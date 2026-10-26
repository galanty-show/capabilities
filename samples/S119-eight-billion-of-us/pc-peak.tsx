import React from 'react';
import {clamp, easeInOut, useCanvas, useScene, type SceneInput} from '@talkframe/scene';
// 《人类走到 80 亿》共用画面库：全部画面由代码绘制，没有图片、视频与字体文件。
// prepare.py 把它和每幕正文拼成 scenes/<module>.tsx。每帧只由 frame、句子时间与常量数据决定：无随机数、无时钟。


const W = 1920;
const H = 1080;
const BLUE = '#86a9d6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const fadeEdges = (t: number, dur: number, inS = .25, outS = .3) => Math.min(sm(t / inS), sm((dur - t) / outS));
/** 主题色（播放页可换配色）：背景、正文、次要文字、强调色读 props.theme；数据系列色写死。 */
type Pal = {bg: string; ink: string; muted: string; accent: string};
const pal = (props: SceneInput): Pal => ({bg: props.theme.background, ink: props.theme.text, muted: props.theme.muted, accent: props.theme.accent});
/** '#rrggbb' / '#rgb' + 透明度 → rgba()；其他写法原样返回。 */
function alpha(color: string, a: number) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return color;
  const hex = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  const n = parseInt(hex, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback: number, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const count = props.sentences.length;
  return {s, t: s.t, at, start, end, dur: s.seconds, count};
}
/** 世界人口（十亿）：公元元年～1940 年为联合国人口司《世界六十亿》（1999）表 1；1950 年起为《世界人口展望 2024》（WPP 2024）年中估计与中位预测。 */
const WORLD: [number, number][] = [[0, .30], [1000, .31], [1250, .40], [1500, .50], [1750, .79], [1800, .98], [1850, 1.26], [1900, 1.65], [1910, 1.75],
  [1920, 1.86], [1930, 2.07], [1940, 2.30], [1950, 2.493], [1960, 3.015], [1970, 3.695], [1980, 4.448], [1990, 5.328], [2000, 6.172], [2010, 7.022],
  [2020, 7.887], [2022, 8.021], [2023, 8.092], [2024, 8.162], [2030, 8.569], [2040, 9.177], [2050, 9.664], [2060, 9.989], [2070, 10.189], [2080, 10.283],
  [2084, 10.289], [2090, 10.272], [2100, 10.180]];
/** 单调三次插值（Fritsch–Carlson）：过数据点、不过冲，只用来把稀疏年份连成平滑的线。 */
function curve(points: [number, number][]) {
  const n = points.length, xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = xs.map((_, i) => i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {m[i] = m[i + 1] = 0; continue;}
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) {const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i];}
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}
const worldAt = curve(WORLD);
type Axis = {x0: number; x1: number; y0: number; y1: number; left: number; right: number; top: number; bottom: number};
const X = (a: Axis, v: number) => mix(a.left, a.right, (v - a.x0) / (a.x1 - a.x0));
const Y = (a: Axis, v: number) => mix(a.bottom, a.top, (v - a.y0) / (a.y1 - a.y0));
/** 折线路径：从 from 年画到 to 年（to < from 时为空）。 */
function linePath(a: Axis, f: (x: number) => number, from: number, to: number, step = .5) {
  if (to <= from) return '';
  const pts: string[] = [];
  for (let x = from; x < to; x += step) pts.push(`${X(a, x).toFixed(1)},${Y(a, f(x)).toFixed(1)}`);
  pts.push(`${X(a, to).toFixed(1)},${Y(a, f(to)).toFixed(1)}`);
  return 'M' + pts.join('L');
}
/** 网格、刻度与刻度文字；p 为显现进度。 */
function Axes({a, xticks, yticks, xlabel = (v: number) => String(v), ylabel = (v: number) => String(v), p = 1, c, font, zero}:
  {a: Axis; xticks: number[]; yticks: number[]; xlabel?: (v: number) => string; ylabel?: (v: number) => string; p?: number; c: Pal; font: string; zero?: boolean}) {
  return <g opacity={p} fontFamily={font}>
    {yticks.map(v => <g key={`y${v}`}>
      <line x1={a.left} x2={mix(a.left, a.right, sm(p * 1.4))} y1={Y(a, v)} y2={Y(a, v)} stroke={alpha(c.ink, zero && v === 0 ? .45 : .1)} strokeWidth={zero && v === 0 ? 2 : 1} />
      <text x={a.left - 18} y={Y(a, v) + 8} textAnchor="end" fontSize={22} fill={c.muted} style={{fontVariantNumeric: 'tabular-nums'}}>{ylabel(v)}</text>
    </g>)}
    <line x1={a.left} x2={a.right} y1={a.bottom} y2={a.bottom} stroke={alpha(c.ink, .35)} strokeWidth={2} />
    {xticks.map(v => <g key={`x${v}`}>
      <line x1={X(a, v)} x2={X(a, v)} y1={a.bottom} y2={a.bottom + 10} stroke={alpha(c.ink, .35)} strokeWidth={2} />
      <text x={X(a, v)} y={a.bottom + 40} textAnchor="middle" fontSize={22} fill={c.muted} style={{fontVariantNumeric: 'tabular-nums'}}>{xlabel(v)}</text>
    </g>)}
  </g>;
}
/** 折线头：发光圆点。 */
const Head = ({x, y, color, r = 9, glow = 1}: {x: number; y: number; color: string; r?: number; glow?: number}) => <g>
  <circle cx={x} cy={y} r={r * 3.2} fill={color} opacity={.16 * glow} />
  <circle cx={x} cy={y} r={r * 1.8} fill={color} opacity={.22 * glow} />
  <circle cx={x} cy={y} r={r} fill={color} />
