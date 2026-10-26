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

// 为什么变快：人口转变示意。出生率与死亡率起初都高、几乎重合；念到“死得更少”死亡线先掉下去，
// 两线之间的金色缺口就是增长；“疫苗 / 抗生素 / 干净的水 / 化肥 / 良种”跟着旁白一个个落在死亡线旁；最后出生线也降下来，缺口收拢。
export const meta = {
  params: {
    kicker: {label: '小标签', type: 'text', default: '为什么越来越快', maxLength: 24, help: '图表标题上方的小字'},
    title: {label: '图表标题', type: 'text', default: '死亡先降，出生后降', maxLength: 40, help: '图表的粗标题'},
    note: {label: '图表说明', type: 'text', default: '人口转变示意图（形状示意，非实测数据）', maxLength: 100, help: '标题下方的说明小字'},
    birth: {label: '出生线名', type: 'text', default: '出生率', maxLength: 12, help: '出生线末端的名字'},
    death: {label: '死亡线名', type: 'text', default: '死亡率', maxLength: 12, help: '死亡线末端的名字'},
    gap: {label: '缺口说明', type: 'text', default: '缺口 = 人口增长', maxLength: 24, help: '两线之间金色区域的说明'},
    dropCue: {label: '死亡下降卡点词', type: 'text', default: '死得更少', maxLength: 24, help: '旁白念到这个词时死亡线开始下降'},
    chips: {label: '原因标签', type: 'list', min: 5, max: 5, maxLength: 16,
      item: [{key: 'label', label: '标签'}, {key: 'cue', label: '卡点词'}],
      default: [{label: '疫苗', cue: '疫苗'}, {label: '抗生素', cue: '抗生素'}, {label: '干净的水', cue: '干净的水'}, {label: '化肥', cue: '化肥'}, {label: '良种', cue: '良种'}],
      help: '依次配疫苗、胶囊、水滴、化肥袋、麦穗图标；旁白念到卡点词时出现'},
    axisY: {label: '纵轴说明', type: 'text', default: '每千人每年', maxLength: 24, help: '纵轴上方的小字'},
    axisX: {label: '横轴说明', type: 'text', default: '时间 →', maxLength: 16, help: '横轴右端的小字'},
    source: {label: '来源', type: 'text', default: '依据：联合国《世界人口展望 2024》摘要，专栏 I.2“人口为什么会见顶”（人口转变示意图）', maxLength: 160, help: '图表下方的出处小字'},
  },
};
const L = 220, R = 1700, TOP = 300, BOT = 690;
const ux = (u: number) => mix(L, R, u);
const vy = (v: number) => mix(BOT, TOP, v / 48);
const birthAt = (u: number) => 38 - 25 * sm((u - .6) / .36);
const deathAt = (u: number) => 35.5 + 2.2 * Math.sin(u * 61) * (1 - sm((u - .12) / .1)) - 26 * sm((u - .16) / .36);
const path = (f: (u: number) => number, from: number, to: number) => {
  if (to <= from) return '';
  const pts: string[] = [];
  for (let u = from; u < to; u += .004) pts.push(`${ux(u).toFixed(1)},${vy(f(u)).toFixed(1)}`);
  pts.push(`${ux(to).toFixed(1)},${vy(f(to)).toFixed(1)}`);
  return 'M' + pts.join('L');
};
/** 两线之间的金色缺口（只在出生高于死亡处）。 */
const gapPath = (to: number) => {
  if (to <= .14) return '';
  const top: string[] = [], bottom: string[] = [];
  for (let u = .14; u <= to; u += .005) {top.push(`${ux(u).toFixed(1)},${vy(Math.max(birthAt(u), deathAt(u))).toFixed(1)}`); bottom.unshift(`${ux(u).toFixed(1)},${vy(deathAt(u)).toFixed(1)}`);}
  return 'M' + top.concat(bottom).join('L') + 'Z';
};
/** 代码画的小图标（40×40，中心在原点）。 */
function Icon2({kind, color}: {kind: number; color: string}) {
  const s = {fill: 'none', stroke: color, strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  if (kind === 0) return <g transform="rotate(-45)" {...s}><rect x={-8} y={-12} width={16} height={26} rx={3} /><line x1={0} y1={-12} x2={0} y2={-20} /><line x1={-7} y1={-20} x2={7} y2={-20} />
    <line x1={0} y1={14} x2={0} y2={22} /><line x1={-8} y1={0} x2={-3} y2={0} /><line x1={-8} y1={6} x2={-3} y2={6} /></g>;
  if (kind === 1) return <g transform="rotate(-35)"><rect x={-9} y={-18} width={18} height={36} rx={9} fill="none" stroke={color} strokeWidth={3.2} />
    <path d="M-9 0 L9 0 L9 9 A9 9 0 0 1 -9 9 Z" fill={color} /></g>;
  if (kind === 2) return <path d="M0 -19 C 8 -8, 14 0, 14 7 A14 14 0 0 1 -14 7 C -14 0, -8 -8, 0 -19 Z" {...s} />;
  if (kind === 3) return <g {...s}><path d="M-13 -10 L13 -10 L16 18 L-16 18 Z" /><path d="M-9 -10 L-6 -17 L6 -17 L9 -10" /><circle cx={0} cy={5} r={4} /></g>;
  return <g {...s}><line x1={0} y1={20} x2={0} y2={-20} />{[-14, -5, 4].map(y => <g key={y}><ellipse cx={-6} cy={y} rx={4} ry={7} transform={`rotate(-30 -6 ${y})`} />
    <ellipse cx={6} cy={y} rx={4} ry={7} transform={`rotate(30 6 ${y})`} /></g>)}</g>;
}
export default function Why(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), c = pal(props), font = props.fonts.text;
  const chips = list<{label: string; cue: string}>(props, 'chips');
  const drop = at(txt(props, 'dropCue'), start(0, .5) + 1.6);
  const lastEnd = end(props.sentences.length - 1, dur - 1);
  // 画线进度：先平着画到 0.16，念到“死得更少”后两线画到 0.62（死亡掉下去），末句后出生线也降下来、画到头。
  let u = mix(0, .16, sm((t - .2) / 1.2));
  u = mix(u, .6, easeInOut((t - drop + .1) / 1.6));
  u = mix(u, 1, easeInOut((t - lastEnd + .6) / 1.6));
  const fallbacks = [start(1, 4) + .1, start(1, 4) + .8, start(1, 4) + 1.6, start(2, 7) + .1, start(2, 7) + .7];
  const chipAt = chips.map((ch, i) => at(String(ch?.cue ?? ''), fallbacks[i] ?? dur));
  const spots: [number, number][] = [[.2, 0], [.32, 0], [.45, 0], [.47, 1], [.57, 1]];
  // 西文标签较宽：字号略小，同一行里按估算宽度把后面的标签往右推开，引线仍指回原位置；中文标签不动。
  const isLatin = (lab: string) => !!lab && !/[㐀-鿿]/.test(lab);
  const chipW = chips.map(ch => {const lab = String(ch?.label ?? ''); return isLatin(lab) ? 66 + 12.6 * lab.length : 60 + 30 * Array.from(lab).length;});
  const chipDX = chips.map(() => 0);
  for (const row of [0, 1]) {
    let edge = -Infinity;
    spots.forEach(([cu, r], i) => {
      if (r !== row || i >= chips.length) return;
      const x = ux(cu);
      if (isLatin(String(chips[i]?.label ?? ''))) chipDX[i] = Math.max(0, edge + chipW[i] / 2 + 10 - x);
      edge = x + chipDX[i] + chipW[i] / 2;
    });
  }
  const axesP = sm((t - .1) / .5), gapP = sm((t - drop - .4) / .6), gapLabel = sm((t - drop - 1.4) / .5);
  return <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .3)}}>
    <Header kicker={txt(props, 'kicker')} title={txt(props, 'title')} note={txt(props, 'note')} c={c} font={font} p={(t - .1) / .7} />
    <Svg>
      <g opacity={axesP} fontFamily={font}>
        <line x1={L} x2={R + 20} y1={BOT} y2={BOT} stroke={alpha(c.ink, .4)} strokeWidth={2} />
        <line x1={L} x2={L} y1={BOT} y2={TOP - 20} stroke={alpha(c.ink, .4)} strokeWidth={2} />
        <text x={L} y={TOP - 34} fontSize={22} fill={c.muted}>{txt(props, 'axisY')}</text>
        <text x={R + 20} y={BOT + 36} textAnchor="end" fontSize={22} fill={c.muted}>{txt(props, 'axisX')}</text>
      </g>
      <path d={gapPath(u)} fill={alpha(c.accent, .28)} opacity={gapP} />
      <path d={path(birthAt, 0, u)} fill="none" stroke={c.ink} strokeWidth={5} strokeLinecap="round" />
      <path d={path(deathAt, 0, u)} fill="none" stroke={BLUE} strokeWidth={5} strokeLinecap="round" />
      {u > .02 && <g fontFamily={font} fontSize={28} fontWeight={800}>
        <text x={ux(u) + 16} y={vy(birthAt(u)) - (u < .2 ? 14 : -10)} fill={c.ink}>{txt(props, 'birth')}</text>
        <text x={ux(u) + 16} y={vy(deathAt(u)) + (u < .2 ? 34 : 10)} fill={BLUE}>{txt(props, 'death')}</text>
      </g>}
      <g opacity={gapLabel} fontFamily={font}>
        <text x={ux(.55)} y={vy((birthAt(.55) + deathAt(.55)) / 2) + 12} textAnchor="middle" fontSize={34} fontWeight={800} fill={c.accent}>{txt(props, 'gap')}</text>
      </g>
      {chips.slice(0, 5).map((ch, i) => {
        const p = (t - chipAt[i]) / .45;
        if (p <= 0) return null;
        const [cu, row] = spots[i], k = out3(p), x = ux(cu) + chipDX[i], y = row === 0 ? 640 : vy(birthAt(cu)) - 92;
        const reach = row === 0 ? y - vy(deathAt(cu)) - 14 : 92 - 14;
        const lab = String(ch?.label ?? ''), w = chipW[i], dx = chipDX[i], latin = isLatin(lab);
        return <g key={i} transform={`translate(${x} ${y}) scale(${.6 + .4 * k})`} opacity={clamp(p * 2.5)} fontFamily={font}>
          <line x1={0} y1={row === 0 ? -36 : 36} x2={-dx} y2={row === 0 ? -reach : reach} stroke={alpha(row === 0 ? BLUE : c.ink, .5)} strokeWidth={2} strokeDasharray="3 5" />
          <rect x={-w / 2} y={-30} width={w} height={60} rx={30} fill={alpha(c.bg, .9)} stroke={row === 0 ? BLUE : c.accent} strokeWidth={2.5} />
          <g transform={`translate(${-w / 2 + 34} 0) scale(.85)`}><Icon2 kind={i} color={row === 0 ? BLUE : c.accent} /></g>
          <text x={-w / 2 + (latin ? 58 : 62)} y={latin ? 8 : 10} fontSize={latin ? 22 : 28} fontWeight={700} fill={c.ink}>{lab}</text>
        </g>;
      })}
    </Svg>
    <Source text={txt(props, 'source')} c={c} font={font} p={axesP} />
    <Finish c={c} />
  </div>;
}
