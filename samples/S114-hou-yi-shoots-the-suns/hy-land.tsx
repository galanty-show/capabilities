import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// Houyi shoots the suns: shared picture-book library. prepare.py joins it with each module into scenes/<module>.tsx,
// inlining only the Ma Shan Zheng (OFL) glyph outlines a module draws. No runtime fonts, randomness or clocks.
const GLYPHS: Record<string, string> = {};
const W = 1920, H = 1080;
const RED = '#e8402c', GOLD = '#ffc93c', AMBER = '#ff9f1c', INK = '#2a1a10', PAPER = '#fff4e0', JADE = '#3fa58a', SKY = '#8fd3e8';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** Overshoot ease for pops (0 -> ~1.1 -> 1). */
const outBack = (v: number) => {const p = clamp(v), c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** Window: fade in from a, fade out from b (seconds). */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// Bundled sample: no asset ids, so prepare.py --sample inlines the plates this module uses here; empty in production jobs.
const MEDIA: Record<string, string> = {"drought":"release-assets/9053df2015332e3366964dca7563b649bf8525f348279fc20ee8acaf21736628.webp","green":"release-assets/f99135ef4ed93236efbb4d3c78d806bf8b40402a369afdf60c4ab1f6ec6cc9c7.webp"};
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

// On-screen words are content params declared in each module's meta.params (defaults are the Chinese original).
const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
const isLatin = (text: string) => !/[㐀-鿿]/.test(text);
const latinWidth = (text: string, size: number, spacing = 0) => Array.from(text).reduce((w, ch) => w + spacing + size *
  (ch === ' ' ? .25 : /[MW]/.test(ch) ? .95 : /[A-Z]/.test(ch) ? .74 : /[il.,'’:;!|·]/.test(ch) ? .3 : /[mw]/.test(ch) ? .86 : /[0-9]/.test(ch) ? .62 : .58), 0);
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
}
const mode = (props: SceneInput, fallback: string) => typeof props.params.mode === 'string' ? props.params.mode as string : fallback;

/** Sentence timing with fallbacks, so edited narration never drops a beat. */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

/** Full-frame plate with a camera move; children share the plate's frame (overlay in plate pixels, 1920x1080).
 * The move is laid out as left/top/width/height instead of a CSS transform: a transformed image layer was re-rastered at
 * slightly different quality run to run (CODE_NONDETERMINISTIC), a plainly painted, resized box is not.
 * origin is "x% y%"; shift adds a pixel offset (camera tremble). */
function Plate({asset, frame, p, from = [1.03, 0, 0], to = [1.1, -20, -10], opacity = 1, origin = '50% 50%', shift = [0, 0], children}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string; shift?: number[]; children?: any}) {
  const k = easeInOut(p);
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k) + shift[0], y = mix(from[2], to[2], k) + shift[1];
  if (opacity <= 0) return null;
  const [px, py] = origin.split(' ').map(v => parseFloat(v) / 100), ox = px * W, oy = py * H;
  const box = {left: ox * (1 - s) + x, top: oy * (1 - s) + y, width: W * s, height: H * s};
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #ffd9a0, #f4b36b 60%, #d9a066)'}} />}
      {children}
    </div>
  </div>;
}
/** SVG canvas in scene coordinates. */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** Brush lettering: each glyph wipes in stroke-wise; p is the whole line's progress 0->1. Latin text falls back to a serif line. */
function Brush({text, x, y, size, fill = PAPER, p = 1, vertical = false, id, gap = .96, shadow = true, align = 'start', maxWidth = 0, stroke = ''}:
  {text: string; x: number; y: number; size: number; fill?: string; p?: number; vertical?: boolean; id: string; gap?: number; shadow?: boolean;
    align?: 'start' | 'middle' | 'end'; maxWidth?: number; stroke?: string}) {
  if (!text || p <= 0) return null;
  const filter = shadow ? {filter: 'drop-shadow(0 5px 12px rgba(60,20,0,.45))'} : undefined;
  if (isLatin(text)) {
    const scale = .62, natural = latinWidth(text, size * scale, size * .01), k = maxWidth && natural > maxWidth ? maxWidth / natural : 1;
    const font = size * scale * k, width = natural * k, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
    const baseline = y + size * .5 + font * .36;
    return <g style={filter}>
      <defs><clipPath id={`${id}-l`}><rect x={left - font * .3} y={baseline - font * 1.1} width={(width + font * .6) * clamp(p)} height={font * 1.5} /></clipPath></defs>
      <text x={left} y={baseline} fontFamily={SERIF} fontWeight={700} fontSize={font} fill={fill} stroke={stroke || undefined} strokeWidth={stroke ? font * .06 : undefined}
        paintOrder="stroke" clipPath={`url(#${id}-l)`}>{text}</text>
    </g>;
  }
  const chars = Array.from(text);
  const total = (vertical ? chars.length * 1.06 : (chars.length - 1) * gap + 1) * size;
  const ox0 = !vertical && align === 'middle' ? x - total / 2 : !vertical && align === 'end' ? x - total : x;
  return <g style={filter}>{chars.map((ch, i) => {
    const q = clamp(p * chars.length - i);
    if (q <= 0 || !GLYPHS[ch]) return null;
    const ox = ox0 + (vertical ? 0 : i * size * gap), oy = y + (vertical ? i * size * 1.06 : 0);
    return <g key={i} transform={`translate(${ox} ${oy}) scale(${size / 1000})`}>
      <defs><mask id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="-150" y="-150" width="1300" height="1300">
        <path d="M-80 80 L1040 80 L-80 320 L1040 320 L-80 550 L1040 550 L-80 790 L1040 790 L-80 1030 L1040 1030"
          fill="none" stroke="white" strokeWidth="255" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - q)} />
      </mask></defs>
      {stroke && <path d={GLYPHS[ch]} fill="none" stroke={stroke} strokeWidth={60} strokeLinejoin="round" mask={`url(#${id}-${i})`} />}
      <path d={GLYPHS[ch]} fill={fill} mask={`url(#${id}-${i})`} />
    </g>;
  })}</g>;
}
/** Vermilion seal that stamps down from large to small. */
function Seal({x, y, text, size = 110, p, id, color = RED}: {x: number; y: number; text: string; size?: number; p: number; id: string; color?: string}) {
  if (p <= 0 || !text) return null;
  const k = out3(p), sc = 1 + 1.4 * (1 - k), chars = Array.from(text);
  if (isLatin(text)) {
    const label = text.toUpperCase(), font = Math.min(size * .34, size * .82 / Math.max(.01, latinWidth(label, 1, .02)));
    return <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${-5 + 5 * k})`} opacity={clamp(p * 3)}>
      <rect x={-size / 2} y={-size * .32} width={size} height={size * .64} rx={size * .1} fill={color} style={{filter: 'url(#rough)'}} />
      <text x={0} y={font * .36} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={font} fill={PAPER}>{label}</text>
    </g>;
  }
  const cols = chars.length > 2 ? 2 : 1, rows = Math.ceil(chars.length / cols), cell = size / Math.max(cols, rows);
  return <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${-5 + 5 * k})`} opacity={clamp(p * 3)}>
    <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * .12} fill={color} style={{filter: 'url(#rough)'}} />
    <rect x={-size / 2 + 6} y={-size / 2 + 6} width={size - 12} height={size - 12} rx={size * .09} fill="none" stroke={PAPER} strokeWidth={3} opacity={.75} />
    {chars.map((ch, i) => {
      const col = cols - 1 - Math.floor(i / rows), row = i % rows;
      return <Brush key={i} text={ch} id={`${id}-${i}`} size={cell * .78} fill={PAPER} shadow={false}
        x={-size / 2 + col * cell + cell * .11} y={-size / 2 + row * cell + cell * .1} />;
    })}
  </g>;
}
/** Shared SVG defs: rough seal edge and the sun glow gradients. */
const Defs = () => <defs>
  <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" />
    <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" /></filter>
  <radialGradient id="sunGlow"><stop offset="0" stopColor="#fff6c8" stopOpacity=".95" /><stop offset=".35" stopColor="#ffd45c" stopOpacity=".55" />
    <stop offset=".7" stopColor="#ff9f1c" stopOpacity=".16" /><stop offset="1" stopColor="#ff8a00" stopOpacity="0" /></radialGradient>
  <radialGradient id="sunBody" cx=".42" cy=".38" r=".7"><stop offset="0" stopColor="#fffbe0" /><stop offset=".45" stopColor="#ffd84a" />
    <stop offset="1" stopColor="#ffa21f" /></radialGradient>
  <radialGradient id="flash"><stop offset="0" stopColor="#ffffff" stopOpacity="1" /><stop offset=".3" stopColor="#fff2b0" stopOpacity=".9" />
    <stop offset="1" stopColor="#ffc93c" stopOpacity="0" /></radialGradient>
  <linearGradient id="feather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset=".5" stopColor="#ffcf3a" />
    <stop offset="1" stopColor="#f08a12" /></linearGradient>
