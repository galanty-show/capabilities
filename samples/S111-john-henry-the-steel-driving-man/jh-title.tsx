import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"hero-wide":"release-assets/9deb90a64b11be4a22e9b409f004223d1871d0119c91de678527743f624c1acf.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
// 字体只按名称引用 macOS 自带的 Superclarendon / DIN Condensed（不随包、不内联）；其他系统依次回退。
const DISPLAY = '"Superclarendon", "Rockwell", "Roboto Slab", Georgia, "Songti SC", "STSong", serif';
const cjkLen = (text: string, k = 1.9) => Array.from(text).reduce((n, ch) => n + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? k : 1), 0);
const CONDENSED = '"DIN Condensed", "Oswald", "Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Songti SC", "STSong", serif';

const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .15, outS = .15) => Math.min(inS > 0 ? sm(t / inS) : 1, outS > 0 ? sm((dur - t) / outS) : 1);

/** 底图：先用分镜素材槽（若有），再用内联底图。 */
function plate(props: SceneInput, name: string): any {
  return (props.assets as any)[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 句子与卡点：cue 找不到词时退回给定秒数，保证改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}
/** 节拍表（幕内秒）：props.beats 优先（music_build.py 写入），缺了用兜底。 */
function beatList(props: SceneInput, fallback: number[]): number[] {
  const value = props.params.beats;
  const parsed = Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : [];
  return parsed.length ? parsed : fallback;
}
/** 最近一次节拍：经过的秒数 d 与序号 i（还没到第一拍时 d = Infinity、i = -1）。 */
function lastBeat(t: number, beats: number[]) {
  let i = -1;
  for (let k = 0; k < beats.length; k++) if (beats[k] <= t + 1e-6) i = k;
  return i < 0 ? {d: Infinity, i} : {d: t - beats[i], i};
}
/** 撞击包络：节拍后 len 秒内由 1 衰减到 0。 */
const hit = (d: number, len = .35) => d >= 0 && d < len ? Math.pow(1 - d / len, 2) : 0;
/** 镜头震动：节拍后衰减。 */
function shakeAt(t: number, beats: number[], power = 10, len = .3) {
  const {d, i} = lastBeat(t, beats);
  if (!(d < len)) return 'none';
  const k = (1 - d / len) * power, r = seeded(9100 + i)();
  return `translate(${Math.sin(d * 95 + r * 6) * k}px, ${Math.cos(d * 80 + r * 3) * k * .8}px)`;
}

/** 满幅底图 + 运镜（scale / 位移随 p 缓动）。不在运行时调色：调色离线做（荔枝经验，避免两次渲染不一致）。 */
function Plate({asset, frame, p, from = [1.04, 0, 0], to = [1.12, -20, -10], opacity = 1, origin = '50% 50%'}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string}) {
  if (!asset || opacity <= 0) return null;
  const k = easeInOut(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}

/** 火星：每个节拍从 (x, y) 迸出一簇，带重力、拖尾与冷却变色；纯函数，同帧同图。 */
function Sparks({t, beats, x, y, n = 44, spread = 1.4, dir = -Math.PI / 2, speed = 1, life = .75, seed = 3, scale = 1}:
  {t: number; beats: number[]; x: number; y: number; n?: number; spread?: number; dir?: number; speed?: number; life?: number; seed?: number; scale?: number}) {
  const ref = useCanvas(Math.round(t * 1000), (c) => {
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    beats.forEach((b, bi) => {
      const age = t - b;
      if (age < 0 || age > life) return;
      const r = seeded(seed * 131 + bi * 17);
      for (let i = 0; i < n; i++) {
        const a = dir + (r() - .5) * spread * 2, v = (500 + 1300 * r()) * speed * scale, l = life * (.45 + .55 * r());
        if (age > l) {r(); continue;}
        const k = age / l, drag = Math.exp(-age * 2.2);
        const px = (tt: number) => x + Math.cos(a) * v * (1 - Math.exp(-tt * 2.2)) / 2.2;
        const py = (tt: number) => y + Math.sin(a) * v * (1 - Math.exp(-tt * 2.2)) / 2.2 + 900 * scale * tt * tt;
        const t0 = Math.max(0, age - .035);
        const hot = 1 - k, w = (1.2 + 2.6 * r()) * scale * (.5 + .5 * drag);
        c.strokeStyle = `rgba(255,${Math.round(150 + 105 * hot)},${Math.round(60 + 160 * hot * hot)},${(1 - k * k) * .95})`;
        c.lineWidth = w;
        c.beginPath(); c.moveTo(px(t0), py(t0)); c.lineTo(px(age), py(age)); c.stroke();
      }
      // 撞击点白热闪光
      if (age < .12) {
        const g = c.createRadialGradient(x, y, 0, x, y, 120 * scale);
        g.addColorStop(0, `rgba(255,250,225,${.9 * (1 - age / .12)})`); g.addColorStop(1, 'rgba(255,170,60,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 120 * scale, 0, 6.283); c.fill();
      }
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}} />;
}

/** 全屏闪光（撞击、爆破）。 */
const Flash = ({amount, color = '255,214,150'}: {amount: number; color?: string}) =>
  amount > .001 ? <div style={{position: 'absolute', inset: 0, background: `rgba(${color},${amount})`, mixBlendMode: 'screen', pointerEvents: 'none'}} /> : null;

/** 暗角。 */
const Finish = ({vignette = .6}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(10,6,3,${vignette}) 100%)`, pointerEvents: 'none'}} />;

/** 版画刻字：木活字感的粗衬线字（SVG），带刻痕滤镜与投影；p 为横扫显现 0→1。 */
function Woodtype({text, x, y, size, fill = PAPER, p = 1, anchor = 'middle', id, spacing = 2, stroke = INK, font = DISPLAY, weight = 900, rough = true, italic = false}:
  {text: string; x: number; y: number; size: number; fill?: string; p?: number; anchor?: 'start' | 'middle' | 'end'; id: string;
    spacing?: number; stroke?: string; font?: string; weight?: number; rough?: boolean; italic?: boolean}) {
  if (!text || p <= 0) return null;
  const reveal = clamp(p), approx = cjkLen(text, 1.5) * size * .68 + 400;
  const left = anchor === 'middle' ? x - approx / 2 : anchor === 'end' ? x - approx : x - 40;
  return <g>
    <defs>
      <clipPath id={`${id}-c`}><rect x={left} y={y - size * 1.2} width={approx * reveal} height={size * 1.6} /></clipPath>
      {rough && <filter id={`${id}-r`} x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={Math.max(2, size * .035)} xChannelSelector="R" yChannelSelector="G" /></filter>}
    </defs>
    <g clipPath={`url(#${id}-c)`}>
      <text x={x + size * .05} y={y + size * .06} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} letterSpacing={spacing}
        fontStyle={italic ? 'italic' : undefined} fill="rgba(0,0,0,.55)">{text}</text>
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} letterSpacing={spacing} fill={fill}
        fontStyle={italic ? 'italic' : undefined} stroke={stroke} strokeWidth={size * .025} paintOrder="stroke" filter={rough ? `url(#${id}-r)` : undefined}>{text}</text>
    </g>
  </g>;
}
/** 整版 SVG（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** 小号说明字（窄体大写）。 */
const Caption = ({children, x, y, size = 30, color = PAPER, opacity = 1, align = 'left', spacing = 4, font = CONDENSED, width}: any) =>
  !children ? null : <div style={{position: 'absolute', left: align === 'right' ? undefined : align === 'center' ? x - (width ?? 1600) / 2 : x,
    right: align === 'right' ? W - x : undefined, width: align === 'center' ? (width ?? 1600) : undefined, top: y, fontFamily: font, fontSize: size,
    letterSpacing: spacing, color, opacity, textAlign: align, textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>;

// 片名：一锤砸下“JOHN HENRY”（木活字刻字），火星从字底迸出；副标题像铁路告示一样横扫出来。
export const meta = {
  title: 'Title card',
  params: {
    title: {label: 'Title', type: 'text', default: 'JOHN HENRY', maxLength: 24},
    subtitle: {label: 'Subtitle', type: 'text', default: 'The Steel-Driving Man', maxLength: 40},
    tagline: {label: 'Tagline', type: 'text', default: 'An American legend', maxLength: 48},
  },
  slots: {'hero-wide': 'John Henry at sunrise, hammer on his shoulder (behind the title)'},
};
export default function Title(props: SceneInput) {
  const {t, dur} = cues(props);
  const beats = beatList(props, [.03]);
  const slam = clamp((t - beats[0]) / .2), sub = sm((t - .75) / .45), tag = sm((t - 1.35) / .6);
  const scale = 1 + .45 * (1 - out3(slam));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, 0, .2)}}>
    <div style={{position: 'absolute', inset: 0, transform: shakeAt(t, beats, 16, .45)}}>
      <Plate asset={plate(props, 'hero-wide')} frame={props.frame} p={t / dur} from={[1.06, 30, 0]} to={[1.12, 0, 0]} opacity={.95} origin="72% 6%" />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(14,9,6,.88) 0%, rgba(14,9,6,.72) 48%, rgba(14,9,6,.15) 78%, rgba(14,9,6,.05) 100%)'}} />
      <Svg>
        <g transform={`translate(110 520) scale(${scale}) translate(-110 -520)`} opacity={clamp(slam * 4)}>
          <Woodtype id="tt" text={txt(props, 'title')} x={110} y={520} size={170} anchor="start" spacing={6} />
        </g>
        <g opacity={sub}>
          <rect x={110} y={566} width={1180 * sub} height={8} fill={RUST} />
          <text x={116} y={650} fontFamily={CONDENSED} fontWeight={700} fontSize={64} letterSpacing={16} fill={OCHRE}
            clipPath="url(#subclip)">{txt(props, 'subtitle').toUpperCase()}</text>
          <defs><clipPath id="subclip"><rect x={100} y={590} width={1300 * sub} height={90} /></clipPath></defs>
        </g>
        <text x={118} y={712} fontFamily={SERIF} fontStyle="italic" fontSize={36} fill={PAPER} opacity={.85 * tag}>{txt(props, 'tagline')}</text>
      </Svg>
      <Sparks t={t} beats={beats} x={560} y={540} dir={-Math.PI / 2} spread={1.5} n={90} speed={1.25} life={1.1} seed={21} />
      <Flash amount={.55 * hit(t - beats[0], .22)} />
    </div>
    <Finish vignette={.55} />
  </div>;
}
