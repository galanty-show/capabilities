import React from 'react';
import {clamp, easeInOut, useCanvas, useScene, type SceneInput} from '@talkframe/scene';
// 《人类走到 80 亿》共用画面库：全部画面由代码绘制，没有图片、视频与字体文件。
// prepare.py 把它和每幕正文拼成 scenes/<module>.tsx。每帧只由 frame、句子时间与常量数据决定：无随机数、无时钟。


const W = 1920;
const H = 1080;
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
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

// 第一个十亿：八十亿的圆盘倒带缩回公元元年的三亿；每个点一百万人，按年份一个个长出来，到 1804 年凑满第一圈十亿。
export const meta = {
  params: {
    legend: {label: '图例', type: 'text', default: '每个点 = 100 万人', maxLength: 32, help: '圆盘下方的图例文字'},
    legendCue: {label: '图例卡点词', type: 'text', default: '每个点', maxLength: 24, help: '旁白念到这个词时出现图例'},
    yearLabel: {label: '年份标签', type: 'text', default: '年份', maxLength: 16, help: '左侧年份计数器上方的小字'},
    yearUnit: {label: '年份单位', type: 'text', default: '年', maxLength: 8, help: '年份数字后的单位'},
    popLabel: {label: '人口标签', type: 'text', default: '世界人口', maxLength: 16, help: '左侧人口数字上方的小字'},
    popUnit: {label: '人口单位', type: 'text', default: '亿', maxLength: 16, help: '人口数字后的单位（数字按亿计；改了 popScale 就按它计）'},
    popScale: {label: '人口数字的单位换算', type: 'number', default: 100, min: 1, max: 1000, step: 1, help: '计数器显示 百万人 ÷ 这个数：100 = 亿，1 = 百万（英文版 million）'},
    ring: {label: '凑满一圈的说明', type: 'text', default: '第一个 10 亿 · 1804 年前后', maxLength: 32, help: '第一圈十亿凑满时圆圈旁的字'},
    yearCue: {label: '年份到站卡点词', type: 'text', default: '一八零四年', maxLength: 24, help: '年份计数器在旁白念完这个词时走到 1804'},
    ringCue: {label: '凑满卡点词', type: 'text', default: '凑满', maxLength: 24, help: '旁白念到这个词时第一圈凑满'},
    source: {label: '来源', type: 'text', default: '来源：联合国人口司《世界六十亿》（1999）表 1、专栏 3；点数按年份插值', maxLength: 160, help: '画面下方的出处小字'},
  },
};
export default function Field(props: SceneInput) {
  const {t, at, start, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const legendAt = at(txt(props, 'legendCue'), start(0, .3) + .8), done = at(txt(props, 'ringCue'), start(1, legendAt + 3) + 1.6);
  // 年份从图例出现后 0.6 秒起跑，念完“一八零四年”时到站；点数跟着年份长，念到“凑满”时第一圈合拢。
  const run0 = legendAt + .6, arrive = Math.min(done, at(txt(props, 'yearCue'), start(1, run0 + 2.5)) + .7);
  // 倒带：0.1～1.0 秒，八十亿缩回三亿、圆盘移到画面中右并放大。
  const rew = easeInOut((t - .1) / .9);
  const year = t < run0 ? mix(2024, 1, rew) : mix(1, 1804, sm((t - run0) / Math.max(.8, arrive - run0)));
  const filled = sm((t - done) / .25);
  const count = t < run0 ? mix(8000, 300, rew) : Math.max(Math.min(1000, worldAt(year) * 1000), 1000 * filled);
  const cx = mix(1250, 1150, rew), spacing = mix(330 / discRadius(8000), 13, rew), cy = 430;
  const ringR = discRadius(1000) * spacing + 16, flash = Math.exp(-Math.max(0, t - done) * 2.2) * filled;
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .25)}}>
    <Canvas frame={props.frame} draw={g => drawDisc(g, {x: cx, y: cy, spacing, n: count,
      colorOf: i => i > count - 26 && t > run0 ? c.accent : c.ink, alphaOf: i => i > count - 26 && t > run0 ? 1 : .9})} />
    <Svg>
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke={c.accent} strokeWidth={3 + 6 * flash} opacity={filled * (.55 + .45 * flash)} />
      <circle cx={cx} cy={cy} r={ringR + 30 * (1 - Math.exp(-Math.max(0, t - done) * 3))} fill="none" stroke={c.accent} strokeWidth={2} opacity={flash * .6} />
      <text x={cx + ringR * .74 + 24} y={cy - ringR * .74 - 10} fontFamily={font} fontSize={32} fontWeight={800} fill={c.accent} opacity={filled}>{txt(props, 'ring')}</text>
      <g opacity={sm((t - legendAt) / .4)} fontFamily={font}>
        <circle cx={cx - 120} cy={cy + 300} r={6} fill={c.ink} />
        <text x={cx - 100} y={cy + 309} fontSize={28} fill={c.ink}>{txt(props, 'legend')}</text>
      </g>
    </Svg>
    <div style={{position: 'absolute', left: 120, top: 240, fontFamily: font, opacity: sm((t - .6) / .5)}}>
      <div style={{fontSize: 24, letterSpacing: 4, color: c.accent, fontWeight: 700}}>{txt(props, 'yearLabel')}</div>
      <div style={{marginTop: 8, whiteSpace: 'nowrap'}}>
        <Odometer value={year} size={92} color={c.ink} font={font} grouping={false} />
        <span style={{fontSize: 34, color: c.muted, marginLeft: 10, verticalAlign: 'top', lineHeight: '100px'}}>{txt(props, 'yearUnit')}</span>
      </div>
      <div style={{fontSize: 24, letterSpacing: 4, color: c.accent, fontWeight: 700, marginTop: 40}}>{txt(props, 'popLabel')}</div>
      <div style={{marginTop: 8, whiteSpace: 'nowrap'}}>
        <Odometer value={Math.round(count / (typeof props.params.popScale === 'number' && props.params.popScale > 0 ? props.params.popScale : 100))} size={72} color={c.ink} font={font} />
        <span style={{fontSize: 30, color: c.muted, marginLeft: 10, verticalAlign: 'top', lineHeight: '80px'}}>{txt(props, 'popUnit')}</span>
      </div>
    </div>
    <Source text={txt(props, 'source')} c={c} font={font} p={sm((t - legendAt) / .4)} />
    <Finish c={c} />
  </div>;
}
