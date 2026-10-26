import React from 'react';
import {noise2d, seeded, useScene, type SceneInput} from '@talkframe/scene';

// S108《落笔成影》修改幕：接着上一幕《山居秋暝》的松月图（与 T23 诗句化画同一画面），光标点选明月，
// 检查器里把“明月”改成“落日”：月亮变成红日、题画诗换字、归鸟飞过，随后墨色收拢、墨爆（交给尾声幕）。
// 时间按句：第一句开口 = 光标出现，+1.25 秒点选、+2.5 秒出检查器；末句（“明月，便成了落日”）开口前 0.05 秒应用；
// 幕末前 0.4 秒墨爆（与尾声幕 0.4 秒交叉淡化重叠）。画面时间接上一幕化画后 2.1 秒（PAINT_AGE），云、溪、松针连续。
export const meta = {
  title: '水墨修改：明月改落日',
  description: '松月图上光标点选明月，检查器里改一个词，画中明月变成落日、题画诗跟着换字；末尾墨色收拢、墨爆。',
  params: {
    poem: {label: '题画诗', type: 'text', default: '明月松间照，清泉石上流', maxLength: 24},
    author: {label: '作者', type: 'text', default: '王维', maxLength: 6},
    word: {label: '被改的词', type: 'text', default: '明月', maxLength: 4},
    editTo: {label: '改成', type: 'text', default: '落日', maxLength: 4},
    cardTitle: {label: '检查器标题', type: 'text', default: '点哪 · 改哪', maxLength: 16},
    selectedLabel: {label: '选中提示', type: 'text', default: '选中：画中{word}', maxLength: 24, help: '{word} 换成被改的词'},
    appliedLabel: {label: '改后提示', type: 'text', default: '已改：{word}', maxLength: 24, help: '{word} 换成改成的词'},
    hint: {label: '底部说明', type: 'text', default: '改一处，其余不动', maxLength: 24},
    applyLabel: {label: '应用按钮', type: 'text', default: '↵ 应用', maxLength: 8},
    doneLabel: {label: '已应用按钮', type: 'text', default: '✓ 已改', maxLength: 8},
  },
};
// 本文件由 tools/production/ink-promo-20261007/build_scenes.mjs 拼装：共用段取自 T22 毛笔落字片名、T23 诗句化画与 src/_sample.tsx，改正文请改 src/ink-edit.tsx 后重跑。

const FONT = '"Xingkai SC", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif';
const SEAL_FONT = '"Weibei SC", "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, d: number) => clamp((t - a) / d);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const outCubic = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const inOutCubic = (x: number) => (x = clamp(x)) < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const f1 = (v: number) => Number(v.toFixed(1));
const word = (v: unknown, fallback: string, max: number) => typeof v === 'string' ? Array.from(v.trim()).slice(0, max).join('') : fallback;

