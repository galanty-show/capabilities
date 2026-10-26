import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"face":"release-assets/6ff5321b2d02d6627bd3029014d2268096a718f3ff9bf749c7f5e65c84864f29.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
// 字体只按名称引用 macOS 自带的 Superclarendon / DIN Condensed（不随包、不内联）；其他系统依次回退。
const DISPLAY = '"Superclarendon", "Rockwell", "Roboto Slab", Georgia, "Songti SC", "STSong", serif';
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
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value as T[] : (meta as any).params?.[key]?.default ?? [];
}
function num(props: SceneInput, key: string): number {
  const value = Number(props.params[key]);
  return Number.isFinite(value) ? value : Number((meta as any).params?.[key]?.default ?? 0);
}
/** 句子与卡点：cue 找不到词时退回给定秒数，保证改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}
/** 撞击包络：节拍后 len 秒内由 1 衰减到 0。 */
const hit = (d: number, len = .35) => d >= 0 && d < len ? Math.pow(1 - d / len, 2) : 0;
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

// 回答：John Henry 的脸。传统歌词“A man ain't nothing but a man”按他念出的词一个个刻到左边；誓言那句以小字跟上。
export const meta = {
  title: "A man ain't nothing but a man",
  params: {
    quote: {label: 'Quote lines', type: 'list', min: 1, max: 4, maxLength: 24, default: ["A MAN AIN'T", 'NOTHING', 'BUT A MAN.'],
      help: 'Revealed word by word while the second sentence is spoken'},
    quoteSentence: {label: 'Quote sentence number', type: 'number', min: 0, max: 6, default: 1, help: 'Which narration sentence (0-based) speaks the quote'},
    vow: {label: 'Vow line', type: 'text', default: '…I’ll die with this hammer in my hand.', maxLength: 60},
    vowSentence: {label: 'Vow sentence number', type: 'number', min: 0, max: 6, default: 3},
  },
  slots: {face: 'Close-up of John Henry by lamplight'},
};
export default function Reply(props: SceneInput) {
  const {s, t, dur} = cues(props);
  const lines = list<string>(props, 'quote').map(String);
  const qs = s.sentence(num(props, 'quoteSentence')), vs = s.sentence(num(props, 'vowSentence'));
  const qStart = qs?.start ?? 3.9, qEnd = qs?.end ?? 6.4;
  const flat = lines.flatMap((line, li) => line.split(/\s+/).filter(Boolean).map(word => ({word, li})));
  const spoken = qs?.words ?? [];
  const timeOf = (i: number) => spoken[i]?.start ?? qStart + (qEnd - qStart) * i / Math.max(1, flat.length);
  const lastWord = timeOf(flat.length - 1);
  const punch = hit(t - lastWord, .4);
  const dim = 1 - .55 * sm((t - (vs?.start ?? 9.7) + .3) / .5);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .06, .12)}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + .015 * punch})`}}>
      <Plate asset={plate(props, 'face')} frame={props.frame} p={t / dur} from={[1.02, 0, 0]} to={[1.12, -40, 0]} origin="70% 40%" />
      <Lamp t={t} x={1850} y={320} power={.45} cone={0} seed={7} />
      <Steam t={t} x={430} y={760} rate={.9} life={4.5} size={1.3} seed={71} drift={120} opacity={.55} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,6,4,.82) 0%, rgba(10,6,4,.55) 40%, rgba(10,6,4,0) 62%)'}} />
      <Svg>
        <defs><filter id="q-rough" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" /></filter></defs>
        <g opacity={dim}>
          {lines.map((line, li) => {
            const words = flat.map((w, i) => ({...w, i})).filter(w => w.li === li);
            const op = (i: number) => clamp((t - timeOf(i) + .05) / .14);
            const y = 300 + li * 132, last = li === lines.length - 1;
            return <g key={li}>
              <text x={126} y={y + 7} fontFamily={DISPLAY} fontWeight={900} fontSize={100} letterSpacing={3} fill="rgba(0,0,0,.6)">
                {words.map((w, k) => <tspan key={w.i} fillOpacity={op(w.i)}>{(k ? ' ' : '') + w.word}</tspan>)}</text>
              <text x={120} y={y} fontFamily={DISPLAY} fontWeight={900} fontSize={100} letterSpacing={3} fill={last ? OCHRE : PAPER} stroke={INK} strokeWidth={3}
                paintOrder="stroke" filter="url(#q-rough)">
                {words.map((w, k) => <tspan key={w.i} fillOpacity={op(w.i)} strokeOpacity={op(w.i)}>{(k ? ' ' : '') + w.word}</tspan>)}</text>
            </g>;
          })}
        </g>
        <text x={124} y={740} fontFamily={SERIF} fontStyle="italic" fontSize={50} fill={OCHRE} stroke={INK} strokeWidth={5} paintOrder="stroke"
          opacity={sm((t - (vs?.start ?? 9.7) - .1) / .5)}>{txt(props, 'vow')}</text>
      </Svg>
    </div>
    <Finish vignette={.55} />
  </div>;
}
