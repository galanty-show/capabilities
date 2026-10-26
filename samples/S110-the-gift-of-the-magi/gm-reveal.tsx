import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {"b":{" ":[235,""],"A":[738,"m224 0l-222 0l0-38q27 0 44-9q16-8 31-31q14-24 33-69l215-515l81 0l224 531q21 48 42 71q22 22 58 22l0 38l-301 0l0-38q13 0 28-2q14-2 24-9q10-7 10-23q0-11-5-30q-5-20-14-41l-33-83l-8-24l-101-272l-4 0l-110 272l-7 24l-40 97q-4 13-8 27q-5 15-5 28q0 23 16 29q15 7 52 7zm232-214l-265 0l17-48l231 0z"],"C":[679,"m362 12q-107 0-177-44q-70-43-104-119q-34-76-34-173q0-112 42-189q43-77 119-117q75-39 174-39q53 0 84 8q31 9 49 17q18 9 32 9q15 0 21-11q6-11 12-23l38 0l0 240l-43 0q-19-96-68-143q-49-47-126-47q-97 0-147 72q-50 71-50 203q0 96 26 156q25 60 74 87q50 28 120 28q72 0 120-26q49-25 92-73l29 26q-31 44-68 80q-37 36-88 57q-52 21-127 21z"],"E":[647,"m594 0l-559 0l0-38q37 0 57-6q21-5 29-23q9-18 9-56l0-404q0-38-7-58q-6-19-26-26q-21-7-62-7l0-39l549 0l6 175l-44 0q-7-47-20-73q-14-26-43-36q-30-10-88-10l-138 0l0 239l100 0q48 0 71-6q24-6 31-25q8-20 8-59l41 0l0 231l-41 0q0-42-8-61q-7-20-31-26q-23-5-71-5l-100 0l0 258l122 0q53 0 86-6q33-5 53-20q20-15 33-42q13-27 26-70l42 0z"],"H":[819,"m351 0l-316 0l0-38q44 0 64-7q20-7 25-29q6-22 6-65l0-377q0-39-5-62q-5-22-24-31q-20-10-66-10l0-38l318 0l0 38q-45 0-65 10q-21 9-25 31q-5 22-5 62l0 157l304 0l0-157q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l319 0l0 38q-46 0-67 10q-20 9-25 31q-5 22-5 62l0 377q0 43 6 65q6 22 26 29q21 7 65 7l0 38l-319 0l0-38q44 0 64-7q20-7 26-29q5-22 5-65l0-171l-304 0l0 171q0 44 5 65q5 22 25 29q20 7 63 7z"],"I":[387,"m350 0l-315 0l0-38q44 0 64-8q20-7 25-29q6-21 6-64l0-377q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l317 0l0 38q-45 0-65 10q-21 9-25 31q-5 23-5 62l0 377q0 42 6 64q5 22 24 29q20 8 63 8z"],"R":[703,"m357 0l-319 0l0-38q38 0 58-6q19-6 26-26q7-20 7-62l0-410q0-30-6-46q-6-17-25-24q-20-7-60-7l0-38l296 0q72 0 131 15q60 15 95 51q35 37 35 101q0 55-23 89q-24 35-60 54q-37 19-79 29l0 5q16 10 36 33q19 23 51 68q32 46 86 123q24 33 48 42q23 9 57 9l0 38l-204 0q-36-61-60-101q-24-40-41-66q-17-27-30-48q-14-22-29-45q-14-23-27-28q-13-6-39-6l-23 0l0 163q0 40 7 61q7 20 28 26q21 6 64 6zm-99-339 38 1q52-3 88-17q37-14 56-45q20-31 20-85q0-58-33-92q-33-35-107-35q-16 0-32 1q-15 0-30 2z"],"T":[638,"m480 0l-323 0l0-38q43 0 64-7q21-6 27-28q7-22 7-67l0-465l-52 0q-55 0-82 12q-28 12-40 43q-12 30-23 84l-43 0l11-191l588 0l9 191l-43 0q-11-54-23-84q-13-31-40-43q-27-12-83-12l-51 0l0 465q0 45 7 67q7 22 27 28q21 7 63 7z"],"V":[699,"m387 5l-65 0l-236-534q-14-33-28-53q-13-19-30-28q-18-9-47-9l0-38l309 0l0 38q-17 0-32 3q-16 2-26 10q-10 8-10 26q0 24 14 57l116 270l38 100l7 0l37-100l114-287q3-7 6-19q3-12 3-25q0-20-15-27q-16-8-49-8l0-38l221 0l0 38q-22 0-37 5q-15 5-27 19q-13 15-27 44q-14 29-35 78z"],"W":[1008,"m732 7l-69 0l-151-402l-13-34l-33-94q-15-44-27-64q-12-20-28-26q-16-6-44-6l0-38l293 0l0 38q-75 0-75 37q0 12 5 26q6 15 11 31l98 261l28 88l6 0l107-321q2-6 6-18q4-13 7-28q3-15 3-28q0-30-19-39q-18-9-49-9l0-38l218 0l0 38q-35 1-52 16q-17 16-31 54zm-360 0l-65 0l-211-524q-22-57-43-78q-20-21-57-24l0-38l291 0l0 38q-38 0-51 8q-14 8-14 24q0 19 12 51l113 280l28 81l6 0l116-291l45 99l-25 0z"],"X":[687,"m686 0l-322 0l0-38l8 0q32 0 45-6q12-5 12-22q0-16-6-32q-5-16-25-46l-56-86l-36-63l-18-20l-165-231q-20-28-34-44q-14-17-32-23q-18-7-53-7l0-39l316 0l0 39l-10 0q-28 0-40 6q-13 6-13 24q0 13 10 32q10 18 23 36q12 19 21 35l59 99l19 19l192 267q26 36 47 48q22 13 58 14zm-447 0l-239 0l0-38q24 0 40-6q15-7 31-22q15-15 36-41l181-227l39 53l-17 0l-112 152q-9 12-19 27q-9 16-9 34q0 15 14 22q14 8 55 8zm291-525-142 178-37-50l16 0l96-134q13-19 21-33q7-13 7-29q0-13-13-19q-13-6-50-6l0-39l240 0l0 39q-31 1-51 9q-20 8-39 28q-19 19-48 56z"],"\u00b7":[301,"m150-198q-35 0-53-17q-18-18-18-49q0-32 18-51q18-20 53-20q35 0 53 20q18 20 18 52q-1 31-18 48q-18 17-53 17z"]}};
const KERN: Record<string, Record<string, number>> = {"b":{" T":-20," V":-20," W":-20," X":-10,"V ":-20,"W ":-20,"X ":-10,"AC":-40,"AT":-60,"AV":-100,"AW":-100,"CC":-10,"CT":-5,"EC":-20,"ET":-15,"RC":-20,"RT":-30,"RV":-50,"RW":-50,"TA":-60,"TC":-10,"VA":-105,"VC":-35,"WA":-105,"WC":-35,"XC":-40}};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"couch":"release-assets/8fdfce28aa5f8e1bf36ccb55fd23d429b4b6b69a31ee70629aa3b6ac5c2c81f9.webp","short":"release-assets/41353256c33a6aa2dc82ae320bce00cc2c5bb286428fc3578c80af7ef51af85b.webp"};
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
/** 竖幅底图放进半屏（960 宽），按 y0→y1 纵向摇镜（图在 960 宽时高 1707）。dx 是整块横移（滑入）。 */
function Panel({asset, frame, side, y0, y1, p, dx = 0, opacity = 1, zoom = [1, 1]}:
  {asset: any; frame: number; side: 'left' | 'right'; y0: number; y1: number; p: number; dx?: number; opacity?: number; zoom?: number[]}) {
  if (!asset || opacity <= 0) return null;
  const k = easeInOut(clamp(p)), y = mix(y0, y1, k), z = mix(zoom[0], zoom[1], k);
  return <div style={{position: 'absolute', top: 0, left: side === 'left' ? 0 : 960, width: 960, height: H, overflow: 'hidden', opacity, transform: `translateX(${dx}px)`}}>
    <div style={{position: 'absolute', left: 0, top: -y, width: 960, height: 1707, transform: `scale(${z})`, transformOrigin: `50% ${y + 540}px`}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 暗角。 */
const Finish = ({vignette = .55}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`}} />;
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
/** 沿折线排表链环：pts 为控制点；p 揭示进度（从头到尾）；shine 为高光沿链跑到的位置 0→1。 */
function ChainLinks({pts, link = 28, p = 1, shine = -1, opacity = 1, width = 5}: {pts: number[][]; link?: number; p?: number; shine?: number; opacity?: number; width?: number}) {
  if (p <= 0 || opacity <= 0) return null;
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = seg[seg.length - 1], count = Math.floor(total / link), links: any[] = [];
  for (let k = 0; k <= count * clamp(p); k++) {
    const d = k * link;
    let j = 1; while (j < seg.length - 1 && seg[j] < d) j++;
    const q = (d - seg[j - 1]) / Math.max(1e-6, seg[j] - seg[j - 1]);
    const x = mix(pts[j - 1][0], pts[j][0], q), y = mix(pts[j - 1][1], pts[j][1], q);
    const ang = Math.atan2(pts[j][1] - pts[j - 1][1], pts[j][0] - pts[j - 1][0]) * 180 / Math.PI;
    const lit = shine >= 0 ? Math.exp(-Math.pow((k / Math.max(1, count) - shine) * 9, 2)) : 0;
    links.push(<g key={k} transform={`translate(${x} ${y}) rotate(${ang})`}>
      {k % 2 === 0 ? <ellipse rx={link * .62} ry={link * .34} fill="none" stroke="url(#pt)" strokeWidth={width} />
        : <rect x={-link * .6} y={-width * .55} width={link * 1.2} height={width * 1.1} rx={width * .55} fill="url(#pt)" />}
      {lit > .05 && <ellipse rx={link * .5} ry={link * .3} fill={`rgba(255,255,255,${.85 * lit})`} style={{filter: 'blur(3px)'}} />}
    </g>);
  }
  return <g opacity={opacity} style={{filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.6))'}}>{links}</g>;
}
/** 长发如瀑：一束起伏的发丝（canvas），从 top 流到 top+len*p；用于“长发”的幽灵影像与片名下的装饰。 */
function HairFlow({frame, x, top, len, width = 220, p = 1, seed = 4, opacity = 1, color = '150,92,48'}:
  {frame: number; x: number; top: number; len: number; width?: number; p?: number; seed?: number; opacity?: number; color?: string}) {
  const r = seeded(seed), n = 46, strands = Array.from({length: n}, () => ({u: r(), ph: r() * 6.28, amp: 10 + r() * 22, w: .8 + r() * 2.2, c: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30, L = len * clamp(p);
    if (L <= 2) return;
    strands.forEach(s => {
      const x0 = x + (s.u - .5) * width * .55;
      c.strokeStyle = `rgba(${color.split(',').map((v, i) => Math.round(Number(v) * (.75 + .5 * s.c) + (i === 0 ? 20 : 0))).join(',')},${.35 + .45 * s.c})`;
      c.lineWidth = s.w; c.beginPath(); c.moveTo(x0, top);
      for (let k = 1; k <= 24; k++) {
        const v = k / 24, yy = top + L * v, spread = (s.u - .5) * width * (.55 + .7 * v);
        c.lineTo(x + spread + Math.sin(v * 7 + t * 1.6 + s.ph) * s.amp * (.3 + v), yy);
      }
      c.stroke();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}

// 反转：与“两件珍宝”同一个分屏。Della 摊开手（念到“dandy”滑到右半），左半是代码画的白金表链，链头一圈虚线表框在等那只表；
// “Give me your watch.”之后静一拍；念到“tumbled”左半换成仰在沙发上的 Jim——表袋是空的；
// 念到“sold”空表袋上浮出金表的影子、化成金尘散去，左屏标签被划掉；念到“combs”右屏 Della 的长发影子也散去。
export const meta = {
  title: 'I sold the watch',
  params: {
    watchLabel: {label: '左屏标签', type: 'text', default: 'I · THE WATCH', maxLength: 28},
    hairLabel: {label: '右屏标签', type: 'text', default: 'II · THE HAIR', maxLength: 28},
    handCue: {label: '摊手卡点词', type: 'text', default: 'dandy', maxLength: 24},
    askCue: {label: '要表卡点词', type: 'text', default: 'watch', maxLength: 24},
    jimCue: {label: '换到 Jim 的卡点词', type: 'text', default: 'tumbled', maxLength: 24},
    soldCue: {label: '金表消散卡点词', type: 'text', default: 'sold', maxLength: 24},
    combsCue: {label: '长发消散卡点词', type: 'text', default: 'combs', maxLength: 24},
  },
  slots: {short: '竖幅：短卷发的 Della 摊开手，掌心是表链', couch: '竖幅：Jim 仰在沙发上笑，背心表袋是空的'},
};
const CHAIN = [[150, 300], [230, 380], [300, 470], [350, 560], [380, 640], [420, 700], [500, 720], [580, 690], [630, 620], [660, 540], [700, 470], [760, 420], [820, 400]];
export default function Reveal(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const hand = at(txt(props, 'handCue'), start(0, .5)), ask = at(txt(props, 'askCue'), start(2, 3));
  const jim = at(txt(props, 'jimCue'), start(3, ask + 2.5)) - .1;
  const sold = at(txt(props, 'soldCue'), start(5, jim + 3)), combs = at(txt(props, 'combsCue'), sold + 1.2);
  const slide = out3((t - hand + .3) / .7);                 // Della 从正中滑到右半
  const jimIn = out3((t - jim) / .55);
  const panR = mix(170, 250, clamp(t / dur)), panL = mix(330, 420, clamp((t - jim) / Math.max(1, dur - jim)));
  const ghostWatch = t < sold ? 0 : (1 - sm((t - sold - .5) / .9)), dust = clamp((t - sold - .4) / 1.4);
  const ghostHair = win(t, combs - .1, combs + 1.1, .35);
  const waiting = sm((t - ask) / .4) * (1 - jimIn);
  const pulse = .55 + .45 * Math.sin((t - ask) * 3.2);
  const pocketY = 900 - panL, palmX = 960 + 460 - 480 * (1 - slide), palmY = 1120 - panR;
  const motes = Array.from({length: 26}, (_, i) => ({a: i * 2.39, v: 60 + (i * 53) % 140}));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .02)}}>
    <Panel asset={slot(props, 'short')} frame={props.frame} side="right" y0={panR} y1={panR} p={0} dx={-480 * (1 - slide)} />
    {jimIn < 1 && <div style={{position: 'absolute', left: 0, top: 0, width: 960 - 480 * (1 - slide), height: H, opacity: slide,
      background: 'radial-gradient(ellipse at 55% 50%, #1f1a22 0%, #0b0908 75%)'}} />}
    <Panel asset={slot(props, 'couch')} frame={props.frame} side="left" y0={panL} y1={panL} p={0} dx={-960 * (1 - jimIn)} />
    <HairFlow frame={props.frame} x={1440} top={170} len={900} width={300} p={1} seed={3} opacity={.65 * ghostHair} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,5,4,.78) 0%, rgba(6,5,4,.35) 9%, rgba(6,5,4,0) 17%)'}} />
    <Svg><Defs />
      <g opacity={slide * (1 - jimIn)}>
        <ChainLinks pts={CHAIN} link={34} p={clamp((t - hand) / 1.2)} shine={((t - hand) * .45) % 1.2} width={5} />
        <g opacity={waiting * pulse}><Clock cx={820} cy={560} r={120} h={0} m={0} s={0} ghost /></g>
      </g>
      <Glints pts={[[palmX, palmY], [palmX + 40, palmY + 50], [palmX - 30, palmY + 90]]} t={t} from={hand} size={28} period={1.2} seed={2} />
      {ghostWatch > 0 && <g opacity={ghostWatch * .9} transform={`translate(480 ${pocketY}) scale(${.9 + .5 * (1 - ghostWatch)}) translate(-480 ${-pocketY})`}>
        <Clock cx={480} cy={pocketY} r={95} h={10} m={9} s={36} kind="pocket" />
      </g>}
      {dust > 0 && dust < 1 && motes.map((m, i) => <circle key={i} cx={480 + Math.cos(m.a) * m.v * dust * 1.8} cy={pocketY + Math.sin(m.a) * m.v * dust - 120 * dust * dust}
        r={3 + (i % 4)} fill="#ffd98a" opacity={(1 - dust) * .9} />)}
      {jimIn > 0 && <line x1={960} y1={0} x2={960} y2={H * jimIn} stroke={GOLD} strokeWidth={2.5} opacity={.85} />}
      <Type id="wl" text={txt(props, 'watchLabel')} x={480} y={92} size={30} align="middle" fill={GOLD} tracking={200} p={(t - jim - .2) / .6} mode="fade" />
      <Type id="hl" text={txt(props, 'hairLabel')} x={1440} y={92} size={30} align="middle" fill={GOLD} tracking={200} p={(t - jim - .2) / .6} mode="fade" />
      <line x1={300} y1={82} x2={300 + 360 * clamp((t - sold - .3) / .4)} y2={82} stroke="#c2563e" strokeWidth={4} opacity={t > sold + .3 ? 1 : 0} />
      <line x1={1260} y1={82} x2={1260 + 360 * clamp((t - combs) / .4)} y2={82} stroke="#c2563e" strokeWidth={4} opacity={t > combs ? 1 : 0} />
    </Svg>
    <Finish vignette={.45} />
  </div>;
}