// ---------- 笔画：字形坐标 0-1000，基线 850，字号 900（与 <text x=500 y=850> 一致） ----------
type Stroke = {d: string; w: number; len: number};
const HAND: Record<string, {paths: string[]; w: number; times: number[][]}> = {
  '文': {w: 112, paths: ['M390 230 Q362 380 350 505 Q520 425 735 360', 'M515 330 L530 560 Q485 760 300 795 Q180 795 110 735', 'M130 640 Q300 600 480 700 Q660 820 850 935'], times: [[0, .36], [.42, .36], [.84, .41]]},
  '影': {w: 82, paths: ['M305 270 L560 260 L565 470 L320 470 Z', 'M80 660 Q330 560 590 440', 'M330 560 L500 560 L500 740 L340 740 Z', 'M440 640 L445 940', 'M260 760 L275 905',
    'M515 770 L550 840', 'M690 255 Q800 320 770 450', 'M810 440 Q770 560 670 615', 'M870 650 Q760 840 540 975'], times: Array.from({length: 9}, (_, i) => [i * .135, .12])},
};
const N = 100;
const CACHE = new Map<string, Stroke[]>();
const sweep = (): Stroke[] => [0, 1, 2, 3].map(i => ({d: `M140 ${250 + i * 190} L860 ${250 + i * 190}`, w: 250, len: 720}));
/** 字形栅格 → 连通块 → 笔画路径（字形坐标）。没有画布或字形为空时返回 null。 */
function rasterStrokes(ch: string): Stroke[] | null {
  const cv = new OffscreenCanvas(N, N), g = cv.getContext('2d');
  if (!g) return null;
  g.font = `700 ${N * .9}px ${FONT}`; g.textAlign = 'center'; g.fillStyle = '#000';
  g.fillText(ch, N / 2, N * .85);
  const a = g.getImageData(0, 0, N, N).data, on = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) on[i] = a[i * 4 + 3] > 90 ? 1 : 0;
  const parts = (cells: number[]) => {
    const inside = new Set(cells), seen = new Set<number>(), out: number[][] = [];
    for (const start of cells) {
      if (seen.has(start)) continue;
      const list = [start]; seen.add(start);
      for (let j = 0; j < list.length; j++) {
        const x = list[j] % N, y = Math.floor(list[j] / N);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy, id = ny * N + nx;
          if (nx >= 0 && ny >= 0 && nx < N && ny < N && inside.has(id) && !seen.has(id)) {seen.add(id); list.push(id);}
        }
      }
      if (list.length >= 5) out.push(list);
    }
    return out;
  };
  const box = (px: number[]) => {
    let x0 = N, x1 = 0, y0 = N, y1 = 0;
    for (const p of px) {const x = p % N, y = Math.floor(p / N); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);}
    return {px, x0, x1, y0, y1};
  };
  const all: number[] = [];
  on.forEach((v, i) => {if (v) all.push(i);});
  const comps = parts(all).map(box);
  if (!comps.length) return null;
  // 列分组：x 范围相交的块属于同一列；多列时先左后右，列内自上而下。
  const sorted = [...comps].sort((p, q) => p.x0 - q.x0), cols: (typeof comps)[] = [];
  for (const b of sorted) {
    const col = cols.find(c => c.some(o => o.x1 >= b.x0 - 1 && b.x1 >= o.x0 - 1));
    if (col) col.push(b); else cols.push([b]);
  }
  const byRow = (p: {x0: number; y0: number}, q: {x0: number; y0: number}) => Math.abs(p.y0 - q.y0) < 4 ? p.x0 - q.x0 : p.y0 - q.y0;
  const ordered = cols.length > 1 && cols.length <= 3 ? cols.sort((p, q) => Math.min(...p.map(b => b.x0)) - Math.min(...q.map(b => b.x0))).flatMap(c => c.sort(byRow)) : comps.sort(byRow);
  const pieces: number[][] = [];
  for (const b of ordered) {
    const w = b.x1 - b.x0, h = b.y1 - b.y0;
    if (w > .32 * N && h > .32 * N) {
      const bands = clamp(Math.round(h / (.2 * N)), 2, 4);
      for (let k = 0; k < bands; k++) {
        const lo = b.y0 + h * k / bands, hi = b.y0 + h * (k + 1) / bands;
        pieces.push(...parts(b.px.filter(p => {const y = Math.floor(p / N); return y >= lo && (k === bands - 1 ? y <= hi : y < hi);})).map(box).sort((p, q) => p.x0 - q.x0).map(p => p.px));
      }
    } else pieces.push(b.px);
  }
  return pieces.map(px => {
    let mx = 0, my = 0;
    for (const p of px) {mx += p % N; my += Math.floor(p / N);}
    mx /= px.length; my /= px.length;
    let xx = 0, yy = 0, xy = 0;
    for (const p of px) {const dx = p % N - mx, dy = Math.floor(p / N) - my; xx += dx * dx; yy += dy * dy; xy += dx * dy;}
    const th = .5 * Math.atan2(2 * xy, xx - yy);
    let ux = Math.cos(th), uy = Math.sin(th);
    if (Math.abs(ux) >= Math.abs(uy) * .58 ? ux < 0 : uy < 0) {ux = -ux; uy = -uy;}
    let lo = Infinity, hi = -Infinity;
    for (const p of px) {const v = (p % N - mx) * ux + (Math.floor(p / N) - my) * uy; lo = Math.min(lo, v); hi = Math.max(hi, v);}
    const bins = clamp(Math.round((hi - lo) / 3), 1, 12), acc = Array.from({length: bins}, () => ({x: 0, y: 0, n: 0, q0: Infinity, q1: -Infinity}));
    for (const p of px) {
      const x = p % N, y = Math.floor(p / N), v = (x - mx) * ux + (y - my) * uy, q = -(x - mx) * uy + (y - my) * ux;
      const bin = acc[Math.min(bins - 1, Math.floor((v - lo) / Math.max(1e-6, hi - lo) * bins))];
      bin.x += x; bin.y += y; bin.n++; bin.q0 = Math.min(bin.q0, q); bin.q1 = Math.max(bin.q1, q);
    }
    let pts = acc.filter(b => b.n).map(b => [b.x / b.n + .5, b.y / b.n + .5]);
    const spread = Math.max(1, ...acc.filter(b => b.n).map(b => (b.q1 - b.q0) / 2 + .5));
    if (pts.length === 1) pts = [[pts[0][0] - ux * Math.max(1.5, (hi - lo) / 2), pts[0][1] - uy * Math.max(1.5, (hi - lo) / 2)], [pts[0][0] + ux * Math.max(1.5, (hi - lo) / 2), pts[0][1] + uy * Math.max(1.5, (hi - lo) / 2)]];
    pts = pts.map((p, i) => i === 0 || i === pts.length - 1 ? p : [(pts[i - 1][0] + 2 * p[0] + pts[i + 1][0]) / 4, (pts[i - 1][1] + 2 * p[1] + pts[i + 1][1]) / 4]);
    pts[0] = [pts[0][0] - ux * 1.5, pts[0][1] - uy * 1.5];
    pts[pts.length - 1] = [pts[pts.length - 1][0] + ux * 1.5, pts[pts.length - 1][1] + uy * 1.5];
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * 10;
    return {d: pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x * 10)} ${f1(y * 10)}`).join(' '), w: f1(spread * 20 + 30), len};
  });
}
function autoStrokes(ch: string): Stroke[] {
  const hit = CACHE.get(ch);
  if (hit) return hit;
  let out = sweep();
  if (typeof OffscreenCanvas !== 'undefined') {try {out = rasterStrokes(ch) ?? out;} catch {out = sweep();}}
  CACHE.set(ch, out);
  return out;
}
type Plan = {paths: string[]; widths: number[]; times: number[][]; total: number};
/** 一个字的笔画与时间（相对落笔起点，秒）：手写字用原笔顺时间；其余按笔长分配，整字 0.7～1.5 秒。 */
function strokePlan(ch: string): Plan {
  const hand = HAND[ch];
  if (hand) {const last = hand.times[hand.times.length - 1]; return {paths: hand.paths, widths: hand.paths.map(() => hand.w), times: hand.times, total: last[0] + last[1]};}
  const st = autoStrokes(ch), raw = st.map(s => clamp(.07 + s.len / 1000 * .42, .08, .4));
  const sum = raw.reduce((x, y) => x + y + .025, 0), scale = clamp(sum, .7, 1.5) / Math.max(1e-6, sum);
  let at = 0;
  const times = raw.map(d => {const r = [at, d * scale]; at += (d + .025) * scale; return r;});
  return {paths: st.map(s => s.d), widths: st.map(s => s.w), times, total: at};
}

function Glyph({id, k, ch, x, y, size, t, plan, fill, bleed = .32}: {id: string; k: string; ch: string; x: number; y: number; size: number; t: number; plan: Plan; fill: string; bleed?: number}) {
  if (t < 0) return null;
  const settle = seg(t, plan.total - .04, .18), wet = 1 - seg(t, plan.total, .9), masked = settle < 1;
  const text = (extra: Record<string, unknown>) => <text x={500} y={850} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={900} {...extra}>{ch}</text>;
  return <g transform={`translate(${f1(x)} ${f1(y)}) scale(${(size / 1000).toFixed(4)})`}>
    {masked && <defs><mask id={id} maskUnits="userSpaceOnUse" x={-300} y={-300} width={1600} height={1600}>
      <g filter={`url(#${k}mblur)`}>{plan.paths.map((d, i) => {
        const p = inOutCubic(seg(t, plan.times[i][0], plan.times[i][1]));
        return p > 0 ? <path key={i} d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={plan.widths[i]} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - p} /> : null;
      })}</g>
      {settle > 0 && <rect x={-300} y={-300} width={1600} height={1600} fill="#fff" opacity={settle} />}
    </mask></defs>}
    {wet > 0 && text({fill, opacity: bleed * wet, filter: `url(#${k}gbleed)`, mask: masked ? `url(#${id})` : undefined})}
    {text({fill, filter: `url(#${k}dry)`, mask: masked ? `url(#${id})` : undefined})}
  </g>;
}
function Seal({cx, cy, size, t, label, color, paper, k}: {cx: number; cy: number; size: number; t: number; label: string[]; color: string; paper: string; k: string}) {
  if (t < 0 || !label.length) return null;
  const sc = size / 100 * (1 + .45 * (1 - outCubic(seg(t, 0, .1)))), r = seeded(`seal-${label.join('')}`), n = label.length, grid = n > 2;
  const fs = grid ? 34 : n === 2 ? 38 : 60, pos = (i: number) => grid ? [i < 2 ? 21 : -21, -6 + (i % 2) * 40] : [0, n === 2 ? -8 + i * 42 : 20];
  return <g transform={`translate(${f1(cx)} ${f1(cy)}) scale(${sc.toFixed(4)}) rotate(-2)`} opacity={seg(t, 0, .04)}>
    <g filter={`url(#${k}sealRough)`}>
      <rect x={-50} y={-50} width={100} height={100} rx={6} fill={color} />
      <rect x={-43} y={-43} width={86} height={86} rx={3} fill="none" stroke={paper} strokeWidth={2.4} />
      {label.map((ch, i) => <text key={i} x={pos(i)[0]} y={pos(i)[1]} textAnchor="middle" fontFamily={SEAL_FONT} fontWeight={700} fontSize={fs} fill={paper}>{ch}</text>)}
    </g>
    {Array.from({length: 18}, (_, i) => <circle key={i} cx={f1(r() * 96 - 48)} cy={f1(r() * 96 - 48)} r={f1(.6 + r() * 2.2)} fill={color} opacity={.55} />)}
    {Array.from({length: 10}, (_, i) => <circle key={`p${i}`} cx={f1(r() * 90 - 45)} cy={f1(r() * 90 - 45)} r={f1(.5 + r() * 1.6)} fill={paper} opacity={.7} />)}
  </g>;
}
function Splatter({cx, cy, t, count, spread, size, color, salt}: {cx: number; cy: number; t: number; count: number; spread: number; size: number; color: string; salt: string}) {
  if (t < 0) return null;
  const r = seeded(salt), q = 1 - Math.exp(-t * 11);
  return <g>{Array.from({length: count}, (_, i) => {
    const a = r() * Math.PI * 2, d = spread * (.35 + r() * .9), s = size * (.25 + Math.pow(r(), 2.2) * 1.2), x = cx + Math.cos(a) * d * q, y = cy + Math.sin(a) * d * q;
    return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(s * (1 + (1 - q) * 1.6))} ry={f1(s)} transform={`rotate(${f1(a * 180 / Math.PI)} ${f1(x)} ${f1(y)})`} fill={color} />;
  })}</g>;
}

