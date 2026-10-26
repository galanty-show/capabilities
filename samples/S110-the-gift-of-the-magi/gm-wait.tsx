import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {"b":{" ":[235,""],"I":[387,"m350 0l-315 0l0-38q44 0 64-8q20-7 25-29q6-21 6-64l0-377q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l317 0l0 38q-45 0-65 10q-21 9-25 31q-5 23-5 62l0 377q0 42 6 64q5 22 24 29q20 8 63 8z"],"V":[699,"m387 5l-65 0l-236-534q-14-33-28-53q-13-19-30-28q-18-9-47-9l0-38l309 0l0 38q-17 0-32 3q-16 2-26 10q-10 8-10 26q0 24 14 57l116 270l38 100l7 0l37-100l114-287q3-7 6-19q3-12 3-25q0-20-15-27q-16-8-49-8l0-38l221 0l0 38q-22 0-37 5q-15 5-27 19q-13 15-27 44q-14 29-35 78z"],"X":[687,"m686 0l-322 0l0-38l8 0q32 0 45-6q12-5 12-22q0-16-6-32q-5-16-25-46l-56-86l-36-63l-18-20l-165-231q-20-28-34-44q-14-17-32-23q-18-7-53-7l0-39l316 0l0 39l-10 0q-28 0-40 6q-13 6-13 24q0 13 10 32q10 18 23 36q12 19 21 35l59 99l19 19l192 267q26 36 47 48q22 13 58 14zm-447 0l-239 0l0-38q24 0 40-6q15-7 31-22q15-15 36-41l181-227l39 53l-17 0l-112 152q-9 12-19 27q-9 16-9 34q0 15 14 22q14 8 55 8zm291-525-142 178-37-50l16 0l96-134q13-19 21-33q7-13 7-29q0-13-13-19q-13-6-50-6l0-39l240 0l0 39q-31 1-51 9q-20 8-39 28q-19 19-48 56z"]}};
const KERN: Record<string, Record<string, number>> = {"b":{" V":-20," X":-10,"V ":-20,"X ":-10}};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"curls":"release-assets/be9227bee62ecd8ffe07e4da53b61dcf8103b23b34e0556cad2fecc989734c68.webp"};
const W = 1920, H = 1080;
const INK = '#0e0b09', GOLD = '#e8c27a', CREAM = '#f6ecd9', EMBER = '#ffb45a', SILVER = '#dfe6ee', NIGHT = '#141b33', COPPER = '#c27a4a';
const SERIF = '"STIX Two Text", Georgia, "Times New Roman", "Songti SC", "STSong", serif';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** 素材：先用素材槽（制作任务），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 句子时间：cue 找不到时退回给定秒数，保证改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

