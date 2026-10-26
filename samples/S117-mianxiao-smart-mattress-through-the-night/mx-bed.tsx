import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《眠晓智能床垫》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版只内联本幕用到的底图（WebP data URI）。全部动作由帧号与旁白时间决定，无随机、无时钟。
const W = 1920, H = 1080;
const MEDIA: Record<string, string> = {"topdown":"release-assets/364054eb172a33738e4d022d8fa3cf7e4de8b518d2632e2e088d88a69f9dab73.webp"};
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

// 俯视床面（两幕共用一张底图，样片里只内联一次）：
// mode=pressure 压力热力图：念到“翻身”由仰卧变侧卧，念到肩、腰、臀那一区高亮、右侧软硬档位跟着调，“托住”时峰值压力降下来。
// mode=temp 左右温区：“她怕冷”“他怕热”两侧读数出场，“分区控温”中线落下，左侧暖光升温、右侧凉意降温。
export const meta = {
  params: {
    mode: {label: '画面', type: 'select', default: 'pressure', options: [{value: 'pressure', label: '压力分布'}, {value: 'temp', label: '左右温区'}]},
    title: {label: '标题', type: 'text', default: '', maxLength: 16, help: '留空时按画面用默认标题'},
    turnCue: {label: '翻身卡点词', type: 'text', default: '翻身', maxLength: 12},
    turnChip: {label: '翻身标记', type: 'text', default: '翻身 · 02:31', maxLength: 16},
    zones: {label: '七个分区', type: 'list', min: 7, max: 7, maxLength: 8, default: ['头', '肩', '背', '腰', '臀', '腿', '足']},
    adjust: {label: '调节卡点', type: 'list', min: 1, max: 7, maxLength: 16, item: [{key: 'cue', label: '卡点词'}, {key: 'zone', label: '分区序号 0–6', type: 'number'}, {key: 'delta', label: '档位变化', type: 'number'}],
      default: [{cue: '肩', zone: 1, delta: -1}, {cue: '腰', zone: 3, delta: 1}, {cue: '臀', zone: 4, delta: -1}], help: '念到 cue 时第 zone 区软硬档位变化 delta（负数调软）'},
    holdCue: {label: '托住卡点词', type: 'text', default: '托住', maxLength: 12},
    peak: {label: '峰值压力说明', type: 'text', default: '峰值压力 {n}%', maxLength: 24, help: '{n} 换成相对变化'},
    soft: {label: '调软/调硬字样', type: 'list', min: 2, max: 2, maxLength: 6, default: ['软', '硬']},
    legend: {label: '图例两端', type: 'list', min: 2, max: 2, maxLength: 6, default: ['低', '高']},
    sides: {label: '左右两侧', type: 'list', min: 2, max: 2, maxLength: 24, item: [{key: 'label', label: '名称'}, {key: 'cue', label: '卡点词'}, {key: 'from', label: '起始温度', type: 'number'}, {key: 'to', label: '目标温度', type: 'number'}],
      default: [{label: '她 · 怕冷', cue: '她怕冷', from: 25, to: 29}, {label: '他 · 怕热', cue: '他怕热', from: 27, to: 24}]},
    zoneCue: {label: '控温卡点词', type: 'text', default: '分区控温', maxLength: 12},
    comfyCue: {label: '舒适卡点词', type: 'text', default: '舒服', maxLength: 12},
    comfy: {label: '舒适字样', type: 'text', default: '舒适', maxLength: 8},
    demo: {label: '示意说明', type: 'text', default: '演示数据', maxLength: 16},
  },
};
const M = {x0: 660, x1: 1264, y0: 156, y1: 872};   // 床面在底图（幕坐标）里的位置
const ZONES = [0, .14, .3, .42, .52, .64, .84, 1];
const zy = (v: number) => M.y0 + (M.y1 - M.y0) * v;
type Blob = [number, number, number, number];       // u, v, sigma, weight
const SUPINE: Blob[] = [[.5, .1, .05, .55], [.36, .24, .055, .75], [.64, .24, .055, .75], [.5, .33, .08, .4], [.5, .5, .08, 1], [.42, .53, .06, .6], [.58, .53, .06, .6],
  [.42, .67, .045, .35], [.58, .67, .045, .35], [.43, .8, .035, .3], [.57, .8, .035, .3], [.44, .92, .028, .85], [.56, .92, .028, .85]];