// ---------- S108 共用：配色（读制作设定 theme；宣纸默认色时用原片色值）与滤镜、渐变 ----------
const W = 1920, H = 1080;
const outExpo = (x: number) => (x = clamp(x)) >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const inCubic = (x: number) => Math.pow(clamp(x), 3);
const outBack = (x: number) => {const q = 1.9; x = clamp(x) - 1; return 1 + (q + 1) * x * x * x + q * x * x;};
type Pal = {paper: string; ink: string; red: string; muted: string; dark: string; g: (hex: string) => string};
const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => `#${c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
const lum = (c: number[]) => .3 * c[0] + .59 * c[1] + .11 * c[2];
function palette(props: SceneInput): Pal {
  const th = props.theme, paper = th.background, ink = th.text;
  const original = paper.toUpperCase() === '#EEE6D3' && ink.toUpperCase() === '#15130F';
  const P = rgb(paper), I = rgb(ink), L0 = lum([238, 230, 211]), L1 = lum([21, 19, 15]);
  const g = (h: string) => {
    if (original || !/^#[0-9a-f]{6}$/i.test(h) || !/^#[0-9a-f]{6}$/i.test(paper) || !/^#[0-9a-f]{6}$/i.test(ink)) return h;
    const q = (L0 - lum(rgb(h))) / (L0 - L1);
    return q < .03 ? h : hex(P.map((p, i) => lerp(p, I[i], clamp(q))));
  };
  return {paper, ink, red: th.accent, muted: th.muted, dark: g('#12110E'), g};
}
function Defs({k, c}: {k: string; c: Pal}) {
  const grain = /^#[0-9a-f]{6}$/i.test(c.paper) && lum(rgb(c.paper)) <= 128 ? .35 : 1;
  return <defs>
    <filter id={`${k}paper`} x={0} y={0} width={W} height={H} filterUnits="userSpaceOnUse">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={7} result="fine" />
      <feColorMatrix in="fine" type="matrix" values={`0 0 0 0 .36  0 0 0 0 .31  0 0 0 0 .23  ${f1(.3 * grain)} ${f1(.3 * grain)} ${f1(.3 * grain)} 0 ${(-.34 * grain).toFixed(2)}`} result="grain" />
      <feTurbulence type="fractalNoise" baseFrequency=".003 .004" numOctaves={3} seed={3} result="big" />
      <feColorMatrix in="big" type="matrix" values={`0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .3  ${f1(.5 * grain)} ${f1(.5 * grain)} 0 0 ${(-.38 * grain).toFixed(2)}`} result="blot" />
      <feTurbulence type="fractalNoise" baseFrequency=".012 .45" numOctaves={2} seed={5} result="fib" />
      <feColorMatrix in="fib" type="matrix" values={`0 0 0 0 .4  0 0 0 0 .35  0 0 0 0 .27  ${f1(.4 * grain)} 0 0 0 ${(-.27 * grain).toFixed(2)}`} result="fiber" />
      <feMerge><feMergeNode in="blot" /><feMergeNode in="fiber" /><feMergeNode in="grain" /></feMerge>
    </filter>
    <filter id={`${k}dry`} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves={2} seed={9} /><feDisplacementMap in="SourceGraphic" scale={7} /></filter>
    <filter id={`${k}mblur`} x={-300} y={-300} width={1600} height={1600} filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation={10} /></filter>
    <filter id={`${k}gbleed`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={14} /></filter>
    <filter id={`${k}gsoft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={9} /></filter>
    <filter id={`${k}mist`} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={30} /></filter>
    <filter id={`${k}farblur`} x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves={2} seed={4} /><feDisplacementMap in="SourceGraphic" scale={10} result="d" /><feGaussianBlur in="d" stdDeviation={2.2} /></filter>
    <filter id={`${k}rough`} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves={3} seed={2} /><feDisplacementMap in="SourceGraphic" scale={9} /></filter>
    <filter id={`${k}sealRough`} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves={2} seed={6} /><feDisplacementMap in="SourceGraphic" scale={4} /></filter>
    <filter id={`${k}blobRough`} x={-400} y={-400} width={W + 800} height={H + 800} filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves={4} seed={8} /><feDisplacementMap in="SourceGraphic" scale={170} /></filter>
    <filter id={`${k}bloomRough`} x={-200} y={-200} width={W + 400} height={H + 400} filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves={4} seed={12} /><feDisplacementMap in="SourceGraphic" scale={60} /></filter>
    <filter id={`${k}shadow`} x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx={0} dy={14} stdDeviation={18} floodColor="#2A2318" floodOpacity={.22} /></filter>
    <radialGradient id={`${k}bloomg`}><stop offset="0" stopColor={c.ink} stopOpacity={.55} /><stop offset=".6" stopColor={c.ink} stopOpacity={.2} /><stop offset=".9" stopColor={c.ink} stopOpacity={.42} /><stop offset="1" stopColor={c.ink} stopOpacity={0} /></radialGradient>
    <radialGradient id={`${k}vignette`} cx=".5" cy=".5" r=".75"><stop offset=".55" stopColor="#7A6A50" stopOpacity={0} /><stop offset="1" stopColor="#5E4F38" stopOpacity={.32} /></radialGradient>
    <radialGradient id={`${k}inkvig`} cx=".5" cy=".4" r=".8"><stop offset=".25" stopColor={c.dark} stopOpacity={0} /><stop offset="1" stopColor={c.dark} stopOpacity={1} /></radialGradient>
    <linearGradient id={`${k}rockwash`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={c.g('#4A4740')} stopOpacity={.55} /><stop offset=".6" stopColor={c.g('#4A4740')} stopOpacity={.2} /><stop offset="1" stopColor={c.g('#4A4740')} stopOpacity={.05} /></linearGradient>
    <radialGradient id={`${k}moonhalo`}><stop offset=".22" stopColor={c.g('#5F5B52')} stopOpacity={.42} /><stop offset=".45" stopColor={c.g('#5F5B52')} stopOpacity={.16} /><stop offset="1" stopColor={c.g('#5F5B52')} stopOpacity={0} /></radialGradient>
    <radialGradient id={`${k}sunhalo`}><stop offset=".15" stopColor="#D2482D" stopOpacity={.55} /><stop offset=".5" stopColor="#C8452E" stopOpacity={.18} /><stop offset="1" stopColor="#C8452E" stopOpacity={0} /></radialGradient>
    <radialGradient id={`${k}sundisk`} cx=".42" cy=".4" r=".7"><stop offset="0" stopColor="#E25A36" /><stop offset=".7" stopColor="#C23A26" /><stop offset="1" stopColor="#A42B1C" /></radialGradient>
    <linearGradient id={`${k}warmsky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E7B184" stopOpacity={.55} /><stop offset=".55" stopColor="#E9C29A" stopOpacity={.22} /><stop offset="1" stopColor="#E9C29A" stopOpacity={0} /></linearGradient>
    <linearGradient id={`${k}nightsky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0C0B09" /><stop offset=".6" stopColor="#181613" /><stop offset="1" stopColor="#23201C" /></linearGradient>
  </defs>;
}

// ---------- 墨分五色的山：一座峰一个形状，峰顶浓、山脚淡入雾，近山加勾线与皴笔 ----------
type Peak = {x: number; h: number; w: number};
function Mountains({id, k, peaks, base, color, alpha, outline = 0, texture = 0, blur = false, seed, snowy = false}: {
  id: string; k: string; peaks: Peak[]; base: (x: number) => number; color: string; alpha: number; outline?: number; texture?: number; blur?: boolean; seed: string; snowy?: boolean;
}) {
  const n = noise2d(seed), r = seeded(seed);
  return <g filter={blur ? `url(#${k}farblur)` : `url(#${k}rough)`}>
    <defs><linearGradient id={`${k}${id}`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor={color} stopOpacity={snowy ? alpha * .04 : alpha} />
      <stop offset={snowy ? '.3' : '.42'} stopColor={color} stopOpacity={snowy ? alpha * .2 : alpha * .72} />
      <stop offset={snowy ? '.75' : '1'} stopColor={color} stopOpacity={snowy ? alpha * .62 : 0} />
      {snowy && <stop offset="1" stopColor={color} stopOpacity={alpha * .1} />}
    </linearGradient></defs>
    {peaks.map((p, j) => {
      const pts: [number, number][] = [], top: [number, number][] = [];
      for (let x = p.x - p.w; x <= p.x + p.w; x += 8) {
        const u = clamp(Math.abs(x - p.x) / p.w), shape = Math.pow(Math.cos(u * Math.PI / 2), 1.15);
        const detail = n(x * .0075, j * 3.1) * .2 + n(x * .028, j * 7.7) * .07 + n(x * .09, j) * .02;
        pts.push([x, base(x) - p.h * Math.max(0, shape + detail * Math.sqrt(shape))]);
        if (shape > .2) top.push(pts[pts.length - 1]);
      }
      const ridge = top.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join(' ');
      const closed = `${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join(' ')} L${f1(p.x + p.w)} ${f1(base(p.x + p.w) + 4)} L${f1(p.x - p.w)} ${f1(base(p.x - p.w) + 4)} Z`;
      const strokes = texture ? Array.from({length: texture}, (_, i) => {
        const [sx, sy] = top[Math.floor(r() * top.length)] ?? pts[0], side = sx < p.x ? -1 : 1, len = 16 + r() * 36;
        return <path key={i} d={`M${f1(sx)} ${f1(sy + 4)} q${f1(side * 6)} ${f1(len * .5)} ${f1(side * (6 + r() * 14))} ${f1(len)}`}
          fill="none" stroke={color} strokeWidth={f1(1.8 + r() * 2.6)} strokeLinecap="round" opacity={alpha * (.3 + r() * .35)} />;
      }) : null;
      const moss = texture ? Array.from({length: Math.ceil(texture / 2)}, (_, i) => {
        const [mx, my] = top[Math.floor(r() * top.length)] ?? pts[0];
        return <ellipse key={`m${i}`} cx={f1(mx + (r() - .5) * 8)} cy={f1(my + 2 + r() * 6)} rx={f1(2.5 + r() * 3.5)} ry={f1(2 + r() * 2)} fill={color} opacity={Math.min(1, alpha * 1.2)} />;
      }) : null;
      return <g key={j}>
        <path d={closed} fill={`url(#${k}${id})`} />
        {outline > 0 && <path d={ridge} fill="none" stroke={color} strokeWidth={outline * 6} strokeLinecap="round" opacity={alpha * .28} filter={`url(#${k}gsoft)`} />}
        {moss}
        {outline > 0 && <path d={ridge} fill="none" stroke={color} strokeWidth={outline} strokeLinecap="round" opacity={Math.min(1, alpha * 1.15)} />}
        {strokes}
      </g>;
    })}
  </g>;
}
const Mist = ({k, t, y, x0, w, h, speed, alpha, color}: {k: string; t: number; y: number; x0: number; w: number; h: number; speed: number; alpha: number; color: string}) =>
  <ellipse cx={f1(x0 + t * speed)} cy={y} rx={w} ry={h} fill={color} opacity={alpha} filter={`url(#${k}mist)`} />;
const bez = (p: number[][], u: number) => {const a = 1 - u; return [0, 1].map(i => a * a * a * p[0][i] + 3 * a * a * u * p[1][i] + 3 * a * u * u * p[2][i] + u * u * u * p[3][i]);};
const quad = (p: number[][], u: number) => [0, 1].map(i => (1 - u) * (1 - u) * p[0][i] + 2 * (1 - u) * u * p[1][i] + u * u * p[2][i]);
function taper(pts: number[][], w0: number, w1: number) {
  const L: string[] = [], R: string[] = [];
  pts.forEach((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], len = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (pts.length - 1)) / 2;
    L.push(`${f1(p[0] - dy / len * w)} ${f1(p[1] + dx / len * w)}`);
    R.push(`${f1(p[0] + dy / len * w)} ${f1(p[1] - dx / len * w)}`);
  });
  return `M${L.join(' L')} L${R.reverse().join(' L')} Z`;
}
type Art = {k: string; t: number; c: Pal};

