import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"born":"release-assets/a6897f6bf9eb2cdd7aa7fb9940da1a69914f7125aea08a73dba87e4063e98507.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
const cjkLen = (text: string, k = 1.9) => Array.from(text).reduce((n, ch) => n + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? k : 1), 0);
const CONDENSED = '"DIN Condensed", "Oswald", "Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif';
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

/** 印章式标签：锈红底版、纸色窄体大写字，落下时由大到小砸实。 */
function Stamp({x, y, text, size = 40, p, color = RUST, ink = PAPER, rotate = -3, anchor = 'middle'}:
  {x: number; y: number; text: string; size?: number; p: number; color?: string; ink?: string; rotate?: number; anchor?: 'start' | 'middle' | 'end'}) {
  if (p <= 0 || !text) return null;
  const k = out3(p), sc = 1 + 1.2 * (1 - k), w = cjkLen(text) * size * .52 + size * 1.2, h = size * 1.5;
  const ox = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0;
  return <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rotate * k})`} opacity={clamp(p * 3)}>
    <rect x={ox} y={-h / 2} width={w} height={h} fill={color} stroke={INK} strokeWidth={3} />
    <rect x={ox + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} fill="none" stroke={ink} strokeWidth={2} opacity={.6} />
    <text x={ox + w / 2} y={size * .36} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={size} letterSpacing={size * .08} fill={ink}>{text.toUpperCase()}</text>
  </g>;
}
/** 小号说明字（窄体大写）。 */
const Caption = ({children, x, y, size = 30, color = PAPER, opacity = 1, align = 'left', spacing = 4, font = CONDENSED, width}: any) =>
  !children ? null : <div style={{position: 'absolute', left: align === 'right' ? undefined : align === 'center' ? x - (width ?? 1600) / 2 : x,
    right: align === 'right' ? W - x : undefined, width: align === 'center' ? (width ?? 1600) : undefined, top: y, fontFamily: font, fontSize: size,
    letterSpacing: spacing, color, opacity, textAlign: align, textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>;

// 生来握锤：小屋灯下的一家人。“传说”印一落；念到 hammer，婴儿手里的小锤亮起金光；念到 swing，一道锤弧横扫全屏、火星迸出。
export const meta = {
  title: 'Born with a hammer in hand',
  params: {
    tag: {label: 'Legend stamp', type: 'text', default: 'A Tall Tale', maxLength: 24, help: 'Stamped when the first sentence starts'},
    hammerCue: {label: 'Glow cue word', type: 'text', default: 'hammer', maxLength: 24},
    swingCue: {label: 'Swing cue word', type: 'text', default: 'swing', maxLength: 24},
  },
  slots: {born: 'Cabin by lamplight: parents with the newborn holding a small hammer'},
};
export default function Born(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const glowAt = at(txt(props, 'hammerCue'), 3.6), swingAt = at(txt(props, 'swingCue'), dur - 2);
  const beats = beatList(props, [swingAt]);
  const HAMMER = {x: 1040, y: 430};
  const glow = sm((t - glowAt + .1) / .5) * (.75 + .25 * Math.sin((t - glowAt) * 5));
  const arc = clamp((t - beats[0] + .18) / .38);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .1)}}>
    <div style={{position: 'absolute', inset: 0, transform: shakeAt(t, beats, 12, .35)}}>
      <Plate asset={plate(props, 'born')} frame={props.frame} p={t / dur} from={[1.04, 0, 30]} to={[1.16, -40, 40]} origin="54% 40%" />
      <Lamp t={t} x={170} y={470} power={.55} cone={0} seed={4} />
      <Svg>
        <defs><radialGradient id="bg-glow"><stop offset="0" stopColor="#fff1b8" stopOpacity=".95" /><stop offset=".35" stopColor="#f2b84b" stopOpacity=".5" /><stop offset="1" stopColor="#f2b84b" stopOpacity="0" /></radialGradient></defs>
        {glow > 0 && <g style={{mixBlendMode: 'screen'}}>
          <circle cx={HAMMER.x} cy={HAMMER.y} r={150 + 30 * glow} fill="url(#bg-glow)" opacity={glow} />
          {[0, 1, 2, 3].map(i => {const a = i * Math.PI / 2 + (t - glowAt) * .6, l = 60 + 50 * glow;
            return <line key={i} x1={HAMMER.x} y1={HAMMER.y} x2={HAMMER.x + Math.cos(a) * l} y2={HAMMER.y + Math.sin(a) * l} stroke="#fff3c4" strokeWidth={4} strokeLinecap="round" opacity={.8 * glow} />;})}
        </g>}
        <Stamp x={300} y={150} text={txt(props, 'tag')} size={44} p={clamp((t - start(0, .3)) / .3)} rotate={-4} />
        {arc > 0 && arc < 1 && <path d={`M ${-200 + 0 * arc} 980 Q 960 ${-120} ${2120} 980`} fill="none" stroke={OCHRE} strokeWidth={46 * Math.sin(arc * Math.PI)}
          strokeLinecap="round" pathLength={100} strokeDasharray={`${26} 100`} strokeDashoffset={-arc * 100 + 13} opacity={.85} style={{mixBlendMode: 'screen'}} />}
      </Svg>
      <Sparks t={t} beats={beats} x={1560} y={560} dir={-Math.PI * .3} spread={1.1} n={60} seed={31} />
      <Flash amount={.4 * hit(t - beats[0], .18)} />
    </div>
    <Finish vignette={.6} />
  </div>;
}