</g>;
/** 数据标注：竖线 + 圆点 + 两行字。 */
function Callout({x, y, title, sub, color, p, c, font, side = 'right', dy = -70, size = 40}:
  {x: number; y: number; title: string; sub?: string; color: string; p: number; c: Pal; font: string; side?: 'left' | 'right'; dy?: number; size?: number}) {
  if (p <= 0) return null;
  const k = out3(p), tx = x + (side === 'right' ? 22 : -22), anchor = side === 'right' ? 'start' : 'end';
  return <g opacity={clamp(p * 2.5)} fontFamily={font}>
    <line x1={x} x2={x} y1={y} y2={y + dy * k} stroke={color} strokeWidth={2} strokeDasharray="4 6" />
    <circle cx={x} cy={y} r={8 + 10 * (1 - k)} fill="none" stroke={color} strokeWidth={3} opacity={1 - .4 * k} />
    <text x={tx} y={y + dy * k - 6} textAnchor={anchor} fontSize={size} fontWeight={800} fill={color} style={{fontVariantNumeric: 'tabular-nums'}}>{title}</text>
    {sub ? <text x={tx} y={y + dy * k + 26} textAnchor={anchor} fontSize={22} fill={c.muted}>{sub}</text> : null}
  </g>;
}
/** 图表标题区（数据新闻式：小标签 + 粗标题 + 单位说明）。 */
function Header({kicker, title, note, c, font, p = 1, x = 120, y = 70}: {kicker: string; title: string; note?: string; c: Pal; font: string; p?: number; x?: number; y?: number}) {
  return <div style={{position: 'absolute', left: x, top: y, fontFamily: font, opacity: sm(p * 1.6), transform: `translateY(${(1 - out3(p)) * 18}px)`}}>
    <div style={{fontSize: 22, letterSpacing: 4, color: c.accent, fontWeight: 700}}>{kicker}</div>
    <div style={{fontSize: 50, fontWeight: 800, color: c.ink, marginTop: 8, letterSpacing: 1}}>{title}</div>
    {note ? <div style={{fontSize: 24, color: c.muted, marginTop: 8}}>{note}</div> : null}
  </div>;
}
/** 来源行：画在字幕带上方。 */
const Source = ({text, c, font, p = 1, x = 120, y = 790}: {text: string; c: Pal; font: string; p?: number; x?: number; y?: number}) => !text ? null :
  <div style={{position: 'absolute', left: x, top: y, right: 120, fontFamily: font, fontSize: 18, color: alpha(c.muted, .9), opacity: p, letterSpacing: .5, whiteSpace: 'nowrap', overflow: 'hidden'}}>{text}</div>;
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 暗角 + 顶部微光：数据新闻的“纸面”质感（纯渐变，确定性渲染）。 */
const Finish = ({c, vignette = .55}: {c: Pal; vignette?: number}) => <>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 38%, ${alpha(c.ink, .045)} 0%, rgba(0,0,0,0) 55%)`}} />
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,${vignette}) 100%)`}} />
</>;

