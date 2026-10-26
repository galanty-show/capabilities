import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《眠晓智能床垫》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版只内联本幕用到的底图（WebP data URI）。全部动作由帧号与旁白时间决定，无随机、无时钟。
const W = 1920, H = 1080;
const MEDIA: Record<string, string> = {"hero-night":"release-assets/b0595e1c3d132b0415817d527ed44a839a05984e71c7f5088e9029d67b79d8dc.webp","material":"release-assets/43d1ef9f5b5cecf4fac740bc0848e3fef041a82fd585ee47f081cee15ebc4a5f.webp"};
/** 素材：先用素材槽（制作任务的高清图），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .3) => sm((t - a) / f) * (1 - sm((t - b) / f));
const fadeEdges = (t: number, dur: number, inS = .2, outS = .2) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** 文字参数：props 写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function num(props: SceneInput, key: string): number {
  const value = Number(props.params[key] ?? (meta as any).params?.[key]?.default);
  return Number.isFinite(value) ? value : 0;
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
}
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

/** 句子时间：cue 找不到时退回固定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}

// ---- 色彩弧线：深夜蓝 → 清晨暖金。k = 0 午夜，1 清晨。
const C = {night: '#060b1c', navy: '#0b1430', ice: '#e8f0ff', mist: '#8fa3c8', cyan: '#7cc8ff', teal: '#5fe0c8', gold: '#f2c27b',
  amber: '#ffb067', coral: '#ff7d6b', cream: '#fbf1de', violet: '#a99bff', deep: '#3a5bd9', sky: '#5aaef5'};
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, k: number, alpha = 1) => {
  const x = rgb(a), y = rgb(b), q = clamp(k);
  return `rgba(${Math.round(mix(x[0], y[0], q))},${Math.round(mix(x[1], y[1], q))},${Math.round(mix(x[2], y[2], q))},${alpha})`;
};
const tone = (k: number, alpha = 1) => mixColor(C.cyan, C.gold, k, alpha);

// ---- 一夜的时间：23:00 = 0 分钟，07:00 = 480 分钟。
const clock = (minutes: number) => {
  const m = ((Math.round(minutes) + 23 * 60) % 1440 + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
/** 睡眠分期：清醒 / 快速眼动 / 浅睡 / 深睡（行号从上到下）。 */
const STAGE = [
  {key: 'wake', color: C.coral}, {key: 'rem', color: C.violet}, {key: 'light', color: C.sky}, {key: 'deep', color: C.deep},
];
/** 示意数据：一夜约五个周期，前半夜深睡多、后半夜快速眼动多（分钟，23:00 起）。 */
const HYPNO: [number, number, number][] = [
  [0, 14, 0], [14, 32, 2], [32, 78, 3], [78, 96, 2], [96, 112, 1], [112, 128, 2], [128, 170, 3], [170, 186, 2], [186, 206, 1],
  [206, 212, 0], [212, 236, 2], [236, 262, 3], [262, 284, 2], [284, 312, 1], [312, 340, 2], [340, 354, 3], [354, 372, 2],
  [372, 404, 1], [404, 410, 0], [410, 438, 2], [438, 466, 1], [466, 480, 0],
];
const stageAt = (minute: number) => (HYPNO.find(([a, b]) => minute >= a && minute < b) ?? HYPNO[HYPNO.length - 1])[2];