// ---------- 排印：内联 STIX Two 字形，按字距排；缺字整串退回 <text> ----------
const latinWidth = (text: string) => Array.from(text).reduce((w, ch) => w + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? 1000 : ch === ' ' ? 250 : /[A-Z]/.test(ch) ? 690 : /[il.,'’:;!|]/.test(ch) ? 280 : /[mwMW]/.test(ch) ? 800 : /[0-9]/.test(ch) ? 500 : 480), 0);
function layout(text: string, face: string, tracking: number, mono: boolean) {
  const g = GLYPHS[face] ?? {}, k = KERN[face] ?? {}, chars = Array.from(text);
  const ok = chars.every(ch => g[ch] || ch === ' ');
  if (!ok) return {ok, chars, xs: [] as number[], width: latinWidth(text) + tracking * chars.length};
  const digit = mono ? Math.max(...'0123456789'.split('').map(d => g[d]?.[0] ?? 0)) : 0;
  const xs: number[] = [];
  let x = 0;
  chars.forEach((ch, i) => {
    const adv = mono && /[0-9]/.test(ch) ? digit : g[ch]?.[0] ?? 250;
    const off = mono && /[0-9]/.test(ch) ? (digit - (g[ch]?.[0] ?? 0)) / 2 : 0;
    xs.push(x + off);
    x += adv + tracking + (i < chars.length - 1 ? k[ch + chars[i + 1]] ?? 0 : 0);
  });
  return {ok, chars, xs, width: x - tracking};
}
/** 一行字。p：揭示进度（rise 逐字升起淡入、wipe 横扫、fade 整体淡入）；size 是字号像素；tracking 是字距（1/1000 em）。 */
function Type({text, x, y, size, face = 'b', fill = CREAM, align = 'start', tracking = 0, p = 1, mode = 'rise', maxWidth = 0, opacity = 1, shadow = true, mono = false, id, stroke}:
  {text: string; x: number; y: number; size: number; face?: 'b' | 'i'; fill?: string; align?: 'start' | 'middle' | 'end'; tracking?: number; p?: number;
    mode?: 'rise' | 'wipe' | 'fade'; maxWidth?: number; opacity?: number; shadow?: boolean; mono?: boolean; id: string; stroke?: string}) {
  if (!text || p <= 0 || opacity <= 0) return null;
  const L = layout(text, face, tracking, mono);
  let k = size / 1000;
  if (maxWidth && L.width * k > maxWidth) k = maxWidth / L.width;
  const width = L.width * k, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
  const style = shadow ? {filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.7))'} : undefined;
  if (!L.ok) {
    return <g style={style} opacity={opacity * (mode === 'fade' || mode === 'rise' ? sm(p) : 1)}>
      {mode === 'wipe' && <defs><clipPath id={`${id}-w`}><rect x={left - 20} y={y - size * 1.2} width={(width + 40) * clamp(p)} height={size * 1.6} /></clipPath></defs>}
      <text x={left} y={y} fontFamily={SERIF} fontSize={size * k * 1000 / size} fontWeight={face === 'b' ? 600 : 400} fontStyle={face === 'i' ? 'italic' : undefined}
        letterSpacing={tracking * k} fill={fill} stroke={stroke} clipPath={mode === 'wipe' ? `url(#${id}-w)` : undefined}>{text}</text>
    </g>;
  }
  const g = GLYPHS[face], n = L.chars.length, S = 5;
  return <g style={style} opacity={opacity * (mode === 'fade' ? sm(p) : 1)}>
    {mode === 'wipe' && <defs><clipPath id={`${id}-w`}><rect x={left - 20} y={y - size * 1.2} width={(width + 40) * clamp(p)} height={size * 1.7} /></clipPath></defs>}
    <g clipPath={mode === 'wipe' ? `url(#${id}-w)` : undefined}>
      {L.chars.map((ch, i) => {
        if (ch === ' ' || !g[ch]) return null;
        const q = mode === 'rise' ? clamp((p * (n + S) - i) / S) : 1;
        if (q <= 0) return null;
        const e = out3(q);
        return <path key={i} d={g[ch][1]} fill={fill} stroke={stroke} strokeWidth={stroke ? 10 : undefined} opacity={mode === 'rise' ? e : 1}
          transform={`translate(${left + L.xs[i] * k} ${y + (1 - e) * size * .22}) scale(${k})`} />;
      })}
    </g>
  </g>;
}
/** 小字说明（系统衬线：macOS 上就是 STIX Two Text）。 */
const Label = ({children, x, y, size = 26, color = 'rgba(246,236,217,.82)', opacity = 1, align = 'left', italic = false, caps = false, spacing = 0}: any) =>
  !children || opacity <= 0 ? null : <div style={{position: 'absolute', left: align === 'center' ? x - 800 : align === 'right' ? undefined : x, right: align === 'right' ? W - x : undefined,
    width: align === 'center' ? 1600 : undefined, top: y, fontFamily: SERIF, fontStyle: italic ? 'italic' : undefined, textAlign: align,
    fontSize: size, letterSpacing: caps ? size * .16 : spacing, textTransform: caps ? 'uppercase' : undefined, color, opacity,
    textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap'}}>{children}</div>;
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
// ---------- 底图 ----------
/** 满幅底图 + 运镜（scale/位移随进度缓动）。不用 CSS filter：调色一律用叠色层，保证两次渲染逐像素一致。 */
function Plate({asset, frame, p, from = [1.04, 0, 0], to = [1.12, -20, -10], opacity = 1, origin = '50% 50%'}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string}) {
  if (!asset || opacity <= 0) return null;
  const k = easeInOut(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 运镜舞台：底图与贴在画里的道具（雪、灯光、表盘、价签）一起缩放平移；k 为 0→1 的运镜进度。 */
function Stage({k, from = [1, 0, 0], to = [1.08, 0, 0], origin = '50% 50%', children, extra = ''}:
  {k: number; from?: number[]; to?: number[]; origin?: string; children: any; extra?: string}) {
  const e = easeInOut(clamp(k)), s = mix(from[0], to[0], e), x = mix(from[1], to[1], e), y = mix(from[2], to[2], e);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s}) ${extra}`, transformOrigin: origin}}>{children}</div>
  </div>;
}
/** 暗角。 */
const Finish = ({vignette = .55}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 煤气灯/烛光：带闪烁的暖光晕（screen 叠加）。 */
function Glow({x, y, r, t, amount = 1, color = '255,186,96', seed = 1}: {x: number; y: number; r: number; t: number; amount?: number; color?: string; seed?: number}) {
  if (amount <= 0) return null;
  const f = .86 + .1 * Math.sin(t * 9.1 + seed * 1.7) * Math.sin(t * 5.3 + seed) + .04 * Math.sin(t * 23 + seed * 3);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', mixBlendMode: 'screen', opacity: amount * f,
    background: `radial-gradient(circle, rgba(${color},.75) 0%, rgba(${color},.28) 22%, rgba(${color},.08) 48%, rgba(${color},0) 70%)`}} />;
}
/** 雪：三层景深，随风斜飘、轻摆；region 限定在窗玻璃等区域。 */
function Snow({frame, amount = 1, wind = 40, seed = 3, region, opacity = 1, size = 1}:
  {frame: number; amount?: number; wind?: number; seed?: number; region?: number[]; opacity?: number; size?: number}) {
  const r = seeded(seed), n = 340, flakes = Array.from({length: n}, () => ({x: r() * W, y: r() * H, z: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    if (region) {c.beginPath(); c.rect(region[0], region[1], region[2], region[3]); c.clip();}
    flakes.forEach((m, i) => {
      if (i / n > amount) return;
      const speed = 40 + 110 * m.z * m.z, y = ((m.y + speed * t) % (H + 40) + H + 40) % (H + 40) - 20;
      const x = (((m.x + wind * (.4 + m.z) * t + Math.sin(t * (.6 + m.z) + m.ph) * (10 + 26 * m.z)) % (W + 40)) + W + 40) % (W + 40) - 20;
      const rad = (.8 + 3.2 * m.z * m.z) * size;
      c.fillStyle = `rgba(240,245,255,${.25 + .55 * m.z})`; c.beginPath(); c.arc(x, y, rad, 0, 6.283); c.fill();
      if (m.z > .8) {c.fillStyle = `rgba(240,245,255,.12)`; c.beginPath(); c.arc(x, y, rad * 2.4, 0, 6.283); c.fill();}
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 闪光：四角星，at 起亮 len 秒（twinkle）。 */
function Sparkle({x, y, size, t, at, len = .7, color = '#fffbe8'}: {x: number; y: number; size: number; t: number; at: number; len?: number; color?: string}) {
  const d = (t - at) / len;
  if (d <= 0 || d >= 1) return null;
  const e = Math.sin(Math.PI * d), s = size * (.3 + .7 * e), a = s * .16;
  return <g transform={`translate(${x} ${y}) rotate(${d * 40})`} opacity={e} style={{filter: 'drop-shadow(0 0 8px rgba(255,240,200,.9))'}}>
    <path d={`M0 ${-s} L${a} ${-a} L${s} 0 L${a} ${a} L0 ${s} L${-a} ${a} L${-s} 0 L${-a} ${-a} Z`} fill={color} />
    <circle r={a * 1.6} fill={color} />
  </g>;
}
/** 一串闪光点：pts 上按 period 轮流闪，seed 错开相位。 */
function Glints({pts, t, from, size = 26, period = 1.6, seed = 1}: {pts: number[][]; t: number; from: number; size?: number; period?: number; seed?: number}) {
  const r = seeded(seed), phase = pts.map(() => r() * period);
  return <>{pts.map((p, i) => {
    if (t < from + phase[i] * .4) return null;
    const local = ((t - from - phase[i]) % period + period) % period;
    return <Sparkle key={i} x={p[0]} y={p[1]} size={size * (.7 + .5 * ((i * 37) % 10) / 10)} t={local} at={0} len={.6} />;
  })}</>;
}
/** 镜头震动（秒内衰减）。 */
const shake = (t: number, at: number, power = 12, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return 'none';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};

// ---------- 道具：硬币、钟表、表链、剪刀、发丝 ----------
const Defs = () => <defs>
  <radialGradient id="cu" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#f0b27c" /><stop offset=".45" stopColor="#b86a3c" /><stop offset="1" stopColor="#5e2f17" /></radialGradient>
  <radialGradient id="ag" cx="36%" cy="30%" r="78%"><stop offset="0" stopColor="#ffffff" /><stop offset=".4" stopColor="#c9ccd2" /><stop offset="1" stopColor="#62666e" /></radialGradient>
  <radialGradient id="au" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#fff3c4" /><stop offset=".35" stopColor="#e2ad4c" /><stop offset=".75" stopColor="#9a6420" /><stop offset="1" stopColor="#5a3510" /></radialGradient>
  <radialGradient id="dial" cx="45%" cy="40%" r="70%"><stop offset="0" stopColor="#fdf8ec" /><stop offset=".8" stopColor="#efe2c6" /><stop offset="1" stopColor="#cdb98f" /></radialGradient>
  <radialGradient id="wood" cx="40%" cy="35%" r="80%"><stop offset="0" stopColor="#7a4a2a" /><stop offset=".7" stopColor="#3e2412" /><stop offset="1" stopColor="#1e1008" /></radialGradient>
  <linearGradient id="pt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#b9c2cc" /><stop offset="1" stopColor="#6d7682" /></linearGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f6f8" /><stop offset=".5" stopColor="#9aa3ad" /><stop offset="1" stopColor="#4c535c" /></linearGradient>
</defs>;
/** 表盘：pocket 金壳怀表 / wall 胡桃木挂钟。h,m,s 为时间；ghost 只画虚线轮廓。 */
function Clock({cx, cy, r, h, m, s, kind = 'pocket', opacity = 1, ghost = false, open = 1}:
  {cx: number; cy: number; r: number; h: number; m: number; s: number; kind?: 'pocket' | 'wall'; opacity?: number; ghost?: boolean; open?: number}) {
  if (opacity <= 0) return null;
  const ha = ((h % 12) + m / 60) * 30, ma = (m + s / 60) * 6, sa = s * 6;
  const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  if (ghost) return <g opacity={opacity} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="10 9">
    <circle cx={cx} cy={cy} r={r * 1.12} /><circle cx={cx} cy={cy - r * 1.3} r={r * .16} /><circle cx={cx} cy={cy} r={r * .9} strokeDasharray="3 10" />
  </g>;
  return <g opacity={opacity}>
    <ellipse cx={cx + r * .08} cy={cy + r * .14} rx={r * 1.2} ry={r * 1.2} fill="rgba(0,0,0,.45)" />
    {kind === 'pocket' ? <>
      <circle cx={cx} cy={cy - r * 1.32} r={r * .17} fill="none" stroke="url(#au)" strokeWidth={r * .07} />
      <rect x={cx - r * .1} y={cy - r * 1.22} width={r * .2} height={r * .16} rx={r * .04} fill="url(#au)" />
      <circle cx={cx} cy={cy} r={r * 1.13} fill="url(#au)" stroke="#5a3510" strokeWidth={r * .02} />
      <circle cx={cx} cy={cy} r={r * 1.0} fill="none" stroke="rgba(255,240,200,.6)" strokeWidth={r * .025} />
    </> : <>
      <circle cx={cx} cy={cy} r={r * 1.16} fill="url(#wood)" stroke="#120904" strokeWidth={r * .02} />
      <circle cx={cx} cy={cy} r={r * 1.02} fill="none" stroke="url(#au)" strokeWidth={r * .06} />
    </>}
    <circle cx={cx} cy={cy} r={r * .97} fill="url(#dial)" />
    {Array.from({length: 60}, (_, i) => {
      const a = i * 6 * Math.PI / 180, long = i % 5 === 0, r0 = r * (long ? .8 : .86);
      return <line key={i} x1={cx + Math.sin(a) * r0} y1={cy - Math.cos(a) * r0} x2={cx + Math.sin(a) * r * .92} y2={cy - Math.cos(a) * r * .92}
        stroke="#2a2018" strokeWidth={long ? r * .018 : r * .007} />;
    })}
    {numerals.map((label, i) => {
      const a = i * 30 * Math.PI / 180, rr = r * .66;
      return <Type key={i} id={`n${i}`} text={label} x={cx + Math.sin(a) * rr} y={cy - Math.cos(a) * rr + r * .065} size={r * .17} align="middle" fill="#231a12" shadow={false} maxWidth={r * .3} />;
    })}
    <g stroke="#1c2740" strokeLinecap="round">
      <line x1={cx} y1={cy} x2={cx + Math.sin(ha * Math.PI / 180) * r * .46} y2={cy - Math.cos(ha * Math.PI / 180) * r * .46} strokeWidth={r * .05} />
      <line x1={cx} y1={cy} x2={cx + Math.sin(ma * Math.PI / 180) * r * .72} y2={cy - Math.cos(ma * Math.PI / 180) * r * .72} strokeWidth={r * .032} />
    </g>
    <line x1={cx - Math.sin(sa * Math.PI / 180) * r * .16} y1={cy + Math.cos(sa * Math.PI / 180) * r * .16}
      x2={cx + Math.sin(sa * Math.PI / 180) * r * .8} y2={cy - Math.cos(sa * Math.PI / 180) * r * .8} stroke="#9b2c1e" strokeWidth={r * .012} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r * .04} fill="#1c2740" /><circle cx={cx} cy={cy} r={r * .018} fill="#e8c27a" />
    <path d={`M${cx - r * .7} ${cy - r * .55} A ${r * .95} ${r * .95} 0 0 1 ${cx + r * .35} ${cy - r * .88}`} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={r * .05} strokeLinecap="round" opacity={.5 * open} />
  </g>;
}

// 等他回家：短卷发的 Della 坐在门边，墙上挂钟一秒一跳，正好在旁白念到“seven”时走到七点整（敲一下、亮一圈）；
// 楼梯上的脚步一下下震动画面；最后一句祈祷时灯光收拢、手里的表链闪光。
export const meta = {
  title: "Seven o'clock",
  params: {
    sevenCue: {label: '七点整卡点词', type: 'text', default: 'seven', maxLength: 24, help: '挂钟在念到这个词时正好走到整点'},
    hour: {label: '整点', type: 'number', default: 7, min: 1, max: 12, step: 1},
    stepsCue: {label: '脚步卡点词', type: 'text', default: 'stairs', maxLength: 24},
    prayerCue: {label: '祈祷卡点词', type: 'text', default: 'Please', maxLength: 24},
  },
  slots: {curls: '短卷发的 Della 坐在门边桌角，手里攥着表链；右半是空墙'},
};
export default function Wait(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const seven = at(txt(props, 'sevenCue'), start(2, 4)), steps = at(txt(props, 'stepsCue'), seven + 1.2), prayer = at(txt(props, 'prayerCue'), start(3, dur - 3));
  const hour = Number(props.params.hour ?? 7);
  // 倒数：钟面时间 = 整点 - (seven - t) 秒，秒针一秒一跳；整点之后照常走。
  const secs = Math.floor(t - seven + 1e-6), total = hour * 3600 + secs;
  const h = Math.floor(total / 3600) % 12, m = Math.floor((total % 3600) / 60), s = ((total % 60) + 60) % 60;
  const ring = t > seven ? Math.exp(-(t - seven) * 2.2) : 0;
  let thump = 'none';
  for (let i = 0; i < 4; i++) {const v = shake(t, steps + .2 + i * .42, 4, .2); if (v !== 'none') thump = v;}
  const close = sm((t - prayer) / 1.2);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .15), transform: thump}}>
    <Stage k={t / dur} from={[1.02, 20, 0]} to={[1.12, 60, 20]} origin="30% 40%">
      <Plate asset={slot(props, 'curls')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
      <Glow x={330} y={140} r={220 + 40 * close} t={t} amount={.75} seed={4} />
      <Snow frame={props.frame} amount={.8} wind={-20} seed={12} region={[1745, 0, 175, 760]} size={.8} />
      <Svg><Defs />
        <circle cx={1360} cy={430} r={290 + 120 * (1 - ring)} fill="none" stroke={GOLD} strokeWidth={6 * ring} opacity={ring} />
        <Clock cx={1360} cy={430} r={230} h={h} m={m} s={s} kind="wall" />
        <Glints pts={[[530, 640], [560, 690], [505, 600]]} t={t} from={prayer + .3} size={30} period={1.3} seed={6} />
      </Svg>
    </Stage>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 42%, rgba(0,0,0,0) ${mix(60, 26, close)}%, rgba(4,3,2,${.75 * close}) 100%)`}} />
    {ring > .6 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,236,190,${.22 * (ring - .6) / .4})`, mixBlendMode: 'screen'}} />}
    <Finish vignette={.5} />
  </div>;
}
