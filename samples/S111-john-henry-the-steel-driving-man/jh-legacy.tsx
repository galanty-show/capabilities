import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"legacy":"release-assets/063a77cb74a7470375614ef0fca410c6d11954e7126a9ead9ef486d0ca31a77c.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
// 字体只按名称引用 macOS 自带的 Superclarendon / DIN Condensed（不随包、不内联）；其他系统依次回退。
const DISPLAY = '"Superclarendon", "Rockwell", "Roboto Slab", Georgia, "Songti SC", "STSong", serif';
const cjkLen = (text: string, k = 1.9) => Array.from(text).reduce((n, ch) => n + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? k : 1), 0);
const CONDENSED = '"DIN Condensed", "Oswald", "Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Songti SC", "STSong", serif';

const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
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

/** 汽灯光：灯点光晕 + 向下的光锥，按 seed 轻微闪烁。 */
function Lamp({t, x, y, power = 1, cone = 1, seed = 1, angle = 0}: {t: number; x: number; y: number; power?: number; cone?: number; seed?: number; angle?: number}) {
  const flick = .86 + .1 * Math.sin(t * 11 + seed * 2) * Math.sin(t * 6.3 + seed) + .04 * Math.sin(t * 23 + seed * 5);
  const a = power * flick, id = `lg${seed}`;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none'}}>
    <defs>
      <radialGradient id={`${id}h`}><stop offset="0" stopColor="#fff4d0" stopOpacity={.95 * a} /><stop offset=".25" stopColor="#ffc46a" stopOpacity={.45 * a} /><stop offset="1" stopColor="#ff9a30" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd28a" stopOpacity={.38 * a * cone} /><stop offset="1" stopColor="#ffb050" stopOpacity="0" /></linearGradient>
    </defs>
    {cone > 0 && <polygon transform={`rotate(${angle} ${x} ${y})`} points={`${x - 26},${y + 10} ${x + 26},${y + 10} ${x + 330},${y + 820} ${x - 330},${y + 820}`} fill={`url(#${id}c)`} />}
    <circle cx={x} cy={y} r={260} fill={`url(#${id}h)`} />
  </svg>;
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

/** 蒸汽：从 (x, y) 定时喷出的烟团，上升、变大、变淡；rate 为每秒团数。 */
function Steam({t, x, y, rate = 3, life = 2.2, size = 1, seed = 2, drift = 60, opacity = 1, startAt = 0}:
  {t: number; x: number; y: number; rate?: number; life?: number; size?: number; seed?: number; drift?: number; opacity?: number; startAt?: number}) {
  const ref = useCanvas(Math.round(t * 1000), (c) => {
    const first = Math.max(0, Math.floor((t - life - startAt) * rate)), last = Math.floor((t - startAt) * rate);
    for (let i = first; i <= last; i++) {
      const born = startAt + i / rate, age = t - born;
      if (age < 0 || age > life) continue;
      const r = seeded(seed * 977 + i), k = age / life;
      const px = x + (r() - .5) * 30 + drift * k + Math.sin(age * 2 + i) * 12 * k;
      const py = y - (90 + 60 * r()) * age * size;
      const rad = (30 + 120 * k) * size * (.7 + .5 * r());
      const g = c.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(240,232,214,${.55 * (1 - k) * opacity})`); g.addColorStop(1, 'rgba(240,232,214,0)');
      c.fillStyle = g; c.beginPath(); c.arc(px, py, rad, 0, 6.283); c.fill();
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}} />;
}

// 余韵：隧道通了，火车从山里开出来。念到 stronger，车灯变亮、蒸汽变浓；念到 singing，镜头慢慢移到铁轨边那把锤子；
// 最后一个词 swing 时锤头一圈微光；旁白念完，片名卡浮上来。
export const meta = {
  title: 'Every swing',
  params: {
    strongerCue: {label: 'Machine cue word', type: 'text', default: 'stronger', maxLength: 24},
    turnCue: {label: 'Turn-to-hammer cue word', type: 'text', default: 'singing', maxLength: 24},
    swingCue: {label: 'Last cue word', type: 'text', default: 'swing', maxLength: 24},
    title: {label: 'End title', type: 'text', default: 'JOHN HENRY', maxLength: 24},
    subtitle: {label: 'End subtitle', type: 'text', default: 'The Steel-Driving Man', maxLength: 40},
    credit: {label: 'End note', type: 'text', default: 'An American legend, retold', maxLength: 60},
  },
  slots: {legacy: 'A train leaves the finished tunnel; the hammer rests by the rail'},
};
export default function Legacy(props: SceneInput) {
  const {s, t, at, dur} = cues(props);
  const endAll = s.sentence(99)?.end ?? dur - 3;
  const strongAt = at(txt(props, 'strongerCue'), 1.4), turnAt = at(txt(props, 'turnCue'), 5.6), swingAt = at(txt(props, 'swingCue'), endAll - .4);
  const card = sm((t - endAll - .25) / .9);
  const pan = sm((t - turnAt + .4) / 5);
  const scale = mix(1.06, 1.22, pan), x = mix(-40, 200, pan), y = mix(10, -170, pan);
  const lamp = .55 + .5 * sm((t - strongAt) / .6);
  const HAMMER = {x: 660, y: 965}, ring = sm((t - swingAt) / .3) * (1 - sm((t - swingAt - 1.5) / 1));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .15, .2)}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: '34% 70%'}}>
      <Plate asset={plate(props, 'legacy')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
      <Lamp t={t} x={1022} y={300} power={lamp} cone={0} seed={16} />
      <Steam t={t} x={1180} y={180} rate={1.6 + 2 * sm((t - strongAt) / .8)} life={3.2} size={1.3} seed={97} drift={160} opacity={.75} />
      <Svg>
        {ring > 0 && <g style={{mixBlendMode: 'screen'}} opacity={ring}>
          <circle cx={HAMMER.x} cy={HAMMER.y} r={40 + 90 * sm((t - swingAt) / 1.2)} fill="none" stroke="#ffe6a8" strokeWidth={6} opacity={1 - sm((t - swingAt) / 1.4)} />
          <circle cx={HAMMER.x} cy={HAMMER.y} r={70} fill="#ffe6a8" opacity={.25} />
        </g>}
      </Svg>
    </div>
    <div style={{position: 'absolute', inset: 0, background: `rgba(14,9,6,${.62 * card})`}} />
    <Svg>
      <g opacity={card}>
        <Woodtype id="et" text={txt(props, 'title')} x={960} y={470} size={150} p={card} spacing={6} />
        <rect x={960 - 420 * card} y={512} width={840 * card} height={7} fill={RUST} />
        <text x={960} y={590} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={54} letterSpacing={14} fill={OCHRE}>{txt(props, 'subtitle').toUpperCase()}</text>
        <text x={960} y={652} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={32} fill={PAPER} opacity={.85 * sm((t - endAll - .9) / .7)}>{txt(props, 'credit')}</text>
      </g>
    </Svg>
    <Finish vignette={.55} />
  </div>;
}
