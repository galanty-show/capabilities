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
const AGE_YEARS = [1950, 1970, 1990, 2000, 2010, 2020, 2024, 2030, 2040, 2050, 2060, 2070, 2075, 2080, 2090, 2100];
/** 65 岁及以上（十亿），WPP 2024。 */
const OLD = [.1263, .1950, .3236, .4217, .5321, .7368, .8329, 1.0059, 1.3134, 1.5754, 1.8473, 2.0315, 2.1348, 2.2427, 2.3575, 2.4173];
/** 18 岁以下（十亿）：WPP 2024 的 15 岁以下 + 15～24 岁组的 3/10（按组内均匀估算，仅用于画线；交叉年份与联合国“2070 年代末”一致）。 */
const KIDS = [1.0048, 1.5944, 2.0607, 2.2040, 2.2844, 2.4048, 2.3980, 2.3613, 2.3381, 2.3538, 2.3135, 2.2512, 2.2257, 2.1989, 2.1254, 2.0367];
const zip = (xs: number[], ys: number[]): [number, number][] => xs.map((x, i) => [x, ys[i]]);
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

// 世界在变老：18 岁以下与 65 岁及以上两条线（1950～2100），念到“孩子少了 / 寿命长了”弹出生育率与预期寿命两张数字卡；
// 第二句画完预测，两线在 2070 年代末交叉，念到“多过”时点亮交叉点。
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '世界在变老', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '老人将多过孩子', maxLength: 40, help: '图表的粗标题'},
    note: {label: '图表说明', type: 'text', default: '单位：亿人；2024 年后为联合国中位预测', maxLength: 100, help: '标题下方的说明小字'},
    yUnit: {label: '纵轴单位', type: 'text', default: '亿', maxLength: 16, help: '纵轴刻度数字后的单位；写成含 {b} 的格式（如 {b} bn）则按十亿显示'},
    kids: {label: '孩子线名', type: 'text', default: '18 岁以下（估算）', maxLength: 24, help: '孩子那条线的名字'},
    old: {label: '老人线名', type: 'text', default: '65 岁及以上', maxLength: 24, help: '老人那条线的名字'},
    cards: {label: '数字卡', type: 'list', min: 2, max: 2, maxLength: 48,
      item: [{key: 'title', label: '大字'}, {key: 'sub', label: '小字'}, {key: 'cue', label: '卡点词'}],
      default: [{title: '3.3 → 2.3', sub: '每位女性平均生育数，1990 → 2024 年', cue: '孩子少了'}, {title: '73.3 岁', sub: '全球出生时预期寿命，2024 年', cue: '寿命长了'}],
      help: '右上角的两张数字卡，旁白念到卡点词时出现'},
    crossCue: {label: '交叉卡点词', type: 'text', default: '多过', maxLength: 24, help: '旁白念到这个词时点亮交叉点'},
    cross: {label: '交叉大字', type: 'text', default: '2070 年代末', maxLength: 24, help: '交叉点的大字'},
    crossNote: {label: '交叉小字', type: 'text', default: '65 岁以上约 22 亿，超过 18 岁以下', maxLength: 56, help: '交叉点的小字'},
    source: {label: '来源', type: 'text', default: '来源：联合国《世界人口展望 2024》关键信息 3、5、8；分龄人口经 Our World in Data 整理，18 岁以下按 15–24 岁组均分估算', maxLength: 160, help: '图表下方的出处小字'},
  },
};
const kidsAt = curve(zip(AGE_YEARS, KIDS)), oldAt = curve(zip(AGE_YEARS, OLD));
/** 交叉年份：两条插值线之差变号处（二分）。 */
const CROSS = (() => {let lo = 2070, hi = 2085; for (let i = 0; i < 40; i++) {const m = (lo + hi) / 2; if (kidsAt(m) > oldAt(m)) lo = m; else hi = m;} return (lo + hi) / 2;})();
export default function Aging(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const a: Axis = {x0: 1950, x1: 2100, y0: 0, y1: 2.7, left: 200, right: 1500, top: 300, bottom: 700};
  const cards = list<{title: string; sub: string; cue: string}>(props, 'cards');
  const e0 = end(0, 3), s1 = start(1, e0 + .3), crossAt = at(txt(props, 'crossCue'), end(1, s1 + 4) - 1.2);
  let year = mix(1950, 2024, easeInOut((t - .3) / Math.max(1, e0 - .3)));
  year = mix(year, 2100, easeInOut((t - s1) / Math.max(1.2, crossAt + .9 - s1)));
  const past = Math.min(year, 2024), axesP = sm((t - .1) / .6), yU = txt(props, 'yUnit');
  const cardAt = cards.map((cd, i) => at(String(cd?.cue ?? ''), start(0, .3) + .4 + i * 1.1));
  const endLabel = sm((year - 2090) / 6);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .3)}}>
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={(t - .1) / .7} />
    <Svg>
      <Axes a={a} xticks={[1950, 2000, 2050, 2100]} yticks={[0, .5, 1, 1.5, 2, 2.5]} ylabel={v => v === 0 ? '0' : yU.includes('{') ? fmt(yU, {b: +v.toFixed(2)}) : `${Math.round(v * 10)} ${yU}`} p={axesP} c={c} font={font} />
      <line x1={X(a, 2024)} x2={X(a, 2024)} y1={a.top} y2={a.bottom} stroke={alpha(c.ink, .18)} strokeWidth={1.5} strokeDasharray="4 6" opacity={axesP} />
      <path d={linePath(a, kidsAt, 1950, past, 1)} fill="none" stroke={c.accent} strokeWidth={5} />
      <path d={linePath(a, oldAt, 1950, past, 1)} fill="none" stroke={BLUE} strokeWidth={5} />
      <path d={linePath(a, kidsAt, 2024, year, 1)} fill="none" stroke={c.accent} strokeWidth={4.5} strokeDasharray="10 9" />
      <path d={linePath(a, oldAt, 2024, year, 1)} fill="none" stroke={BLUE} strokeWidth={4.5} strokeDasharray="10 9" />
      {year > 1951 && <><Head x={X(a, year)} y={Y(a, kidsAt(year))} color={c.accent} r={6} glow={1 - endLabel} /><Head x={X(a, year)} y={Y(a, oldAt(year))} color={BLUE} r={6} glow={1 - endLabel} /></>}
      <g fontFamily={font} fontSize={26} fontWeight={800}>
        <text x={X(a, 1988)} y={Y(a, kidsAt(1988)) + 44} fill={c.accent} opacity={sm((year - 1995) / 8)}>{txt(props, 'kids')}</text>
        <text x={X(a, 1953)} y={Y(a, oldAt(1953)) - 22} fill={BLUE} opacity={sm((year - 1985) / 8)}>{txt(props, 'old')}</text>
      </g>
      <Callout x={X(a, CROSS)} y={Y(a, oldAt(CROSS))} title={txt(props, 'cross')} sub={txt(props, 'crossNote')} color={c.ink} p={(t - crossAt) / .5} c={c} font={font} side="left" dy={-110} size={40} />
    </Svg>
    {cards.slice(0, 2).map((cd, i) => {
      const p = (t - cardAt[i]) / .45;
      return <div key={i} style={{position: 'absolute', left: 1560, top: 300 + i * 190, width: 320, fontFamily: font, opacity: clamp(p * 2), transform: `translateX(${(1 - out3(p)) * 40}px)`,
        borderLeft: `4px solid ${i === 0 ? c.accent : BLUE}`, paddingLeft: 20}}>
        <div style={{fontSize: 48, fontWeight: 800, color: c.ink, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{String(cd?.title ?? '')}</div>
        <div style={{fontSize: 21, color: c.muted, marginTop: 8, lineHeight: 1.4}}>{String(cd?.sub ?? '')}</div>
      </div>;
    })}
    <Source text={txt(props, 'source')} c={c} font={font} p={axesP} />
    <Finish c={c} />
  </div>;
}