// 峰值与不确定：世界人口实线先画到 2024 年，第一句时虚线（联合国中位预测）往后走，念到“峰值”在 2084 年前后点亮约 103 亿；
// 念到“不确定”时预测区间的扇形从 2024 年展开，念到“九十亿”时在 2100 年立起 90～114 亿的区间标尺。
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '峰值', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '会一直涨下去吗', maxLength: 40, help: '图表的粗标题'},
    note: {label: '图表说明', type: 'text', default: '单位：亿人；联合国中位预测与 95% 预测区间', maxLength: 100, help: '标题下方的说明小字'},
    yUnit: {label: '纵轴单位', type: 'text', default: '亿', maxLength: 16, help: '纵轴刻度数字后的单位；写成含 {b} 的格式（如 {b} bn）则按十亿显示'},
    peakCue: {label: '峰值卡点词', type: 'text', default: '峰值', maxLength: 24, help: '旁白念到这个词时点亮峰值'},
    peak: {label: '峰值大字', type: 'text', default: '约 103 亿', maxLength: 16, help: '峰值标注的大字'},
    peakNote: {label: '峰值小字', type: 'text', default: '2080 年代中期见顶（中位预测）', maxLength: 32, help: '峰值标注的小字'},
    fanCue: {label: '区间卡点词', type: 'text', default: '不确定', maxLength: 24, help: '旁白念到这个词时展开预测区间'},
    fan: {label: '区间说明', type: 'text', default: '95% 预测区间', maxLength: 24, help: '扇形里的字'},
    rangeCue: {label: '区间标尺卡点词', type: 'text', default: '九十亿', maxLength: 24, help: '旁白念到这个词时立起 2100 年的区间标尺'},
    range: {label: '区间大字', type: 'text', default: '90–114 亿', maxLength: 24, help: '2100 年区间标尺旁的大字'},
    rangeNote: {label: '区间小字', type: 'text', default: '2100 年 · 95% 的可能', maxLength: 32, help: '区间标尺旁的小字'},
    odds: {label: '见顶概率', type: 'text', default: '本世纪内见顶的可能：约 80%', maxLength: 48, help: '右上角的小字'},
    fanNote: {label: '扇形说明', type: 'text', default: '扇形中间年份为示意，2100 年两端为联合国公布值', maxLength: 72, help: '扇形下方的小字'},
    source: {label: '来源', type: 'text', default: '来源：联合国《世界人口展望 2024：结果摘要》第 8、41 页；1950–2023 年为估计', maxLength: 160, help: '图表下方的出处小字'},
  },
};
const LO_2100 = 9.0, HI_2100 = 11.4;
/** 区间半宽：2024 年为 0，往后按 1.5 次方变宽，2100 年两端正好是公布值。 */
const widen = (y: number) => Math.pow(clamp((y - 2024) / 76), 1.5);
export default function Peak(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const a: Axis = {x0: 1950, x1: 2100, y0: 2, y1: 12.2, left: 200, right: 1500, top: 290, bottom: 700};
  const s0 = start(0, .3), peakAt = at(txt(props, 'peakCue'), end(0, s0 + 6) - 2);
  const fanAt = at(txt(props, 'fanCue'), start(1, peakAt + 3) + .6), rangeAt = at(txt(props, 'rangeCue'), fanAt + 3);
  // 实线 1.2 秒画到 2024 年；虚线（中位预测）跟着第一句走到 2084 年的峰值，再画完到 2100 年。
  const past = mix(1950, 2024, easeInOut((t - .15) / 1.2));
  let proj = mix(2024, 2084, easeInOut((t - 1.3) / Math.max(1, peakAt - 1.3)));
  proj = mix(proj, 2100, easeInOut((t - peakAt - .2) / 1.4));
  const fan = easeInOut((t - fanAt) / 1.6), fanTo = mix(2024, 2100, fan), med2100 = worldAt(2100);
  const lo = (y: number) => worldAt(y) - (med2100 - LO_2100) * widen(y), hi = (y: number) => worldAt(y) + (HI_2100 - med2100) * widen(y);
  let band = '';
  if (fanTo > 2025) {
    const top: string[] = [], bottom: string[] = [];
    for (let y = 2024; y <= fanTo; y += 1) {top.push(`${X(a, y).toFixed(1)},${Y(a, hi(y)).toFixed(1)}`); bottom.unshift(`${X(a, y).toFixed(1)},${Y(a, lo(y)).toFixed(1)}`);}
    band = 'M' + top.concat(bottom).join('L') + 'Z';
  }
  const axesP = sm((t - .1) / .6), yU = txt(props, 'yUnit'), rng = out3((t - rangeAt) / .5);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .4)}}>
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={(t - .1) / .7} />
    <div style={{position: 'absolute', right: 140, top: 150, fontFamily: font, fontSize: 24, color: BLUE, opacity: sm((t - fanAt - 1.4) / .5)}}>{txt(props, 'odds')}</div>
    <Svg>
      <Axes a={a} xticks={[1950, 2000, 2050, 2100]} yticks={[2, 4, 6, 8, 10, 12]} ylabel={v => yU.includes('{') ? fmt(yU, {b: +v.toFixed(2)}) : `${v * 10} ${yU}`} p={axesP} c={c} font={font} />
      {band && <path d={band} fill={alpha(BLUE, .2)} stroke={alpha(BLUE, .45)} strokeWidth={1.5} />}
      {fan > .6 && <text x={X(a, 2070)} y={Y(a, lo(2070)) + 34} textAnchor="middle" fontFamily={font} fontSize={24} fill={BLUE} opacity={sm((fan - .6) / .3)}>{txt(props, 'fan')}</text>}
      <path d={linePath(a, worldAt, 1950, past, 1)} fill="none" stroke={c.accent} strokeWidth={5} />
      <path d={linePath(a, worldAt, 2024, proj, 1)} fill="none" stroke={c.accent} strokeWidth={4.5} strokeDasharray="10 9" />
      <Head x={X(a, proj > 2024.2 ? proj : past)} y={Y(a, worldAt(proj > 2024.2 ? proj : past))} color={c.accent} r={7} />
      <Callout x={X(a, 2084)} y={Y(a, 10.289)} title={txt(props, 'peak')} sub={txt(props, 'peakNote')} color={c.accent} p={(t - peakAt) / .5} c={c} font={font} side="left" dy={-90} size={44} />
      {/* 2100 年区间标尺 */}
      <g opacity={rng} fontFamily={font}>
        <line x1={X(a, 2100) + 20} x2={X(a, 2100) + 20} y1={Y(a, LO_2100)} y2={Y(a, mix(LO_2100, HI_2100, rng))} stroke={BLUE} strokeWidth={4} />
        <line x1={X(a, 2100) + 10} x2={X(a, 2100) + 30} y1={Y(a, LO_2100)} y2={Y(a, LO_2100)} stroke={BLUE} strokeWidth={4} />
        <line x1={X(a, 2100) + 10} x2={X(a, 2100) + 30} y1={Y(a, HI_2100)} y2={Y(a, HI_2100)} stroke={BLUE} strokeWidth={4} opacity={rng} />
        <text x={X(a, 2100) + 48} y={Y(a, 10.2) - 4} fontSize={40} fontWeight={800} fill={BLUE}>{txt(props, 'range')}</text>
        <text x={X(a, 2100) + 48} y={Y(a, 10.2) + 32} fontSize={22} fill={c.muted}>{txt(props, 'rangeNote')}</text>
      </g>
      <text x={X(a, 2024) + 20} y={Y(a, 3) } fontFamily={font} fontSize={20} fill={c.muted} opacity={sm((fan - .8) / .2)}>{txt(props, 'fanNote')}</text>
    </Svg>
    <Source text={txt(props, 'source')} c={c} font={font} p={axesP} />
    <Finish c={c} />
  </div>;
}