// ---------- 月夜：明月松间照，清泉石上流 ----------
const MOON = {x: 1180, y: 300, r: 105};
const TRUNK = [[330, 1110], [250, 860], [480, 650], [590, 360]];
const trunkAt = (u: number) => bez(TRUNK, u);
const BRANCHES = [{u: .62, c: [700, 470], e: [930, 425], w: 17}, {u: .99, c: [700, 330], e: [835, 292], w: 13}, {u: .8, c: [430, 445], e: [285, 470], w: 13}, {u: .45, c: [620, 650], e: [800, 612], w: 14}]
  .map(b => ({...b, pts: [trunkAt(b.u), b.c, b.e]}));
const CLUSTERS = [...[[0, .55, 62], [0, .86, 70], [0, 1, 74], [1, .6, 58], [1, 1, 66], [2, .65, 56], [2, 1, 62], [3, .7, 54], [3, 1, 60]]
  .map(([b, u, R]) => ({p: quad(BRANCHES[b].pts, u), R})), {p: trunkAt(1), R: 70}];
function Pine({k, t, c}: Art) {
  const pts = Array.from({length: 40}, (_, i) => trunkAt(i / 39)), r = seeded('needles');
  return <g filter={`url(#${k}rough)`}>
    <path d={taper(pts, 60, 18)} fill={c.ink} opacity={.92} />
    <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0] + 6)} ${f1(p[1])}`).join(' ')} fill="none" stroke={c.paper} strokeWidth={4} opacity={.16} />
    {Array.from({length: 18}, (_, i) => {const [x, y] = trunkAt(.05 + i * .05); return <ellipse key={i} cx={f1(x + (i % 2 ? -8 : 7))} cy={f1(y)} rx={13} ry={7} fill="none" stroke={c.paper} strokeWidth={2.2} opacity={.22} transform={`rotate(${-30 + (i % 3) * 18} ${f1(x)} ${f1(y)})`} />;})}
    {BRANCHES.map((b, i) => <path key={i} d={taper(Array.from({length: 18}, (_, j) => quad(b.pts, j / 17)), b.w, 4)} fill={c.ink} opacity={.9} />)}
    {CLUSTERS.map(({p: [cx, cy], R}, i) => <g key={i} transform={`rotate(${(Math.sin(t * 1.3 + i * .9) * 1.1).toFixed(2)} ${f1(cx)} ${f1(cy)})`}>
      <ellipse cx={f1(cx)} cy={f1(cy - R * .32)} rx={f1(R * 1.25)} ry={f1(R * .52)} fill={c.g('#3B3832')} opacity={.3} filter={`url(#${k}gsoft)`} />
      <path d={`M${f1(cx - R * .8)} ${f1(cy)} Q${f1(cx)} ${f1(cy + 8)} ${f1(cx + R * .8)} ${f1(cy - 2)}`} fill="none" stroke={c.ink} strokeWidth={7} strokeLinecap="round" />
      {Array.from({length: 17}, (_, j) => {
        const a = -Math.PI + .32 + (Math.PI - .64) * (j / 16) + (r() - .5) * .08, ox = cx + (j / 16 - .5) * R * 1.1, len = R * (.72 + r() * .3);
        return <path key={j} d={`M${f1(ox)} ${f1(cy)} L${f1(ox + Math.cos(a) * len)} ${f1(cy + Math.sin(a) * len)}`} stroke={c.ink} strokeWidth={f1(2.2 + r() * 1.2)} strokeLinecap="round" opacity={.86} />;
      })}
    </g>)}
  </g>;
}
const ROCKS = [{x: 560, y: 1015, r: 150}, {x: 1185, y: 1045, r: 200}, {x: 1560, y: 995, r: 170}, {x: 1860, y: 1055, r: 200}];
function Rocks({k, c}: {k: string; c: Pal}) {
  const n = noise2d('rocks'), r = seeded('rocks');
  return <g filter={`url(#${k}rough)`}>{ROCKS.map((q, i) => {
    const pts = Array.from({length: 28}, (_, j) => {const a = Math.PI + Math.PI * j / 27, rad = q.r * (1 + n(Math.cos(a) * 1.1, i * 4 + Math.sin(a) * .6) * .26); return [q.x + Math.cos(a) * rad * 1.15, q.y + Math.sin(a) * rad * .82];});
    const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join(' ');
    return <g key={i}>
      <path d={`${d} Z`} fill={`url(#${k}rockwash)`} />
      <path d={d} fill="none" stroke={c.ink} strokeWidth={5} strokeLinecap="round" opacity={.85} />
      {Array.from({length: 4}, (_, j) => {const [x, y] = pts[5 + Math.floor(r() * 18)], ix = lerp(x, q.x, .18), iy = lerp(y, q.y, .3) + 6;
        return <path key={j} d={`M${f1(ix)} ${f1(iy)} q${f1((q.x - x) * .25)} ${f1(18 + r() * 14)} ${f1((q.x - x) * .32 + 20)} ${f1(30 + r() * 30)}`} fill="none" stroke={c.ink} strokeWidth={f1(2 + r() * 2)} strokeLinecap="round" opacity={.38} />;})}
    </g>;
  })}</g>;
}
const STREAM = [[1030, 905], [960, 960], [850, 1000], [835, 1120]];

