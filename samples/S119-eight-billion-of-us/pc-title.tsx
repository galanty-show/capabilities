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
/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback: number, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const count = props.sentences.length;
  return {s, t: s.t, at, start, end, dur: s.seconds, count};
}
/** 来源行：画在字幕带上方。 */
const Source = ({text, c, font, p = 1, x = 120, y = 790}: {text: string; c: Pal; font: string; p?: number; x?: number; y?: number}) => !text ? null :
  <div style={{position: 'absolute', left: x, top: y, right: 120, fontFamily: font, fontSize: 18, color: alpha(c.muted, .9), opacity: p, letterSpacing: .5, whiteSpace: 'nowrap', overflow: 'hidden'}}>{text}</div>;
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

// 片名：开场退出来的八十亿人圆盘留在右侧压暗，左侧片名横扫显现、金色细线划出。纯视觉幕（无旁白、定长）。
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '数据短片', maxLength: 24, help: '片名上方的小字'},
    title: {label: '片名', type: 'text', default: '人类走到 80 亿', maxLength: 24, help: '片名大字'},
    subtitle: {label: '副标题', type: 'text', default: '从一个点，到八十亿个点', maxLength: 40, help: '片名下方的一句话'},
    source: {label: '数据说明', type: 'text', default: '数据：联合国人口司《世界人口展望 2024》等，出处逐条见说明', maxLength: 160, help: '片名页底部的出处小字'},
  },
};
export default function Title(props: SceneInput) {
  const {t, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const n = 8000, spacing = 330 / discRadius(n);
  const wipe = out3((t - .25) / .8), rule = out3((t - .7) / .7), sub = sm((t - 1.1) / .5);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .3)}}>
    <div style={{position: 'absolute', inset: 0, opacity: mix(1, .32, sm(t / .8))}}>
      <Canvas frame={props.frame} draw={g => drawDisc(g, {x: 1250 + 170 * easeInOut(t / 1.4), y: 430, spacing, n, angle: t * .021, colorOf: () => c.ink})} />
    </div>
    <div style={{position: 'absolute', left: 120, top: 270, fontFamily: font}}>
      <div style={{fontSize: 26, letterSpacing: 8, color: c.accent, fontWeight: 700, opacity: sm(t / .4)}}>{txt(props, 'kicker')}</div>
      <div style={{fontSize: 128, fontWeight: 900, color: c.ink, letterSpacing: 4, marginTop: 18, whiteSpace: 'nowrap',
        clipPath: `inset(-20% ${(1 - wipe) * 100}% -20% 0)`}}>{txt(props, 'title')}</div>
      <div style={{height: 4, width: 520 * rule, background: c.accent, marginTop: 26}} />
      <div style={{fontSize: 36, color: c.ink, opacity: .86 * sub, marginTop: 26, letterSpacing: 2}}>{txt(props, 'subtitle')}</div>
    </div>
    <Source text={txt(props, 'source')} c={c} font={font} p={sub} y={760} />
    <Finish c={c} vignette={.55} />
  </div>;
}
