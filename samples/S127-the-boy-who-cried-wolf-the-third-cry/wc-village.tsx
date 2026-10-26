import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// The Boy Who Cried Wolf: shared cinematic library. prepare.py joins it with each module into scenes/<module>.tsx and inlines
// only the Ma Shan Zheng (OFL) glyph outlines a module draws. No runtime fonts, randomness or clocks: everything is a function of t.
const GLYPHS: Record<string, string> = {};
const W = 1920, H = 1080;
const GOLD = '#ffd27a', EMBER = '#ff9c4a', MOON = '#dfe9ff', INK = '#05070d', PAPER = '#fff4e0', WOLF = '#9dff7a';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const in2 = (v: number) => {const p = clamp(v); return p * p;};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** Window: fade in from a, fade out from b (seconds). */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
/** 0 before a, 1 after a (soft edge f). */
const after = (t: number, a: number, f = .2) => sm((t - a) / f);

const MEDIA: Record<string, string> = {"village-dusk":"release-assets/dcfc8ac05b07c41b3b71a645cba5b4f9318ab2643b0a202d63a2fbfc3c25f352.webp"};
const VIDEO_URLS = new Map<string, string>();
function slot(props: SceneInput, name: string): any {
  if (props.assets[name]) return props.assets[name];
  const media = MEDIA[name];
  if (!media) return undefined;
  if (!media.startsWith('data:video/')) return {src: media, kind: 'image'};
  let url = VIDEO_URLS.get(name);
  if (!url) {
    const raw = atob(media.slice(media.indexOf(',') + 1));
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    url = URL.createObjectURL(new Blob([bytes], {type: 'video/mp4'}));
    VIDEO_URLS.set(name, url);
  }
  return {src: url, kind: 'video'};
}
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
const mode = (props: SceneInput, fallback: string) => typeof props.params.mode === 'string' ? props.params.mode as string : fallback;
const isLatin = (text: string) => !/[㐀-鿿]/.test(text);

/** Sentence timing with fallbacks, so edited narration never drops a beat. */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}

/** Full-frame plate with a camera move (zoom s, offset x/y in px) laid out as a plain box, not a CSS transform:
 * transformed image layers re-raster differently run to run (CODE_NONDETERMINISTIC). Children share the plate frame (1920x1080). */
function Plate({asset, frame, p, from = [1.04, 0, 0], to = [1.12, -20, -10], opacity = 1, origin = '50% 50%', shift = [0, 0], ease = easeInOut, children}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string; shift?: number[]; ease?: (v: number) => number; children?: any}) {
  if (opacity <= 0) return null;
  const k = ease(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k) + shift[0], y = mix(from[2], to[2], k) + shift[1];
  const [px, py] = origin.split(' ').map(v => parseFloat(v) / 100), ox = px * W, oy = py * H;
  const box = {left: ox * (1 - s) + x, top: oy * (1 - s) + y, width: W * s, height: H * s};
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2440, #3a3050 60%, #20283a)'}} />}
      {children}
    </div>
  </div>;
}
/** Where a plate point (1920x1080 plate pixels) lands on screen for the same camera move as Plate. */
function camPoint(pt: number[], p: number, from = [1.04, 0, 0], to = [1.12, -20, -10], origin = '50% 50%', shift = [0, 0], ease = easeInOut) {
  const k = ease(clamp(p)), s = mix(from[0], to[0], k), x = mix(from[1], to[1], k) + shift[0], y = mix(from[2], to[2], k) + shift[1];
  const [px, py] = origin.split(' ').map(v => parseFloat(v) / 100), ox = px * W, oy = py * H;
  return [ox * (1 - s) + x + pt[0] * s, oy * (1 - s) + y + pt[1] * s, s];
}
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** Brush lettering: each glyph wipes in stroke-wise; p is the line's progress 0->1. Latin text falls back to a serif line. */
function Brush({text, x, y, size, fill = PAPER, p = 1, id, gap = .98, align = 'start', glow = ''}:
  {text: string; x: number; y: number; size: number; fill?: string; p?: number; id: string; gap?: number; align?: 'start' | 'middle' | 'end'; glow?: string}) {
  if (!text || p <= 0) return null;
  const filter = glow ? {filter: `drop-shadow(0 0 3px rgba(30,15,5,.85)) drop-shadow(0 0 18px ${glow}) drop-shadow(0 6px 16px rgba(0,0,0,.6))`} : {filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.55))'};
  if (isLatin(text)) {
    const k = Math.min(1, 1680 / (text.length * size * .62 * .56)), font = size * .62 * k, width = text.length * font * .56, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
    return <g style={filter} opacity={clamp(p * 1.4)}>
      <text x={left} y={y + size * .62} fontFamily='Georgia, "Times New Roman", serif' fontWeight={700} fontSize={font} letterSpacing={font * .08} fill={fill}>{text}</text>
    </g>;
  }
  const chars = Array.from(text), total = ((chars.length - 1) * gap + 1) * size;
  const ox0 = align === 'middle' ? x - total / 2 : align === 'end' ? x - total : x;
  return <g style={filter}>{chars.map((ch, i) => {
    const q = clamp(p * chars.length - i);
    if (q <= 0 || !GLYPHS[ch]) return null;
    return <g key={i} transform={`translate(${ox0 + i * size * gap} ${y}) scale(${size / 1000})`}>
      <defs><mask id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="-150" y="-150" width="1300" height="1300">
        <path d="M-80 80 L1040 80 L-80 320 L1040 320 L-80 550 L1040 550 L-80 790 L1040 790 L-80 1030 L1040 1030"
          fill="none" stroke="white" strokeWidth="255" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - q)} />
      </mask></defs>
      <path d={GLYPHS[ch]} fill={fill} mask={`url(#${id}-${i})`} />
    </g>;
  })}</g>;
}