const PAINT_AGE = 2.1;
function MoonSun({k, t, c, sun, swell}: {k: string; t: number; c: Pal; sun: number; swell: number}) {
  const band = Array.from({length: 30}, (_, i) => bez(STREAM, i / 29)), rr = MOON.r * (1 + .28 * sun) * (1 + .4 * swell);
  return <g>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${k}warmsky)`} opacity={sun * .85} />
    <circle cx={MOON.x} cy={MOON.y} r={460} fill={`url(#${k}moonhalo)`} opacity={1 - sun} />
    <circle cx={MOON.x} cy={MOON.y} r={f1(560 * (1 + .3 * swell))} fill={`url(#${k}sunhalo)`} opacity={sun} />
    <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#F8F3E7" opacity={1 - sun} />
    {sun > 0 && <circle cx={MOON.x} cy={MOON.y} r={f1(rr * (.8 + .2 * outBack(sun)))} fill={`url(#${k}sundisk)`} opacity={sun} filter={`url(#${k}sealRough)`} />}
    <path d={`M${f1(MOON.x - 260 + t * 9)} ${MOON.y + 70} q140 -26 300 -6 t260 8`} fill="none" stroke={c.g('#6C685F')} strokeWidth={14} strokeLinecap="round" opacity={.22} filter={`url(#${k}gsoft)`} />
    <Mountains k={k} id="m2a" seed="m2a" blur color={c.g('#5A564D')} alpha={.3} base={() => 790} peaks={[{x: 860, h: 170, w: 180}, {x: 1130, h: 250, w: 210}, {x: 1420, h: 200, w: 180}, {x: 1700, h: 300, w: 230}, {x: 1950, h: 240, w: 200}]} />
    <Mist k={k} t={t} y={780} x0={900} w={700} h={40} speed={12} alpha={.7} color={c.paper} />
    <Mountains k={k} id="m2b" seed="m2b" color={c.g('#2E2B26')} alpha={.5} outline={2.4} texture={12} base={() => 930} peaks={[{x: 1450, h: 290, w: 200}, {x: 1790, h: 380, w: 230}]} />
    <Mist k={k} t={t} y={900} x0={1300} w={600} h={44} speed={-10} alpha={.6} color={c.paper} />
    {Array.from({length: 7}, (_, i) => {
      const off = (i - 3) * 9, d = band.map((p, j) => `${j ? 'L' : 'M'}${f1(p[0] + off * (.3 + j / 29))} ${f1(p[1])}`).join(' ');
      return <path key={i} d={d} fill="none" stroke={c.g('#5E5A52')} strokeWidth={i % 3 ? 1.8 : 2.8} strokeLinecap="round" strokeDasharray={i % 2 ? '34 70' : '18 56'} strokeDashoffset={f1(-t * (130 + i * 14) - i * 37)} opacity={.55} />;
    })}
    <Rocks k={k} c={c} />
    <Pine k={k} t={t} c={c} />
  </g>;
}