const SIDE: Blob[] = [[.47, .1, .045, .5], [.53, .24, .05, 1], [.53, .35, .05, .45], [.53, .52, .058, 1], [.46, .68, .045, .65], [.5, .79, .035, .35], [.48, .89, .032, .6]];
const field = (blobs: Blob[], u: number, v: number, spread: number) => blobs.reduce((sum, [bu, bv, s, w]) => {
  const ss = s * spread; return sum + w * Math.exp(-(((u - bu) * .78) ** 2 + (v - bv) ** 2) / (2 * ss * ss));}, 0);
const RAMP: [number, string][] = [[0, '#14306e'], [.25, '#2a62e0'], [.5, '#2fc3e0'], [.72, '#ffc861'], [1, '#ff5d4d']];
function ramp(v: number, alpha: number) {
  const x = clamp(v); let i = 0; while (i < RAMP.length - 2 && x > RAMP[i + 1][0]) i++;
  const [a, ca] = RAMP[i], [b, cb] = RAMP[i + 1];
  return mixColor(ca, cb, (x - a) / (b - a), alpha);
}
function Heat({frame, turn, relief}: {frame: number; turn: number; relief: number}) {
  const cell = 16, cols = Math.floor((M.x1 - M.x0) / cell), rows = Math.floor((M.y1 - M.y0) / cell);
  const ref = useCanvas(frame, c => {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const u = (i + .5) / cols, v = (j + .5) / rows;
      const smear = Math.sin(Math.PI * turn) * .35;
      const val = ((1 - turn) * field(SUPINE, u, v, 1 + .15 * relief + smear) + turn * field(SIDE, u, v, 1 + .2 * relief + smear)) * (1 - .34 * relief);
      if (val < .06) continue;
      c.fillStyle = ramp(val, .25 + .6 * clamp(val * 1.4));
      const x = M.x0 + i * cell + 2, y = M.y0 + j * cell + 2;
      c.beginPath(); c.roundRect(x, y, cell - 4, cell - 4, 3); c.fill();
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />;
}
function Body({cx, k}: {cx: number; k: number}) {
  const w = (M.x1 - M.x0) * .22, top = zy(.04);
  return <g opacity={k} fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.42)" strokeWidth={2}>
    <ellipse cx={cx} cy={top + 46} rx={38} ry={46} />
    <rect x={cx - w / 2} y={zy(.17)} width={w} height={zy(.6) - zy(.17)} rx={w * .42} />
    <rect x={cx - w * .42} y={zy(.58)} width={w * .38} height={zy(.95) - zy(.58)} rx={w * .19} />
    <rect x={cx + w * .04} y={zy(.58)} width={w * .38} height={zy(.95) - zy(.58)} rx={w * .19} />
  </g>;
}
export default function Bed(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const mode = txt(props, 'mode') === 'temp' ? 'temp' : 'pressure';
  const fade = fadeEdges(t, dur, .3, .3);
  const plate = <Plate asset={slot(props, 'topdown')} frame={props.frame} p={t / dur} from={[1.0, 0, 0]} to={[1.035, 0, -6]} origin="50% 48%">
    {mode === 'pressure' ? <PressureLayer props={props} /> : <TempLayer props={props} />}
  </Plate>;
  return <div style={{position: 'absolute', inset: 0, background: '#05080f', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>{plate}</div>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,8,18,.82) 0%, rgba(5,8,18,.25) 30%, rgba(5,8,18,0) 34%, rgba(5,8,18,0) 66%, rgba(5,8,18,.25) 70%, rgba(5,8,18,.82) 100%)'}} />
    {mode === 'pressure' ? <PressurePanels props={props} /> : <TempPanels props={props} />}
    <NightBar minutes={mode === 'pressure' ? mix(212, 226, t / dur) : mix(350, 358, t / dur)} k={mode === 'pressure' ? .22 : .5} fonts={props.fonts} />
    <DemoTag fonts={props.fonts} label={txt(props, 'demo')} />
    <Finish vignette={.45} />
  </div>;
}
function pressureTimes(props: SceneInput) {
  const {t, at} = cues(props);
  const turn = sm((t - at(txt(props, 'turnCue'), .3) - .1) / 1.4), relief = sm((t - at(txt(props, 'holdCue'), 5.5)) / 1.2);
  return {t, turn, relief};
}
function PressureLayer({props}: {props: SceneInput}) {
  const {t, turn, relief} = pressureTimes(props), {at} = cues(props);
  const adjust = list<{cue: string; zone: number}>(props, 'adjust');
  const marks = adjust.map(a => ({zone: Number(a.zone), k: win(t, at(String(a.cue), -9), at(String(a.cue), -9) + 1.5, .2)}));
  const zonesIn = sm((t - at(String(adjust[0]?.cue ?? ''), 2.6) + .4) / .5);
  return <>
    <div style={{position: 'absolute', inset: 0, opacity: sm(t / .5)}}><Heat frame={props.frame} turn={turn} relief={relief} /></div>
    <Svg>
      {ZONES.slice(1, -1).map((v, i) => <line key={i} x1={M.x0 + 10} x2={M.x1 - 10} y1={zy(v)} y2={zy(v)} stroke="rgba(232,240,255,.4)" strokeWidth={1.5}
        strokeDasharray="8 10" opacity={zonesIn} />)}
      {marks.map((m, i) => m.k > 0 && ZONES[m.zone + 1] !== undefined && <rect key={i} x={M.x0 + 4} y={zy(ZONES[m.zone]) + 3} width={M.x1 - M.x0 - 8}
        height={zy(ZONES[m.zone + 1]) - zy(ZONES[m.zone]) - 6} rx={14} fill="rgba(242,194,123,.12)" stroke={C.gold} strokeWidth={3} opacity={m.k} />)}
    </Svg>
  </>;
}
function PressurePanels({props}: {props: SceneInput}) {
  const {t, turn, relief} = pressureTimes(props), {at} = cues(props);
  const zones = list<string>(props, 'zones').map(String);
  const labelW = Math.max(36, ...zones.map(z => /[\u2e80-\u9fff]/.test(z) ? 36 : Math.ceil(z.length * 14.5)));
  const adjust = list<{cue: string; zone: number; delta: number}>(props, 'adjust');
  const soft = list<string>(props, 'soft').map(String), legend = list<string>(props, 'legend').map(String);
  const tc = at(txt(props, 'turnCue'), .3), zonesIn = sm((t - at(String(adjust[0]?.cue ?? ''), 2.6) + .4) / .5);
  const level = zones.map((_, z) => 3 + adjust.reduce((sum, a) => Number(a.zone) === z ? sum + Number(a.delta) * sm((t - at(String(a.cue), 99)) / .6) : sum, 0));
  const lit = zones.map((_, z) => adjust.reduce((m, a) => Number(a.zone) === z ? Math.max(m, win(t, at(String(a.cue), -9), at(String(a.cue), -9) + 1.5, .2)) : m, 0));
  const title = txt(props, 'title') || '压力分布';
  return <>
    <Text fonts={props.fonts} x={150} y={180} size={40} weight={300} spacing={6} opacity={sm(t / .5)}>{title}</Text>
    <div style={{position: 'absolute', left: 152, top: 250, width: 300, height: 12, borderRadius: 6, opacity: sm(t / .5),
      background: `linear-gradient(90deg, ${RAMP.map(([p, c]) => `${c} ${p * 100}%`).join(', ')})`}} />
    <Text fonts={props.fonts} x={152} y={272} size={20} color={C.mist} glow={false} opacity={sm(t / .5)}>{legend[0]}</Text>
    <Text fonts={props.fonts} x={452} y={272} size={20} color={C.mist} glow={false} align="right" opacity={sm(t / .5)}>{legend[1]}</Text>
    {/* 翻身标记 */}
    <div style={{position: 'absolute', left: 150, top: 360, opacity: sm((t - tc) / .4), display: 'flex', alignItems: 'center', gap: 14}}>
      <svg width={44} height={44} viewBox="-22 -22 44 44"><path d="M-14 -4 A15 15 0 1 1 -4 14" fill="none" stroke={C.cyan} strokeWidth={3.5} strokeLinecap="round"
        transform={`rotate(${turn * 360})`} /><path d="M-19 -9 L-14 -2 L-8 -8" fill="none" stroke={C.cyan} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${turn * 360})`} /></svg>
      <span style={{fontFamily: props.fonts.text, fontSize: 30, color: C.ice, letterSpacing: 3}}>{txt(props, 'turnChip')}</span>
    </div>
    <div style={{position: 'absolute', left: 150, top: 460, opacity: relief, fontFamily: props.fonts.text}}>
      <div style={{fontSize: 24, color: C.mist, letterSpacing: 4}}>{fmt(txt(props, 'peak'), {n: ''}).trim()}</div>
      <div style={{fontSize: 84, fontWeight: 300, color: C.gold, fontVariantNumeric: 'tabular-nums', letterSpacing: 2}}>−{Math.round(34 * relief)}%</div>
    </div>
    {/* 右侧软硬档位 */}
    <div style={{position: 'absolute', inset: 0, opacity: zonesIn}}>
      {zones.map((z, i) => {  // labelW：中文一字 36 px；西文按字母数放宽，档位条随之右移
        const y = (zy(ZONES[i]) + zy(ZONES[i + 1])) / 2, lv = level[i], d = Math.round(lv - 3);
        return <div key={i} style={{position: 'absolute', left: 1320, top: y - 18, display: 'flex', alignItems: 'center', gap: 14, fontFamily: props.fonts.text}}>
          <span style={{width: labelW, fontSize: 26, color: lit[i] > .3 ? C.gold : C.ice, fontWeight: lit[i] > .3 ? 600 : 400}}>{z}</span>
          <div style={{display: 'flex', gap: 6}}>{[0, 1, 2, 3, 4].map(s => <div key={s} style={{width: 34, height: 14, borderRadius: 4,
            background: s < Math.floor(lv) ? (d < 0 ? C.cyan : d > 0 ? C.amber : 'rgba(232,240,255,.7)') : s < lv ? `rgba(232,240,255,${.7 * (lv - Math.floor(lv))})` : 'rgba(232,240,255,.14)'}} />)}</div>
          <span style={{fontSize: 22, color: d < 0 ? C.cyan : C.amber, opacity: d === 0 ? 0 : 1, letterSpacing: 1}}>{d < 0 ? `${soft[0] ?? ''} ${d}` : `${soft[1] ?? ''} +${d}`}</span>
        </div>;
      })}
    </div>
  </>;
}
function tempTimes(props: SceneInput) {
  const {t, at} = cues(props);
  const sides = list<{label: string; cue: string; from: number; to: number}>(props, 'sides');
  const zc = at(txt(props, 'zoneCue'), 2.6), heat = sm((t - zc) / 1.8), comfy = sm((t - at(txt(props, 'comfyCue'), zc + 2)) / .5);
  return {t, sides, zc, heat, comfy, s0: sm((t - at(String(sides[0]?.cue ?? ''), .2)) / .4), s1: sm((t - at(String(sides[1]?.cue ?? ''), 1.2)) / .4)};
}
function TempLayer({props}: {props: SceneInput}) {
  const {t, zc, heat, s0, s1} = tempTimes(props), mid = (M.x0 + M.x1) / 2, cy = zy(.4);
  return <Svg>
    <defs>
      <radialGradient id="tw" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor={C.amber} stopOpacity=".62" /><stop offset="1" stopColor={C.amber} stopOpacity=".04" /></radialGradient>
      <radialGradient id="tc" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor={C.sky} stopOpacity=".55" /><stop offset="1" stopColor={C.cyan} stopOpacity=".04" /></radialGradient>
      <clipPath id="tl"><rect x={M.x0} y={M.y0} width={mid - M.x0} height={M.y1 - M.y0} rx={26} /></clipPath>
      <clipPath id="tr"><rect x={mid} y={M.y0} width={M.x1 - mid} height={M.y1 - M.y0} rx={26} /></clipPath>
    </defs>
    <rect x={M.x0} y={M.y0} width={mid - M.x0} height={M.y1 - M.y0} fill="url(#tw)" opacity={heat} />
    <rect x={mid} y={M.y0} width={M.x1 - mid} height={M.y1 - M.y0} fill="url(#tc)" opacity={heat} />
    <g clipPath="url(#tl)">{[0, 1, 2, 3].map(i => {const q = ((t - zc) * .5 + i / 4) % 1; return t < zc ? null :
      <circle key={i} cx={(M.x0 + mid) / 2} cy={cy} r={30 + q * 380} fill="none" stroke={C.amber} strokeWidth={3} opacity={.5 * (1 - q) * heat} />;})}</g>
    <g clipPath="url(#tr)">{Array.from({length: 9}, (_, i) => {const y = M.y0 + ((i * 84 + (t - zc) * 40) % (M.y1 - M.y0)); return t < zc ? null :
      <path key={i} d={`M${mid + 10} ${y} q 37 -14 75 0 t 75 0 t 75 0 t 75 0`} fill="none" stroke={C.cyan} strokeWidth={2} opacity={.45 * heat} />;})}</g>
    <line x1={mid} y1={M.y0 + 6} x2={mid} y2={mix(M.y0 + 6, M.y1 - 6, sm((t - zc + .2) / .7))} stroke={C.gold} strokeWidth={3} strokeDasharray="14 10" />
    <Body cx={(M.x0 + mid) / 2} k={.4 + .6 * s0} />
    <Body cx={(mid + M.x1) / 2} k={.4 + .6 * s1} />
  </Svg>;
}
function TempPanels({props}: {props: SceneInput}) {
  const {t, sides, heat, comfy, s0, s1} = tempTimes(props);
  const panel = (i: number, k: number) => {
    const side = sides[i] ?? {label: '', from: 0, to: 0}, v = mix(Number(side.from), Number(side.to), heat), warm = Number(side.to) > Number(side.from);
    const color = warm ? C.amber : C.cyan, x = i === 0 ? 150 : 1770;
    return <div key={i} style={{position: 'absolute', left: i === 0 ? x : undefined, right: i === 0 ? undefined : W - x, top: 330, opacity: k,
      transform: `translateY(${(1 - k) * 20}px)`, textAlign: i === 0 ? 'left' : 'right', fontFamily: props.fonts.text}}>
      <div style={{fontSize: 34, color: C.ice, letterSpacing: 4}}>{side.label}</div>
      <div style={{fontSize: 120, fontWeight: 200, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2, textShadow: `0 0 30px ${color}55`}}>{v.toFixed(1)}°</div>
      <div style={{fontSize: 24, color: C.mist, letterSpacing: 3, opacity: heat}}>{warm ? '↑' : '↓'} {Math.abs(Number(side.to) - Number(side.from)).toFixed(0)}°</div>
      <div style={{marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 24, border: `1px solid ${color}`,
        color, fontSize: 24, letterSpacing: 4, opacity: comfy}}>{txt(props, 'comfy')}</div>
    </div>;
  };
  return <>{panel(0, s0)}{panel(1, s1)}
    <Text fonts={props.fonts} x={960} y={900 - 4} size={1} opacity={0}>{''}</Text></>;
}