/** The film's motif: a shout turned into rings rolling out from (x, y) toward `dir` degrees.
 * strength scales brightness/width/count; breakAt (px radius) makes rings shatter into falling fragments past that radius. */
function Echo({t, at, x, y, dir = 0, spread = 38, strength = 1, n = 5, gap = .26, speed = 900, maxR = 1500, color = GOLD, breakAt = 0, seed = 1, day = false}:
  {t: number; at: number; x: number; y: number; dir?: number; spread?: number; strength?: number; n?: number; gap?: number; speed?: number; maxR?: number; color?: string; breakAt?: number; seed?: number; day?: boolean}) {
  if (t < at || strength <= 0) return null;
  const rings = [];
  for (let i = 0; i < n; i++) {
    const d = t - at - i * gap;
    if (d <= 0) continue;
    const r = 40 + speed * d * (1 - .25 * clamp(d / 3));
    if (r > maxR) continue;
    let alpha = Math.min(1, strength * 1.15) * (1 - Math.pow(r / maxR, 1.6)) * clamp(d / .1) * (1 - i * .07);
    const width = (34 - i * 3) * (.45 + .55 * strength) * (1 - .5 * r / maxR);
    const broken = breakAt > 0 && r > breakAt, k = broken ? clamp((r - breakAt) / 260) : 0;
    if (broken) alpha *= 1 - k;
    if (alpha <= .01) continue;
    const a0 = (dir - spread) * Math.PI / 180, a1 = (dir + spread) * Math.PI / 180;
    if (!broken) {
      const dpath = `M ${x + Math.cos(a0) * r} ${y + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r}`;
      const dust = seeded(seed * 53 + i * 11);
      for (let j = 0; j < 22; j++) {
        const u = dust(), ang = (dir - spread + 2 * spread * u) * Math.PI / 180, rr = r + (dust() - .5) * width * 3, tw = .4 + .6 * Math.abs(Math.sin(d * 9 + j));
        rings.push(<circle key={`${i}d${j}`} cx={x + Math.cos(ang) * rr} cy={y + Math.sin(ang) * rr} r={1.2 + dust() * width * .16} fill="#fffbe8" opacity={alpha * tw * .8} />);
      }
      rings.push(<g key={i} opacity={alpha}>
        {day && <path d={dpath} fill="none" stroke="#7a3a08" strokeWidth={width * 1.25} strokeLinecap="round" opacity={.35} />}
        <path d={dpath} fill="none" stroke={color} strokeWidth={width * 4.5} strokeLinecap="round" opacity={.14} />
        <path d={dpath} fill="none" stroke={color} strokeWidth={width * 2.2} strokeLinecap="round" opacity={.3} />
        <path d={dpath} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={.75} />
        <path d={dpath} fill="none" stroke="#fffaf0" strokeWidth={Math.max(2, width * .32)} strokeLinecap="round" />
      </g>);
    } else {
      // shatter: the arc splits into shards that drift apart, tumble and drop
      const rnd = seeded(seed * 31 + i * 7), shards = 9;
      for (let j = 0; j < shards; j++) {
        const u0 = j / shards, u1 = u0 + .7 / shards, jit = (rnd() - .5) * 2;
        const aa = a0 + (a1 - a0) * u0, ab = a0 + (a1 - a0) * u1, rr = r + jit * 40 * k;
        const fall = 140 * k * k * (.6 + rnd()), sx = Math.cos((aa + ab) / 2) * 40 * k * jit;
        const p0 = [x + Math.cos(aa) * rr + sx, y + Math.sin(aa) * rr + fall], p1 = [x + Math.cos(ab) * rr + sx, y + Math.sin(ab) * rr + fall];
        rings.push(<g key={`${i}-${j}`} opacity={alpha}><line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={color} strokeWidth={width * 2 * (1 - .4 * k)} strokeLinecap="round" opacity={.3} />
          <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#fffaf0" strokeWidth={width * .45 * (1 - .4 * k)} strokeLinecap="round" /></g>);
      }
    }
  }
  return <g style={day ? undefined : {mixBlendMode: 'screen'}}>{rings}</g>;
}

/** Foreground grass silhouettes swaying in the wind; `drift` moves them faster than the plate for parallax depth. */
function Grass({t, side = 'both', color = '#0d140c', height = 260, wind = 1, n = 34, seed = 3, drift = 0, opacity = 1, rim = ''}:
  {t: number; side?: 'left' | 'right' | 'both' | 'bottom'; color?: string; height?: number; wind?: number; n?: number; seed?: number; drift?: number; opacity?: number; rim?: string}) {
  if (opacity <= 0) return null;
  const r = seeded(seed), blades = Array.from({length: n}, () => ({u: r(), h: .45 + r() * .7, w: 10 + r() * 22, ph: r() * 6, lean: (r() - .5) * .5}));
  const place = (u: number) => side === 'left' ? u * 520 : side === 'right' ? W - u * 520 : u * W;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity}}>
    {blades.map((b, i) => {
      const x = place(b.u) + drift * (.6 + b.h), hgt = height * b.h * (side === 'bottom' ? .7 : 1);
      const sway = (Math.sin(t * 1.7 * wind + b.ph) * .6 + Math.sin(t * 3.1 * wind + b.ph * 2) * .25) * 70 * wind + b.lean * 120;
      const tipX = x + sway, tipY = H - hgt, cx = x + sway * .35, cy = H - hgt * .55;
      const d = `M ${x - b.w} ${H + 10} Q ${cx - b.w * .4} ${cy} ${tipX} ${tipY} Q ${cx + b.w * .4} ${cy} ${x + b.w} ${H + 10} Z`;
      return <g key={i}><path d={d} fill={color} />{rim && <path d={`M ${tipX} ${tipY} Q ${cx + b.w * .4} ${cy} ${x + b.w} ${H + 10}`} fill="none" stroke={rim} strokeWidth={2} opacity={.55} />}</g>;
    })}
  </svg>;
}