</defs>;

/** The Golden Crow (jinwu): a round, friendly sun-bird with three little legs, flapping wings and rays.
 * mood: happy / sleepy / worried / joy (eyes closed in a smile). */
function SunBird({x, y, r = 56, t, phase = 0, mood = 'happy', glow = 1, rays = 1, flap = 1, opacity = 1, tilt = 0, squash = 0}:
  {x: number; y: number; r?: number; t: number; phase?: number; mood?: string; glow?: number; rays?: number; flap?: number; opacity?: number; tilt?: number; squash?: number}) {
  if (opacity <= 0 || r <= 0) return null;
  const wing = Math.sin(t * 11 + phase * 7) * 22 * flap;
  const blinkT = (t + phase * 2.3) % 3.1, blink = mood === 'sleepy' || mood === 'joy' ? 0 : blinkT < .12 ? .15 : 1;
  const spin = t * 18 + phase * 40, pulse = 1 + .05 * Math.sin(t * 3 + phase * 5);
  const eyeY = -r * .12, eyeX = r * .3, brow = mood === 'worried' ? 1 : 0;
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${1 + squash * .12} ${1 - squash * .12})`} opacity={opacity}>
    {glow > 0 && <circle r={r * 2.6 * pulse} fill="url(#sunGlow)" opacity={glow} />}
    {rays > 0 && <g transform={`rotate(${spin}) scale(${rays})`}>{Array.from({length: 12}, (_, i) =>
      <path key={i} transform={`rotate(${i * 30})`} d={`M ${-r * .22} ${-r * 1.02} Q 0 ${-r * (1.62 + (i % 2) * .22)} ${r * .22} ${-r * 1.02} Z`}
        fill={i % 2 ? '#ffd45c' : AMBER} stroke="#c8641a" strokeWidth={r * .03} strokeLinejoin="round" />)}</g>}
    {[-1, 0, 1].map(k => <path key={k} d={`M ${k * r * .22} ${r * .86} l ${k * r * .06} ${r * .3} m ${-r * .09} 0 l ${r * .18} 0`}
      stroke="#d9661a" strokeWidth={r * .07} strokeLinecap="round" fill="none" />)}
    <g transform={`translate(${-r * .86} ${r * .05}) rotate(${-20 - wing})`}><path d={`M 0 0 C ${-r * .55} ${-r * .35} ${-r * .75} ${r * .25} ${-r * .2} ${r * .38} Z`}
      fill="#ffbe2e" stroke="#c8641a" strokeWidth={r * .04} strokeLinejoin="round" /></g>
    <g transform={`translate(${r * .86} ${r * .05}) rotate(${20 + wing})`}><path d={`M 0 0 C ${r * .55} ${-r * .35} ${r * .75} ${r * .25} ${r * .2} ${r * .38} Z`}
      fill="#ffbe2e" stroke="#c8641a" strokeWidth={r * .04} strokeLinejoin="round" /></g>
    {[-1, 0, 1].map(k => <path key={`c${k}`} d={`M ${k * r * .14} ${-r * .9} q ${k * r * .12 - r * .08} ${-r * .38} ${k * r * .2} ${-r * .42}`}
      stroke="#f08a12" strokeWidth={r * .09} strokeLinecap="round" fill="none" />)}
    <circle r={r} fill="url(#sunBody)" stroke="#c8641a" strokeWidth={r * .05} />
    <ellipse cx={-r * .52} cy={r * .2} rx={r * .16} ry={r * .1} fill="#ff7a6a" opacity={.55} />
    <ellipse cx={r * .52} cy={r * .2} rx={r * .16} ry={r * .1} fill="#ff7a6a" opacity={.55} />
    {mood === 'joy' || mood === 'sleepy'
      ? [-1, 1].map(k => <path key={`e${k}`} d={mood === 'joy' ? `M ${k * eyeX - r * .12} ${eyeY + r * .02} Q ${k * eyeX} ${eyeY - r * .16} ${k * eyeX + r * .12} ${eyeY + r * .02}`
        : `M ${k * eyeX - r * .12} ${eyeY} Q ${k * eyeX} ${eyeY + r * .1} ${k * eyeX + r * .12} ${eyeY}`} stroke={INK} strokeWidth={r * .06} strokeLinecap="round" fill="none" />)
      : [-1, 1].map(k => <g key={`e${k}`} transform={`translate(${k * eyeX} ${eyeY}) scale(1 ${blink})`}>
        <ellipse rx={r * .12} ry={r * .16} fill={INK} /><circle cx={r * .04} cy={-r * .06} r={r * .045} fill="#fff" /></g>)}
    {brow > 0 && [-1, 1].map(k => <path key={`b${k}`} d={`M ${k * (eyeX + r * .15)} ${eyeY - r * .22} L ${k * (eyeX - r * .13)} ${eyeY - r * .34}`}
      stroke={INK} strokeWidth={r * .05} strokeLinecap="round" />)}
    <path d={`M ${-r * .13} ${r * .08} L ${r * .13} ${r * .08} L 0 ${r * .3} Z`} fill="#ff7b1c" stroke="#c8641a" strokeWidth={r * .03} strokeLinejoin="round" />
    {mood === 'worried' && <ellipse cx={0} cy={r * .44} rx={r * .07} ry={r * .09} fill={INK} opacity={.8} />}
  </g>;
}

/** A golden feather (quill + vane), pointing down. */
const Feather = ({x, y, s = 1, rot = 0, opacity = 1}: {x: number; y: number; s?: number; rot?: number; opacity?: number}) => opacity <= 0 ? null :
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <path d="M 0 -26 C 13 -16 12 10 0 26 C -12 10 -13 -16 0 -26 Z" fill="url(#feather)" stroke="#c8641a" strokeWidth={1.4} />
    <path d="M 0 -30 L 0 28" stroke="#b5560f" strokeWidth={1.6} strokeLinecap="round" />
    {[-14, -5, 4, 13].map(v => <path key={v} d={`M 0 ${v} l 8 6 M 0 ${v} l -8 6`} stroke="#e08a1a" strokeWidth={1} opacity={.8} />)}
  </g>;

/** Burst of golden feathers from a hit at time `at`, drifting down with a sway to `floor` (sea or ground). */
function FeatherBurst({t, at, x, y, floor = 960, seed = 1, n = 16, fall = 3.6, scale = 1}: {t: number; at: number; x: number; y: number; floor?: number; seed?: number; n?: number; fall?: number; scale?: number}) {
  const d = t - at;
  if (d < 0 || d > fall + 1.2) return null;
  const r = seeded(seed * 97 + 13), items = Array.from({length: n}, () => ({a: r() * Math.PI * 2, v: 120 + r() * 260, sw: 20 + r() * 50, ph: r() * 6, s: .7 + r() * .7, k: .75 + r() * .5}));
  return <g>{items.map((f, i) => {
    const burst = out3(d / .35), dx = Math.cos(f.a) * f.v * burst, dy0 = Math.sin(f.a) * f.v * .6 * burst;
    const T = fall * f.k, q = clamp((d - .2) / T), drop = sm(q) * (floor - y - dy0);
    const sway = Math.sin(d * 2.4 + f.ph) * f.sw * clamp(d / .6);
    const fx = x + dx + sway, fy = y + dy0 + drop, landed = q >= 1;
    const op = landed ? clamp(1 - (d - .2 - T) / .5) : clamp(d / .08);
    return <Feather key={i} x={fx} y={fy} s={f.s * scale} rot={Math.sin(d * 2.4 + f.ph) * 35 + f.a * 20} opacity={op} />;
  })}</g>;
}
/** Ripples where feathers touch the sea. */
function Ripples({t, at, x, floor, seed = 1, fall = 3.6, n = 6}: {t: number; at: number; x: number; floor: number; seed?: number; fall?: number; n?: number}) {
  const r = seeded(seed * 31 + 7);
  return <g>{Array.from({length: n}, (_, i) => {
    const lt = at + .2 + fall * (.75 + r() * .5), rx = x + (r() - .5) * 360, d = t - lt;
    if (d < 0 || d > 1.4) return null;
    const k = out3(d / 1.4);
    return <ellipse key={i} cx={rx} cy={floor + 8} rx={10 + 70 * k} ry={3 + 14 * k} fill="none" stroke="#fffbe6" strokeWidth={3 * (1 - k)} opacity={(1 - k) * .9} />;
  })}</g>;
}

/** Arrow on a quadratic arc from (x0,y0) to (x1,y1), launched at `from` and landing at `hit`. Trail glows white-gold. */
function Arrow({t, from, hit, x0, y0, x1, y1, lift = 140}: {t: number; from: number; hit: number; x0: number; y0: number; x1: number; y1: number; lift?: number}) {
  const d = (t - from) / Math.max(.05, hit - from);
  if (d < 0 || d > 1.25) return null;
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift;
  const pt = (u: number) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1];
  const u = clamp(d), [ax, ay] = pt(u), [bx, by] = pt(Math.max(0, u - .02));
  const ang = Math.atan2(ay - by, ax - bx) * 180 / Math.PI;
  const tail = Math.max(0, u - .45), steps = 14, trail = Array.from({length: steps + 1}, (_, i) => pt(tail + (u - tail) * i / steps));
  const fade = d > 1 ? 1 - (d - 1) / .25 : 1;
  return <g opacity={fade}>
    <polyline points={trail.map(p => p.join(',')).join(' ')} fill="none" stroke="#fffbe0" strokeWidth={10} strokeLinecap="round" opacity={.35} />
    <polyline points={trail.map(p => p.join(',')).join(' ')} fill="none" stroke="#ffe27a" strokeWidth={4} strokeLinecap="round" opacity={.9} />
    {d <= 1 && <g transform={`translate(${ax} ${ay}) rotate(${ang})`}>
      <line x1={-86} y1={0} x2={0} y2={0} stroke="#8a5a2b" strokeWidth={5} strokeLinecap="round" />
      <path d="M 0 -9 L 24 0 L 0 9 Z" fill="#e9eef2" stroke="#5a6470" strokeWidth={2} />
      <path d="M -86 0 l -16 -12 l 22 0 Z M -86 0 l -16 12 l 22 0 Z" fill="#ffffff" stroke="#9aa5ae" strokeWidth={1.5} />
    </g>}
  </g>;
}
/** Hit flash: white-gold burst, ring and sparkle rays. */
function HitFlash({t, at, x, y, r = 70}: {t: number; at: number; x: number; y: number; r?: number}) {
  const d = t - at;
  if (d < 0 || d > .9) return null;
  const k = out3(d / .9), a = 1 - k;
  return <g>
    <circle cx={x} cy={y} r={r * (1 + 3 * k)} fill="url(#flash)" opacity={a} />
    <circle cx={x} cy={y} r={r * (.8 + 2.6 * k)} fill="none" stroke="#fffbe0" strokeWidth={8 * a} opacity={a} />
    {Array.from({length: 8}, (_, i) => {const ang = i * Math.PI / 4 + .3, l0 = r * (.9 + 1.2 * k), l1 = r * (1.4 + 2.6 * k);
      return <line key={i} x1={x + Math.cos(ang) * l0} y1={y + Math.sin(ang) * l0} x2={x + Math.cos(ang) * l1} y2={y + Math.sin(ang) * l1}
        stroke="#fff6c8" strokeWidth={6 * a} strokeLinecap="round" />;})}
  </g>;
}
/** Small twinkle star. */
const Twinkle = ({x, y, s = 1, opacity = 1, color = '#fffbe0'}: {x: number; y: number; s?: number; opacity?: number; color?: string}) => opacity <= 0 ? null :
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={color}
    d="M 0 -22 C 3 -6 6 -3 22 0 C 6 3 3 6 0 22 C -3 6 -6 3 -22 0 C -6 -3 -3 -6 0 -22 Z" />;

/** Sun counter: label, ten little suns (lit or spent) and a big brush numeral in a vermilion badge. */
const NUMERALS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
function SunCounter({count, t, changedAt = -9, x = 70, y = 64, opacity = 1, label, numerals}: {count: number; t: number; changedAt?: number; x?: number; y?: number; opacity?: number; label: string; numerals: string[]}) {
  if (opacity <= 0) return null;
  const bump = 1 + .35 * Math.max(0, 1 - (t - changedAt) / .35) * (t >= changedAt ? 1 : 0);
  const numeral = numerals[count] ?? String(count);
  return <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-20} y={-16} width={640} height={156} rx={34} fill="rgba(255,248,230,.82)" stroke="#e7b36a" strokeWidth={3} />
    <g transform={`translate(66 62) scale(${bump})`}>
      <circle r={54} fill={RED} stroke="#9e2414" strokeWidth={4} />
      <Brush id="cnt" text={numeral} x={0} y={-44} size={88} fill={PAPER} shadow={false} align="middle" />
    </g>
    <text x={150} y={34} fontSize={30} fontWeight={700} fill="#8a4a1a" fontFamily='"PingFang SC", "Noto Sans SC", sans-serif' letterSpacing={4}>{label}</text>
    {Array.from({length: 10}, (_, i) => {
      const lit = i < count;
      return <g key={i} transform={`translate(${170 + i * 44} 90)`}>
        <circle r={17} fill={lit ? GOLD : 'rgba(150,120,90,.25)'} stroke={lit ? '#d9661a' : 'rgba(150,120,90,.45)'} strokeWidth={2.5} />
        {lit && Array.from({length: 8}, (_, j) => <line key={j} x1={0} y1={-20} x2={0} y2={-25} transform={`rotate(${j * 45 + t * 30})`} stroke={AMBER} strokeWidth={3} strokeLinecap="round" />)}
      </g>;
    })}
  </g>;
}

/** Dried-mud crack network in a trapezoid field (seeded jittered grid, perspective rows), spreading out from the centre.
 * Each edge has an `at` (0..1 order) so p=0 shows nothing and p=1 the whole network. */
function crackPaths(seed: number, box: [number, number, number, number], cols = 13, rows = 6) {
  const r = seeded(seed), [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, pts: number[][][] = [];
  for (let j = 0; j <= rows; j++) {
    const v = j / rows, y = y0 + (y1 - y0) * (v * v * .45 + v * .55), half = mix(.34, .52, v) * (x1 - x0);
    pts.push(Array.from({length: cols + 1}, (_, i) => [cx + (i / cols - .5) * 2 * half + (r() - .5) * (x1 - x0) / cols * .75, y + (j && j < rows ? (r() - .5) * (y1 - y0) / rows * .7 : 0)]));
  }
  const out: {d: string; w: number; at: number; o: number}[] = [], far = Math.hypot((x1 - x0) / 2, (y1 - y0) / 2);
  const edge = (a: number[], b: number[], v: number, border: boolean) => {
    if (r() < .14) return;
    const mx = (a[0] + b[0]) / 2 + (r() - .5) * 14, my = (a[1] + b[1]) / 2 + (r() - .5) * 8;
    const dist = Math.hypot(mx - cx, (my - (y0 + y1) / 2) * 1.6) / far;
    out.push({d: `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${mx.toFixed(1)} ${my.toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)}`,
      w: mix(1.6, 4.4, v), at: clamp(dist * .75 + (r() - .5) * .12), o: border ? .35 : .9});
  };
  for (let j = 0; j <= rows; j++) for (let i = 0; i < cols; i++) edge(pts[j][i], pts[j][i + 1], j / rows, j === 0 || j === rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i <= cols; i++) edge(pts[j][i], pts[j + 1][i], (j + .5) / rows, i === 0 || i === cols);
  return out;
}
function Cracks({paths, p, opacity = 1}: {paths: {d: string; w: number; at: number; o: number}[]; p: number; opacity?: number}) {
  if (p <= 0 || opacity <= 0) return null;
  return <g opacity={opacity} strokeLinecap="round" strokeLinejoin="round" fill="none">{paths.map((c, i) => {
    const q = clamp((p * 1.25 - c.at) / .25);
    if (q <= 0) return null;
    return <g key={i} opacity={c.o}>
      <path d={c.d} stroke="rgba(255,240,205,.7)" strokeWidth={c.w + 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} transform="translate(0 1.5)" />
      <path d={c.d} stroke="#6b4423" strokeWidth={c.w} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />
    </g>;
  })}</g>;
}
/** Picture-book cloud (cream puffs with a soft brown outline). */
const Cloud = ({x, y, s = 1, opacity = 1}: {x: number; y: number; s?: number; opacity?: number}) => opacity <= 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -130 30 C -150 30 -160 0 -132 -8 C -140 -40 -96 -56 -72 -36 C -64 -76 -4 -84 12 -46 C 30 -74 84 -66 88 -30 C 120 -40 150 -10 132 18 C 150 30 140 40 120 40 L -120 40 Z"
      fill="#fff8ec" stroke="#d9b58a" strokeWidth={3} strokeLinejoin="round" />
    <path d="M -100 22 C -60 30 20 30 100 22" stroke="#f1dcc0" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>;

/** Heat shimmer drawn as vector bands: translucent wavy ribbons drifting up and wobbling over the hot horizon.
 * (Copies of the plate, as strips or as a masked layer, looked more like real refraction but rendered differently
 * run to run on the GPU path and failed the delivery check with CODE_NONDETERMINISTIC.) */
function HeatHaze({t, y0, y1, amount = 1, n = 9}: {asset?: any; frame?: number; t: number; y0: number; y1: number; amp?: number; amount?: number; n?: number}) {
  if (amount <= 0) return null;
  const band = (y1 - y0) / n;
  return <Svg><g fill="none" strokeLinecap="round">{Array.from({length: n}, (_, i) => {
    const k = ((t * .22 + i / n) % 1), y = y1 - k * (y1 - y0), op = Math.sin(Math.PI * k) * .22 * amount;
    const pts = Array.from({length: 25}, (_, j) => {const x = j * 80; return `${x},${(y + Math.sin(j * .9 + t * 4.2 + i * 1.7) * band * .18).toFixed(1)}`;});
    return <polyline key={i} points={pts.join(' ')} stroke="#fff3dc" strokeWidth={band * .32} opacity={op} />;
  })}</g></Svg>;
}
/** Rising heat lines (wavy, translucent). */
function HeatLines({t, x0, x1, y, n = 9, amount = 1, seed = 4}: {t: number; x0: number; x1: number; y: number; n?: number; amount?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), items = Array.from({length: n}, () => ({x: x0 + r() * (x1 - x0), ph: r(), h: 90 + r() * 90}));
  return <g fill="none" strokeLinecap="round">{items.map((it, i) => {
    const k = (t * .55 + it.ph) % 1, yy = y - k * 160, op = Math.sin(Math.PI * k) * .55 * amount;
    const path = `M ${it.x} ${yy} q 12 ${-it.h / 4} 0 ${-it.h / 2} q -12 ${-it.h / 4} 0 ${-it.h / 2}`;
    return <path key={i} d={path} stroke="#fff3d6" strokeWidth={5} opacity={op} />;
  })}</g>;
}
/** Rain streaks (canvas, frame-deterministic). */
function Rain({frame, amount = 1, angle = .16, seed = 3, opacity = 1}: {frame: number; amount?: number; angle?: number; seed?: number; opacity?: number}) {
  const r = seeded(seed), drops = Array.from({length: 420}, () => ({x: r() * W * 1.3, y: r() * H, l: 26 + r() * 50, v: 1300 + r() * 1100, z: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    c.lineCap = 'round';
    drops.forEach((d, i) => {
      if (i / drops.length > amount) return;
      const y = (d.y + d.v * t) % (H + 120) - 60, x = (d.x - y * angle) % (W * 1.3) - W * .15;
      c.strokeStyle = `rgba(225,240,255,${.25 + .45 * d.z})`; c.lineWidth = 1 + 2 * d.z;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - d.l * angle, y + d.l); c.stroke();
    });
  });
  if (opacity <= 0) return null;
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />;
}
/** Night stars and a friendly moon. */
function NightSky({t, amount = 1, moonX = 1560, moonY = 170}: {t: number; amount?: number; moonX?: number; moonY?: number}) {
  if (amount <= 0) return null;
  const r = seeded(91), stars = Array.from({length: 60}, () => ({x: r() * W, y: r() * 420, s: r()}));
  return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: 0, opacity: amount, background: 'linear-gradient(180deg, rgba(20,34,90,.88), rgba(30,40,90,.62) 55%, rgba(20,24,60,.55))', mixBlendMode: 'multiply'}} />
    <Svg style={{opacity: amount}}>{stars.map((s, i) => <Twinkle key={i} x={s.x} y={s.y} s={.18 + .3 * s.s} opacity={.35 + .6 * Math.abs(Math.sin(t * 2 + i))} />)}
      <circle cx={moonX} cy={moonY} r={120} fill="#fdf3c8" opacity={.18} /><circle cx={moonX} cy={moonY} r={90} fill="#fdf3c8" opacity={.25} />
      <circle cx={moonX} cy={moonY} r={70} fill="#fdf3c8" />
      <circle cx={moonX + 30} cy={moonY - 18} r={60} fill="rgba(30,40,90,.0)" /></Svg>
  </div>;
}
/** Warm sky tint (multiply + screen layers), amount 0..1. */
function Heat({amount = 1, t = 0}: {amount?: number; t?: number}) {
  if (amount <= 0) return null;
  const pulse = 1 + .05 * Math.sin(t * 3);
  return <>
    <div style={{position: 'absolute', inset: 0, opacity: amount, background: 'linear-gradient(180deg, rgba(255,120,40,.55), rgba(255,170,60,.25) 60%, rgba(255,140,40,.2))', mixBlendMode: 'multiply'}} />
    <div style={{position: 'absolute', inset: 0, opacity: amount * .5 * pulse, background: 'radial-gradient(ellipse at 50% 10%, rgba(255,236,170,.75), rgba(255,200,90,0) 65%)', mixBlendMode: 'screen'}} />
  </>;
}
/** Soft vignette. */
const Finish = ({vignette = .38}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(40,15,0,0) 52%, rgba(40,15,0,${vignette}) 100%)`}} />;
/** Decaying camera shake. */
const shake = (t: number, at: number, power = 14, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return '';
  const k = (1 - d / len) * power;
  return `translate(${(Math.sin(d * 90) * k).toFixed(2)}px, ${(Math.cos(d * 70) * k * .7).toFixed(2)}px)`;
};
const fadeEdges = (t: number, dur: number, inS = .15, outS = .15) => Math.min(sm(t / inS), sm((dur - t) / outS));
/** Small caption-like note in the host text font. */
const Note = ({children, x, y, size = 30, color = 'rgba(255,244,224,.92)', opacity = 1, align = 'left', fonts}: any) =>
  !children || opacity <= 0 ? null : <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y,
    textAlign: align === 'center' ? 'center' : 'left', fontFamily: fonts?.text, fontSize: size, letterSpacing: typeof children === 'string' && isLatin(children) ? 1 : 4,
    color, opacity, textShadow: '0 2px 10px rgba(60,20,0,.85)', whiteSpace: 'nowrap', fontWeight: 600}}>{children}</div>;