export default function InkEdit(props: SceneInput) {
  const s = useScene(props), k = `ied${props.seed}`, c = palette(props), t = s.t, tt = t + PAINT_AGE;
  const lines = word(props.params.poem, meta.params.poem.default, 24).split(/[，,。.、；;\s]+/u).map(l => Array.from(l)).filter(l => l.length).slice(0, 4);
  const author = word(props.params.author, meta.params.author.default, 6);
  const from = word(props.params.word, meta.params.word.default, 4) || meta.params.word.default, to = word(props.params.editTo, meta.params.editTo.default, 4) || meta.params.editTo.default;
  const ui = (key: 'cardTitle' | 'selectedLabel' | 'appliedLabel' | 'hint' | 'applyLabel' | 'doneLabel', value: unknown) => word(value, meta.params[key].default, 40);
  const cardTitle = ui('cardTitle', props.params.cardTitle), hint = ui('hint', props.params.hint), applyLabel = ui('applyLabel', props.params.applyLabel), doneLabel = ui('doneLabel', props.params.doneLabel);
  const selectedLabel = ui('selectedLabel', props.params.selectedLabel), appliedLabel = ui('appliedLabel', props.params.appliedLabel);
  const sents = props.sentences, T0 = sents[0]?.start ?? .4;
  const apply = sents.length > 1 ? sents[sents.length - 1].start - .05 : T0 + 5, boom = Math.max(apply + 1.2, s.seconds - .4);
  const click = T0 + 1.25, card = T0 + 2.5, type0 = apply - 1.5625, type1 = type0 + .15625;
  const sun = outCubic(seg(t, apply, .6)), swell = inCubic(seg(t, boom - .45, .45)), darken = inCubic(seg(t, boom - 1.1, 1.1));
  const shake = t > boom - .6 && t < boom ? 3 * swell * Math.sin(t * 95) : 0, cam = 1 + .05 * seg(tt, 0, 3.75) + .16 * inCubic(seg(t, apply, boom - apply));
  // 题画诗：被改的词在哪行哪几个字，就在那里换字（先墨晕褪去，再朱红落下、慢慢转回墨色）。
  const hitLine = lines.findIndex(l => l.join('').includes(from)), hitAt = hitLine >= 0 ? lines[hitLine].join('').indexOf(from) : -1;
  const n = lines.length, toChars = Array.from(to), fromLen = Array.from(from).length;
  // 光标与检查器
  const mv = outCubic(seg(t, T0 + .2, .8)), cx = lerp(1620, 1236, mv), cy = lerp(800, 352, mv), press = t >= click && t < click + .12 ? .82 : 1;
  const sel = outBack(seg(t, click, .26)), selOut = seg(t, apply + .25, .35), half = lerp(190, 142, sel) * (1 + .5 * selOut);
  const cardIn = outCubic(seg(t, card, .32)), cardOut = seg(t, apply + .6, .4), value = t < type0 ? from : t < type1 ? toChars[0] : to;
  const caret = t >= type0 && Math.floor((t - type0) / .28) % 2 === 0 && t < apply, ok = seg(t, apply, .2), showUi = t >= T0 - .2 && t <= apply + 1.2;
  const boomK = (i: number) => outCubic(seg(t, boom + i * .025, .42));
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: c.paper}}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
      <Defs k={k} c={c} />
      <rect x={0} y={0} width={W} height={H} fill={c.paper} />
      <rect x={0} y={0} width={W} height={H} filter={`url(#${k}paper)`} />
      <rect x={0} y={0} width={W} height={H} fill={`url(#${k}vignette)`} />
      <g transform={`translate(${f1(shake)} ${f1(-shake * .5)})`}>
        <g transform={`translate(${MOON.x} ${MOON.y}) scale(${cam.toFixed(4)}) translate(${-MOON.x} ${-MOON.y})`}><MoonSun k={k} t={tt} c={c} sun={sun} swell={swell} /></g>
        {t >= apply + .3 && t <= boom + .1 && <g>{[0, 1, 2, 3, 4].map(i => {
          const q = seg(t, apply + .35 + i * .12, boom - apply - .4);
          if (q <= 0 || q >= 1) return null;
          const x = lerp(1560 + i * 40, 760 - i * 30, q), y = 250 + [0, 40, -25, 70, 15][i] + Math.sin(q * 6 + i) * 10, sz = [26, 20, 22, 17, 19][i], flap = Math.sin(t * 15 + i * 1.7) * .6;
          return <path key={i} d={`M${f1(x - sz)} ${f1(y - sz * flap)} Q${f1(x - sz * .4)} ${f1(y - sz * .2)} ${f1(x)} ${f1(y + 3)} Q${f1(x + sz * .4)} ${f1(y - sz * .2)} ${f1(x + sz)} ${f1(y - sz * flap)}`} fill="none" stroke={c.ink} strokeWidth={4} strokeLinecap="round" />;
        })}</g>}
        <g>
          {lines.map((line, li) => line.map((ch, i) => {
            const x = 1800 - li * 62, y = 118 + i * 54, j = i - hitAt;
            if (li === hitLine && j >= 0 && j < fromLen) {
              const q = seg(t, apply + j * .08, .3), redK = 1 - seg(t, apply + .9, .8), nc = toChars[j] ?? '';
              return <g key={`${li}-${i}`}>
                {q < 1 && <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={46} fill={c.ink} opacity={1 - q} transform={`translate(0 ${f1(-q * 14)})`} filter={q > 0 ? `url(#${k}gbleed)` : `url(#${k}dry)`}>{ch}</text>}
                {q > 0 && nc && <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={f1(46 * (1 + .4 * (1 - outCubic(q))))} fill={redK > 0 ? (redK > .5 ? c.red : c.g('#6A2A21')) : c.ink} opacity={outCubic(q)} filter={`url(#${k}dry)`}>{nc}</text>}
              </g>;
            }
            return <text key={`${li}-${i}`} x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={46} fill={c.ink} filter={`url(#${k}dry)`}>{ch}</text>;
          }))}
          {n > 0 && <text x={1800 - n * 62 + 2} y={118 + (lines[n - 1].length - 1) * 54} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={c.muted}>{author}</text>}
        </g>
        {showUi && <g>
          {t >= click && selOut < 1 && <g opacity={(1 - selOut) * seg(t, click, .05)}>
            <rect x={MOON.x - half} y={MOON.y - half} width={half * 2} height={half * 2} fill="none" stroke={c.red} strokeWidth={2} strokeDasharray="10 9" opacity={.6} />
            {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => <path key={i}
              d={`M${f1(MOON.x + sx * half)} ${f1(MOON.y + sy * (half - 38))} L${f1(MOON.x + sx * half)} ${f1(MOON.y + sy * half)} L${f1(MOON.x + sx * (half - 38))} ${f1(MOON.y + sy * half)}`} fill="none" stroke={c.red} strokeWidth={6} strokeLinecap="round" />)}
            <g transform={`translate(${f1(MOON.x - half)} ${f1(MOON.y - half - 50)})`}>
              <rect width={Math.max(96, 28 * Array.from(t < apply ? from : to).length + 40)} height={40} rx={6} fill={c.red} />
              <text x={Math.max(96, 28 * Array.from(t < apply ? from : to).length + 40) / 2} y={29} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={c.paper}>{t < apply ? from : to}</text>
            </g>
            {t < click + .5 && <circle cx={1236} cy={352} r={f1(20 + 80 * outCubic(seg(t, click, .5)))} fill="none" stroke={c.red} strokeWidth={3} opacity={1 - seg(t, click, .5)} />}
          </g>}
          {cardIn > 0 && cardOut < 1 && <g transform={`translate(1330 ${f1(560 + (1 - cardIn) * 26)})`} opacity={cardIn * (1 - cardOut)}>
            <rect width={470} height={236} rx={14} fill="#F9F5EC" stroke="#2A2723" strokeOpacity={.22} strokeWidth={2} filter={`url(#${k}shadow)`} />
            <text x={32} y={52} fontFamily={FONT} fontWeight={700} fontSize={30} fill={c.red}>{cardTitle}</text>
            <text x={438} y={52} textAnchor="end" fontFamily='"PingFang SC", sans-serif' fontSize={20} fill="#8A8273">{t < apply ? selectedLabel.replace('{word}', from) : appliedLabel.replace('{word}', to)}</text>
            <rect x={32} y={78} width={406} height={84} rx={10} fill="#FFFFFF" stroke={t >= type0 ? c.red : '#2A2723'} strokeOpacity={t >= type0 ? .8 : .25} strokeWidth={2} />
            {t >= card + .2 && t < type0 && <rect x={50} y={94} width={56 * fromLen} height={52} rx={6} fill={c.red} opacity={.16} />}
            <text x={56} y={138} fontFamily={FONT} fontWeight={700} fontSize={50} fill="#15130F">{value}</text>
            {caret && <rect x={56 + Array.from(value).length * 52 + 4} y={98} width={3.5} height={48} fill={c.red} />}
            <g transform="translate(32 200)">
              <text fontFamily='"PingFang SC", sans-serif' fontSize={20} fill="#8A8273">{hint}</text>
              <g transform="translate(330 -22)">
                <rect width={76} height={32} rx={8} fill={ok > 0 ? c.red : 'none'} stroke={c.red} strokeWidth={2} />
                <text x={38} y={23} textAnchor="middle" fontFamily='"PingFang SC", sans-serif' fontSize={19} fontWeight={600} fill={ok > 0 ? '#F9F5EC' : c.red}>{ok > 0 ? doneLabel : applyLabel}</text>
              </g>
            </g>
          </g>}
          {seg(t, card + .1, .3) < 1 && <g transform={`translate(${f1(cx)} ${f1(cy)}) scale(${press * 1.6})`} opacity={seg(t, T0, .15) * (1 - seg(t, card + .1, .3))}>
            <path d="M0 0 L0 26 L7 20 L12 31 L17 29 L12 18 L21 18 Z" fill={c.ink} stroke={c.paper} strokeWidth={1.8} strokeLinejoin="round" />
          </g>}
        </g>}
        {darken > 0 && <rect x={0} y={0} width={W} height={H} fill={`url(#${k}inkvig)`} opacity={darken * .75} />}
      </g>
      {t >= boom && <g>
        <g filter={`url(#${k}blobRough)`}>
          {[[MOON.x, MOON.y, 1], [MOON.x - 260, MOON.y + 160, .8], [MOON.x + 200, MOON.y + 240, .7], [MOON.x - 520, MOON.y + 420, .6], [MOON.x + 120, MOON.y - 80, .9]].map(([x, y, sc], i) =>
            <circle key={i} cx={x} cy={y} r={f1(2600 * sc * boomK(i))} fill={c.dark} />)}
        </g>
        <Splatter cx={MOON.x} cy={MOON.y} t={t - boom} count={40} spread={1300} size={22} color={c.dark} salt="boom" />
      </g>}
    </svg>
  </div>;
}
