import React from 'react';
import {noise2d, seeded, useScene, type SceneInput} from '@talkframe/scene';

// 诗句化画（T23）：诗句随朗读逐字落纸，念完后墨点飞散、整幅水墨画从纸上晕开，诗句缩成右上角的题画诗。
// 时间全部来自本幕旁白：有逐字时间时每个字在念到它的那一刻落下；没有时在该句里按字数插值。
// 化画时刻 = max(念完后 0.3 秒, 幕末前 3.35 秒)：给这一幕 hold 3 秒左右，画面才有时间停留。
// 画面由 S108《落笔成影》的全局大模块拆出，山、江、帆、雪、柳、月、松、石全部是程序生成的矢量图形。
export const meta = {
  title: '诗句化画',
  description: '诗句随朗读逐字写在宣纸上，念完后字化成水墨画（江河 / 江雪 / 柳岸 / 月夜 / 山峦），诗句缩成题画诗。第一句旁白作介绍，含诗句的那句按逐字时间落纸；化画后给本幕 hold 约 3 秒。',
  category: '故事插画',
  aesthetic: '水墨',
  techniques: ['逐字落纸', '字化成画', '墨分五色', '晕染揭示'],
  bestFor: ['古诗词朗读', '文化与历史介绍', '意境转场'],
  notFor: ['竖屏', '长段说明文字', '数据图表'],
  aspects: ['landscape'],
  slots: ['poem', 'title', 'author', 'painting', 'signature', 'palette'],
  params: {
    poem: {label: '诗句', type: 'text', default: '孤帆远影碧空尽，唯见长江天际流', maxLength: 32, help: '逗号分行，竖排从右往左；每行最多 8 字、最多 4 行。旁白里念到的字按实测时间落纸'},
    title: {label: '诗题', type: 'text', default: '黄鹤楼送孟浩然之广陵', maxLength: 12},
    author: {label: '作者', type: 'text', default: '李白', maxLength: 6},
    painting: {label: '画面', type: 'select', default: 'river', options: [
      {value: 'river', label: '江河'}, {value: 'snow', label: '江雪'}, {value: 'willow', label: '柳岸'}, {value: 'moon', label: '月夜'}, {value: 'hills', label: '山峦'}]},
    signature: {label: '落款', type: 'text', default: '', maxLength: 4, help: '左侧竖排落款与朱印，化画时淡出；留空不画'},
    palette: {label: '配色', type: 'select', options: [{value: 'rice', label: '宣纸'}, {value: 'night', label: '夜墨'}, {value: 'celadon', label: '青瓷'}, {value: 'tea', label: '茶笺'}], help: '留空跟随制作设定的配色'},
  },
  themes: [
    {id: 'rice', name: '宣纸', background: '#EEE6D3', accent: '#B8372A', text: '#15130F', muted: '#6D655A'},
    {id: 'night', name: '夜墨', background: '#1A1916', accent: '#D9573B', text: '#EFE7D6', muted: '#A39985'},
    {id: 'celadon', name: '青瓷', background: '#DCE5DC', accent: '#A4433A', text: '#1C2925', muted: '#5F7068'},
    {id: 'tea', name: '茶笺', background: '#E3D3B4', accent: '#9C3424', text: '#2B2117', muted: '#7B6850'},
  ],
  license: {spdx: 'MIT', attribution: true, commercial: true, redistribution: true},
};

const W = 1920, H = 1080;
const FONT = '"Xingkai SC", "STXingkai", "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif';
const SEAL_FONT = '"Weibei SC", "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, d: number) => clamp((t - a) / d);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const outCubic = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const outExpo = (x: number) => (x = clamp(x)) >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const f1 = (v: number) => Number(v.toFixed(1));
const word = (v: unknown, fallback: string, max: number) =>
  typeof v === 'string' && v.trim() ? Array.from(v.trim()).slice(0, max).join('') : fallback;
const HAN = /\p{Script=Han}/u;

