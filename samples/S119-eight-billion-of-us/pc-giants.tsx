import React from 'react';
import {clamp, easeInOut, useCanvas, useScene, type SceneInput} from '@talkframe/scene';
// 《人类走到 80 亿》共用画面库：全部画面由代码绘制，没有图片、视频与字体文件。
// prepare.py 把它和每幕正文拼成 scenes/<module>.tsx。每帧只由 frame、句子时间与常量数据决定：无随机数、无时钟。


const W = 1920;
const H = 1080;
const CORAL = '#e4674f';
const TEAL = '#45b8a6';
const GOLD = '#ffd58a';
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
const CI_YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2015, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100];
/** 中国、印度人口（十亿），WPP 2024 年中估计（～2023）与中位预测（2024～）。 */
const CHINA = [.5440, .6548, .8233, .9832, 1.1536, 1.2696, 1.3516, 1.3961, 1.4190, 1.4235, 1.4261, 1.4264, 1.4252, 1.4226, 1.4193, 1.4161, 1.3982, 1.3428,
  1.2603, 1.1351, .9988, .8703, .7449, .6334];
const INDIA = [.3463, .4360, .5459, .6874, .8650, 1.0579, 1.2435, 1.3280, 1.3747, 1.3890, 1.4026, 1.4142, 1.4254, 1.4381, 1.4509, 1.4639, 1.5251, 1.6226,
  1.6796, 1.7010, 1.6892, 1.6455, 1.5803, 1.5053];
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

// 人口第一大国换位：中国、印度两条线从 1950 年画起，念到“超过”时在交叉处亮起高光；念到“减少”时接上联合国中位预测，
// 中国一路往下，印度在 2060 年代初见顶。
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '人口第一大国', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '印度超过中国', maxLength: 40, help: '图表的粗标题'},
    note: {label: '图表说明', type: 'text', default: '单位：亿人；2024 年后为联合国中位预测', maxLength: 100, help: '标题下方的说明小字'},
    yUnit: {label: '纵轴单位', type: 'text', default: '亿', maxLength: 16, help: '纵轴刻度数字后的单位；写成含 {b} 的格式（如 {b} bn）则按十亿显示'},
    china: {label: '中国线名', type: 'text', default: '中国', maxLength: 16, help: '中国那条线的名字'},
    india: {label: '印度线名', type: 'text', default: '印度', maxLength: 16, help: '印度那条线的名字'},
    crossCue: {label: '交叉卡点词', type: 'text', default: '超过', maxLength: 24, help: '旁白念到这个词时点亮交叉点'},
    cross: {label: '交叉大字', type: 'text', default: '2022–2023 年间交叉', maxLength: 32, help: '交叉点的大字'},
    crossNote: {label: '交叉小字', type: 'text', default: '两国各约 14.3 亿；具体日期为估计', maxLength: 56, help: '交叉点的小字'},
    projCue: {label: '预测卡点词', type: 'text', default: '减少', maxLength: 24, help: '旁白念到这个词时画出预测'},
    chinaEnd: {label: '中国 2100 标注', type: 'text', default: '2100 年约 6.3 亿', maxLength: 32, help: '中国线末端的字'},
    indiaEnd: {label: '印度 2100 标注', type: 'text', default: '2100 年约 15.1 亿', maxLength: 32, help: '印度线末端的字'},
    source: {label: '来源', type: 'text', default: '来源：联合国《世界人口展望 2024》年中人口；联合国经社部政策简报第 153 号（2023）；交叉日期随修订版本略有不同', maxLength: 160, help: '图表下方的出处小字'},
  },
};
const chinaAt = curve(zip(CI_YEARS, CHINA)), indiaAt = curve(zip(CI_YEARS, INDIA));
const CROSS = (() => {let lo = 2015, hi = 2024; for (let i = 0; i < 40; i++) {const m = (lo + hi) / 2; if (chinaAt(m) > indiaAt(m)) lo = m; else hi = m;} return (lo + hi) / 2;})();
export default function Giants(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const a: Axis = {x0: 1950, x1: 2100, y0: .2, y1: 1.85, left: 200, right: 1560, top: 290, bottom: 700};
  const crossAt = at(txt(props, 'crossCue'), start(0, .3) + 2.6), projAt = at(txt(props, 'projCue'), start(1, crossAt + 1) + 1);
  let year = mix(1950, 2016, easeInOut((t - .2) / Math.max(1, crossAt - .2 - .8)));
  year = mix(year, 2023.5, easeInOut((t - crossAt + .8) / 1));
  const proj = mix(2023.5, 2100, easeInOut((t - projAt + .3) / 1.8));
  const past = year, axesP = sm((t - .1) / .6), yU = txt(props, 'yUnit');
  const hl = sm((t - crossAt) / .3), pulse = Math.exp(-Math.max(0, t - crossAt) * 1.8) * hl;
  const cx = X(a, CROSS), cy = Y(a, chinaAt(CROSS)), endP = sm((proj - 2094) / 5);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .3)}}>
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={(t - .1) / .7} />
    <Svg>
      <Axes a={a} xticks={[1950, 2000, 2050, 2100]} yticks={[.4, .8, 1.2, 1.6]} ylabel={v => yU.includes('{') ? fmt(yU, {b: +v.toFixed(2)}) : `${Math.round(v * 10)} ${yU}`} p={axesP} c={c} font={font} />
      <path d={linePath(a, chinaAt, 1950, past, .5)} fill="none" stroke={CORAL} strokeWidth={5} />
      <path d={linePath(a, indiaAt, 1950, past, .5)} fill="none" stroke={TEAL} strokeWidth={5} />
      <path d={linePath(a, chinaAt, 2023.5, proj, .5)} fill="none" stroke={CORAL} strokeWidth={4.5} strokeDasharray="10 9" />
      <path d={linePath(a, indiaAt, 2023.5, proj, .5)} fill="none" stroke={TEAL} strokeWidth={4.5} strokeDasharray="10 9" />
      {/* 交叉高光 */}
      <g opacity={hl}>
        <circle cx={cx} cy={cy} r={60 + 80 * (1 - pulse)} fill={GOLD} opacity={.12 * pulse} />
        <circle cx={cx} cy={cy} r={34} fill={alpha(GOLD, .18)} />
        <circle cx={cx} cy={cy} r={12} fill={GOLD} />
      </g>
      <Callout x={cx} y={cy} title={txt(props, 'cross')} sub={txt(props, 'crossNote')} color={GOLD} p={(t - crossAt - .15) / .5} c={c} font={font} side="left" dy={-100} size={38} />
      <g fontFamily={font} fontSize={30} fontWeight={800}>
        <text x={X(a, 1972)} y={Y(a, chinaAt(1972)) - 22} fill={CORAL} opacity={sm((year - 1975) / 6)}>{txt(props, 'china')}</text>
        <text x={X(a, 1985)} y={Y(a, indiaAt(1985)) + 46} fill={TEAL} opacity={sm((year - 1990) / 6)}>{txt(props, 'india')}</text>
      </g>
      <g fontFamily={font} fontSize={24} opacity={endP}>
        <text x={X(a, 2100) + 16} y={Y(a, chinaAt(2100)) + 8} fill={CORAL}>{txt(props, 'chinaEnd')}</text>
        <text x={X(a, 2100) + 16} y={Y(a, indiaAt(2100)) + 8} fill={TEAL}>{txt(props, 'indiaEnd')}</text>
      </g>
    </Svg>
    <Source text={txt(props, 'source')} c={c} font={font} p={axesP} />
    <Finish c={c} />
  </div>;
}