// The village field, three modes sharing one drought plate (and the green plate for spring).
// drought: ten suns, heat shimmer, a thermometer shooting up, cracks growing on the cue, the river drying, sweat drops.
// calm: one sun, day to night, the thermometer settles. spring: rain, cracks close, sprouts grow, the field turns green.
export const meta = {
  params: {
    mode: {label: '模式', type: 'select', default: 'drought', options: [{value: 'drought', label: '大旱'}, {value: 'calm', label: '一个太阳'}, {value: 'spring', label: '下雨回春'}]},
    furnaceCue: {label: '火炉卡点词', type: 'text', default: '火炉', maxLength: 24, help: '大旱：念到这个词，温度计冲到顶'},
    crackCue: {label: '裂开卡点词', type: 'text', default: '裂开', maxLength: 24, help: '大旱：念到这个词，地上的裂缝长出来'},
    riverCue: {label: '小河卡点词', type: 'text', default: '小河', maxLength: 24, help: '大旱：念到这个词，河水被晒干'},
    peopleCue: {label: '人们卡点词', type: 'text', default: '人们', maxLength: 24, help: '大旱：念到这个词，村民冒汗'},
    dogCue: {label: '小狗卡点词', type: 'text', default: '小狗', maxLength: 24},
    dayCue: {label: '白天卡点词', type: 'text', default: '白天', maxLength: 24, help: '一个太阳：念到这个词，太阳慢慢走过天空'},
    nightCue: {label: '晚上卡点词', type: 'text', default: '晚上', maxLength: 24, help: '一个太阳：念到这个词，天黑下来、月亮出来'},
    rainCue: {label: '下雨卡点词', type: 'text', default: '哗啦啦', maxLength: 24, help: '下雨回春：念到这个词，大雨落下'},
    closeCue: {label: '裂缝合上卡点词', type: 'text', default: '合上', maxLength: 24},
    sproutCue: {label: '小苗卡点词', type: 'text', default: '小苗', maxLength: 24},
    greenCue: {label: '变绿卡点词', type: 'text', default: '绿了', maxLength: 24},
  },
  slots: {drought: '大旱的村庄田地', green: '雨后变绿的同一片田地'},
};
const SUNS = [[150, 130, 40], [330, 255, 38], [510, 100, 42], [690, 235, 38], [870, 110, 42], [1050, 240, 38], [1290, 52, 36], [1560, 58, 36], [1830, 150, 40], [1790, 335, 36]];
const RIVER = 'M 0 640 L 150 616 L 330 600 L 470 606 L 640 598 L 600 628 L 470 690 L 330 770 L 200 860 L 80 960 L 0 1030 Z';
const HEADS = [[1238, 392], [1398, 398], [1592, 392]];
const CRACK_BOX: [number, number, number, number] = [430, 735, 1560, 1075];

