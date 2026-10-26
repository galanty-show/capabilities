import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《眠晓智能床垫》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版只内联本幕用到的底图（WebP data URI）。全部动作由帧号与旁白时间决定，无随机、无时钟。
const W = 1920, H = 1080;
const MEDIA: Record<string, string> = {"cutaway":"release-assets/bf84846cb5b10f59a4dac42360de7554c703a22e8c63ded1958f7481dcdd568f.webp"};
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

// 睡眠分期：先是床垫剖面，念到“传感器”时传感层亮起、光点沿边缘流动；“心率”“呼吸”各弹出一张实时波形卡。
// 第二句起剖面退后，睡眠分期带状图按时间光标一段一段实时画出来，念到哪个分期哪一行就亮。
export const meta = {
  params: {
    sensorLabel: {label: '传感层说明', type: 'text', default: '压电传感层 · 无感监测', maxLength: 24},
    sensorCue: {label: '传感层卡点词', type: 'text', default: '传感器', maxLength: 12},
    heart: {label: '心率卡', type: 'list', min: 3, max: 3, maxLength: 12, default: ['心率', '58', '次/分'], help: '名称、读数、单位'},
    breath: {label: '呼吸卡', type: 'list', min: 3, max: 3, maxLength: 12, default: ['呼吸', '14', '次/分']},
    heartCue: {label: '心率卡点词', type: 'text', default: '心率', maxLength: 12},
    breathCue: {label: '呼吸卡点词', type: 'text', default: '呼吸', maxLength: 12},
    chartTitle: {label: '分期图标题', type: 'text', default: '睡眠分期', maxLength: 16},
    stages: {label: '四个分期', type: 'list', min: 4, max: 4, maxLength: 24, item: [{key: 'label', label: '名称'}, {key: 'cue', label: '卡点词'}],
      default: [{label: '清醒', cue: ''}, {label: '快速眼动', cue: '快速眼动'}, {label: '浅睡', cue: '浅睡'}, {label: '深睡', cue: '深睡'}],
      help: '从上到下：清醒、快速眼动、浅睡、深睡；cue 是旁白念到时这一行亮起的词'},
    demo: {label: '示意说明', type: 'text', default: '演示数据', maxLength: 16},
    nightLabel: {label: '进度条标题', type: 'text', default: '', maxLength: 12},
  },
};
const AX = {x0: 790, x1: 1730, y0: 418, lane: 84, span: 240, reach: 200};   // 分期图：23:00–03:00，画到 02:20
export default function Stages(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props);
  const sc = at(txt(props, 'sensorCue'), .5), hc = at(txt(props, 'heartCue'), 1.6), bc = at(txt(props, 'breathCue'), 2.4);
  const b0 = start(1, 4), b1 = Math.max(b0 + 2, end(1, dur - .6));
  const phase = sm((t - b0 + .35) / .8);                              // 0 剖面为主 → 1 分期图为主
  const draw = clamp((t - b0) / (b1 - b0 + .2)), cursor = AX.reach * easeInOut(draw);
  const minutes = t < b0 ? 0 : cursor;
  const stages = list<{label: string; cue: string}>(props, 'stages');
  const lit = stages.map(st => {const c = st?.cue ? at(String(st.cue), -10) : -10; return c < 0 ? 0 : win(t, c - .05, c + 1.6, .25);});
  const glow = sm((t - sc) / .5);
  const heart = list<string>(props, 'heart').map(String), breath = list<string>(props, 'breath').map(String);
  const hr = Number(heart[1]) || 58, jit = seeded(Math.floor(t * 1.2) + 7)(), hrNow = Math.round(hr + (jit - .5) * 2.4);
  const xOf = (m: number) => AX.x0 + (AX.x1 - AX.x0) * m / AX.span;
  const laneY = (row: number) => AX.y0 + row * AX.lane;
  // 心跳与呼吸波形（最近 3 秒，向左滚动）
  const beat = 60 / hr, br = 60 / (Number(breath[1]) || 14);
  const heartPath = Array.from({length: 121}, (_, i) => {const tt = t - 3 + i * 3 / 120, ph = ((tt % beat) + beat) % beat;
    const v = Math.exp(-(((ph - .08) / .025) ** 2)) - .35 * Math.exp(-(((ph - .16) / .04) ** 2)) + .18 * Math.exp(-(((ph - .42) / .08) ** 2));
    return `${(i * 3).toFixed(1)},${(40 - v * 34).toFixed(1)}`;}).join(' ');
  const breathPath = Array.from({length: 121}, (_, i) => {const tt = t - 3 + i * 3 / 120; return `${(i * 3).toFixed(1)},${(40 - 22 * Math.sin(tt / br * 6.283)).toFixed(1)}`;}).join(' ');
  const card = (y: number, k: number, label: string[], path: string, color: string, value: string) => <div style={{position: 'absolute', left: 120, top: y, width: 430, height: 140,
    borderRadius: 22, background: 'rgba(10,18,42,.72)', border: '1px solid rgba(124,200,255,.22)', opacity: k, transform: `translateX(${(1 - k) * -40}px)`}}>
    <Text fonts={props.fonts} x={26} y={20} size={24} color={C.mist} spacing={4} glow={false}>{label[0]}</Text>
    <div style={{position: 'absolute', left: 26, top: 52, fontFamily: props.fonts.text, fontSize: 60, fontWeight: 300, color: C.ice, fontVariantNumeric: 'tabular-nums'}}>
      {value}<span style={{fontSize: 22, color: C.mist, marginLeft: 8, letterSpacing: 2}}>{label[2]}</span></div>
    <svg width={190} height={80} viewBox="0 0 360 80" style={{position: 'absolute', right: 20, top: 34}}>
      <polyline points={path} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 6px ${color})`}} />
    </svg>
  </div>;
  return <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 65% 45%, #101d44 0%, #070d22 70%)', overflow: 'hidden'}}>
    <Plate asset={slot(props, 'cutaway')} frame={props.frame} p={0} from={[mix(.92, .86, phase), mix(250, 330, phase), mix(-20, -40, phase)]}
      to={[mix(.92, .86, phase), mix(250, 330, phase), mix(-20, -40, phase)]} opacity={mix(1, .32, phase)}>
      <Svg>
        <defs><radialGradient id="sg-g"><stop offset="0" stopColor={C.cyan} stopOpacity=".55" /><stop offset="1" stopColor={C.cyan} stopOpacity="0" /></radialGradient></defs>
        <ellipse cx={1000} cy={470} rx={700} ry={150} fill="url(#sg-g)" opacity={glow * (.55 + .25 * Math.sin(t * 4))} style={{mixBlendMode: 'screen'}} transform="rotate(-4 1000 470)" />
        {[[288, 405, 1070, 575], [1070, 575, 1645, 368]].map(([x1, y1, x2, y2], e) => Array.from({length: 6}, (_, i) => {
          const q = ((t - sc) * .45 + i / 6 + e * .08) % 1; if (t < sc) return null;
          return <circle key={`${e}-${i}`} cx={mix(x1, x2, q)} cy={mix(y1, y2, q)} r={6} fill="#dff6ff" opacity={glow * Math.sin(q * Math.PI)} style={{filter: 'drop-shadow(0 0 10px #7cc8ff)'}} />;}))}
        <circle cx={288} cy={405} r={8} fill={C.cyan} opacity={glow * (1 - phase)} />
      </Svg>
    </Plate>
    {/* 引线：剖面里传感层左尖（底图坐标 288,405）在幕上的位置 */}
    <Svg><polyline points={`${960 + (288 - 960) * .92 + 250},${540 + (405 - 540) * .92 - 20} 560,330 120,330`} fill="none" stroke={C.cyan} strokeWidth={2}
      strokeDasharray="900" strokeDashoffset={900 * (1 - glow)} opacity={1 - phase} /></Svg>
    <Text fonts={props.fonts} x={120} y={286} size={30} color={C.ice} spacing={4} opacity={glow * (1 - phase)}>{txt(props, 'sensorLabel')}</Text>
    {card(mix(470, 300, phase), sm((t - hc) / .45), heart, heartPath, C.coral, String(hrNow))}
    {card(mix(640, 470, phase), sm((t - bc) / .45), breath, breathPath, C.teal, breath[1] ?? '')}
    {/* 睡眠分期带状图 */}
    <div style={{position: 'absolute', left: 610, top: 300, width: 1170, height: 540, borderRadius: 28, background: 'rgba(8,14,36,.8)',
      border: '1px solid rgba(124,200,255,.2)', opacity: phase, transform: `translateY(${(1 - phase) * 30}px)`}} />
    <div style={{position: 'absolute', inset: 0, opacity: phase, transform: `translateY(${(1 - phase) * 30}px)`}}>
      <Text fonts={props.fonts} x={650} y={330} size={30} spacing={4} color={C.ice}>{txt(props, 'chartTitle')}</Text>
      <Text fonts={props.fonts} x={1740} y={336} size={20} spacing={3} color="rgba(232,240,255,.45)" align="right" glow={false}>{txt(props, 'demo')}</Text>
      {stages.map((st, row) => <Text key={row} fonts={props.fonts} x={650} y={laneY(row) + 24} size={22} spacing={2} glow={false}
        color={lit[row] > 0 ? mixColor(C.mist, STAGE[row].color, lit[row]) : C.mist} weight={lit[row] > .5 ? 600 : 400}>{st?.label}</Text>)}
      <Svg>
        {STAGE.map((_, row) => <rect key={row} x={AX.x0 - 10} y={laneY(row) + 8} width={AX.x1 - AX.x0 + 20} height={AX.lane - 16} rx={12}
          fill={STAGE[row].color} opacity={.05 + .16 * lit[row]} />)}
        {[0, 60, 120, 180, 240].map(m => <g key={m}><line x1={xOf(m)} y1={AX.y0} x2={xOf(m)} y2={laneY(4)} stroke="rgba(232,240,255,.08)" />
          <text x={xOf(m)} y={laneY(4) + 34} textAnchor="middle" fontSize={20} fill="rgba(232,240,255,.5)" fontFamily={props.fonts.text}>{clock(m)}</text></g>)}
        {HYPNO.filter(([a]) => a < cursor).map(([a, b, row], i, all) => {
          const bb = Math.min(b, cursor), y = laneY(row) + 14, next = all[i + 1];
          return <g key={i}>
            <rect x={xOf(a)} y={y} width={Math.max(0, xOf(bb) - xOf(a))} height={AX.lane - 28} rx={9} fill={STAGE[row].color} opacity={.55 + .45 * Math.max(lit[row], .4)} />
            {next && next[0] < cursor && <line x1={xOf(b)} y1={laneY(row) + AX.lane / 2} x2={xOf(b)} y2={laneY(next[2]) + AX.lane / 2} stroke="rgba(232,240,255,.35)" strokeWidth={2} />}
          </g>;})}
        {t >= b0 && <g><line x1={xOf(cursor)} y1={AX.y0 - 6} x2={xOf(cursor)} y2={laneY(4)} stroke={C.ice} strokeWidth={2} opacity={.8} />
          <circle cx={xOf(cursor)} cy={laneY(stageAt(cursor)) + AX.lane / 2} r={9} fill={C.ice} style={{filter: 'drop-shadow(0 0 10px #cfe3ff)'}} /></g>}
      </Svg>
    </div>
    <NightBar minutes={minutes} k={.12} fonts={props.fonts} label={txt(props, 'nightLabel')} opacity={sm(t / .5)} />
    <Finish vignette={.4} />
  </div>;
}
