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
/** “{n} 年” → “123 年”。 */
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback: number, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const count = props.sentences.length;
  return {s, t: s.t, at, start, end, dur: s.seconds, count};
}
/** 每个“十亿”的年份：1804～1999 为联合国人口司（1999）专栏 3；70 亿取联合国人口基金标记的 2011 年 10 月 31 日；80 亿取联合国宣布的 2022 年 11 月 15 日。 */
const MILESTONES = [1804, 1927, 1960, 1974, 1987, 1999, 2011, 2022];
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
/** 整数格点哈希 → [0, 1)：每个点固定的抖动与明暗，不用随机数。 */
function hash(i: number, j: number, k = 0) {
  let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(k | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** 圆盘点阵：格点按到圆心距离排序，第 i 个点就是第 i 个“一百万人”，人越多圆盘越大（面积与人口成正比）。 */
const LATTICE: [number, number][] = (() => {
  const pts: [number, number, number, number][] = [], R = 62;
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {const r2 = i * i + j * j; if (r2 <= R * R) pts.push([i, j, r2, Math.atan2(j, i)]);}
  pts.sort((a, b) => a[2] - b[2] || a[3] - b[3]);
  return pts.map(p => [p[0], p[1]]);
})();
/** 圆盘半径（格距单位）≈ √(n/π)。 */
const discRadius = (n: number) => Math.sqrt(n / Math.PI);
/** 画 n 个点（可带小数：最后一个点按小数渐显）；colorOf(i) 给每个点着色，alphaOf(i) 给透明度，angle 整盘旋转（弧度）。
 *  运动都在画布里算，不用 CSS transform 缩放或旋转画布（位图重采样两次渲染可能不一致）。 */
function drawDisc(cx: CanvasRenderingContext2D, o: {x: number; y: number; spacing: number; n: number; colorOf: (i: number) => string; alphaOf?: (i: number) => number; size?: number; angle?: number}) {
  const n = Math.min(LATTICE.length, o.n), whole = Math.floor(n), r = clamp(o.spacing * (o.size ?? .28), .9, 7);
  const cos = Math.cos(o.angle ?? 0), sin = Math.sin(o.angle ?? 0);
  for (let i = 0; i < Math.ceil(n); i++) {
    const [gi, gj] = LATTICE[i];
    const a = (i < whole ? 1 : n - whole) * (o.alphaOf ? o.alphaOf(i) : 1);
    if (a <= .01) continue;
    const jx = (hash(gi, gj, 3) - .5) * .5, jy = (hash(gj, gi, 7) - .5) * .5, shade = .72 + .28 * hash(gi, gj, 11);
    cx.globalAlpha = a * shade;
    cx.fillStyle = o.colorOf(i);
    const px = (gi + jx) * o.spacing, py = (gj + jy) * o.spacing;
    cx.beginPath(); cx.arc(o.x + px * cos - py * sin, o.y + px * sin + py * cos, r, 0, 6.2832); cx.fill();
  }
  cx.globalAlpha = 1;
}
/** 画布层（铺满整幕）。 */
const Canvas = ({frame, draw, style}: {frame: number; draw: (c: CanvasRenderingContext2D) => void; style?: any}) => {
  const ref = useCanvas(frame, c => draw(c));
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', ...style}} />;
};

// 每多十亿用了多少年：里程碑时间轴上，念到“一百二十三年 / 三十三年 / …… / 十一年”时各立起一根柱子（柱高 = 年数），一根比一根矮；
// 右侧圆盘同步再长一圈十亿。念到“二零二二年”时打上 2022.11.15 的日期戳。
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '每多十亿人', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '用了多少年', maxLength: 40, help: '图表的粗标题'},
    note: {label: '图表说明', type: 'text', default: '柱子立在达到该十亿的年份，柱高 = 与上一个十亿相隔几年', maxLength: 100, help: '标题下方的说明小字'},
    bars: {label: '柱子卡点', type: 'list', min: 7, max: 7, maxLength: 24,
      item: [{key: 'cue', label: '卡点词'}, {key: 'n', label: '第几次出现', type: 'number'}],
      default: [{cue: '一百二十三年', n: 0}, {cue: '三十三年', n: 0}, {cue: '十四年', n: 0}, {cue: '十三年', n: 2}, {cue: '十二年', n: 0}, {cue: '十二年', n: 1}, {cue: '十一年', n: 0}],
      help: '第 2 到第 8 个十亿的柱子依次在旁白念到这些词时立起；“第几次出现”从 0 数，如“十三年”在“一百二十三年”“三十三年”里也出现过，所以是第 2 次'},
    firstFmt: {label: '第一根柱顶', type: 'text', default: '{n} 年', maxLength: 16, help: '第一根柱子顶上的字，{n} 换成年数'},
    yearsFmt: {label: '其余柱顶', type: 'text', default: '{n}', maxLength: 16, help: '其余柱子顶上的字（柱子挨得近，默认只写数字），{n} 换成年数'},
    firstMark: {label: '起点标注', type: 'text', default: '10 亿', maxLength: 16, help: '1804 年起点圆点上方的字'},
    total: {label: '圆盘下的人口', type: 'text', default: '{n} 亿人', maxLength: 32, help: '右侧圆盘下的人口，{n} 换成亿数；{b} 换成十亿数'},
    dateCue: {label: '日期卡点词', type: 'text', default: '二零二二年', maxLength: 24, help: '旁白念到这个词时打上日期戳'},
    date: {label: '日期戳', type: 'text', default: '2022.11.15', maxLength: 24, help: '日期戳大字'},
    dateNote: {label: '日期说明', type: 'text', default: '联合国：世界人口达到 80 亿', maxLength: 40, help: '日期戳下的小字'},
    source: {label: '来源', type: 'text', default: '来源：联合国人口司《世界六十亿》（1999）专栏 3；联合国人口基金（2011，70 亿）；联合国（2022，80 亿）', maxLength: 160, help: '图表下方的出处小字'},
  },
};
export default function Bars(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const spec = list<{cue: string; n: number}>(props, 'bars');
  // 卡点：找不到就按句子顺序兜底（前四句各一根，第四句三根，末句一根）。
  const fallback = [start(0, 1) + 1.4, start(1, 3) + .6, start(2, 5) + .5, start(3, 7) + .7, start(3, 7) + 1.6, start(3, 7) + 2.4, start(5, 12) + 1.2];
  const times = MILESTONES.slice(1).map((_, k) => at(String(spec[k]?.cue ?? ''), fallback[k], Number(spec[k]?.n) || 0));
  const dateAt = at(txt(props, 'dateCue'), start(4, times[5] + 2));
  const base = 650, left = 150, right = 1130, k = 2.85;
  const xOf = (year: number) => mix(left, right, (year - 1790) / 240);
  const grow = times.map(tt => out3((t - tt + .05) / .6));
  const billions = 1 + grow.reduce((s, g) => s + sm(g * 1.2), 0);
  // 圆盘：从上一幕的位置移到右侧；越大点距越小，半径不超过 280 像素。
  const move = easeInOut((t - .1) / 1), n = billions * 1000;
  const spacing = mix(13, Math.min(13, 280 / discRadius(n)), move), cx = mix(1150, 1520, move), cy = 430;
  const newest = Math.floor(billions - .001);
  const intro = sm((t - .1) / .5), stamp = out3((t - dateAt) / .45);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .3)}}>
    <Canvas frame={props.frame} draw={g => drawDisc(g, {x: cx, y: cy, spacing, n,
      colorOf: i => Math.floor(i / 1000) === newest && newest > 0 ? c.accent : c.ink,
      alphaOf: i => {const b = Math.floor(i / 1000); return b === newest ? 1 : b % 2 ? .62 : .9;}})} />
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={(t - .2) / .7} />
    <Svg>
      <g fontFamily={font} opacity={intro}>
        <line x1={left - 20} x2={right + 30} y1={base} y2={base} stroke={alpha(c.ink, .4)} strokeWidth={2} />
        {/* 起点：1804 年第一个十亿 */}
        <circle cx={xOf(1804)} cy={base} r={9} fill={c.ink} />
        <text x={xOf(1804)} y={base - 24} textAnchor="middle" fontSize={24} fontWeight={700} fill={c.ink}>{txt(props, 'firstMark')}</text>
        <text x={xOf(1804)} y={base + 38} textAnchor="middle" fontSize={20} fill={c.muted} style={{fontVariantNumeric: 'tabular-nums'}}>1804</text>
        {MILESTONES.slice(1).map((year, i) => {
          const g = grow[i], gap = year - MILESTONES[i], h = gap * k * g, x = xOf(year), last = i === MILESTONES.length - 2;
          if (g <= 0) return null;
          const color = last ? c.accent : alpha(c.ink, .88);
          return <g key={year}>
            {/* 时间跨度：从上一个十亿画到这一个 */}
            <line x1={xOf(MILESTONES[i])} x2={mix(xOf(MILESTONES[i]), x, g)} y1={base + 1} y2={base + 1} stroke={c.accent} strokeWidth={5} opacity={.8} />
            <rect x={x - 17} y={base - h} width={34} height={h} fill={color} opacity={last ? 1 : .9} />
            {last && <rect x={x - 27} y={base - h - 10} width={54} height={h + 10} fill="none" stroke={c.accent} strokeWidth={2} opacity={.5 + .5 * Math.sin(t * 5) ** 2} />}
            <text x={x} y={base - h - 16} textAnchor="middle" fontSize={i === 0 ? 36 : last ? 34 : 28} fontWeight={800} fill={last ? c.accent : c.ink}
              style={{fontVariantNumeric: 'tabular-nums'}}>{fmt(txt(props, i === 0 ? 'firstFmt' : 'yearsFmt'), {n: Math.round(gap * g)})}</text>
            <text x={x} y={base + 36} textAnchor="middle" fontSize={18} fill={c.muted} style={{fontVariantNumeric: 'tabular-nums'}}>{year}</text>
          </g>;
        })}
      </g>
      {/* 日期戳 */}
      <g opacity={clamp(stamp * 1.5)} transform={`translate(${xOf(2022) - 40} ${base - 260}) scale(${1 + .5 * (1 - stamp)})`} fontFamily={font}>
        <text x={0} y={0} textAnchor="end" fontSize={56} fontWeight={900} fill={c.accent} style={{fontVariantNumeric: 'tabular-nums'}}>{txt(props, 'date')}</text>
        <text x={0} y={38} textAnchor="end" fontSize={24} fill={c.ink}>{txt(props, 'dateNote')}</text>
      </g>
      <text x={cx} y={cy + 340} textAnchor="middle" fontFamily={font} fontSize={34} fontWeight={800} fill={c.ink} opacity={move}
        style={{fontVariantNumeric: 'tabular-nums'}}>{fmt(txt(props, 'total'), {n: Math.round(billions) * 10, b: Math.round(billions)})}</text>
    </Svg>
    <Source text={txt(props, 'source')} c={c} font={font} p={intro} />
    <Finish c={c} />
  </div>;
}
