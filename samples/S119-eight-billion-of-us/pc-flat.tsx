import React from 'react';
import {clamp, easeInOut, useCanvas, useScene, type SceneInput} from '@talkframe/scene';
// 《人类走到 80 亿》共用画面库：全部画面由代码绘制，没有图片、视频与字体文件。
// prepare.py 把它和每幕正文拼成 scenes/<module>.tsx。每帧只由 frame、句子时间与常量数据决定：无随机数、无时钟。


const W = 1920;
const H = 1080;
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
/** 列表参数（文字或对象）。 */
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) ? value as T[] : (meta as any).params?.[key]?.default ?? [];
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
/** 滚动计数器（里程表式）：低位按帧翻动，高位在低位进位时滚过去。 */
function Odometer({value, size, color, font, weight = 800, grouping = true}: {value: number; size: number; color: string; font: string; weight?: number; grouping?: boolean}) {
  const v = Math.max(0, value), digits = Math.max(1, Math.floor(v).toString().length), lineH = size * 1.1;
  const cells: any[] = [];
  for (let d = digits - 1; d >= 0; d--) {
    const p = Math.pow(10, d), base = Math.floor(v / p) % 10;
    const carry = d === 0 ? 0 : sm(((v % p) / p) * 10 - 9);
    const pos = base + carry;
    cells.push(<span key={`d${d}`} style={{display: 'inline-block', height: lineH, overflow: 'hidden', verticalAlign: 'top', width: size * .6, textAlign: 'center'}}>
      <span style={{display: 'block', transform: `translateY(${-pos * lineH}px)`}}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => <span key={i} style={{display: 'block', height: lineH, lineHeight: `${lineH}px`}}>{n}</span>)}
      </span>
    </span>);
    if (grouping && d > 0 && d % 3 === 0) cells.push(<span key={`c${d}`} style={{display: 'inline-block', width: size * .26, textAlign: 'center', lineHeight: `${lineH}px`}}>,</span>);
  }
  return <span style={{fontFamily: font, fontSize: size, fontWeight: weight, color, display: 'inline-block', height: lineH, lineHeight: `${lineH}px`, whiteSpace: 'nowrap'}}>{cells}</span>;
}

// 平线：世界人口从公元元年画到今天，真实比例下前一千八百年几乎贴着地面；念到“然后，这条线竖了起来”时线头冲上去。
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '世界人口', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '一千八百年，几乎是一条平线', maxLength: 40, help: '图表的粗标题'},
    note: {label: '单位说明', type: 'text', default: '单位：亿人；纵轴为真实比例', maxLength: 100, help: '标题下方的单位小字'},
    yUnit: {label: '纵轴单位', type: 'text', default: '亿', maxLength: 16, help: '纵轴刻度数字后的单位；写成含 {b} 的格式（如 {b} bn）则按十亿显示'},
    firstYear: {label: '起点年份文字', type: 'text', default: '公元元年', maxLength: 12, help: '横轴起点的刻度文字'},
    marks: {label: '标注', type: 'list', min: 3, max: 3, maxLength: 24,
      item: [{key: 'title', label: '大字'}, {key: 'sub', label: '小字'}, {key: 'cue', label: '卡点词'}],
      default: [{title: '约 3 亿', sub: '公元元年', cue: '公元元年'}, {title: '约 5 亿', sub: '1500 年', cue: '一千五百年'}, {title: '约 82 亿', sub: '2024 年', cue: '然后'}],
      help: '依次标在公元元年、1500 年与 2024 年的数据点上；第三项的卡点词是线头开始冲上去的时刻'},
    yearUnit: {label: '年份单位', type: 'text', default: '年', maxLength: 8, help: '右上角线头年份后的单位'},
    recent: {label: '近两百年色带', type: 'text', default: '最近两百年', maxLength: 24, help: '图上 1824～2024 年色带的说明'},
    source: {label: '来源', type: 'text', default: '来源：联合国人口司《世界六十亿》（1999）表 1；1950 年起为《世界人口展望 2024》年中估计', maxLength: 160, help: '图表下方的出处小字'},
  },
};
export default function Flat(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const a: Axis = {x0: 0, x1: 2040, y0: 0, y1: 9, left: 200, right: 1760, top: 250, bottom: 720};
  const marks = list<{title: string; sub: string; cue: string}>(props, 'marks');
  const m0 = at(marks[0]?.cue ?? '', start(0, .4)), m1 = at(marks[1]?.cue ?? '', start(1, m0 + 3)), up = at(marks[2]?.cue ?? '', start(2, m1 + 2.6) + .5);
  // 线头年份：念到“公元元年”起画到 1000 年，念到“一千五百年”再爬到 1500 年；念到“然后”起 1.8 秒冲到 2024 年。
  let year = mix(0, 1000, sm((t - m0) / Math.max(.6, m1 - m0)));
  year = mix(year, 1500, sm((t - m1) / Math.max(.6, up - .6 - m1)));
  year = mix(year, 2024, sm((t - up + .2) / 1.8));
  const yU = txt(props, 'yUnit'), axesP = sm((t - .1) / .6);
  const hx = X(a, year), hy = Y(a, worldAt(year)), band = sm((t - up - 1.2) / .5);
  const label = (v: number) => v === 0 ? txt(props, 'firstYear') : String(v);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .25)}}>
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={t / .7} />
    <Svg>
      <rect x={X(a, 1824)} y={a.top - 10} width={X(a, 2024) - X(a, 1824)} height={a.bottom - a.top + 10} fill={alpha(c.accent, .1)} opacity={band} />
      <text x={X(a, 1824) - 12} y={a.top + 18} textAnchor="end" fontFamily={font} fontSize={22} fill={c.accent} opacity={band}>{txt(props, 'recent')}</text>
      <Axes a={a} xticks={[0, 500, 1000, 1500, 2000]} yticks={[0, 2, 4, 6, 8]} xlabel={label} ylabel={v => v === 0 ? '0' : yU.includes('{') ? fmt(yU, {b: +v.toFixed(2)}) : `${v * 10} ${yU}`} p={axesP} c={c} font={font} />
      <path d={linePath(a, worldAt, 0, year, 2)} fill="none" stroke={c.accent} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      {year > 1 && <Head x={hx} y={hy} color={c.accent} r={8} />}
      <Callout x={X(a, 0)} y={Y(a, .30)} title={marks[0]?.title ?? ''} sub={marks[0]?.sub} color={c.accent} p={(t - m0) / .5} c={c} font={font} dy={-120} />
      <Callout x={X(a, 1500)} y={Y(a, .50)} title={marks[1]?.title ?? ''} sub={marks[1]?.sub} color={c.accent} p={(t - m1) / .5} c={c} font={font} side="left" dy={-150} />
      <Callout x={X(a, 2024)} y={Y(a, 8.162)} title={marks[2]?.title ?? ''} sub={marks[2]?.sub} color={c.accent} p={(t - up - 1.6) / .5} c={c} font={font} side="left" dy={60} />
    </Svg>
    {/* 线头年份 */}
    <div style={{position: 'absolute', right: 150, top: 96, fontFamily: font, textAlign: 'right', color: c.ink, opacity: axesP}}>
      <Odometer value={Math.max(1, year)} size={64} color={c.ink} font={font} grouping={false} />
      <span style={{fontSize: 28, color: c.muted, marginLeft: 8, verticalAlign: 'top', lineHeight: '72px'}}>{txt(props, 'yearUnit')}</span>
    </div>
    <Source text={txt(props, 'source')} c={c} font={font} p={axesP} />
    <Finish c={c} />
  </div>;
}