// ---------- 配色：默认宣纸配色时用原片色值；换配色时把中性灰按“纸 → 墨”的深浅比例重映射，彩色（黄鹂、柳叶、红日）保留 ----------
type Pal = {paper: string; ink: string; red: string; muted: string; g: (hex: string) => string};
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const hex = (c: number[]) => `#${c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
const lum = (c: number[]) => .3 * c[0] + .59 * c[1] + .11 * c[2];
function palette(props: SceneInput): Pal {
  const th = meta.themes.find(x => x.id === props.params.palette) ?? props.theme;
  const paper = th.background, ink = th.text;
  const original = paper.toUpperCase() === '#EEE6D3' && ink.toUpperCase() === '#15130F';
  const P = rgb(paper), I = rgb(ink), L0 = lum([238, 230, 211]), L1 = lum([21, 19, 15]);
  const g = (h: string) => {
    if (original || !/^#[0-9a-f]{6}$/i.test(h)) return h;
    const k = (L0 - lum(rgb(h))) / (L0 - L1);
    return k < .03 ? h : hex(P.map((p, i) => lerp(p, I[i], clamp(k))));
  };
  return {paper, ink, red: th.accent, muted: th.muted, g};
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

// ---------- 江河：孤帆远影碧空尽，唯见长江天际流 ----------
const VP = {x: 1180, y: 612};
function Boat({c}: {c: Pal}) {
  return <g>
    <path d="M-92 -4 Q0 30 96 -6 L74 -16 L-74 -14 Z" fill={c.ink} opacity={.88} />
    <path d="M2 -14 L2 -214" stroke={c.ink} strokeWidth={4.5} strokeLinecap="round" />
    <path d="M8 -206 L68 -192 L84 -36 L8 -30 Z" fill={c.g('#CFC6B1')} stroke={c.ink} strokeWidth={3} strokeLinejoin="round" opacity={.92} />
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M8 ${-176 + i * 32} L${72 + i * 2.4} ${-164 + i * 30}`} stroke={c.ink} strokeWidth={2} opacity={.7} />)}
  </g>;
}
function River({k, t, c}: Art) {
  const wob = noise2d('banks'), ripples = seeded('ripples');
  const bankL = (x: number) => lerp(1100, VP.y + 8, Math.pow(clamp(x / 1120), .62)) + wob(x * .006, 1) * 16 * (1 - clamp(x / 1120));
  const bankR = (x: number) => lerp(VP.y + 8, 920, Math.pow(clamp((x - 1240) / 680), 1.5)) + wob(x * .006, 5) * 12 * clamp((x - 1240) / 680);
  const sail = outCubic(seg(t, -.2, 2.9)), sp = Math.pow(sail, .8);
  const sx = lerp(1010, VP.x + 4, sp), sy = lerp(905, VP.y + 6, sp), ss = lerp(1, .07, Math.pow(sail, .7)), so = 1 - seg(t, 1.75, .6);
  return <g>
    <rect x={0} y={0} width={W} height={VP.y} fill={`url(#${k}skywash)`} />
    <Mountains k={k} id="m1t" seed="m1t" blur color={c.g('#6A665C')} alpha={.2} base={() => VP.y + 20} peaks={[{x: 640, h: 380, w: 200}, {x: 820, h: 300, w: 160}, {x: 1560, h: 360, w: 190}, {x: 1720, h: 270, w: 150}]} />
    <Mist k={k} t={t} y={VP.y - 60} x0={700} w={760} h={60} speed={10} alpha={.8} color={c.paper} />
    <Mountains k={k} id="m1a" seed="m1a" blur color={c.g('#59554C')} alpha={.32} base={() => VP.y + 4} peaks={[{x: 790, h: 95, w: 130}, {x: 980, h: 62, w: 100}, {x: 1340, h: 120, w: 150}, {x: 1530, h: 75, w: 110}, {x: 1660, h: 50, w: 90}]} />
    <Mist k={k} t={t} y={VP.y - 18} x0={1100} w={520} h={34} speed={14} alpha={.75} color={c.paper} />
    <Mountains k={k} id="m1c" seed="m1c" color={c.g('#2E2B26')} alpha={.6} outline={2.4} texture={10} base={bankR} peaks={[{x: 1470, h: 170, w: 150}, {x: 1700, h: 330, w: 190}, {x: 1930, h: 520, w: 240}]} />
    <Mountains k={k} id="m1b" seed="m1b" color={c.g('#2B2823')} alpha={.66} outline={2.8} texture={16} base={bankL} peaks={[{x: 120, h: 580, w: 260}, {x: 400, h: 420, w: 210}, {x: 660, h: 270, w: 170}, {x: 890, h: 140, w: 130}, {x: 1050, h: 60, w: 80}]} />
    <rect x={0} y={VP.y} width={W} height={H - VP.y} fill={`url(#${k}river)`} />
    {([[0, 1110, bankL], [1240, 1920, bankR]] as const).map(([a, b, f], i) => {
      const d = Array.from({length: 40}, (_, j) => {const x = a + (b - a) * j / 39; return `${j ? 'L' : 'M'}${f1(x)} ${f1(f(x) + 2)}`;}).join(' ');
      return <g key={i}><path d={d} fill="none" stroke={c.g('#3A372F')} strokeWidth={18} opacity={.16} filter={`url(#${k}gsoft)`} /><path d={d} fill="none" stroke={c.g('#3A372F')} strokeWidth={2.4} opacity={.4} strokeDasharray="140 50 70 90" filter={`url(#${k}rough)`} /></g>;
    })}
    {Array.from({length: 46}, (_, i) => {
      const depth = ((i / 46 + t * .035) % 1 + 1) % 1, d = Math.pow(depth, 1.9);
      const y = lerp(VP.y + 12, 1090, d), half = lerp(70, 900, d), x = VP.x + (ripples() - .5) * 2 * half * .85, len = lerp(8, 120, d) * (.5 + ripples());
      return <path key={i} d={`M${f1(x - len / 2)} ${f1(y)} q${f1(len / 2)} ${f1(-2 - d * 4)} ${f1(len)} 0`} fill="none" stroke={c.g('#3A3832')} strokeWidth={f1(lerp(.8, 3.2, d))} strokeLinecap="round" opacity={.18 + .2 * d} />;
    })}
    <Mist k={k} t={t} y={760} x0={260} w={520} h={46} speed={-18} alpha={.55} color={c.paper} />
    <Mountains k={k} id="m1d" seed="m1d" color={c.ink} alpha={.88} outline={4} texture={22} base={() => 1100} peaks={[{x: 30, h: 700, w: 240}, {x: 260, h: 430, w: 180}]} />
    {so > 0 && <g transform={`translate(${f1(sx)} ${f1(sy)}) scale(${ss.toFixed(4)})`} opacity={so}>
      <g transform="scale(1 -0.45)" opacity={.14} filter={`url(#${k}mist)`}><Boat c={c} /></g>
      <Boat c={c} />
    </g>}
  </g>;
}

