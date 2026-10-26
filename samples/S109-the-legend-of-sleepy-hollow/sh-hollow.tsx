import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const INK = '#07090d', PAPER = '#efe6d2', AMBER = '#e8862a', EMBER = '#ffb45a', MOON = '#ebe8d8', FROST = '#cfdbe6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const MEDIA: Record<string, string> = {"hollow":"release-assets/5c2e972909e22df3f57a92943e4219ae0569aba85956c14aea462f934c5138be.webp"};
// 矢量剪影（trace.py 从 Gemini 黑剪影描出，高 1000、底边居中锚点）：horseman 无头骑士、ichabod 伊卡博德、throw 立镫掷物。
/** 素材：先用素材槽（制作任务，高清图），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

// 画面文字都是各幕 meta.params 声明的内容参数（默认值是英文原文），换语言只换参数、不换代码。
const SERIF = 'Baskerville, "Big Caslon", "Hoefler Text", Georgia, "Times New Roman", "Songti SC", "STSong", serif';
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

/** 镜头：从 from 到 to 的 [缩放, x 位移, y 位移]，按 p 缓动；pt(fx, fy) 把底图上的相对位置换成屏幕坐标，给叠加层对位。 */
function camera(p: number, from: number[], to: number[], ease = easeInOut) {
  const k = ease(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return {s, x, y, pt: (fx: number, fy: number) => [(fx * W - W / 2) * s + W / 2 + x, (fy * H - H / 2) * s + H / 2 + y] as [number, number]};
}
/** 满幅底图 + 镜头。用布局尺寸（left/top/width/height）放大，不用 CSS transform 缩放：
 * transform 缩放的图层在两次渲染里光栅化结果会差几个色阶（交付检查判 CODE_NONDETERMINISTIC，10-13 Katrina 一幕实测）。 */
function Plate({asset, frame, cam, opacity = 1}: {asset: any; frame: number; cam: {s: number; x: number; y: number}; opacity?: number}) {
  if (!asset) return null;
  const w = W * cam.s, h = H * cam.s;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: (W - w) / 2 + cam.x, top: (H - h) / 2 + cam.y, width: w, height: h}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 暗角。 */
const Finish = ({vignette = .6}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 幕首/幕末黑场（只在幕自己的时间里起作用：交叉淡化的重叠段 t<0 或 t>dur 时保持不透明，免得叠出黑帧）。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(t < 0 ? 1 : sm(t / inS), t > dur ? 1 : sm((dur - t) / outS));
/** 流动的雾：几层不同深度的柔雾带，各自按速度横移并缓缓起伏；y0～y1 是雾带所在的高度范围。 */
function Fog({t, amount = 1, y0 = 620, y1 = 1080, layers = 3, speed = 30, tint = '200,210,222', seed = 2, id = 'fog'}:
  {t: number; amount?: number; y0?: number; y1?: number; layers?: number; speed?: number; tint?: string; seed?: number; id?: string}) {
  if (amount <= 0) return null;
  const r = seeded(seed * 7 + 1), span = W * 1.8;
  const blobs = Array.from({length: layers * 7}, (_, i) => ({layer: i % layers, x: r() * span, y: r(), w: 520 + r() * 680, h: 90 + r() * 120, ph: r() * 6.28, a: .25 + .4 * r()}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: amount}}>
    <defs><radialGradient id={`${id}-b`}><stop offset="0" stopColor={`rgb(${tint})`} stopOpacity=".6" /><stop offset=".55" stopColor={`rgb(${tint})`} stopOpacity=".22" />
      <stop offset="1" stopColor={`rgb(${tint})`} stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={`rgb(${tint})`} stopOpacity="0" />
        <stop offset="1" stopColor={`rgb(${tint})`} stopOpacity=".22" /></linearGradient></defs>
    <rect x={0} y={y0} width={W} height={y1 - y0} fill={`url(#${id}-v)`} />
    {blobs.map((b, i) => {
      const depth = (b.layer + 1) / layers, v = speed * (.5 + depth);
      const x = (((b.x + v * t) % span) + span) % span - W * .4, y = mix(y0, y1, b.y) + Math.sin(t * .4 + b.ph) * 18;
      return <ellipse key={i} cx={x} cy={y} rx={b.w * (.7 + .5 * depth)} ry={b.h * (.7 + .5 * depth)} fill={`url(#${id}-b)`} opacity={b.a} />;
    })}
  </svg>;
}
/** 风卷落叶（canvas）：叶片翻转、打旋，wind 控制风向与风力。 */
function Leaves({frame, amount = 1, wind = 1, seed = 3, n = 60, opacity = 1, size = 1, fall = 1}:
  {frame: number; amount?: number; wind?: number; seed?: number; n?: number; opacity?: number; size?: number; fall?: number}) {
  const r = seeded(seed), colors = ['#a8471c', '#c9741f', '#7a2f17', '#d79a2c', '#5e3a1c'];
  const leaves = Array.from({length: n}, () => ({x: r() * (W + 400), y: r() * H, s: r(), ph: r() * 6.28, spin: (r() - .5) * 6, c: colors[Math.floor(r() * colors.length)]}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    leaves.forEach((l, i) => {
      if (i / n > amount) return;
      const span = W + 400;
      const x = (((l.x + wind * (180 + 260 * l.s) * t + Math.sin(t * 1.7 + l.ph) * 50) % span) + span) % span - 200;
      const y = (((l.y + fall * (50 + 70 * l.s) * t + Math.sin(t * 2.3 + l.ph) * 34) % (H + 120)) + H + 120) % (H + 120) - 60;
      const len = (10 + 16 * l.s) * size;
      c.save(); c.translate(x, y); c.rotate(l.ph + l.spin * t); c.scale(1, .25 + .75 * Math.abs(Math.cos(t * 3.1 + l.ph)));
      c.fillStyle = l.c; c.globalAlpha = .55 + .45 * l.s;
      c.beginPath(); c.moveTo(-len, 0); c.quadraticCurveTo(0, -len * .55, len, 0); c.quadraticCurveTo(0, len * .55, -len, 0); c.fill();
      c.restore();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 火星 / 萤火 / 雪：缓慢上扬或飘落的小光点（canvas）。 */
function Motes({frame, kind = 'ember', amount = 1, seed = 5, opacity = 1, x0 = 0, x1 = W, y0 = 0, y1 = H, n = 140}:
  {frame: number; kind?: 'ember' | 'wisp' | 'snow'; amount?: number; seed?: number; opacity?: number; x0?: number; x1?: number; y0?: number; y1?: number; n?: number}) {
  const r = seeded(seed + kind.length), motes = Array.from({length: n}, () => ({x: r(), y: r(), s: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30, hh = y1 - y0, ww = x1 - x0;
    motes.forEach((m, i) => {
      if (i / n > amount) return;
      const up = kind === 'snow' ? 1 : -1, speed = kind === 'snow' ? 60 + 80 * m.s : kind === 'wisp' ? 12 + 14 * m.s : 50 + 70 * m.s;
      const y = y0 + (((m.y * hh + up * speed * t) % hh) + hh) % hh;
      const x = x0 + (((m.x * ww + Math.sin(t * (kind === 'wisp' ? .7 : 1.4) + m.ph) * (kind === 'wisp' ? 60 : 24) + (kind === 'snow' ? 30 * t : 0)) % ww) + ww) % ww;
      const pulse = kind === 'wisp' ? .5 + .5 * Math.sin(t * 2.2 + m.ph * 3) : 1;
      const size = kind === 'snow' ? 1.6 + 3.2 * m.s : kind === 'wisp' ? 2 + 3 * m.s : 1.2 + 2.2 * m.s;
      if (kind === 'wisp') {
        const g = c.createRadialGradient(x, y, 0, x, y, size * 6);
        g.addColorStop(0, `rgba(190,255,220,${.75 * pulse})`); g.addColorStop(1, 'rgba(120,220,200,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, size * 6, 0, 6.283); c.fill();
        return;
      }
      c.fillStyle = kind === 'snow' ? `rgba(240,246,255,${.5 + .45 * m.s})` : `rgba(255,${130 + 90 * m.s},60,${.45 + .5 * Math.sin(t * 6 + m.ph) ** 2})`;
      c.beginPath(); c.arc(x, y, size, 0, 6.283); c.fill();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 版画式名牌：细线框 + 大写衬线字 + 小字说明，p 控制线框画出与字淡入。 */
function Card({x, y, title, sub = '', p, align = 'left', size = 64, color = PAPER, accent = AMBER}:
  {x: number; y: number; title: string; sub?: string; p: number; align?: 'left' | 'right' | 'center'; size?: number; color?: string; accent?: string}) {
  if (p <= 0 || !title) return null;
  const k = out3(p);
  return <div style={{position: 'absolute', left: align === 'right' ? undefined : align === 'center' ? x - 800 : x, right: align === 'right' ? W - x : undefined,
    width: align === 'center' ? 1600 : undefined, top: y, textAlign: align, fontFamily: SERIF, color, textShadow: '0 3px 16px rgba(0,0,0,.9)', whiteSpace: 'nowrap', opacity: sm(p * 1.6)}}>
    <div style={{display: 'inline-block', borderTop: `2px solid ${accent}`, width: 260 * k, marginBottom: 14}} />
    <div style={{fontSize: size, letterSpacing: size * .08, textTransform: 'uppercase', lineHeight: 1.05, transform: `translateY(${(1 - k) * 18}px)`}}>{title}</div>
    {sub && <div style={{fontSize: size * .42, letterSpacing: 3, fontStyle: 'italic', opacity: .85 * sm((p - .3) / .5), marginTop: 10}}>{sub}</div>}
  </div>;
}

// 1790 年的山谷：镜头从暮色天空缓缓压进山谷。念到年份落下版画式地名牌，念到地名画出指向教堂的虚线；
// 念到 magicCue，谷底的雾泛起幽光、鬼火升起（代码画的流雾与光点）。
export const meta = {
  title: 'Sleepy Hollow, 1790',
  params: {
    date: {label: 'Date line', type: 'text', default: 'New York · 1790', maxLength: 40},
    dateCue: {label: 'Date appears on', type: 'text', default: '1790', maxLength: 24},
    place: {label: 'Place name', type: 'text', default: 'Sleepy Hollow', maxLength: 32},
    placeCue: {label: 'Place appears on', type: 'text', default: 'Sleepy Hollow', maxLength: 32},
    magicCue: {label: 'Mist glows on', type: 'text', default: 'bewitched', maxLength: 24},
  },
};
/** 三次贝塞尔曲线前 p 段的折线点（画虚线指引用）。 */
const bezier = (a: number[], b: number[], c: number[], d: number[], p: number) => {
  const count = Math.max(2, Math.round(60 * p));
  return Array.from({length: count}, (_, i) => {
    const u = p * i / (count - 1), v = 1 - u;
    return `${v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0]},${v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]}`;
  }).join(' ');
};
export default function Hollow(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const cam = camera(t / dur, [1.2, 40, 150], [1.06, -20, -20]);
  const date = at(txt(props, 'dateCue'), start(0, .4)), place = at(txt(props, 'placeCue'), start(1, 2.5)), magic = at(txt(props, 'magicCue'), start(2, 5));
  const [cx, cy] = cam.pt(.655, .52), glow = sm((t - magic + .2) / 1.2);
  const path = clamp((t - place - .3) / 1.1);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .01, .1)}}>
    <Plate asset={slot(props, 'hollow')} frame={props.frame} cam={cam} />
    <Fog t={t} amount={.55 + .35 * glow} y0={cam.pt(0, .38)[1]} y1={cam.pt(0, .62)[1]} layers={3} speed={14} tint={glow > .5 ? '185,215,205' : '205,200,190'} seed={3} id="hf" />
    <Motes frame={props.frame} kind="wisp" amount={glow} n={26} seed={4} x0={200} x1={1700} y0={cam.pt(0, .4)[1]} y1={cam.pt(0, .7)[1]} />
    <Leaves frame={props.frame} amount={.35} wind={.7} seed={6} n={40} fall={.8} />
    <Svg>
      {path > 0 && <polyline points={bezier([960, 300], [1080, 360], [cx - 60, cy - 200], [cx, cy - 40], path)} fill="none" stroke={PAPER} strokeWidth={2.5}
        strokeDasharray="10 12" opacity={.75} />}
      {path > .95 && <circle cx={cx} cy={cy - 40} r={14 + 4 * Math.sin(t * 4)} fill="none" stroke={AMBER} strokeWidth={3} opacity={.9} />}
    </Svg>
    <Card x={960} y={96} title={txt(props, 'date')} p={clamp((t - date + .1) / .6)} align="center" size={34} />
    <Card x={960} y={168} title={txt(props, 'place')} p={clamp((t - place + .1) / .7)} align="center" size={86} />
    <Finish vignette={.6} />
  </div>;
}
