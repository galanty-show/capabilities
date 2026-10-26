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
/** 无限缩放人群：一个点 → 八十多亿。ppu 是每个人（格距 1）在屏幕上占多少像素；格点按层级合并（每层 ×100 人）。
 *  人群边界是一个装得下 total 人的圆盘；第 3 层（每点一百万人）与 drawDisc 的点位、抖动、明暗一致，两种画法可以无缝衔接。 */
function drawCrowd(cx: CanvasRenderingContext2D, o: {x: number; y: number; ppu: number; total: number; ink: string; accent: string; you: number}) {
  const R = Math.sqrt(o.total / Math.PI);
  for (let k = 0; k <= 3; k++) {
    const unit = Math.pow(10, k), sp = unit * o.ppu;
    const fadeIn = k === 0 ? 1 : sm((170 - sp) / 90), fadeOut = k === 3 ? 1 : sm((sp - 6.5) / 5);
    const a = fadeIn * fadeIn * fadeOut;
    if (a <= .01 || sp < 6) continue;
    const r = clamp(sp * .28, .9, 10);
    const ni = Math.ceil((W / 2 + 40) / sp), nj = Math.ceil((H / 2 + 40) / sp), lim = (R / unit) * (R / unit);
    cx.fillStyle = o.ink;
    for (let i = -ni; i <= ni; i++) for (let j = -nj; j <= nj; j++) {
      if (i * i + j * j > lim) continue;
      const center = k === 0 && i === 0 && j === 0;
      const jx = center ? 0 : (hash(i, j, k === 3 ? 3 : k + 20) - .5) * .5, jy = center ? 0 : (hash(j, i, k === 3 ? 7 : k + 40) - .5) * .5;
      cx.globalAlpha = a * (.72 + .28 * hash(i, j, k === 3 ? 11 : k + 60));
      cx.beginPath(); cx.arc(o.x + (i + jx) * sp, o.y + (j + jy) * sp, r, 0, 6.2832); cx.fill();
    }
  }
  // “你”：最初那个点，金色光环随缩放淡出。
  if (o.you > 0) {
    const r = Math.max(4, clamp(o.ppu * .28, .9, 10));
    cx.globalAlpha = o.you; cx.fillStyle = o.accent; cx.strokeStyle = o.accent; cx.lineWidth = 3;
    cx.beginPath(); cx.arc(o.x, o.y, r, 0, 6.2832); cx.fill();
    cx.beginPath(); cx.arc(o.x, o.y, r * 2.4 + 8, 0, 6.2832); cx.stroke();
  }
  cx.globalAlpha = 1;
}
/** 屏幕里看得见的人数：屏幕矩形 ∩ 人群圆盘的面积（格距单位），按列数值积分（纯函数，驱动计数器）。 */
function crowdCount(ppu: number, total: number) {
  const R = Math.sqrt(total / Math.PI), hx = (W / 2) / ppu, hy = (H / 2) / ppu, a = Math.min(R, hx), steps = 400;
  let area = 0;
  for (let s = 0; s < steps; s++) {const x = -a + (s + .5) * (2 * a / steps); area += Math.min(2 * Math.sqrt(Math.max(0, R * R - x * x)), 2 * hy) * (2 * a / steps);}
  return Math.min(total, Math.max(1, area));
}
/** 缩放进度 z（看得见的人数取对数）→ 每人像素：z=0 时屏幕里只有一个人。 */
const ppuAt = (z: number) => Math.sqrt(W * H / Math.pow(10, z));