// ---------- 江雪：孤舟蓑笠翁，独钓寒江雪 ----------
const FISH = {x: 960, y: 700};
function Snow({k, t, c}: Art) {
  const r = seeded('snow');
  return <g>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${k}overcast)`} />
    <Mountains k={k} id="ms1" seed="ms1" snowy color={c.g('#3A3731')} alpha={.62} outline={2.6} texture={10} base={() => 660} peaks={[{x: 120, h: 420, w: 230}, {x: 360, h: 300, w: 200}, {x: 560, h: 190, w: 160}, {x: 1380, h: 230, w: 170}, {x: 1600, h: 360, w: 210}, {x: 1850, h: 470, w: 240}]} />
    <Mountains k={k} id="ms0" seed="ms0" snowy blur color={c.g('#5D5A52')} alpha={.45} base={() => 640} peaks={[{x: 760, h: 150, w: 170}, {x: 1080, h: 110, w: 150}, {x: 1220, h: 170, w: 160}]} />
    <Mist k={k} t={t} y={650} x0={900} w={900} h={40} speed={9} alpha={.8} color={c.paper} />
    {[0, 1, 2, 3].map(i => {
      const q = ((t * .35 + i / 4) % 1 + 1) % 1;
      return <ellipse key={i} cx={FISH.x + 160} cy={FISH.y + 12} rx={f1(30 + q * 260)} ry={f1(5 + q * 34)} fill="none" stroke={c.g('#5B5850')} strokeWidth={2} opacity={.4 * (1 - q)} />;
    })}
    {Array.from({length: 14}, (_, i) => <path key={i} d={`M${f1(300 + r() * 1300)} ${f1(760 + r() * 280)} q30 -3 70 0`} fill="none" stroke={c.g('#5B5850')} strokeWidth={1.6} strokeLinecap="round" opacity={.22} />)}
    <g transform={`translate(${FISH.x} ${f1(FISH.y + Math.sin(t * 1.6) * 3)}) rotate(${f1(Math.sin(t * 1.2) * 1.2)})`}>
      <path d="M-120 0 Q0 26 130 -4 L104 -14 L-100 -12 Z" fill={c.ink} opacity={.9} />
      <path d="M-34 -12 Q-30 -64 -4 -74 Q22 -66 28 -12 Z" fill={c.g('#3A3832')} opacity={.92} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M${-28 + i * 9} -14 L${-22 + i * 8} -56`} stroke={c.paper} strokeWidth={1.4} opacity={.28} />)}
      <path d="M-46 -72 L-4 -100 L40 -72 Q-4 -66 -46 -72 Z" fill={c.ink} />
      <path d="M20 -50 Q120 -150 236 -170" fill="none" stroke={c.ink} strokeWidth={3} strokeLinecap="round" />
      <path d="M236 -170 Q200 -60 160 12" fill="none" stroke={c.ink} strokeWidth={1.2} opacity={.7} />
    </g>
    {Array.from({length: 190}, (_, i) => {
      const x0 = r() * (W + 200) - 100, sp = 40 + r() * 70, ph = r() * 1200, size = 1.4 + Math.pow(r(), 2) * 4.2;
      const y = ((t + 3) * sp + ph) % 1160 - 40, x = x0 + Math.sin((t + ph) * (.6 + size * .1)) * 18 - (t + 3) * 12;
      return <circle key={i} cx={f1(((x % (W + 200)) + W + 200) % (W + 200) - 100)} cy={f1(y)} r={f1(size)} fill="#FDFCF7" opacity={.92} />;
    })}
  </g>;
}