/** Thermometer: level 0..1, hot tints the bulb red, cool tints it blue. */
function Thermo({x, y, level, t, opacity = 1}: {x: number; y: number; level: number; t: number; opacity?: number}) {
  if (opacity <= 0) return null;
  const h = 380, fill = clamp(level), hot = clamp((level - .55) / .4), cool = clamp((.45 - level) / .3);
  const color = cool > 0 ? `rgb(${mix(232, 70, cool)},${mix(64, 150, cool)},${mix(44, 230, cool)})` : RED;
  const wob = hot > .8 ? Math.sin(t * 30) * 2 * hot : 0;
  return <g transform={`translate(${x + wob} ${y})`} opacity={opacity}>
    <rect x={-30} y={-24} width={60} height={h + 40} rx={30} fill="rgba(255,250,240,.9)" stroke="#8a4a1a" strokeWidth={4} />
    <circle cx={0} cy={h + 30} r={44} fill="rgba(255,250,240,.95)" stroke="#8a4a1a" strokeWidth={4} />
    <rect x={-13} y={h * (1 - fill) - 8} width={26} height={h * fill + 40} rx={13} fill={color} />
    <circle cx={0} cy={h + 30} r={32} fill={color} />
    {hot > 0 && <circle cx={0} cy={h + 30} r={60 + 10 * Math.sin(t * 8)} fill="none" stroke="#ffd45c" strokeWidth={5} opacity={hot * .8} />}
    {[0, 1, 2, 3, 4].map(i => <line key={i} x1={18} x2={30} y1={i * h / 4} y2={i * h / 4} stroke="#8a4a1a" strokeWidth={3} />)}
  </g>;
}
/** Seedlings in perspective rows, grown by p (0..1). */
function Sprouts({p, t, opacity = 1}: {p: number; t: number; opacity?: number}) {
  if (p <= 0 || opacity <= 0) return null;
  const r = seeded(77), rows = [[740, .55, 9], [800, .66, 10], [870, .78, 11], [950, .9, 12], [1040, 1.05, 13]];
  let n = 0;
  return <g opacity={opacity}>{rows.map(([y, s, count], ri) => Array.from({length: count}, (_, i) => {
    const x = 520 + (i + .5) * (960 / count) + (r() - .5) * 30, delay = r() * .5 + ri * .06, k = outBack((p * 1.6 - delay) / .6);
    n++;
    if (k <= 0) return null;
    const sway = Math.sin(t * 2 + n) * 3, h = 46 * s * k;
    return <g key={`${ri}-${i}`} transform={`translate(${x} ${y})`}>
      <path d={`M 0 0 Q ${sway} ${-h * .5} ${sway * 1.5} ${-h}`} stroke="#3d8a2a" strokeWidth={5 * s} fill="none" strokeLinecap="round" />
      <path transform={`translate(${sway * 1.5} ${-h}) rotate(-35) scale(${s * k})`} d="M 0 0 C 8 -18 26 -18 30 -6 C 18 2 8 4 0 0 Z" fill="#6cc04a" stroke="#2f7a24" strokeWidth={1.5} />
      <path transform={`translate(${sway * 1.5} ${-h}) rotate(215) scale(${s * k})`} d="M 0 0 C 8 -18 26 -18 30 -6 C 18 2 8 4 0 0 Z" fill="#86d35e" stroke="#2f7a24" strokeWidth={1.5} />
    </g>;
  }))}</g>;
}
/** Sweat drop sliding down beside a head, looping. */
function Sweat({x, y, t, ph, opacity}: {x: number; y: number; t: number; ph: number; opacity: number}) {
  if (opacity <= 0) return null;
  const k = (t * .8 + ph) % 1;
  return <path transform={`translate(${x} ${y + k * 36}) scale(${1.1 - k * .3})`} opacity={opacity * Math.sin(Math.PI * k)}
    d="M 0 -16 C 8 -4 11 4 0 12 C -11 4 -8 -4 0 -16 Z" fill="#9fdcff" stroke="#3a86c8" strokeWidth={2} />;
}

