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
/** 全球人口年增长率（%），WPP 2024，1950～2023 年为估计（经 Our World in Data 整理）。 */
const RATE_EST = [1.738, 1.747, 1.935, 1.9, 1.993, 2.011, 1.978, 2.073, 1.997, 1.729, 1.584, 1.665, 2.112, 2.283, 2.159, 2.088, 2.039, 1.997, 2.093, 2.056,
  2.056, 1.972, 1.971, 1.938, 1.883, 1.803, 1.776, 1.745, 1.744, 1.786, 1.801, 1.816, 1.855, 1.783, 1.797, 1.799, 1.829, 1.836, 1.785, 1.778, 1.758,
  1.628, 1.568, 1.517, 1.466, 1.449, 1.419, 1.393, 1.365, 1.345, 1.353, 1.326, 1.304, 1.287, 1.283, 1.272, 1.277, 1.28, 1.282, 1.282, 1.269, 1.256,
  1.267, 1.233, 1.216, 1.178, 1.166, 1.125, 1.068, 1.027, .902, .801, .875, .871];
const RATE: [number, number][] = RATE_EST.map((v, i) => [1950 + i, v]);
/** WPP 2024 中位预测（%）。 */
const RATE_PROJ: [number, number][] = [[2023, .871], [2024, .858], [2025, .841], [2026, .83], [2028, .795], [2030, .764], [2035, .686], [2040, .607],
  [2045, .519], [2050, .421], [2055, .327], [2060, .253], [2065, .197], [2070, .147], [2075, .092], [2080, .035], [2085, -.013], [2090, -.052],
  [2095, -.09], [2100, -.127]];
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

// 转折：全球人口年增长率 1950～2023（实测估计）画到 1963 年的峰顶停住，念到“一九六三年”打上峰值；
// 再一路画下去，念到“不到百分之一”标出 2023 年；最后蓝色虚线接上联合国中位预测，在 2080 年代中期跌破零。
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '转折', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '全球人口年增长率', maxLength: 40, help: '图表的粗标题'},
    note: {label: '图表说明', type: 'text', default: '1950–2023 年为估计，之后为联合国中位预测', maxLength: 100, help: '标题下方的说明小字'},
    peakCue: {label: '峰值卡点词', type: 'text', default: '一九六三年', maxLength: 24, help: '旁白念到这个词时标出峰值'},
    peak: {label: '峰值大字', type: 'text', default: '约 2.3%', maxLength: 16, help: '峰值标注的大字'},
    peakNote: {label: '峰值小字', type: 'text', default: '1963 年 · 增长最快（2.28%）', maxLength: 32, help: '峰值标注的小字'},
    nowCue: {label: '今天卡点词', type: 'text', default: '不到百分之一', maxLength: 24, help: '旁白念到这个词时标出最近一年'},
    now: {label: '最近一年大字', type: 'text', default: '0.87%', maxLength: 16, help: '最近一年标注的大字'},
    nowNote: {label: '最近一年小字', type: 'text', default: '2023 年', maxLength: 32, help: '最近一年标注的小字'},
    proj: {label: '预测线说明', type: 'text', default: '联合国中位预测', maxLength: 24, help: '蓝色虚线旁的字'},
    zero: {label: '跌破零的说明', type: 'text', default: '2080 年代中期跌破 0', maxLength: 32, help: '预测线与零线交点旁的字'},
    source: {label: '来源', type: 'text', default: '来源：联合国《世界人口展望 2024》年增长率（经 Our World in Data 整理）', maxLength: 160, help: '图表下方的出处小字'},
  },
};
const rateAt = (x: number) => {const i = clamp(Math.floor(x - 1950), 0, RATE.length - 2), k = x - RATE[i][0]; return mix(RATE[i][1], RATE[i + 1][1], clamp(k));};
const projAt = curve(RATE_PROJ);
export default function Rate(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const a: Axis = {x0: 1950, x1: 2100, y0: -.45, y1: 2.6, left: 200, right: 1720, top: 260, bottom: 700};
  const peakAt = at(txt(props, 'peakCue'), start(1, 2) + 1.4), nowAt = at(txt(props, 'nowCue'), end(2, peakAt + 4) - 1.2);
  const lastEnd = end(props.sentences.length - 1, dur - .8);
  let year = mix(1950, 1963, easeInOut((t - .3) / Math.max(.8, peakAt - .3)));
  year = mix(year, 2023, easeInOut((t - peakAt - .9) / Math.max(1, nowAt - peakAt - .9)));
  const proj = mix(2023, 2100, easeInOut((t - lastEnd + .5) / 1.8));
  const axesP = sm((t - .1) / .6);
  const area = linePath(a, rateAt, 1950, year, 1);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .3)}}>
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={(t - .1) / .7} />
    <Svg>
      <Axes a={a} xticks={[1950, 1975, 2000, 2025, 2050, 2075, 2100]} yticks={[0, .5, 1, 1.5, 2, 2.5]} ylabel={v => `${v}%`} p={axesP} c={c} font={font} zero />
      {area && <path d={`${area}L${X(a, year).toFixed(1)},${Y(a, 0).toFixed(1)}L${X(a, 1950)},${Y(a, 0)}Z`} fill={alpha(c.accent, .12)} />}
      <path d={area} fill="none" stroke={c.accent} strokeWidth={4.5} strokeLinejoin="round" />
      {year > 1950.5 && t < lastEnd && <Head x={X(a, year)} y={Y(a, rateAt(year))} color={c.accent} r={7} />}
      <path d={linePath(a, projAt, 2023, proj, 1)} fill="none" stroke={BLUE} strokeWidth={4} strokeDasharray="10 10" />
      {proj > 2024 && <g fontFamily={font} opacity={sm((proj - 2030) / 10)}>
        <text x={X(a, 2045)} y={Y(a, projAt(2045)) - 24} fontSize={24} fill={BLUE}>{txt(props, 'proj')}</text>
      </g>}
      <Callout x={X(a, 2084)} y={Y(a, 0)} title={txt(props, 'zero')} color={BLUE} p={(proj - 2088) / 6} c={c} font={font} side="left" dy={110} size={26} />
      <Callout x={X(a, 1963)} y={Y(a, 2.283)} title={txt(props, 'peak')} sub={txt(props, 'peakNote')} color={c.accent} p={(t - peakAt) / .5} c={c} font={font} dy={-30} size={48} />
      <Callout x={X(a, 2023)} y={Y(a, .871)} title={txt(props, 'now')} sub={txt(props, 'nowNote')} color={c.accent} p={(t - nowAt) / .5} c={c} font={font} dy={-150} size={44} />
    </Svg>
    <Source text={txt(props, 'source')} c={c} font={font} p={axesP} />
    <Finish c={c} />
  </div>;
}
