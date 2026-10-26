import React from 'react';
import {noise2d, seeded, useScene, type SceneInput} from '@talkframe/scene';

// S108《落笔成影》尾声：墨爆之后的夜色，红日升起、远山与余烬，白字片名快速写出、钤印震动，标语从左向右显出，最后标志与英文名。
// 本幕从墨爆那一刻开始（与上一幕 0.4 秒交叉淡化）；节点按配乐拍点写在幕内秒数：钤印 1.25、标语 2.5、英文名 3.75，
// 旁白（“文影，落笔成影”）在幕首 0.4 秒开口，与片名落笔同时。
export const meta = {
  title: '水墨尾声：墨爆与落款',
  description: '夜色红日、远山余烬；白色毛笔字片名快速写出，钤印、标语显出，最后是标志与英文名。',
  params: {
    text: {label: '片名', type: 'text', default: '文影', maxLength: 4},
    seal: {label: '印文', type: 'text', default: '文影', maxLength: 4},
    tagline: {label: '标语', type: 'text', default: '落笔成影', maxLength: 24, help: '中文按毛笔大字写；没有汉字时（英文版）改用衬线字、字距收窄'},
    latin: {label: '英文名', type: 'text', default: 'GALANTY', maxLength: 16, help: '留空则不画标志与英文名'},
  },
};
// 本文件由 tools/production/ink-promo-20261007/build_scenes.mjs 拼装：共用段取自 T22 毛笔落字片名、T23 诗句化画与 src/_sample.tsx，改正文请改 src/ink-finale.tsx 后重跑。

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

const SEAL_AT = 1.25, TAG_AT = 2.5, LATIN_AT = 3.75, LIGHT = '#F2EBDC';
/** 尾声的快写：手写字用原片快写节奏，其余字把笔画时间压到 0.44 秒内。 */
const FAST: Record<string, number[][]> = {'文': [[0, .12], [.14, .12], [.28, .16]], '影': Array.from({length: 9}, (_, i) => [i * .06, .07])};
function fastPlan(ch: string): Plan {
  const plan = strokePlan(ch), fast = FAST[ch];
  if (fast) {const last = fast[fast.length - 1]; return {...plan, times: fast, total: last[0] + last[1]};}
  const q = Math.min(1, .44 / Math.max(1e-6, plan.total));
  return {...plan, times: plan.times.map(([a, d]) => [a * q, d * q]), total: plan.total * q};
}