export default function Land(props: SceneInput) {
  const {t, at, start, end, endAll, dur} = cues(props);
  const m = mode(props, 'drought');
  const drought = slot(props, 'drought'), green = slot(props, 'green');
  const cracks = crackPaths(2026, CRACK_BOX);
  if (m === 'calm') {
    const day = at(txt(props, 'dayCue'), start(1, dur * .45)), night = at(txt(props, 'nightCue'), day + 1.6);
    const n = sm((t - night) / .9), arc = clamp((t - start(0, 0)) / Math.max(1, night - start(0, 0) + .6));
    const sx = mix(560, 1500, arc) + n * 260, sy = 230 - Math.sin(Math.PI * arc) * 110 + n * 260;
    const level = mix(.98, .5, sm((t - .2) / 1.4)) - .22 * n;
    return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur)}}>
      <Plate asset={drought} frame={props.frame} p={t / dur} from={[1.06, 0, 0]} to={[1.04, 0, -10]}>
        <Svg><Cracks paths={cracks} p={1} opacity={.85} /></Svg>
      </Plate>
      <div style={{position: 'absolute', inset: 0, opacity: (1 - n) * .7, background: 'radial-gradient(ellipse at 50% 15%, rgba(255,226,150,.6), rgba(255,200,90,0) 60%)', mixBlendMode: 'screen'}} />
      <NightSky t={t} amount={n * .92} moonX={520} moonY={150} />
        <Svg><Defs />
          <SunBird x={sx} y={sy} r={58} t={t} phase={.3} mood={n > .3 ? 'sleepy' : 'joy'} glow={1 - n * .6} rays={1 - n * .5} opacity={1 - sm((t - night) / .7)} />
          {Array.from({length: 14}, (_, i) => {const r = seeded(300 + i)(), x = 520 + r * 900, y = 760 + ((i * 37) % 260); const tw = Math.sin(t * 3 + i * 1.7);
            return <circle key={i} cx={x + Math.sin(t + i) * 20} cy={y + Math.cos(t * .8 + i) * 12} r={4} fill="#fff3a0" opacity={n * (.4 + .5 * tw * tw)} />;})}
          {Array.from({length: 14}, (_, i) => {const r = seeded(300 + i)(), x = 520 + r * 900, y = 760 + ((i * 37) % 260); const tw = Math.sin(t * 3 + i * 1.7);
            return <circle key={`h${i}`} cx={x + Math.sin(t + i) * 20} cy={y + Math.cos(t * .8 + i) * 12} r={11} fill="#fff3a0" opacity={n * (.12 + .15 * tw * tw)} />;})}
        </Svg>
      <Svg><Thermo x={90} y={260} level={level} t={t} /></Svg>
      <Finish />
    </div>;
  }
  if (m === 'spring') {
    const rain = at(txt(props, 'rainCue'), start(0, .2)), close = at(txt(props, 'closeCue'), start(1, dur * .35) + 1.2);
    const sprout = at(txt(props, 'sproutCue'), close + 1.0), greenAt = at(txt(props, 'greenCue'), sprout + 1.0);
    const r = sm((t - rain + .3) / .5) * (1 - sm((t - greenAt - .4) / 1.2));
    const n = .92 * (1 - sm((t - close) / 2.2)), g = sm((t - sprout - .2) / (greenAt - sprout + .8));
    const done = endAll(dur);
    return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .15)}}>
      <Plate asset={drought} frame={props.frame} p={t / dur} from={[1.04, 0, -10]} to={[1.08, 0, -20]}>
        <Svg><Cracks paths={cracks} p={1 - sm((t - close) / 1.4)} opacity={.85} /></Svg>
        <Svg><Sprouts p={clamp((t - sprout) / 1.3)} t={t} opacity={1 - sm((t - greenAt - .3) / .9)} /></Svg>
      </Plate>
      <Plate asset={green} frame={props.frame} p={t / dur} from={[1.04, 0, -10]} to={[1.08, 0, -20]} opacity={g} />
      <div style={{position: 'absolute', inset: 0, opacity: n, background: 'linear-gradient(180deg, rgba(30,44,90,.9), rgba(40,56,100,.6) 60%, rgba(30,40,80,.55))', mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', inset: 0, opacity: r * .55, background: 'linear-gradient(180deg, rgba(70,90,120,.75), rgba(90,110,140,.2) 55%, rgba(0,0,0,0))', mixBlendMode: 'multiply'}} />
      <Rain frame={props.frame} amount={.35 + .65 * r} opacity={r} seed={9} />
      {t > rain && t < rain + .12 && <div style={{position: 'absolute', inset: 0, background: `rgba(230,240,255,${.35 * (1 - (t - rain) / .12)})`}} />}
      <Svg><Defs />
        <SunBird x={1640} y={mix(260, 200, sm((t - greenAt - .6) / 1))} r={56} t={t} phase={.3} mood="joy" opacity={sm((t - greenAt - .4) / .8)} />
        {[0, 1, 2].map(i => <Twinkle key={i} x={1540 + i * 90} y={150 + (i % 2) * 60} s={.8} opacity={win(t, greenAt + .8 + i * .15, done + 1, .2) * (.5 + .5 * Math.sin(t * 4 + i))} />)}
      </Svg>
      <Finish vignette={.3} />
    </div>;
  }
  // drought
  const furnace = at(txt(props, 'furnaceCue'), start(0, .2) + 1.2), crack = at(txt(props, 'crackCue'), start(1, dur * .3) + .8);
  const river = at(txt(props, 'riverCue'), crack + 2.4), people = at(txt(props, 'peopleCue'), start(2, dur * .7)), dog = at(txt(props, 'dogCue'), people + 1.6);
  const level = mix(.62, .8, sm(t / 1.2)) + .2 * outBack((t - furnace) / .6);
  const water = 1 - sm((t - river) / 1.1);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur)}}>
    <Plate asset={drought} frame={props.frame} p={t / dur} from={[1.02, 0, 0]} to={[1.08, 0, -25]} origin="50% 70%">
      <HeatHaze t={t} y0={330} y1={780} />
      <Svg><Defs />
        <path d={RIVER} fill="#79c3e6" opacity={.55 * water} />
        <path d={RIVER} fill="none" stroke="#e8f7ff" strokeWidth={5} opacity={.6 * water} />
        {water < 1 && water > 0 && Array.from({length: 8}, (_, i) => <path key={i} d={`M ${60 + i * 70} ${700 + (i % 3) * 60 - (1 - water) * 90} q 10 -20 0 -40 q -10 -20 0 -40`}
          stroke="#ffffff" strokeWidth={5} fill="none" opacity={Math.sin(Math.PI * (1 - water)) * .7} strokeLinecap="round" />)}
        <Cracks paths={cracks} p={clamp((t - crack) / 1.8)} />
        {HEADS.map(([x, y], i) => <Sweat key={i} x={x} y={y} t={t} ph={i * .33} opacity={sm((t - people - i * .1) / .3)} />)}
        {HEADS.map(([x, y], i) => <Sweat key={`b${i}`} x={x - 34} y={y + 6} t={t + .5} ph={i * .21} opacity={sm((t - people - .3 - i * .1) / .3)} />)}
        {[0, 1, 2].map(i => <path key={i} d={`M ${1680 + i * 16} ${612 - i * 4} q 14 -8 28 0`} stroke="#fff6e0" strokeWidth={4} fill="none" strokeLinecap="round"
          opacity={win(t, dog + i * .08, dur, .15) * (.4 + .6 * Math.abs(Math.sin(t * 9 + i)))} />)}
      </Svg>
    </Plate>
    <Heat amount={.55 + .3 * sm((t - furnace) / .6)} t={t} />
    <Svg><Defs />
        {SUNS.map(([x, y, r], i) => <SunBird key={i} x={x + Math.sin(t * 1.3 + i) * 10} y={y + Math.cos(t * 1.7 + i) * 6} r={r * (1 + .08 * sm((t - furnace) / .4) * Math.sin(t * 6 + i))}
          t={t} phase={i * .37} mood="joy" glow={.9} />)}
        <HeatLines t={t} x0={480} x1={1500} y={760} n={12} amount={.9} />
    </Svg>
    <Svg><Thermo x={90} y={260} level={level} t={t} /></Svg>
    {t >= furnace && t < furnace + .15 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,220,150,${.4 * (1 - (t - furnace) / .15)})`, mixBlendMode: 'screen'}} />}
    <Finish vignette={.42} />
  </div>;
}