// 尺度感：一个点 ↔ 八十多亿个点。mode=out（开场）：从一个人往后退，念到“一百人 / 一万人 / 一百万人”各退一级，
// 最后退到装得下八十亿人的圆盘；mode=in（结尾）：从圆盘一路推回最初那一个点——“你”。左侧计数器是屏幕里看得见的人数。
export const meta = {
  params: {
    mode: '用法：out 开场往后退、in 结尾推回一个点（改代码更合适，不出控件）',
    stepCues: {label: '退一级的卡点词', type: 'list', min: 3, max: 3, maxLength: 24, default: ['一百人', '一万人', '一百万人'],
      help: '旁白念到这三个词时，画面依次退到一百人、一万人、一百万人（开场用）'},
    finalCue: {label: '退到底的卡点词', type: 'text', default: '八十多亿', maxLength: 24, help: '念到这个词时人群退成整个圆盘（开场用）'},
    countLabel: {label: '计数器标签', type: 'text', default: '画面里的人', maxLength: 24, help: '计数器上方的小字'},
    unit: {label: '计数单位', type: 'text', default: '人', maxLength: 8, help: '计数器后面的单位'},
    unitOne: {label: '人数为 1 时的单位', type: 'text', default: '', maxLength: 16, help: '留空沿用上面的单位；英文填 person'},
    todayLabel: {label: '圆盘说明', type: 'text', default: '今天的人类', maxLength: 24, help: '退到底后圆盘下方的说明（开场用）'},
    todayNote: {label: '数字注释', type: 'text', default: '圆盘按 80 亿人画；2024 年约 82 亿人（联合国《世界人口展望 2024》）', maxLength: 100, help: '计数器下方的出处小字'},
    zoomCue: {label: '开始推近的卡点词', type: 'text', default: '一个一个人', maxLength: 24, help: '念到这个词时开始往一个点推近（结尾用）'},
    you: {label: '最后那个点', type: 'text', default: '你', maxLength: 12, help: '推到最后一个点时旁边的字（结尾用）'},
    youCue: {label: '“你”的卡点词', type: 'text', default: '你', maxLength: 24, help: '旁白念到这个词时点亮最后那个点（结尾用）'},
    fraction: {label: '分数说明', type: 'text', default: '八十多亿分之一', maxLength: 24, help: '最后那个点下面的大字（结尾用）'},
    credit: {label: '片尾小字', type: 'text', default: '数据：联合国人口司《世界人口展望 2024》等 · 画面：全部由代码实时绘制', maxLength: 120, help: '结尾最后显示的出处与制作说明'},
  },
};
const TOTAL = 8e9, CY = 430, DISC_PX = 330;
/** 退到底时圆盘半径正好 330 像素。 */
const Z_END = Math.log10(W * H / Math.pow(DISC_PX / Math.sqrt(TOTAL / Math.PI), 2));
/** 结尾的两个时刻：开始推近、点亮“你”。 */
function endingTimes(props: SceneInput, at: (p: string, f: number, o?: number) => number, start: (i: number, f?: number) => number) {
  const tz = at(txt(props, 'zoomCue'), start(0, .4) + 1);
  const ty = at(txt(props, 'youCue'), start(1, tz + 2) + .2);
  return {tz, ty};
}
export default function Zoom(props: SceneInput) {
  const {t, at, start, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const out = props.params.mode !== 'in';
  let z: number, cx: number, you: number, countOpacity: number, ty = 0;
  if (out) {
    const steps = list<string>(props, 'stepCues').map(String);
    const ta = at(steps[0] ?? '', start(1, 2.4) + .4), tb = at(steps[1] ?? '', ta + 1), tc = at(steps[2] ?? '', tb + 1);
    const td = start(2, tc + 1.6), te = at(txt(props, 'finalCue'), td + 1.2);
    // 前三级各 0.75 秒到位（提前 0.15 秒起步）；最后一级从第三句开头一路退到“八十多亿”之后 0.6 秒。
    z = mix(0, 2, easeInOut((t - ta + .15) / .75));
    z = mix(z, 4, easeInOut((t - tb + .15) / .75));
    z = mix(z, 6, easeInOut((t - tc + .15) / .75));
    z = mix(z, Z_END, easeInOut((t - td) / Math.max(1.2, te + .6 - td)));
    you = 1 - sm((z - 3.2) / 1.2);
    cx = mix(960, 1250, sm((z - 7) / 3.5));
    countOpacity = sm((t - .3) / .5);
  } else {
    const times = endingTimes(props, at, start);
    ty = times.ty;
    z = mix(Z_END, 0, easeInOut((t - times.tz + .8) / Math.max(2, ty - times.tz + .6)));
    you = sm((t - ty + .1) / .4);
    cx = mix(1250, 960, sm((Z_END - z - .5) / 3));
    countOpacity = 1 - sm((t - ty) / .4);
  }
  const ppu = ppuAt(z), count = crowdCount(ppu, TOTAL), discR = Math.sqrt(TOTAL / Math.PI) * ppu;
  const full = out ? sm((z - (Z_END - .25)) / .2) : 1 - sm((Z_END - z - .05) / .2);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, out ? .4 : .2, out ? .05 : .6)}}>
    <Canvas frame={props.frame} draw={g => drawCrowd(g, {x: cx, y: CY, ppu, total: TOTAL, ink: c.ink, accent: c.accent, you})} />
    {/* 人群铺满时给计数器与字幕带压一层暗底，数字和字幕都看得清 */}
    <div style={{position: 'absolute', inset: 0, opacity: sm((z - 2.5) / 1.5) * (1 - full),
      background: `linear-gradient(90deg, ${alpha(c.bg, .92)} 0%, ${alpha(c.bg, .75)} 30%, ${alpha(c.bg, 0)} 52%)`}} />
    <div style={{position: 'absolute', inset: 0, opacity: sm((z - 2.5) / 1.5) * (1 - full),
      background: `linear-gradient(180deg, ${alpha(c.bg, 0)} 66%, ${alpha(c.bg, .88)} 82%, ${alpha(c.bg, .88)} 100%)`}} />
    {/* 圆盘轮廓：人群退成整盘时出现 */}
    <Svg><g opacity={full}>
      <circle cx={cx} cy={CY} r={discR + 14} fill="none" stroke={alpha(c.ink, .22)} strokeWidth={1.5} strokeDasharray="3 9" />
      {out && <text x={cx} y={CY + discR + 60} textAnchor="middle" fontFamily={font} fontSize={28} fill={c.muted} letterSpacing={4}>{txt(props, 'todayLabel')}</text>}
    </g></Svg>
    {/* 计数器：屏幕里看得见的人 */}
    <div style={{position: 'absolute', left: 120, top: 250, fontFamily: font, opacity: countOpacity}}>
      <div style={{fontSize: 24, letterSpacing: 4, color: c.accent, fontWeight: 700}}>{txt(props, 'countLabel')}</div>
      <div style={{marginTop: 10, whiteSpace: 'nowrap'}}>
        <Odometer value={count} size={84} color={c.ink} font={font} />
        <span style={{fontSize: 34, color: c.muted, marginLeft: 14, verticalAlign: 'top', lineHeight: '92px'}}>{full > .5 ? '+ ' : ''}{count < 2 && txt(props, 'unitOne') ? txt(props, 'unitOne') : txt(props, 'unit')}</span>
      </div>
      <div style={{fontSize: 22, color: c.muted, marginTop: 12, opacity: full}}>{txt(props, 'todayNote')}</div>
    </div>
    {/* 结尾：最后那个点 */}
    {!out && <>
      <Svg><text x={cx + 50} y={CY - 24} fontFamily={font} fontSize={64} fontWeight={800} fill={c.accent} opacity={you}>{txt(props, 'you')}</text></Svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: font, fontSize: 64, fontWeight: 800, letterSpacing: 6, color: c.ink,
        opacity: sm((t - ty - .2) / .6), transform: `translateY(${(1 - out3((t - ty - .2) / .8)) * 20}px)`}}>{txt(props, 'fraction')}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: font, fontSize: 20, letterSpacing: 1, color: c.muted,
        opacity: sm((t - ty - 1.4) / .6)}}>{txt(props, 'credit')}</div>
    </>}
    <Finish c={c} vignette={.5} />
  </div>;
}