export default function InkFinale(props: SceneInput) {
  const s = useScene(props), k = `ifn${props.seed}`, c = palette(props), t = s.t, len = s.seconds;
  const chars = Array.from(word(props.params.text, meta.params.text.default, 4) || meta.params.text.default);
  const seal = Array.from(word(props.params.seal, meta.params.seal.default, 4));
  const tagline = word(props.params.tagline, meta.params.tagline.default, 24), latinText = word(props.params.latin, meta.params.latin.default, 16);
  const n = chars.length, size = n <= 2 ? 470 : n === 3 ? 400 : 320, x0 = 950 - n * size / 2;
  const plans = chars.map(fastPlan), starts = chars.map((ch, i) => ch === '影' && chars[i - 1] === '文' ? .68 : .22 + i * .46);
  const sealX = x0 + n * size + 20 * size / 470, sealY = 142 + 380 * size / 470;
  const zoom = 1.1 - .1 * outExpo(seg(t, .05, 1.4)) + .025 * seg(t, 1.45, Math.max(.1, len - 1.45));
  const sunIn = outExpo(seg(t, .12, .9)), tagK = seg(t, TAG_AT, .55), latin = outCubic(seg(t, LATIN_AT, .6)), r = seeded('embers');
  const shake = t >= SEAL_AT ? 6 * Math.exp(-(t - SEAL_AT) * 12) * Math.sin((t - SEAL_AT) * 80) : 0, boomK = outCubic(seg(t, 0, .42));
  const tw = outCubic(tagK);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0C0B09'}}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
      <Defs k={k} c={c} />
      <g transform={`translate(${f1(shake)} ${f1(-shake * .6)})`}>
        <rect x={0} y={0} width={W} height={H} fill={`url(#${k}nightsky)`} />
        <g transform={`translate(960 500) scale(${zoom.toFixed(4)}) translate(-960 -500)`}>
          <circle cx={960} cy={420} r={f1(580 * (.6 + .4 * sunIn))} fill={`url(#${k}sunhalo)`} opacity={sunIn * .9} />
          <circle cx={960} cy={420} r={f1(268 * (.62 + .38 * sunIn))} fill={`url(#${k}sundisk)`} opacity={sunIn} filter={`url(#${k}sealRough)`} />
          <Mountains k={k} id="mfa" seed="mfa" color="#3A352F" alpha={1} base={() => 1000} peaks={[{x: 240, h: 280, w: 260}, {x: 620, h: 330, w: 240}, {x: 1000, h: 250, w: 220}, {x: 1330, h: 360, w: 260}, {x: 1720, h: 300, w: 260}]} />
          <Mist k={k} t={t} y={840} x0={700} w={900} h={50} speed={22} alpha={.55} color="#57514A" />
          <Mountains k={k} id="mfb" seed="mfb" color="#24211D" alpha={1} outline={3} texture={14} base={() => 1100} peaks={[{x: 80, h: 360, w: 260}, {x: 430, h: 220, w: 220}, {x: 1530, h: 240, w: 240}, {x: 1880, h: 400, w: 280}]} />
          <Mist k={k} t={t} y={1000} x0={1100} w={1000} h={60} speed={-16} alpha={.45} color="#4A453F" />
          {Array.from({length: 70}, (_, i) => {
            const ex = r() * W, sp = 20 + r() * 50, ph = r() * 10, red = r() < .3, y = 1100 - (t * sp + ph * 110) % 1200, x = ex + Math.sin((t + ph) * .9) * 24, sz = .8 + r() * 2.8;
            return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(sz)} fill={red ? '#E0613F' : c.paper} opacity={(.25 + r() * .5) * seg(t, .4, .8)} />;
          })}
          {chars.map((ch, i) => <Glyph key={i} id={`${k}g${i}`} k={k} ch={ch} x={x0 + i * size} y={142} size={size} t={t - starts[i]} plan={plans[i]} fill={LIGHT} bleed={.45} />)}
          {t >= SEAL_AT - .03 && <g opacity={.75}><Splatter cx={x0 + n * size * .64} cy={400} t={t - SEAL_AT + .03} count={26} spread={420} size={7} color={LIGHT} salt="fsplat" /></g>}
          <Seal cx={sealX} cy={sealY} size={112 * size / 470} t={t - SEAL_AT} label={seal} color={c.red} paper={LIGHT} k={k} />
          {seal.length > 0 && <Splatter cx={sealX} cy={sealY} t={t - SEAL_AT} count={16} spread={150} size={5} color={c.red} salt="fseal" />}
          {tagK > 0 && tagline && <g>
            <defs><linearGradient id={`${k}tagwipe`} x1="0" x2="1" y1="0" y2="0"><stop offset={f1(lerp(-.2, 1, tw))} stopColor="#fff" /><stop offset={f1(lerp(0, 1.2, tw))} stopColor="#000" /></linearGradient>
              <mask id={`${k}tagmask`} maskUnits="userSpaceOnUse" x={560} y={740} width={800} height={160}><rect x={560} y={740} width={800} height={160} fill={`url(#${k}tagwipe)`} /></mask></defs>
            {/[\u3400-\u9fff]/.test(tagline)
              ? <text x={978} y={866} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={96} letterSpacing="0.38em" fill={LIGHT} mask={`url(#${k}tagmask)`} filter={`url(#${k}dry)`}>{tagline}</text>
              : <text x={960} y={858} textAnchor="middle" fontFamily='"Baskerville", Georgia, "Times New Roman", serif' fontStyle="italic" fontSize={Math.min(76, 1500 / Math.max(1, tagline.length))} letterSpacing="0.06em" fill={LIGHT} mask={`url(#${k}tagmask)`}>{tagline}</text>}
          </g>}
          {latin > 0 && latinText && <g opacity={latin} transform={`translate(0 ${f1((1 - latin) * 12)})`}>
            <path d={`M${f1(960 - 300 * latin)} 912 L${f1(960 + 300 * latin)} 912`} stroke="#8F8270" strokeWidth={1.6} opacity={.7} />
            <g transform="translate(786 934) scale(.42)">
              {[[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={13} rx={6.5} fill={LIGHT} />)}
              <path d="M64.5 62.1 L84.98 73.5 L64.5 84.9 Z" fill={c.red} stroke={c.red} strokeWidth={2.7} strokeLinejoin="round" />
            </g>
            <text x={857} y={967} fontFamily='"Avenir Next", "Helvetica Neue", sans-serif' fontWeight={500} fontSize={30} letterSpacing="0.62em" fill="#B4A68F">{latinText}</text>
          </g>}
        </g>
      </g>
      {boomK < 1 && <circle cx={1180} cy={300} r={f1(60 + 700 * boomK)} fill="none" stroke="#E0613F" strokeWidth={f1(30 * (1 - boomK))} opacity={(1 - boomK) * .6} />}
    </svg>
  </div>;
}