// ---------- 柳岸：两个黄鹂鸣翠柳，一行白鹭上青天 ----------
const WTRUNK = [[90, 1110], [40, 820], [230, 520], [430, 240]];
const WBR = [{u: .98, c: [640, 150], e: [940, 210]}, {u: .7, c: [520, 380], e: [800, 420]}, {u: .85, c: [250, 230], e: [60, 260]}].map(b => ({...b, pts: [bez(WTRUNK, b.u), b.c, b.e]}));
function Willow({k, t, c}: Art) {
  const r = seeded('willow'), trunk = Array.from({length: 36}, (_, i) => bez(WTRUNK, i / 35));
  const strands: {x: number; y: number; len: number; ph: number}[] = [];
  WBR.forEach((b, bi) => {for (let j = 0; j < 11; j++) {const [x, y] = quad(b.pts, .12 + j * .08); strands.push({x, y, len: 180 + r() * 420 - bi * 40, ph: r() * 6});}});
  return <g>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${k}qingsky)`} />
    <Mountains k={k} id="mw0" seed="mw0" blur color={c.g('#5D6660')} alpha={.28} base={() => 900} peaks={[{x: 900, h: 170, w: 220}, {x: 1250, h: 240, w: 240}, {x: 1600, h: 190, w: 220}, {x: 1880, h: 260, w: 220}]} />
    <Mist k={k} t={t} y={880} x0={1100} w={900} h={48} speed={12} alpha={.75} color={c.paper} />
    {Array.from({length: 6}, (_, i) => {
      const q = t * .085 + i * .13, x = 700 + q * 900 + Math.sin(t * 1.3 + i) * 6, y = 880 - q * 700, sc = 1.55 - i * .1, flap = Math.sin(t * 6.5 + i * 1.3);
      return <g key={i} transform={`translate(${f1(x)} ${f1(y)}) rotate(-32) scale(${sc.toFixed(3)})`}>
        <path d="M-26 2 L-70 10 M-26 4 L-68 16" stroke={c.ink} strokeWidth={1.8} strokeLinecap="round" />
        <path d={`M-6 -2 Q-4 ${f1(-40 * flap - 8)} -40 ${f1(-58 * flap - 12)} L-30 ${f1(-44 * flap - 8)} Q-24 ${f1(-20 * flap)} -16 0 Z`} fill="#FBF9F2" stroke={c.ink} strokeWidth={1.8} strokeLinejoin="round" />
        <path d={`M-40 ${f1(-58 * flap - 12)} L-30 ${f1(-44 * flap - 8)}`} stroke={c.ink} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={0} cy={0} rx={28} ry={9} fill="#FBF9F2" stroke={c.ink} strokeWidth={2} />
        <path d="M24 -3 Q34 -14 30 -20 Q40 -26 46 -22" fill="none" stroke={c.ink} strokeWidth={2.2} strokeLinecap="round" />
        <path d="M46 -22 L66 -18" stroke="#B08A3A" strokeWidth={2.6} strokeLinecap="round" />
        <path d={`M-2 2 Q2 ${f1(36 * flap + 14)} -30 ${f1(48 * flap + 22)} Q-12 ${f1(18 * flap + 8)} -12 2 Z`} fill="#F1EEE4" stroke={c.ink} strokeWidth={1.6} strokeLinejoin="round" opacity={.92} />
      </g>;
    })}
    <g filter={`url(#${k}rough)`}>
      <path d={taper(trunk, 74, 20)} fill={c.ink} opacity={.9} />
      {WBR.map((b, i) => <path key={i} d={taper(Array.from({length: 18}, (_, j) => quad(b.pts, j / 17)), 16, 4)} fill={c.ink} opacity={.88} />)}
    </g>
    {strands.map((s, i) => {
      const sway = Math.sin(t * 1.1 + s.ph) * 30 + Math.sin(t * .5 + s.ph * 2) * 14, ex = s.x + sway + 14, ey = s.y + s.len;
      return <g key={i}>
        <path d={`M${f1(s.x)} ${f1(s.y)} Q${f1(s.x + sway * .3)} ${f1(s.y + s.len * .55)} ${f1(ex)} ${f1(ey)}`} fill="none" stroke={c.g('#2B2A25')} strokeWidth={1.5} opacity={.6} />
        {Array.from({length: Math.floor(s.len / 22)}, (_, j) => {
          const u = (j + 1) / (s.len / 22 + 1), px = lerp(s.x, ex, u) + sway * .3 * Math.sin(u * Math.PI), py = lerp(s.y, ey, u), side = j % 2 ? 1 : -1;
          return <path key={j} d={`M${f1(px)} ${f1(py)} l${f1(side * 11)} ${f1(9)}`} stroke={j % 3 ? '#3E5B40' : '#2E3F31'} strokeWidth={3.4} strokeLinecap="round" opacity={.72} />;
        })}
      </g>;
    })}
    {[{b: 0, u: .62, flip: 1}, {b: 1, u: .78, flip: -1}].map((o, i) => {
      const [x, y] = quad(WBR[o.b].pts, o.u), hop = Math.max(0, Math.sin(t * 5 + i * 2)) * 5, sing = Math.sin(t * 11 + i) > .3 ? 1 : 0;
      return <g key={i} transform={`translate(${f1(x)} ${f1(y - 26 - hop)}) scale(${o.flip * 1.6} 1.6)`}>
        <path d="M-20 4 L-44 14 L-40 4 Z" fill={c.ink} />
        <ellipse cx={0} cy={0} rx={24} ry={15} fill="#E2A92E" transform="rotate(-12)" />
        <path d="M-10 -6 Q4 -2 12 8 Q-4 10 -16 4 Z" fill={c.ink} opacity={.85} />
        <circle cx={20} cy={-12} r={11} fill="#E6B238" />
        <path d="M24 -16 L22 -9" stroke={c.ink} strokeWidth={4} strokeLinecap="round" />
        <path d={`M30 -13 L42 ${-14 - sing * 3} L30 -9 Z`} fill="#C9632B" />
        {sing > 0 && <path d="M30 -10 L41 -6" stroke="#C9632B" strokeWidth={2} />}
        <path d="M-2 14 L-4 22 M6 13 L6 21" stroke={c.ink} strokeWidth={2} />
      </g>;
    })}
  </g>;
}

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
function Moon({k, t, c}: Art) {
  const band = Array.from({length: 30}, (_, i) => bez(STREAM, i / 29));
  return <g>
    <circle cx={MOON.x} cy={MOON.y} r={460} fill={`url(#${k}moonhalo)`} />
    <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#F8F3E7" />
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

// ---------- 山峦：远山、云海、近崖与归鸟 ----------
function Hills({k, t, c}: Art) {
  return <g>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${k}skywash)`} />
    <circle cx={1500} cy={250} r={64} fill={c.red} opacity={.75} filter={`url(#${k}gsoft)`} />
    <Mountains k={k} id="mh0" seed="mh0" blur color={c.g('#6A665C')} alpha={.24} base={() => 640} peaks={[{x: 420, h: 330, w: 230}, {x: 760, h: 420, w: 240}, {x: 1120, h: 300, w: 220}, {x: 1460, h: 380, w: 240}, {x: 1800, h: 280, w: 220}]} />
    <Mist k={k} t={t} y={610} x0={900} w={900} h={56} speed={11} alpha={.85} color={c.paper} />
    <Mountains k={k} id="mh1" seed="mh1" color={c.g('#3A372F')} alpha={.52} outline={2.4} texture={12} base={() => 820} peaks={[{x: 260, h: 380, w: 230}, {x: 620, h: 260, w: 200}, {x: 1300, h: 300, w: 220}, {x: 1640, h: 420, w: 240}]} />
    <Mist k={k} t={t} y={800} x0={600} w={760} h={50} speed={-14} alpha={.7} color={c.paper} />
    <Mountains k={k} id="mh2" seed="mh2" color={c.ink} alpha={.86} outline={4} texture={20} base={() => 1110} peaks={[{x: 60, h: 560, w: 250}, {x: 330, h: 330, w: 190}, {x: 1780, h: 470, w: 230}, {x: 1980, h: 620, w: 240}]} />
    {[0, 1, 2, 3].map(i => {
      const x = 1180 - t * 46 - i * 70, y = 380 + [0, 30, -20, 46][i] + Math.sin(t * 2 + i) * 6, s = [20, 15, 17, 13][i], flap = Math.sin(t * 9 + i * 1.7) * .6;
      return <path key={i} d={`M${f1(x - s)} ${f1(y - s * flap)} Q${f1(x - s * .4)} ${f1(y - s * .2)} ${f1(x)} ${f1(y + 3)} Q${f1(x + s * .4)} ${f1(y - s * .2)} ${f1(x + s)} ${f1(y - s * flap)}`} fill="none" stroke={c.ink} strokeWidth={3.4} strokeLinecap="round" />;
    })}
  </g>;
}

const KINDS = ['river', 'snow', 'willow', 'moon', 'hills'];
const FOCUS: Record<string, {x: number; y: number}> = {river: VP, snow: FISH, willow: {x: 960, y: 520}, moon: MOON, hills: {x: 1000, y: 560}};
const TARGETS: Record<string, number[][]> = {
  river: [[VP.x, VP.y], [380, 640], [1700, 700], [1050, 900], [700, 520]], snow: [[FISH.x, FISH.y], [300, 420], [1650, 430], [960, 640], [600, 560]],
  willow: [[300, 400], [700, 300], [1200, 500], [500, 700], [1400, 300]], moon: [[MOON.x, MOON.y], [470, 600], [1000, 980], [1600, 760], [780, 420]],
  hills: [[760, 420], [1460, 380], [300, 700], [1300, 640], [1800, 800]],
};
const BLOBS = [[1150, 560], [1240, 300], [1060, 760], [620, 620], [1520, 700], [320, 860], [1700, 320], [880, 250], [200, 300], [1800, 980]];

function Seal({cx, cy, size, label, color, paper, k}: {cx: number; cy: number; size: number; label: string[]; color: string; paper: string; k: string}) {
  const r = seeded(`seal-${label.join('')}`), n = label.length, grid = n > 2;
  const fs = grid ? 34 : n === 2 ? 38 : 60;
  const pos = (i: number) => grid ? [i < 2 ? 21 : -21, -6 + (i % 2) * 40] : [0, n === 2 ? -8 + i * 42 : 20];
  return <g transform={`translate(${f1(cx)} ${f1(cy)}) scale(${(size / 100).toFixed(4)}) rotate(-2)`}>
    <g filter={`url(#${k}sealRough)`}>
      <rect x={-50} y={-50} width={100} height={100} rx={6} fill={color} />
      <rect x={-43} y={-43} width={86} height={86} rx={3} fill="none" stroke={paper} strokeWidth={2.4} />
      {label.map((ch, i) => <text key={i} x={pos(i)[0]} y={pos(i)[1]} textAnchor="middle" fontFamily={SEAL_FONT} fontWeight={700} fontSize={fs} fill={paper}>{ch}</text>)}
    </g>
    {Array.from({length: 18}, (_, i) => <circle key={i} cx={f1(r() * 96 - 48)} cy={f1(r() * 96 - 48)} r={f1(.6 + r() * 2.2)} fill={color} opacity={.55} />)}
    {Array.from({length: 10}, (_, i) => <circle key={`p${i}`} cx={f1(r() * 90 - 45)} cy={f1(r() * 90 - 45)} r={f1(.5 + r() * 1.6)} fill={paper} opacity={.7} />)}
  </g>;
}

/** 诗句按标点分行；每行最多 8 字、最多 4 行。 */
function poemLines(text: string) {
  return text.split(/[，,。.、；;！!？?\s]+/u).map(line => Array.from(line).filter(ch => HAN.test(ch) || /\p{L}/u.test(ch)).slice(0, 8)).filter(line => line.length).slice(0, 4);
}
/** 每个字的落纸时间：从含前两个字的那句起往后逐字找，有逐字时间用实测开口，否则在所在句里按字数插值；
 * 找不到的字在诗句所在的时间段里均分；旁白里没有诗字时在幕长里匀开（每字 0.12～0.3 秒）。诗句之前的第一句当介绍。 */
function charTimes(props: SceneInput, lines: string[][], seconds: number) {
  const flat = lines.flat(), sents = props.sentences, texts = sents.map(x => Array.from(x.text.replace(/\s/gu, '')));
  const found = texts.findIndex(x => x.join('').includes(flat.slice(0, 2).join('')));
  const k = found >= 0 ? found : sents.length - 1, out: (number | null)[] = flat.map(() => null);
  let si = k, from = 0, last = k;
  if (k >= 0) flat.forEach((ch, i) => {
    for (let j = si; j < sents.length; j++) {
      const at = texts[j].indexOf(ch, j === si ? from : 0);
      if (at < 0) continue;
      const w = sents[j].words?.find(item => item.index + Array.from(item.text).length > at);
      out[i] = w ? w.start : sents[j].start + (sents[j].end - sents[j].start) * at / Math.max(1, texts[j].length);
      si = j; from = at + 1; last = Math.max(last, j);
      return;
    }
  });
  // 旁白里一个诗字都没有（没开旁白或旁白不念诗）：在幕长里匀开，给化画留 3 秒。
  const anyFound = out.some(v => v !== null), a0 = sents[0]?.start ?? .6;
  const a = anyFound ? sents[k].start : a0, b = anyFound ? sents[last].end : Math.max(a0 + .12 * flat.length, Math.min(a0 + .3 * flat.length, seconds - 3));
  const filled = out.map((v, i) => v ?? a + (b - a) * i / Math.max(1, flat.length));
  for (let i = 1; i < filled.length; i++) filled[i] = Math.max(filled[i], filled[i - 1] + .05);
  const poemEnd = Math.max(b, filled[filled.length - 1] + .3);
  const intro = anyFound && k > 0 ? sents[0] : undefined;
  let n = 0;
  return {chars: lines.map(line => line.map(() => filled[n++])), poemEnd, introStart: intro?.start ?? Math.max(0, filled[0] - 1.2)};
}

export default function InkPoemPainting(props: SceneInput) {
  const s = useScene(props), c = palette(props), k = `ipp${props.seed}`, t = s.t;
  const lines = poemLines(word(props.params.poem, meta.params.poem.default, 40));
  const safe = lines.length ? lines : poemLines(meta.params.poem.default);
  const title = word(props.params.title, meta.params.title.default, 12), author = word(props.params.author, meta.params.author.default, 6);
  const kind = typeof props.params.painting === 'string' && KINDS.includes(props.params.painting) ? props.params.painting : 'river';
  const signature = Array.from(word(props.params.signature, meta.params.signature.default, 4));
  const {chars, poemEnd, introStart} = charTimes(props, safe, s.seconds);
  const X = Math.max(poemEnd + .3, s.seconds - 3.35);
  const n = safe.length, colX = (li: number) => 1150 + ((n - 1) / 2 - li) * 180;
  const step = (len: number) => Math.min(132, 900 / len), charY = (len: number, i: number) => 540 - (len - 1) * step(len) / 2 + i * step(len);
  const d = seg(t, X - .03, .62), r = seeded(`${k}-drift`), fr = seeded(`flight-${kind}`);
  // 题签与诗人大字在介绍开口约 1 秒后浮现：接在交叉淡化后面时，上一幅画先褪去，不与上一首的题画诗叠在一起。
  const paperAt = introStart + 1;
  const titleO = outCubic(seg(t, paperAt + .1, .45)) * (1 - seg(t, X - .15, .3));
  const ghost = seg(t, paperAt, .8) * (1 - seg(t, chars[0][0] + .4, .8));
  const colO = 1 - seg(t, X, .3), insO = outCubic(seg(t, X + .45, .5));
  const f = FOCUS[kind], cam = (1 + .05 * seg(t, X, 3.75)) * (1 + .12 * (1 - outExpo(seg(t, X, 1.1))));
  const art: Art = {k, t: t - X, c};
  const sk = signature.length, sStep = Math.min(174, 360 / Math.max(1, sk)), sFs = sStep * .94;
  const shockK = outCubic(seg(t, X, .55)), flight = t >= X - .05 && t <= X + 1.3;
  // 深色纸（夜墨）上墨斑与纤维按 35% 画，免得纸面发脏。
  const grain = lum(rgb(/^#[0-9a-f]{6}$/i.test(c.paper) ? c.paper : '#EEE6D3')) > 128 ? 1 : .35;
  const shades = {sky: c.g('#B9B09E'), river0: c.g('#8E8C83'), river1: c.g('#6F716C'), rock: c.g('#4A4740'), halo: c.g('#5F5B52'), over0: c.g('#7F7C74'), over1: c.g('#8C8980')};
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: c.paper}}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
      <defs>
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
        <filter id={`${k}gbleed`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={14} /></filter>
        <filter id={`${k}gsoft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={9} /></filter>
        <filter id={`${k}mist`} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={30} /></filter>
        <filter id={`${k}farblur`} x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves={2} seed={4} /><feDisplacementMap in="SourceGraphic" scale={10} result="d" /><feGaussianBlur in="d" stdDeviation={2.2} /></filter>
        <filter id={`${k}rough`} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves={3} seed={2} /><feDisplacementMap in="SourceGraphic" scale={9} /></filter>
        <filter id={`${k}sealRough`} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves={2} seed={6} /><feDisplacementMap in="SourceGraphic" scale={4} /></filter>
        <filter id={`${k}blobRough`} x={-400} y={-400} width={W + 800} height={H + 800} filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves={4} seed={8} /><feDisplacementMap in="SourceGraphic" scale={170} /></filter>
        <filter id={`${k}disp`} x={-200} y={-200} width={W + 400} height={H + 400} filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves={3} seed={11} /><feDisplacementMap in="SourceGraphic" scale={f1(outCubic(d) * 190)} /><feGaussianBlur stdDeviation={f1(d * 9)} />
        </filter>
        <radialGradient id={`${k}vignette`} cx=".5" cy=".5" r=".75"><stop offset=".55" stopColor="#7A6A50" stopOpacity={0} /><stop offset="1" stopColor="#5E4F38" stopOpacity={.32} /></radialGradient>
        <linearGradient id={`${k}skywash`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={shades.sky} stopOpacity={.16} /><stop offset="1" stopColor={shades.sky} stopOpacity={0} /></linearGradient>
        <linearGradient id={`${k}river`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={shades.river0} stopOpacity={0} /><stop offset="1" stopColor={shades.river1} stopOpacity={.2} /></linearGradient>
        <linearGradient id={`${k}rockwash`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={shades.rock} stopOpacity={.55} /><stop offset=".6" stopColor={shades.rock} stopOpacity={.2} /><stop offset="1" stopColor={shades.rock} stopOpacity={.05} /></linearGradient>
        <radialGradient id={`${k}moonhalo`}><stop offset=".22" stopColor={shades.halo} stopOpacity={.42} /><stop offset=".45" stopColor={shades.halo} stopOpacity={.16} /><stop offset="1" stopColor={shades.halo} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${k}overcast`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={shades.over0} stopOpacity={.42} /><stop offset=".6" stopColor={shades.over1} stopOpacity={.2} /><stop offset="1" stopColor={shades.over1} stopOpacity={.1} /></linearGradient>
        <linearGradient id={`${k}qingsky`} x1="1" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7FA39C" stopOpacity={.34} /><stop offset=".55" stopColor="#9DB8AE" stopOpacity={.12} /><stop offset="1" stopColor="#9DB8AE" stopOpacity={0} /></linearGradient>
        {t >= X - .03 && <mask id={`${k}rev`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <g filter={`url(#${k}blobRough)`}>{BLOBS.map(([x, y], j) => {const q = outExpo(seg(t, X - .02 + j * .035, 1)); return q > 0 ? <circle key={j} cx={x} cy={y} r={f1(1500 * q)} fill="#fff" /> : null;})}</g>
        </mask>}
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={c.paper} />
      <rect x={0} y={0} width={W} height={H} filter={`url(#${k}paper)`} />
      <rect x={0} y={0} width={W} height={H} fill={`url(#${k}vignette)`} />
      <g opacity={s.fadeOut(9)}>
        {sk > 0 && colO > 0 && <g opacity={colO}>
          {signature.map((ch, i) => <g key={i} transform={`translate(${f1(181 - 500 * sFs / 900)} ${f1(263 - (174 - sStep) * .5 + i * sStep - 850 * sFs / 900)}) scale(${(sFs / 900).toFixed(4)})`}>
            <text x={500} y={850} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={900} fill={c.ink} filter={`url(#${k}dry)`}>{ch}</text>
          </g>)}
          <Seal cx={182} cy={f1(263 - (174 - sStep) * .5 + (sk - 1) * sStep + 75)} size={52} label={signature} color={c.red} paper={c.paper} k={k} />
        </g>}
        {ghost > 0 && <text x={f1(700 - (t - paperAt) * 8)} y={720} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={430} letterSpacing="0.05em" fill={c.ink} opacity={.075 * ghost} filter={`url(#${k}gsoft)`}>{author}</text>}
        {titleO > 0 && <g opacity={titleO}>
          {Array.from(title).map((ch, i) => <text key={i} x={1800} y={150 + i * 50} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={42} fill={c.ink} filter={`url(#${k}dry)`}>{ch}</text>)}
          <rect x={1782} y={74} width={36} height={4} fill={c.red} opacity={.8} />
          {Array.from(author).map((ch, i) => <text key={`a${i}`} x={1738} y={150 + i * 42} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={c.muted}>{ch}</text>)}
        </g>}
        {t >= chars[0][0] - .1 && d < 1 && <g filter={d > 0 ? `url(#${k}disp)` : undefined} opacity={1 - Math.pow(d, .9)}>
          {safe.map((line, li) => line.map((ch, i) => {
            const q = outCubic(seg(t, chars[li][i] - .06, .24)), dx = (r() - .5) * 600 * d, dy = (r() - .6) * 400 * d;
            if (q <= 0) return null;
            const sc = (1.28 - .28 * q) * (1 + .5 * d), fs = step(line.length) * .894;
            return <g key={`${li}-${i}`} transform={`translate(${f1(colX(li) + dx)} ${f1(charY(line.length, i) + dy)}) scale(${sc.toFixed(3)})`}>
              <text y={f1(fs * .356)} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={f1(fs)} fill={c.ink} opacity={(1 - q) * .55} filter={`url(#${k}gbleed)`}>{ch}</text>
              <text y={f1(fs * .356)} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={f1(fs)} fill={c.ink} opacity={q} filter={`url(#${k}dry)`}>{ch}</text>
            </g>;
          }))}
        </g>}
        {t >= X - .03 && <g>
          <g mask={t < X + 1.4 ? `url(#${k}rev)` : undefined}>
            <g transform={`translate(${f.x} ${f.y}) scale(${cam.toFixed(4)}) translate(${-f.x} ${-f.y})`}>
              {kind === 'river' ? <River {...art} /> : kind === 'snow' ? <Snow {...art} /> : kind === 'willow' ? <Willow {...art} /> : kind === 'moon' ? <Moon {...art} /> : <Hills {...art} />}
            </g>
          </g>
          {insO > 0 && <g opacity={insO}>
            {safe.map((line, li) => line.map((ch, i) => <text key={`${li}-${i}`} x={1800 - li * 62} y={118 + i * 54} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={46} fill={c.ink} filter={`url(#${k}dry)`}>{ch}</text>))}
            <text x={1800 - n * 62 + 2} y={118 + (safe[n - 1].length - 1) * 54} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={c.muted}>{author}</text>
          </g>}
        </g>}
        {t >= X && shockK < 1 && <g filter={`url(#${k}rough)`} opacity={(1 - shockK) * .45}>
          <circle cx={1150} cy={540} r={f1(220 + 1000 * shockK)} fill="none" stroke={c.ink} strokeWidth={f1(34 * (1 - shockK))} />
          <circle cx={1150} cy={540} r={f1(40 + 700 * outCubic(seg(t, X + .05, .5)))} fill="none" stroke={c.ink} strokeWidth={f1(10 * (1 - shockK))} />
        </g>}
        {flight && <g opacity={1 - seg(t, X + .7, .5)}>{Array.from({length: 96}, (_, j) => {
          const li = j % n, line = safe[li], i = Math.floor(fr() * line.length);
          const ox = colX(li) + (fr() - .5) * 90, oy = charY(line.length, i) + (fr() - .5) * 90, tg = TARGETS[kind][j % 5];
          const tx = tg[0] + (fr() - .5) * 260, ty = tg[1] + (fr() - .5) * 160, q = outCubic(seg(t, X - .04 + fr() * .08, .55 + fr() * .3));
          const arc = Math.sin(q * Math.PI) * (fr() - .5) * 340, size = (3 + Math.pow(fr(), 2) * 16) * (1 - q * .55);
          return <circle key={j} cx={f1(lerp(ox, tx, q) + arc * .6)} cy={f1(lerp(oy, ty, q) - Math.abs(arc) * .4)} r={f1(size)} fill={c.ink} opacity={.85 * (1 - q * .5)} />;
        })}</g>}
      </g>
    </svg>
  </div>;
}
