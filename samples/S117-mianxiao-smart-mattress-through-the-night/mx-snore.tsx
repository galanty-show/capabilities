import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《眠晓智能床垫》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版只内联本幕用到的底图（WebP data URI）。全部动作由帧号与旁白时间决定，无随机、无时钟。
const W = 1920, H = 1080;
const MEDIA: Record<string, string> = {};
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

// 鼾声与抬头：代码画的侧视剖面。鼾声时口边一圈圈珊瑚色声波、右上监测条起伏；念到“抬起”床头绕铰点缓缓抬 10°，
// 角度弧与读数出现；念到“呼吸顺了”声波变青、变小，分贝数降下来，“轻了”时标出“鼾声平稳”。
export const meta = {
  params: {
    liftCue: {label: '抬头卡点词', type: 'text', default: '抬起', maxLength: 12},
    calmCue: {label: '平稳卡点词', type: 'text', default: '呼吸顺了', maxLength: 12},
    quietCue: {label: '变轻卡点词', type: 'text', default: '轻了', maxLength: 12},
    angle: {label: '抬升角度', type: 'number', default: 10, min: 0, max: 20},
    angleLabel: {label: '角度说明', type: 'text', default: '床头抬升 {n}°', maxLength: 24},
    monitor: {label: '监测条标题', type: 'text', default: '鼾声监测', maxLength: 16},
    loud: {label: '分贝起止', type: 'list', min: 2, max: 2, item: 'number', default: [58, 36]},
    calm: {label: '平稳字样', type: 'text', default: '鼾声平稳', maxLength: 16},
    motor: {label: '电机说明', type: 'text', default: '静音电机', maxLength: 16},
    demo: {label: '示意说明', type: 'text', default: '演示数据', maxLength: 16},
  },
};
const HX = 760, HY = 640;                             // 床头铰点
export default function Snore(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const lc = at(txt(props, 'liftCue'), 1.4), cc = at(txt(props, 'calmCue'), 3.2), qc = at(txt(props, 'quietCue'), 4.6);
  const lift = easeInOut(clamp((t - lc) / 2.2)), deg = num(props, 'angle') * lift;
  const calm = sm((t - cc + .2) / 1.4), quiet = sm((t - qc) / .5);
  const loud = list<number>(props, 'loud').map(Number), db = mix(loud[0] ?? 58, loud[1] ?? 36, calm);
  const snoreAmp = (tt: number) => {const ph = ((tt % 2.8) + 2.8) % 2.8; return Math.exp(-(((ph - .9) / .38) ** 2));};   // 每 2.8 秒一声鼾
  const amp = (1 - calm) * (.35 + .65 * snoreAmp(t)) + calm * .18 * (.5 + .5 * Math.sin(t / 4.3 * 6.283));
  const waveColor = mixColor(C.coral, C.teal, calm);
  const rad = -deg * Math.PI / 180, rot = (x: number, y: number) => [HX + (x - HX) * Math.cos(rad) - (y - HY) * Math.sin(rad), HY + (x - HX) * Math.sin(rad) + (y - HY) * Math.cos(rad)];
  const [mx, my] = rot(566, 470);                     // 口鼻位置随床头转动
  // 被子上沿：x 从 590 到 1476 的一条鼓起曲线；越靠床头越跟着床头转（w 由 1 平滑过渡到 0）。
  const top = (x: number) => 572 - (70 * sm((x - 590) / 90) + 28 * Math.sin(Math.PI * clamp((x - 640) / 820)) - 70 * sm((x - 1400) / 76));
  const pts = Array.from({length: 60}, (_, i) => {const x = 590 + i * (1476 - 590) / 59, w = 1 - sm((x - (HX - 60)) / 160);
    const [rx, ry] = rot(x, top(x)), [bx, by] = rot(x, 572); return [mix(x, rx, w), mix(top(x), ry, w), mix(x, bx, w), mix(572, by, w)];});
  const duvet = 'M' + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L') + ' L' + pts.slice().reverse().map(p => `${p[2].toFixed(1)},${p[3].toFixed(1)}`).join(' L') + ' Z';
  const motorPulse = lift > 0 && lift < 1 ? 1 : 0;
  const bars = Array.from({length: 48}, (_, i) => {const tt = t - 2.4 + i * .05; const a = (1 - sm((tt - cc + .2) / 1.4)) * (.25 + .75 * snoreAmp(tt)) + .12;
    return a * (.55 + .45 * Math.abs(Math.sin(i * 1.7 + t * 9)));});
  return <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 70%, #1d1d4a 0%, #0c0f2a 55%, #070a1c 100%)', overflow: 'hidden',
    opacity: fadeEdges(t, dur, .3, .3)}}>
    <Motes frame={props.frame} amount={.6} seed={21} opacity={.6} rise={.3} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 690, height: 3, background: 'linear-gradient(90deg, rgba(232,240,255,0), rgba(232,240,255,.18), rgba(232,240,255,0))'}} />
    <Svg>
      <defs>
        <linearGradient id="sn-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2a5c" /><stop offset=".55" stopColor="#101b40" /><stop offset=".56" stopColor="#8b8578" /><stop offset="1" stopColor="#6f6a60" /></linearGradient>
        <linearGradient id="sn-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe5f2" /><stop offset="1" stopColor="#a7b0c6" /></linearGradient>
        <radialGradient id="sn-glow"><stop offset="0" stopColor="#ffe2b0" stopOpacity=".55" /><stop offset="1" stopColor="#ffe2b0" stopOpacity="0" /></radialGradient>
      </defs>
      {/* 底座与暖白底灯 */}
      <ellipse cx={960} cy={700} rx={560} ry={22} fill="url(#sn-glow)" />
      <rect x={430} y={650} width={1060} height={34} rx={14} fill="#2b3040" stroke="rgba(255,255,255,.08)" />
      {/* 静音电机 */}
      <g transform={`translate(${HX} 668)`}>
        <circle r={13} fill="#3d4458" stroke={C.gold} strokeWidth={2} />
        {[0, 1].map(i => {const q = ((t - lc) * 1.6 + i * .5) % 1; return motorPulse ? <circle key={i} r={13 + q * 34} fill="none" stroke={C.gold} strokeWidth={2} opacity={.6 * (1 - q)} /> : null;})}
      </g>
      {/* 床身（不动的部分） */}
      <rect x={HX - 4} y={570} width={1490 - HX} height={72} rx={18} fill="url(#sn-m)" />
      <line x1={HX + 8} y1={571} x2={1476} y2={571} stroke={C.gold} strokeWidth={3} />
      {/* 床头（绕铰点转动）：床垫、枕头、头部与上身被子 */}
      <g transform={`rotate(${-deg} ${HX} ${HY})`}>
        <rect x={430} y={570} width={HX - 420} height={72} rx={18} fill="url(#sn-m)" />
        <line x1={444} y1={571} x2={HX + 8} y2={571} stroke={C.gold} strokeWidth={3} />
        <rect x={452} y={532} width={190} height={44} rx={22} fill="#cfd6e6" />
        {/* 仰卧的头：浅肤色圆、后脑深色头发、朝上的鼻尖 */}
        <circle cx={540} cy={508} r={36} fill="#c9b6a4" />
        <path d="M504 512 A 36 36 0 0 1 528 474 L 534 500 Z" fill="#2a2433" />
        <path d="M506 516 A 36 36 0 0 1 512 486 Q 540 470 566 480 Q 540 482 520 500 Z" fill="#2a2433" />
        <path d="M552 474 L 560 462 L 566 476 Z" fill="#c9b6a4" />
      </g>
      {/* 被子：一条连续的轮廓，铰点左边的点随床头转动、右边不动，中间平滑过渡 */}
      <path d={duvet} fill="url(#sn-d)" />
      {/* 声波 */}
      {[0, 1, 2, 3].map(i => {const q = ((t * .9) + i / 4) % 1; const r = 20 + q * 150 * (.5 + amp);
        return <path key={i} d={`M ${mx + r * Math.cos(-1.1)} ${my + r * Math.sin(-1.1)} A ${r} ${r} 0 0 1 ${mx + r * Math.cos(.15)} ${my + r * Math.sin(.15)}`}
          fill="none" stroke={waveColor} strokeWidth={4} strokeLinecap="round" opacity={(1 - q) * clamp(amp * 1.4) * (1 - quiet * .5)} transform={`rotate(${-deg - 25} ${mx} ${my})`} />;})}
      {/* 角度弧 */}
      <g opacity={sm((t - lc) / .4)}>
        <line x1={HX} y1={HY - 70} x2={420} y2={HY - 70} stroke="rgba(232,240,255,.25)" strokeWidth={2} strokeDasharray="6 8" />
        <path d={`M ${HX - 300} ${HY - 70} A 300 300 0 0 1 ${HX - 300 * Math.cos(rad)} ${HY - 70 + 300 * Math.sin(rad)}`} fill="none" stroke={C.gold} strokeWidth={3} />
      </g>
    </Svg>
    <Text fonts={props.fonts} x={380} y={360} size={30} color={C.gold} spacing={3} opacity={sm((t - lc) / .4)}>{fmt(txt(props, 'angleLabel'), {n: deg.toFixed(1)})}</Text>
    <Text fonts={props.fonts} x={HX} y={714} size={20} color="rgba(242,194,123,.8)" spacing={4} align="center" opacity={sm((t - lc) / .4) * (1 - sm((t - lc - 3) / .6))}>{txt(props, 'motor')}</Text>
    {/* 右上：鼾声监测条 */}
    <div style={{position: 'absolute', left: 1180, top: 170, width: 600, height: 230, borderRadius: 24, background: 'rgba(12,16,42,.75)', border: '1px solid rgba(169,155,255,.25)'}}>
      <Text fonts={props.fonts} x={28} y={22} size={24} color={C.mist} spacing={4} glow={false}>{txt(props, 'monitor')}</Text>
      <div style={{position: 'absolute', right: 28, top: 12, fontFamily: props.fonts.text, fontSize: 52, fontWeight: 300, color: waveColor, fontVariantNumeric: 'tabular-nums'}}>
        {Math.round(db)}<span style={{fontSize: 22, marginLeft: 6, color: C.mist}}>dB</span></div>
      <svg width={544} height={110} viewBox="0 0 544 110" style={{position: 'absolute', left: 28, top: 96}}>
        {bars.map((a, i) => <rect key={i} x={i * 11.3} y={55 - a * 50} width={6} height={Math.max(3, a * 100)} rx={3} fill={i > 40 ? waveColor : mixColor(C.mist, waveColor, .5)} opacity={.4 + .6 * (i / 48)} />)}
      </svg>
    </div>
    <div style={{position: 'absolute', left: 1180, top: 420, display: 'flex', alignItems: 'center', gap: 12, opacity: quiet, fontFamily: props.fonts.text}}>
      <svg width={34} height={34} viewBox="-17 -17 34 34"><circle r={15} fill="none" stroke={C.teal} strokeWidth={2.5} /><path d="M-7 0 L-2 5 L8 -6" fill="none" stroke={C.teal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span style={{fontSize: 30, color: C.teal, letterSpacing: 4}}>{txt(props, 'calm')}</span>
    </div>
    <NightBar minutes={mix(250, 254, t / dur)} k={.35} fonts={props.fonts} />
    <DemoTag fonts={props.fonts} label={txt(props, 'demo')} />
    <Finish vignette={.5} />
  </div>;
}
