import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {};
const KERN: Record<string, Record<string, number>> = {};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"embrace":"release-assets/a6182f447d6c1e9888c3c9282f67e9f420d10cb2f61a6fd2b7d7f09639be5007.webp"};
const W = 1920, H = 1080;
const INK = '#0e0b09', GOLD = '#e8c27a', CREAM = '#f6ecd9', EMBER = '#ffb45a', SILVER = '#dfe6ee', NIGHT = '#141b33', COPPER = '#c27a4a';
const SERIF = '"STIX Two Text", Georgia, "Times New Roman", "Songti SC", "STSong", serif';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
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
/** 暖色浮尘（灯光里的微粒）。 */
function Motes({frame, amount = 1, seed = 5, color = '255,214,150', opacity = 1}: {frame: number; amount?: number; seed?: number; color?: string; opacity?: number}) {
  const r = seeded(seed + 11), n = 140, motes = Array.from({length: n}, () => ({x: r() * W, y: r() * H, s: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    motes.forEach((m, i) => {
      if (i / n > amount) return;
      const y = ((m.y - (8 + 18 * m.s) * t) % H + H) % H, x = (m.x + Math.sin(t * .5 + m.ph) * 30 + 6 * t) % W;
      c.fillStyle = `rgba(${color},${(.18 + .5 * m.s) * (.6 + .4 * Math.sin(t * 2 + m.ph))})`;
      c.beginPath(); c.arc(x, y, .8 + 2.2 * m.s, 0, 6.283); c.fill();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
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


// 相拥：镜头慢慢推近两张脸，暖光一点点升起（壁灯、炉火、金色浮尘），窗外的雪一直下；“For the other.”时光最满。
export const meta = {
  title: 'Two foolish children',
  params: {
    warmCue: {label: '光最满的卡点词', type: 'text', default: 'For the other', maxLength: 24},
  },
  slots: {embrace: '短发的 Della 与 Jim 在小屋中央相拥，左边桌上是梳子'},
};
export default function Embrace(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const full = at(txt(props, 'warmCue'), dur - 1.2);
  const warm = sm(t / Math.max(1, full + .4));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .02, .02)}}>
    <Stage k={t / dur} from={[1.02, 0, 0]} to={[1.16, -40, 50]} origin="56% 38%">
      <Plate asset={slot(props, 'embrace')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
      <Glow x={330} y={150} r={260 + 120 * warm} t={t} amount={.55 + .45 * warm} seed={1} />
      <Glow x={1560} y={850} r={150 + 60 * warm} t={t * 1.4} amount={.5 + .4 * warm} color="255,150,70" seed={5} />
      <Snow frame={props.frame} amount={.85} wind={-15} seed={23} region={[1755, 0, 165, 780]} size={.8} />
      <Svg><Glints pts={[[560, 720], [610, 735], [520, 705]]} t={t} from={full - 1.5} size={22} period={1.4} seed={8} /></Svg>
    </Stage>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 40%, rgba(255,190,110,.5) 0%, rgba(255,170,90,.12) 45%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen', opacity: .15 + .55 * warm}} />
    <Motes frame={props.frame} amount={.5 + .5 * warm} seed={4} opacity={.4 + .5 * warm} />
    <Finish vignette={mix(.55, .35, warm)} />
  </div>;
}
