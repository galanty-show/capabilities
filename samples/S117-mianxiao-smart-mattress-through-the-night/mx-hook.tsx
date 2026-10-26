import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《眠晓智能床垫》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版只内联本幕用到的底图（WebP data URI）。全部动作由帧号与旁白时间决定，无随机、无时钟。
const W = 1920, H = 1080;
const MEDIA: Record<string, string> = {"bedroom-night":"release-assets/7e8755553ef1defddc968c58c50d64993daa8f4371a501d92cc89fa9e3238952.webp"};
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

// 开场钩子：凌晨三点的卧室。时钟在念到“三点”时从 02:59 翻到 03:00，枕边亮起一圈“醒着”的涟漪；
// “翻来覆去”起一条忽高忽低的睡眠曲线从左画到右，几处尖峰标出夜醒。幕末压暗，好硬切到品牌幕的同一条线。
export const meta = {
  params: {
    clockFrom: {label: '起始时刻', type: 'text', default: '02:59', maxLength: 5},
    clockTo: {label: '翻到的时刻', type: 'text', default: '03:00', maxLength: 5},
    flipCue: {label: '翻钟卡点词', type: 'text', default: '三点', maxLength: 12, help: '旁白念到这个词时时钟翻页'},
    wakeCue: {label: '醒来卡点词', type: 'text', default: '醒', maxLength: 12},
    curveCue: {label: '曲线卡点词', type: 'text', default: '翻来覆去', maxLength: 12, help: '从这个词开始画睡眠曲线'},
    curveLabel: {label: '曲线标题', type: 'text', default: '昨夜睡眠', maxLength: 16},
    wakeLabel: {label: '夜醒标记', type: 'text', default: '醒', maxLength: 6},
    axis: {label: '时间轴两端', type: 'list', min: 2, max: 2, maxLength: 8, default: ['23:00', '03:00']},
  },
};
export default function Hook(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props);
  const flip = at(txt(props, 'flipCue'), .7), wake = at(txt(props, 'wakeCue'), 1.4);
  const c0 = at(txt(props, 'curveCue'), start(1, 2.2)), c1 = Math.max(c0 + 1.5, end(1, c0 + 3.4) - .2);
  const reveal = sm((t - c0) / (c1 - c0)) * .985 + .015 * clamp((t - c0) / .2);
  const flipped = t >= flip, colon = Math.floor(t * 2) % 2 === 0 || t < .3;
  const digits = (flipped ? txt(props, 'clockTo') : txt(props, 'clockFrom')).split(':');
  const flipK = clamp((t - flip) / .22), clockIn = sm((t - .05) / .45);
  const dark = sm((t - (dur - .55)) / .5);                         // 幕末压暗，只留曲线
  const axis = list<string>(props, 'axis').map(String);
  // 尖峰（夜醒）位置：与 lib 的 jitter 尖峰一致。
  const spikes = [.3, .58, .86];
  const head = CURVE.x0 + (CURVE.x1 - CURVE.x0) * reveal, headV = jitter(reveal);
  return <div style={{position: 'absolute', inset: 0, background: C.night, overflow: 'hidden', opacity: sm(t / .15)}}>
    <Plate asset={slot(props, 'bedroom-night')} frame={props.frame} p={t / dur} from={[1.03, 0, 0]} to={[1.11, -40, 10]} origin="72% 58%" />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,8,22,.78) 0%, rgba(4,8,22,.55) 38%, rgba(4,8,22,.05) 62%, rgba(4,8,22,.25) 100%)'}} />
    <Motes frame={props.frame} amount={.5} seed={3} opacity={.7} />
    {/* 醒着：枕边一圈圈淡珊瑚色涟漪 */}
    <Svg>{[0, 1, 2].map(i => {const q = ((t - wake) / 1.6 - i * .33); if (q < 0 || t < wake) return null; const r = (q % 1) * 120;
      return <circle key={i} cx={1485} cy={592} r={20 + r} fill="none" stroke={C.coral} strokeWidth={2} opacity={.55 * (1 - (q % 1)) * (1 - dark)} />;})}</Svg>
    <div style={{position: 'absolute', inset: 0, background: '#03060f', opacity: dark * .92}} />
    {/* 时钟 */}
    <div style={{position: 'absolute', left: 160, top: 64, opacity: clockIn * (1 - dark), fontFamily: props.fonts.text, fontWeight: 200, fontSize: 112,
      letterSpacing: 6, color: C.ice, textShadow: '0 0 30px rgba(124,200,255,.35)', fontVariantNumeric: 'tabular-nums', display: 'flex'}}>
      <span style={{display: 'inline-block', transform: `translateY(${flipped ? (1 - out3(flipK)) * -18 : 0}px)`, opacity: flipped ? .4 + .6 * flipK : 1}}>{digits[0]}</span>
      <span style={{opacity: colon ? .9 : .2, margin: '0 4px'}}>:</span>
      <span style={{display: 'inline-block', transform: `translateY(${flipped ? (1 - out3(flipK)) * -18 : 0}px)`, opacity: flipped ? .4 + .6 * flipK : 1}}>{digits[1]}</span>
    </div>
    <Text fonts={props.fonts} x={166} y={196} size={24} color={C.mist} spacing={6} opacity={clockIn * (1 - dark) * sm((t - c0 + .3) / .5)}>{txt(props, 'curveLabel')}</Text>
    {/* 忽高忽低的睡眠曲线 */}
    <Svg>
      <defs>
        <linearGradient id="hk-g" gradientUnits="userSpaceOnUse" x1="0" y1={CURVE.y - CURVE.amp} x2="0" y2={CURVE.y + CURVE.amp}>
          <stop offset="0" stopColor={C.coral} /><stop offset=".45" stopColor={C.ice} /><stop offset="1" stopColor={C.sky} /></linearGradient>
        <linearGradient id="hk-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.cyan} stopOpacity=".16" /><stop offset="1" stopColor={C.cyan} stopOpacity="0" /></linearGradient>
      </defs>
      <line x1={CURVE.x0} y1={CURVE.y + CURVE.amp + 26} x2={CURVE.x1} y2={CURVE.y + CURVE.amp + 26} stroke="rgba(232,240,255,.18)" strokeWidth={1.5} opacity={sm((t - c0 + .4) / .4)} />
      {reveal > .02 && <path d={`${curvePath(reveal)} L${head.toFixed(1)},${CURVE.y + CURVE.amp + 26} L${CURVE.x0},${CURVE.y + CURVE.amp + 26} Z`} fill="url(#hk-f)" />}
      {reveal > .02 && <path d={curvePath(reveal)} fill="none" stroke="url(#hk-g)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
        style={{filter: 'drop-shadow(0 0 10px rgba(124,200,255,.45))'}} />}
      {spikes.map((u, i) => {const q = sm((reveal - u) / .03); if (q <= 0) return null; const x = CURVE.x0 + (CURVE.x1 - CURVE.x0) * u, y = CURVE.y + CURVE.amp * (1 - 2 * jitter(u));
        return <g key={i} opacity={q}><circle cx={x} cy={y} r={7 + 5 * (1 - q)} fill={C.coral} /><circle cx={x} cy={y} r={18} fill={C.coral} opacity={.2} />
          <text x={x} y={y - 24} textAnchor="middle" fontSize={22} fill={C.coral} fontFamily={props.fonts.text} letterSpacing={2}>{txt(props, 'wakeLabel')}</text></g>;})}
      {reveal > .02 && reveal < .999 && <circle cx={head} cy={CURVE.y + CURVE.amp * (1 - 2 * headV)} r={8} fill={C.ice} style={{filter: 'drop-shadow(0 0 12px #cfe3ff)'}} />}
      {axis.length === 2 && <g opacity={sm((t - c0 + .4) / .4)} fontFamily={props.fonts.text} fontSize={20} fill="rgba(232,240,255,.5)">
        <text x={CURVE.x0} y={CURVE.y + CURVE.amp + 56}>{axis[0]}</text><text x={CURVE.x1} y={CURVE.y + CURVE.amp + 56} textAnchor="end">{axis[1]}</text></g>}
    </Svg>
    <Finish vignette={.55} />
  </div>;
}