/** Drifting mist banks (soft ellipses) across a band of the frame. */
function Mist({t, y0 = 500, y1 = 800, color = '255,255,255', amount = .35, n = 7, speed = 18, seed = 5}:
  {t: number; y0?: number; y1?: number; color?: string; amount?: number; n?: number; speed?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), banks = Array.from({length: n}, () => ({x: r() * (W + 800) - 400, y: y0 + r() * (y1 - y0), rx: 300 + r() * 420, ry: 40 + r() * 70, v: .5 + r(), ph: r() * 6}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
    <defs><radialGradient id={`mist${seed}`}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity="1" /><stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient></defs>
    {banks.map((b, i) => {
      const x = ((b.x + t * speed * b.v) % (W + 1000)) - 500;
      return <ellipse key={i} cx={x} cy={b.y + Math.sin(t * .3 + b.ph) * 10} rx={b.rx} ry={b.ry} fill={`url(#mist${seed})`} opacity={amount * (.5 + .5 * Math.sin(t * .4 + b.ph) ** 2)} />;
    })}
  </svg>;
}

/** Volumetric light shafts from a source point (screen blend, outside the plate box). */
function Rays({t, x, y, color = '255,226,160', amount = .5, n = 7, spread = 70, dir = 120, length = 2200, seed = 2}:
  {t: number; x: number; y: number; color?: string; amount?: number; n?: number; spread?: number; dir?: number; length?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), rays = Array.from({length: n}, () => ({a: dir + (r() - .5) * spread, w: 2 + r() * 5, ph: r() * 6}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    <defs><linearGradient id={`ray${seed}`} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={x + Math.cos(dir * Math.PI / 180) * length} y2={y + Math.sin(dir * Math.PI / 180) * length}>
      <stop offset="0" stopColor={`rgb(${color})`} stopOpacity=".9" /><stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></linearGradient>
      <radialGradient id={`raysrc${seed}`}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity=".9" /><stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient></defs>
    <circle cx={x} cy={y} r={340} fill={`url(#raysrc${seed})`} opacity={amount * .7} />
    {rays.map((ray, i) => {
      const a = (ray.a + Math.sin(t * .25 + ray.ph) * 2.5) * Math.PI / 180, wa = ray.w * Math.PI / 180;
      const p1 = [x + Math.cos(a - wa) * length, y + Math.sin(a - wa) * length], p2 = [x + Math.cos(a + wa) * length, y + Math.sin(a + wa) * length];
      return <polygon key={i} points={`${x},${y} ${p1.join(',')} ${p2.join(',')}`} fill={`url(#ray${seed})`} opacity={amount * (.25 + .2 * Math.sin(t * .7 + ray.ph))} />;
    })}
  </svg>;
}

/** Floating specks: pollen/dust by day, fireflies or embers at night (twinkling glow). */
function Motes({t, n = 40, color = '255,236,180', size = 3, amount = 1, area = [0, 0, W, H], rise = 12, glow = false, seed = 9}:
  {t: number; n?: number; color?: string; size?: number; amount?: number; area?: number[]; rise?: number; glow?: boolean; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), [ax, ay, bx, by] = area, pts = Array.from({length: n}, () => ({x: ax + r() * (bx - ax), y: ay + r() * (by - ay), s: .5 + r(), ph: r() * 6, v: .5 + r()}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    {pts.map((m, i) => {
      const x = m.x + Math.sin(t * .6 * m.v + m.ph) * 40, y = ay + ((m.y - ay - t * rise * m.v) % (by - ay) + (by - ay)) % (by - ay);
      const tw = glow ? Math.max(0, Math.sin(t * 1.3 * m.v + m.ph * 3)) : .6 + .4 * Math.sin(t * 2 + m.ph);
      return <g key={i} opacity={amount * tw}>
        {glow && <circle cx={x} cy={y} r={size * m.s * 6} fill={`rgba(${color},.18)`} />}
        <circle cx={x} cy={y} r={size * m.s} fill={`rgb(${color})`} />
      </g>;
    })}
  </svg>;
}

/** Soft warm/cool glow blob (window light, lantern, sun) — screen blend. */
const Glow = ({x, y, r, color = '255,190,110', amount = 1}: {x: number; y: number; r: number; color?: string; amount?: number}) => amount <= 0 ? null :
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: amount, mixBlendMode: 'screen',
    background: `radial-gradient(circle, rgba(${color},.95) 0%, rgba(${color},.45) 25%, rgba(${color},.12) 55%, rgba(${color},0) 72%)`}} />;

/** Predator eyes: two glints that ignite at `at`, breathe, and blink once. */
function Eyes({t, at, x, y, gap = 70, size = 16, color = WOLF, tilt = 6}: {t: number; at: number; x: number; y: number; gap?: number; size?: number; color?: string; tilt?: number}) {
  const on = sm((t - at) / .35);
  if (on <= 0) return null;
  const blinkT = (t - at - 1.9), blink = blinkT > 0 && blinkT < .16 ? .12 : 1;
  const breathe = .85 + .15 * Math.sin((t - at) * 3.2);
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    <defs><radialGradient id="eyeglow"><stop offset="0" stopColor={color} stopOpacity=".9" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>
    {[-1, 1].map(k => <g key={k} transform={`translate(${x + k * gap / 2} ${y + k * tilt}) scale(1 ${blink})`} opacity={on * breathe}>
      <circle r={size * 7} fill="url(#eyeglow)" opacity={.35} />
      <ellipse rx={size * 1.25} ry={size * .62} fill={color} transform={`rotate(${k * -12})`} />
      <ellipse rx={size * .5} ry={size * .3} fill="#f6ffe8" transform={`rotate(${k * -12})`} />
    </g>)}
  </svg>;
}

/** Small birds bursting up out of the trees when the shout lands. */
function Birds({t, at, x, y, n = 9, spread = 220, seed = 4, color = '#1d2318', scale = 1}: {t: number; at: number; x: number; y: number; n?: number; spread?: number; seed?: number; color?: string; scale?: number}) {
  const d = t - at;
  if (d < 0 || n <= 0) return null;
  const r = seeded(seed), birds = Array.from({length: n}, () => ({dx: (r() - .5) * spread, vx: (r() - .3) * 160, vy: 120 + r() * 140, ph: r() * 6, s: .7 + r() * .6}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
    {birds.map((b, i) => {
      const bx = x + b.dx + b.vx * d, by = y - b.vy * d + 18 * d * d, flap = Math.sin(d * 22 + b.ph) * 9 * b.s * scale, s = 9 * b.s * scale;
      return <path key={i} d={`M ${bx - s} ${by - flap} Q ${bx - s * .4} ${by - 2} ${bx} ${by} Q ${bx + s * .4} ${by - 2} ${bx + s} ${by - flap}`}
        fill="none" stroke={color} strokeWidth={2.4 * scale} strokeLinecap="round" opacity={clamp(1 - (d - 3) / 1)} />;
    })}
  </svg>;
}

/** Colour grade wash over the frame (outside the plate box): multiply tint + optional screen lift. */
const Grade = ({tint, amount = 1, lift = '', liftAmount = 0}: {tint: string; amount?: number; lift?: string; liftAmount?: number}) => <>
  {amount > 0 && <div style={{position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply', opacity: amount}} />}
  {lift && liftAmount > 0 && <div style={{position: 'absolute', inset: 0, background: lift, mixBlendMode: 'screen', opacity: liftAmount}} />}
</>;

/** Film finish: vignette, deterministic grain and thin letterbox bars. */
function Film({frame, vignette = .45, grain = .07, bars = 54, black = 0}: {frame: number; vignette?: number; grain?: number; bars?: number; black?: number}) {
  const ref = useCanvas(frame, (c, f) => {
    const r = seeded(f * 7919 + 17), img = c.createImageData(480, 270);
    for (let i = 0; i < img.data.length; i += 4) {const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;}
    c.putImageData(img, 0, 0);
  });
  return <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(0,0,0,${vignette}) 100%)`}} />
    <canvas ref={ref} width={480} height={270} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: grain, mixBlendMode: 'overlay', imageRendering: 'auto'}} />
    {bars > 0 && <><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bars, background: INK}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bars, background: INK}} /></>}
    {black > 0 && <div style={{position: 'absolute', inset: 0, background: INK, opacity: black}} />}
  </>;
}
/** Decaying camera shake offset [x, y] in px. */
const shake = (t: number, at: number, power = 14, len = .5) => {
  const d = t - at;
  if (d < 0 || d > len) return [0, 0];
  const k = (1 - d / len) * power;
  return [Math.sin(d * 83) * k, Math.cos(d * 67) * k * .7];
};
/** Handheld drift: tiny slow wobble for living frames. */
const handheld = (t: number, amp = 4, seed = 1) => [Math.sin(t * .9 + seed) * amp + Math.sin(t * 2.3 + seed * 2) * amp * .35, Math.cos(t * .7 + seed * 3) * amp * .7];
const fadeEdges = (t: number, dur: number, inS = .2, outS = .2) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** Camera by keyframes [time, zoom, focusX, focusY] in plate pixels: the focus point is centred, clamped so the plate always covers the frame.
 * Between keys the move eases (easeInOut). Returns [scale, left, top]. */
type Key = [number, number, number, number];
function cam(t: number, keys: Key[], shift = [0, 0]): number[] {
  let k0 = keys[0], k1 = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t <= keys[i + 1][0]) {k0 = keys[i]; k1 = keys[i + 1]; break;}
  if (t < keys[0][0]) k1 = k0;
  if (t > keys[keys.length - 1][0]) k0 = k1;
  const u = k1[0] > k0[0] ? easeInOut(clamp((t - k0[0]) / (k1[0] - k0[0]))) : 1;
  const s = mix(k0[1], k1[1], u), fx = mix(k0[2], k1[2], u), fy = mix(k0[3], k1[3], u);
  const left = Math.min(0, Math.max(W - W * s, W / 2 - fx * s)) + shift[0], top = Math.min(0, Math.max(H - H * s, H / 2 - fy * s)) + shift[1];
  return [s, left, top];
}
/** Plate point -> screen point for a camera from cam(). */
const sp = (c: number[], x: number, y: number) => [c[1] + x * c[0], c[2] + y * c[0]];
/** A plate shown through a cam() camera; children are drawn in plate pixels. */
function Shot({asset, frame, c, opacity = 1, children}: {asset: any; frame: number; c: number[]; opacity?: number; children?: any}) {
  if (opacity <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: c[1], top: c[2], width: W * c[0], height: H * c[0]}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2440, #3a3050 60%, #20283a)'}} />}
      {children}
    </div>
  </div>;
}
/** Rising chimney smoke wisps (plate pixels). */
function Smoke({t, x, y, n = 6, color = '235,235,240', amount = .5, height = 240, seed = 8, lean = 40}: {t: number; x: number; y: number; n?: number; color?: string; amount?: number; height?: number; seed?: number; lean?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), puffs = Array.from({length: n}, () => ({ph: r(), s: .7 + r() * .6}));
  const id = `smk${seed}-${Math.round(x)}`;
  return <g><defs><radialGradient id={id}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity=".7" /><stop offset=".6" stopColor={`rgb(${color})`} stopOpacity=".25" />
    <stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient></defs>{puffs.map((p, i) => {
    const k = (t * .16 + p.ph) % 1, px = x + Math.sin(k * 5 + i) * 14 + lean * k * k, py = y - k * height, rr = (16 + 50 * k) * p.s;
    return <ellipse key={i} cx={px} cy={py} rx={rr} ry={rr * .8} fill={`url(#${id})`} opacity={amount * Math.sin(Math.PI * k)} />;
  })}</g>;
}
/** Twinkle star glint. */
const Glint = ({x, y, s = 1, opacity = 1, color = '#fffbe8'}: {x: number; y: number; s?: number; opacity?: number; color?: string}) => opacity <= 0 ? null :
  <g opacity={opacity} style={{mixBlendMode: 'screen'}}>
    <defs><radialGradient id={`gl${Math.round(x)}${Math.round(y)}`}><stop offset="0" stopColor={color} stopOpacity=".5" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>
    <circle cx={x} cy={y} r={34 * s} fill={`url(#gl${Math.round(x)}${Math.round(y)})`} />
    <path transform={`translate(${x} ${y}) scale(${s})`} fill={color} d="M 0 -30 C 3 -7 7 -3 30 0 C 7 3 3 7 0 30 C -3 7 -7 3 -30 0 C -7 -3 -3 -7 0 -30 Z" />
  </g>;

// The village at dusk: every window glows while the farmer waves the shout away; then, on the cue, the lights go out
// one by one, far to near, and the near door swings shut over its warm slit of light (camera thud on the last one).
export const meta = {
  params: {
    mode: {label: '模式', type: 'select', default: 'doors', options: [{value: 'doors', label: '关门'}]},
  },
  slots: {'village-dusk': '黄昏村巷'},
};
// plate pixels: far hamlet lights, the side window, the far door, the right lattice window; then the near doorway.
const LIGHTS: {x: number; y: number; r: number; w?: number; h?: number}[] = [
  {x: 1470, y: 505, r: 26}, {x: 1530, y: 520, r: 22}, {x: 1590, y: 500, r: 26}, {x: 1650, y: 512, r: 22},
  {x: 1010, y: 566, r: 120, w: 60, h: 133}, {x: 1121, y: 746, r: 150, w: 50, h: 210}, {x: 1890, y: 446, r: 170, w: 60, h: 250},
];
const DOOR = {x0: 553, x1: 653, y0: 332, y1: 880};

export default function Village(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  // timed from the line's start, not its words, so the door thuds in the shared score fit every language
  const begin = start(1, dur * .5) + .5, shut = begin + 2.1;
  const step = (shut - .2 - begin) / LIGHTS.length;
  const close = sm((t - shut + .15) / .55), [kx, ky] = shake(t, shut + .4, 10, .5), [hx, hy] = handheld(t, 2, 5);
  const c = cam(t, [[0, 1.02, 1000, 560], [shut, 1.1, 820, 600], [dur, 1.12, 800, 600]], [hx + kx, hy + ky]);
  const leafX = mix(DOOR.x1, DOOR.x0, close);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
    <Shot asset={slot(props, 'village-dusk')} frame={props.frame} c={c}>
      <Svg>
        <defs><linearGradient id="slit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffb866" stopOpacity=".55" /><stop offset="1" stopColor="#ff9a3a" stopOpacity=".18" /></linearGradient>
          <radialGradient id="lamp"><stop offset="0" stopColor="#ffd08a" stopOpacity=".85" /><stop offset=".45" stopColor="#ffa94a" stopOpacity=".35" /><stop offset="1" stopColor="#ff9a3a" stopOpacity="0" /></radialGradient>
          <radialGradient id="pool"><stop offset="0" stopColor="#ffb866" stopOpacity=".5" /><stop offset="1" stopColor="#ffb866" stopOpacity="0" /></radialGradient></defs>
        {LIGHTS.map((l, i) => {
          const on = 1 - sm((t - begin - i * step) / .18), flick = .92 + .08 * Math.sin(t * 9 + i * 2);
          if (on <= 0) return null;
          return <g key={i} opacity={on * flick} style={{mixBlendMode: 'screen'}}>
            {l.w && <ellipse cx={l.x} cy={l.y} rx={l.w * .62} ry={l.h! * .58} fill="url(#lamp)" opacity={.9} />}
            <circle cx={l.x} cy={l.y} r={l.r} fill="url(#lamp)" opacity={.45} />
          </g>;
        })}
        <path d={`M ${DOOR.x0} ${DOOR.y0} L ${leafX} ${DOOR.y0} L ${leafX} ${DOOR.y1} L ${DOOR.x0} ${DOOR.y1} Z`} fill="url(#slit)" opacity={(1 - close) * .9} style={{mixBlendMode: 'screen'}} />
        <path d={`M ${leafX} ${DOOR.y0 - 4} L ${DOOR.x1 + 74} ${DOOR.y0 - 4} L ${DOOR.x1 + 74} ${DOOR.y1 + 4} L ${leafX} ${DOOR.y1 + 4} Z`} fill="#2b1f18" opacity={close} />
        <ellipse cx={(DOOR.x0 + DOOR.x1) / 2} cy={DOOR.y1 + 20} rx={220 * (1 - close)} ry={46} fill="url(#pool)" opacity={(1 - close) * .7} style={{mixBlendMode: 'screen'}} />
      </Svg>
    </Shot>
    <Grade tint="linear-gradient(180deg, #5a4a8a, #2a2246)" amount={.2 + .35 * sm((t - begin) / (shut - begin + .8))} />
    <Film frame={props.frame} vignette={.55 + .15 * close} grain={.08} black={sm((t - dur + 1.2) / 1.2) * .5} />
  </div>;
}
