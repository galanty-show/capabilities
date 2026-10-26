import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《眠晓智能床垫》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版只内联本幕用到的底图（WebP data URI）。全部动作由帧号与旁白时间决定，无随机、无时钟。
const W = 1920, H = 1080;
const MEDIA: Record<string, string> = {"hero-dawn":"release-assets/7a54879f2e9d2b4dad616accc79d2d35f6aec962beb53422e76c1e714c598853.webp"};
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

// 收尾两幕共用：mode=hero 晨光里的产品英雄镜头，字标与口号按旁白落下（“睡得深”“醒得亮”各一拍，金线划过）；
// mode=end 结尾标版：月牙在地平线上圆成朝阳，品牌、型号、口号与“虚构品牌”说明。
export const meta = {
  params: {
    mode: {label: '画面', type: 'select', default: 'hero', options: [{value: 'hero', label: '产品英雄镜头'}, {value: 'end', label: '结尾标版'}]},
    brand: {label: '品牌名', type: 'text', default: '眠晓', maxLength: 8},
    latin: {label: '拉丁字标', type: 'text', default: 'MIANXIAO', maxLength: 16},
    model: {label: '型号与品类', type: 'text', default: '晓一 · 智能床垫', maxLength: 24},
    slogan: {label: '口号（两拍）', type: 'list', min: 2, max: 2, maxLength: 16, item: [{key: 'text', label: '文字'}, {key: 'cue', label: '卡点词'}],
      default: [{text: '睡得深，', cue: '睡得深'}, {text: '醒得亮。', cue: '醒得亮'}]},
    note: {label: '标版小字', type: 'text', default: '虚构品牌 · 文影演示样片', maxLength: 32},
    nameSize: {label: '英雄镜头品牌字号', type: 'number', default: 124, min: 40, max: 160, help: '品牌名较长（如西文字标）时调小，字距按比例跟着变'},
    sloganSize: {label: '英雄镜头口号字号', type: 'number', default: 66, min: 30, max: 90},
  },
};
const INK = '#3a2814';
export default function Finale(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const mode = txt(props, 'mode') === 'end' ? 'end' : 'hero';
  const slogan = list<{text: string; cue: string}>(props, 'slogan');
  const name = Array.from(txt(props, 'brand'));
  if (mode === 'end') {
    const mk = clamp((t - .1) / 1.4), word = sm((t - .5) / .6), sub = sm((t - .9) / .6), out = fadeEdges(t, dur, .01, .35);
    return <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 42%, #fff6e6 0%, #f6e3bf 55%, #eccb93 100%)', overflow: 'hidden', opacity: out}}>
      <Motes frame={props.frame} amount={.4} seed={41} color="214,160,80" opacity={.7} rise={.3} />
      <Svg><Mark x={960} y={300} size={120} p={mk} ink="#c98a2e" id="em" /></Svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: props.fonts.text, fontWeight: 300, fontSize: 120, letterSpacing: 40,
        paddingLeft: 40, color: INK, opacity: word, transform: `translateY(${(1 - word) * 16}px)`}}>{txt(props, 'brand')}</div>
      <Text fonts={props.fonts} x={960} y={548} size={22} align="center" spacing={14} color="#b07a2a" glow={false} opacity={word}>{txt(props, 'latin')}</Text>
      <Text fonts={props.fonts} x={960} y={606} size={34} align="center" spacing={6} color={INK} glow={false} opacity={sub}>{txt(props, 'model')}</Text>
      <Text fonts={props.fonts} x={960} y={668} size={30} align="center" spacing={8} color="#8a5a1c" glow={false} opacity={sub}>{slogan.map(s => s?.text ?? '').join('')}</Text>
      <Text fonts={props.fonts} x={960} y={850} size={20} align="center" spacing={4} color="rgba(58,40,20,.5)" glow={false} opacity={sub}>{txt(props, 'note')}</Text>
      <div style={{position: 'absolute', inset: 0, background: C.cream, opacity: 1 - sm(t / .45)}} />
    </div>;
  }
  const c1 = at(String(slogan[0]?.cue ?? ''), 1.4), c2 = Math.max(c1 + .5, at(String(slogan[1]?.cue ?? ''), c1 + .9));
  const word = sm((t - .1) / .7), s1 = sm((t - c1) / .45), s2 = sm((t - c2) / .45), glint = clamp((t - c2) / 1.3);
  return <div style={{position: 'absolute', inset: 0, background: '#2a1c0e', overflow: 'hidden'}}>
    <Plate asset={slot(props, 'hero-dawn')} frame={props.frame} p={t / dur} from={[1.2, 160, 0]} to={[1.14, 130, 0]} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(252,240,218,.78) 0%, rgba(252,240,218,.45) 26%, rgba(252,240,218,0) 40%)'}} />
    {/* 金色光带划过 */}
    {glint > 0 && glint < 1 && <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen',
      background: `linear-gradient(105deg, rgba(255,220,150,0) ${glint * 140 - 30}%, rgba(255,226,160,.5) ${glint * 140 - 20}%, rgba(255,220,150,0) ${glint * 140 - 10}%)`}} />}
    <Svg><Mark x={292} y={232} size={72} p={.55 + .45 * word} ink="#c98a2e" id="hm" /></Svg>
    <div style={{position: 'absolute', left: 190, top: 280, display: 'flex', fontFamily: props.fonts.text, fontWeight: 300, fontSize: num(props, 'nameSize'), color: INK, letterSpacing: num(props, 'nameSize') * 24 / 124}}>
      {name.map((ch, i) => {const q = sm((t - .1 - i * .14) / .6); return <span key={i} style={{opacity: q, transform: `translateY(${(1 - q) * 20}px)`, display: 'inline-block'}}>{ch}</span>;})}
    </div>
    <Text fonts={props.fonts} x={198} y={450} size={22} spacing={12} color="#b07a2a" glow={false} opacity={word}>{txt(props, 'latin')}</Text>
    <Text fonts={props.fonts} x={196} y={494} size={32} spacing={6} color={INK} glow={false} opacity={word}>{txt(props, 'model')}</Text>
    {slogan.slice(0, 2).map((line, i) => {const q = i === 0 ? s1 : s2;
      return <div key={i} style={{position: 'absolute', left: 192, top: 592 + i * 86, fontFamily: props.fonts.text, fontSize: num(props, 'sloganSize'), letterSpacing: num(props, 'sloganSize') * 10 / 66, fontWeight: 400,
        color: i === 0 ? '#7a4c14' : '#c27f1f', opacity: q, transform: `translateY(${(1 - q) * 18}px)`}}>{line?.text}</div>;})}
    <div style={{position: 'absolute', left: 198, top: 772, height: 3, width: 300 * out3((t - c2) / .8), background: 'linear-gradient(90deg, #c98a2e, rgba(201,138,46,0))'}} />
    <Finish vignette={.3} color="60,34,8" />
    {/* 从暖白淡入、淡回暖白再硬切到标版：暖色两幕之间不经过深色底 */}
    <div style={{position: 'absolute', inset: 0, background: C.cream, opacity: Math.max(1 - sm(t / .4), sm((t - (dur - .35)) / .3))}} />
  </div>;
}