/** 满幅底图 + 运镜；children 与底图同一变换（叠加层按底图坐标画）。 */
function Plate({asset, frame, p, from = [1.04, 0, 0], to = [1.12, -20, -8], opacity = 1, origin = '50% 50%', children}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string; children?: any}) {
  const k = easeInOut(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
      {children}
    </div>
  </div>;
}
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 暗角。 */
const Finish = ({vignette = .5, color = '0,0,0'}: {vignette?: number; color?: string}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(${color},0) 48%, rgba(${color},${vignette}) 100%)`}} />;
/** 小字（宿主字体）。 */
const Text = ({children, x, y, size = 26, color = C.ice, opacity = 1, align = 'left', weight = 400, spacing = 2, fonts, glow = true, style}: any) =>
  !children && children !== 0 ? null : <div style={{position: 'absolute', left: align === 'left' ? x : undefined, right: align === 'right' ? W - x : undefined,
    top: y, width: align === 'center' ? 1200 : undefined, marginLeft: align === 'center' ? x - 600 : undefined, textAlign: align,
    fontFamily: fonts?.text, fontSize: size, fontWeight: weight, letterSpacing: spacing, color, opacity, whiteSpace: 'nowrap', lineHeight: 1.2,
    textShadow: glow ? '0 2px 14px rgba(0,0,0,.55)' : undefined, fontVariantNumeric: 'tabular-nums', ...style}}>{children}</div>;
/** 角落里的“演示数据”小标。 */
const DemoTag = ({fonts, x = 1780, y = 70, label, color = 'rgba(232,240,255,.45)'}: any) =>
  <Text fonts={fonts} x={x} y={y} size={18} color={color} align="right" spacing={3} glow={false}>{label}</Text>;

/** 月亮与太阳小图标。 */
const Moon = ({x, y, r = 10, color = C.ice}: any) => <g transform={`translate(${x} ${y})`}>
  <mask id={`moon-${x}-${y}`}><circle r={r} fill="white" /><circle cx={r * .45} cy={-r * .3} r={r * .85} fill="black" /></mask>
  <circle r={r} fill={color} mask={`url(#moon-${x}-${y})`} /></g>;
const Sun = ({x, y, r = 8, color = C.gold, glow = 0}: any) => <g transform={`translate(${x} ${y})`}>
  {glow > 0 && <circle r={r * 3.2} fill={color} opacity={.18 * glow} />}
  <circle r={r} fill={color} />
  {Array.from({length: 8}, (_, i) => {const a = i * Math.PI / 4; return <line key={i} x1={Math.cos(a) * r * 1.5} y1={Math.sin(a) * r * 1.5}
    x2={Math.cos(a) * r * 2.1} y2={Math.sin(a) * r * 2.1} stroke={color} strokeWidth={2} strokeLinecap="round" />;})}</g>;

/** 顶部“一夜进度”：23:00 月亮 —— 07:00 太阳，当前时刻随幕推进；k 为色彩弧线位置。 */
function NightBar({minutes, k, fonts, opacity = 1, label = ''}: {minutes: number; k: number; fonts: any; opacity?: number; label?: string}) {
  const x0 = 700, x1 = 1220, y = 74, q = clamp(minutes / 480), x = mix(x0, x1, q);
  return <div style={{position: 'absolute', inset: 0, opacity}}>
    <Svg>
      <defs><linearGradient id="nb" x1="0" x2="1"><stop offset="0" stopColor={C.cyan} /><stop offset="1" stopColor={C.gold} /></linearGradient></defs>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(232,240,255,.18)" strokeWidth={2} strokeLinecap="round" />
      <line x1={x0} y1={y} x2={x} y2={y} stroke="url(#nb)" strokeWidth={3} strokeLinecap="round" />
      <Moon x={x0 - 34} y={y} r={10} color={mixColor(C.ice, C.mist, k)} />
      <Sun x={x1 + 34} y={y} r={7} color={C.gold} glow={clamp((q - .8) / .2)} />
      <circle cx={x} cy={y} r={7} fill={tone(k)} /><circle cx={x} cy={y} r={14} fill={tone(k)} opacity={.25} />
    </Svg>
    <Text fonts={fonts} x={x} y={y + 18} size={22} align="center" color={tone(k)} spacing={2} weight={500}>{clock(minutes)}</Text>
    {label && <Text fonts={fonts} x={x0 - 60} y={y - 14} size={20} align="right" color="rgba(232,240,255,.62)" spacing={4}>{label}</Text>}
  </div>;
}

/** 缓慢飘动的微尘（canvas，按帧确定）。 */
function Motes({frame, amount = 1, seed = 5, color = '200,220,255', opacity = 1, rise = 1}: {frame: number; amount?: number; seed?: number; color?: string; opacity?: number; rise?: number}) {
  const r = seeded(seed), n = 120, motes = Array.from({length: n}, () => ({x: r() * W, y: r() * H, s: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    motes.forEach((m, i) => {
      if (i / n > amount) return;
      const y = ((m.y - rise * (10 + 18 * m.s) * t) % H + H) % H, x = (m.x + Math.sin(t * .4 + m.ph) * 22 + 6 * t) % W;
      c.fillStyle = `rgba(${color},${(.12 + .4 * m.s) * (.6 + .4 * Math.sin(t * 1.3 + m.ph))})`;
      c.beginPath(); c.arc(x, y, .8 + 1.8 * m.s, 0, 6.283); c.fill();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />;
}

/** 忽高忽低的睡眠曲线（开场与品牌幕共用，保证硬切两侧同一条线）：u 0→1 横向位置，返回 0（深睡）～1（醒着）。 */
const CURVE = {x0: 170, x1: 1750, y: 300, amp: 120};
const jitter = (u: number) => clamp(.46 + .2 * Math.sin(u * 19.5 + .6) + .13 * Math.sin(u * 45.9 + 1.9) + .07 * Math.sin(u * 86 + .3)
  + .42 * Math.exp(-(((u - .3) / .014) ** 2)) + .48 * Math.exp(-(((u - .58) / .013) ** 2)) + .4 * Math.exp(-(((u - .86) / .012) ** 2)), 0, 1);
/** 曲线路径：flat 0 原样、1 拉平成直线；baseY 可把直线移到别处。 */
function curvePath(reveal = 1, flat = 0, baseY = CURVE.y) {
  const pts: string[] = [], n = 220;
  for (let i = 0; i <= n * clamp(reveal); i++) {
    const u = i / n, v = mix(jitter(u), .5, flat);
    pts.push(`${(CURVE.x0 + (CURVE.x1 - CURVE.x0) * u).toFixed(1)},${(mix(CURVE.y, baseY, flat) + CURVE.amp * (1 - 2 * v)).toFixed(1)}`);
  }
  return pts.length > 1 ? 'M' + pts.join(' L') : '';
}

/** 品牌标志：月牙在地平线上慢慢圆成朝阳（p 0 → 1）。 */
function Mark({x, y, size = 64, p = 1, ink = C.gold, id = 'mk'}: {x: number; y: number; size?: number; p?: number; ink?: string; id?: string}) {
  const r = size / 2, q = easeInOut(clamp(p)), cut = mix(r * .55, r * 2.4, q), lift = mix(r * .35, -r * .1, q);
  return <g transform={`translate(${x} ${y})`}>
    <defs>
      <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-size} y={-size} width={size * 2} height={size * 2}>
        <rect x={-size} y={-size} width={size * 2} height={size * 2} fill="black" />
        <rect x={-size} y={-size} width={size * 2} height={size + r * .32} fill="white" />
        <circle cx={cut} cy={lift - cut * .35} r={r * .9} fill="black" />
      </mask>
    </defs>
    <circle cx={0} cy={lift} r={r} fill={mixColor(C.ice, ink, q)} mask={`url(#${id}-m)`} />
    <line x1={-r * 1.6} y1={r * .32} x2={r * 1.6} y2={r * .32} stroke={ink} strokeWidth={Math.max(2, size / 28)} strokeLinecap="round" />
  </g>;
}

// 品牌：上一幕那条忽高忽低的线被抚平、变成一道金线，像门缝一样上下打开，露出面料微距；
// 念到品牌名时字标落下，念到“智能床垫”时切到产品英雄镜头。
export const meta = {
  params: {
    brand: {label: '品牌名', type: 'text', default: '眠晓', maxLength: 8},
    latin: {label: '拉丁字标', type: 'text', default: 'MIANXIAO', maxLength: 16},
    model: {label: '型号与品类', type: 'text', default: '晓一 · 智能床垫', maxLength: 24},
    brandCue: {label: '字标卡点词', type: 'text', default: '眠晓', maxLength: 12},
    heroCue: {label: '切产品卡点词', type: 'text', default: '智能床垫', maxLength: 12},
  },
};
export default function Brand(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const flat = sm(t / .65), lineY = mix(CURVE.y, 540, sm((t - .15) / .6));
  const open = out3((t - .72) / .75);                               // 金线开缝
  const bc = at(txt(props, 'brandCue'), 1.2), hc = Math.max(bc + .6, at(txt(props, 'heroCue'), bc + .9));
  const word = sm((t - bc) / .7), hero = sm((t - hc - .1) / .7), sub = sm((t - hc - .3) / .6);
  const name = Array.from(txt(props, 'brand'));
  const gold = mixColor(C.ice, C.gold, flat);
  return <div style={{position: 'absolute', inset: 0, background: '#03060f', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(${(1 - open) * 50}% 0 ${(1 - open) * 50}% 0)`}}>
      <Plate asset={slot(props, 'material')} frame={props.frame} p={t / dur} from={[1.12, 60, 10]} to={[1.04, -40, -10]} origin="70% 40%" />
      <Plate asset={slot(props, 'hero-night')} frame={props.frame} p={clamp((t - hc) / Math.max(1, dur - hc))} from={[1.08, 30, 0]} to={[1.02, 0, 0]} origin="66% 55%" opacity={hero} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,6,15,.82) 0%, rgba(3,6,15,.5) 30%, rgba(3,6,15,0) 55%)'}} />
      <Motes frame={props.frame} amount={.35} seed={9} color="255,226,180" opacity={.6} />
    </div>
    <Svg>
      {/* 抚平的线 → 金色门缝的上下两道边 */}
      <g opacity={1 - sm((t - 1.1) / .5)}>
        {open <= .001 ? <path d={curvePath(1, flat, lineY)} fill="none" stroke={gold} strokeWidth={4} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 12px rgba(242,194,123,.7))'}} />
          : [-1, 1].map(s => <line key={s} x1={CURVE.x0 - 170 * open} x2={CURVE.x1 + 170 * open} y1={540 + s * 540 * open} y2={540 + s * 540 * open} stroke={C.gold} strokeWidth={3} opacity={1 - open} />)}
      </g>
      <g opacity={word}><Mark x={300} y={372} size={70} p={.15 + .5 * word} id="bm" /></g>
    </Svg>
    {/* 字标 */}
    <div style={{position: 'absolute', left: 200, top: 420, display: 'flex', fontFamily: props.fonts.text, fontWeight: 300, fontSize: 132, color: C.cream,
      letterSpacing: 26, textShadow: '0 4px 30px rgba(0,0,0,.6)'}}>
      {name.map((ch, i) => {const q = sm((t - bc - i * .16) / .55); return <span key={i} style={{opacity: q, transform: `translateY(${(1 - q) * 24}px)`, display: 'inline-block'}}>{ch}</span>;})}
    </div>
    <Text fonts={props.fonts} x={206} y={600} size={22} spacing={12} color="rgba(242,194,123,.9)" opacity={word}>{txt(props, 'latin')}</Text>
    <Text fonts={props.fonts} x={204} y={650} size={34} spacing={6} color={C.ice} weight={400} opacity={sub}>{txt(props, 'model')}</Text>
    <Finish vignette={.45} />
  </div>;
}
