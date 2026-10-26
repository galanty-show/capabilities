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
const MEDIA: Record<string, string> = {"brom":"release-assets/ec56a8e3c1429f61d18494ea863aff56b39aaf9d5e2ae9e0ded504c3fc2bd8f8.webp"};
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
/** 镜头震动（秒内衰减）。 */
const shake = (t: number, at: number, power = 18, len = .5) => {
  const d = t - at;
  if (d < 0 || d > len) return 'translate(0px, 0px)';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};
/** 幕首/幕末黑场（只在幕自己的时间里起作用：交叉淡化的重叠段 t<0 或 t>dur 时保持不透明，免得叠出黑帧）。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(t < 0 ? 1 : sm(t / inS), t > dur ? 1 : sm((dur - t) / outS));
/** 烛火 / 灯笼的闪烁系数（约 0.8～1.1），同一 seed 每帧确定。 */
const flicker = (t: number, seed = 0) => {
  const n = noise2d(97 + seed);
  return .93 + .09 * n(t * 5.5, seed) + .05 * Math.sin(t * 19 + seed * 3) * Math.sin(t * 7.3 + seed);
};
/** 暖光：屏幕叠加的柔光团（烛火、灯笼、炉火），随 flicker 呼吸。 */
function Glow({x, y, r, t, seed = 0, color = '255,170,80', strength = .55}: {x: number; y: number; r: number; t: number; seed?: number; color?: string; strength?: number}) {
  const f = flicker(t, seed), rr = r * (.94 + .1 * f);
  return <div style={{position: 'absolute', left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', mixBlendMode: 'screen', pointerEvents: 'none',
    background: `radial-gradient(circle, rgba(${color},${strength * f}) 0%, rgba(${color},${strength * f * .35}) 30%, rgba(${color},0) 70%)`}} />;
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
/** 指示标注：从 (x0, y0) 画一条细线到 (x1, y1)，末端落下大写小字。 */
function Callout({from, to, label, p, color = PAPER, size = 30}: {from: [number, number]; to: [number, number]; label: string; p: number; color?: string; size?: number}) {
  if (p <= 0) return null;
  const k = out3(clamp(p * 1.4)), [x0, y0] = from, [x1, y1] = to;
  const left = x1 < x0;
  return <>
    <Svg><line x1={x0} y1={y0} x2={mix(x0, x1, k)} y2={mix(y0, y1, k)} stroke={color} strokeWidth={2} opacity={.85} />
      <circle cx={x0} cy={y0} r={6} fill="none" stroke={color} strokeWidth={2} opacity={.9 * sm(p * 4)} /></Svg>
    <div style={{position: 'absolute', left: left ? undefined : x1 + 12, right: left ? W - x1 + 12 : undefined, top: y1 - size * .7, fontFamily: SERIF, fontSize: size,
      letterSpacing: 4, textTransform: 'uppercase', color, whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,.95)', opacity: sm((p - .45) / .4)}}>{label}</div>
  </>;
}


// Brom Bones：迎着镜头狂奔的情敌。镜头低机位推近并随马蹄颠簸；念到名字，名牌像印章一样砸下；
// 念到 prankCue，远处跳进沟里的 Ichabod 被圈出来；念到 packCue，一阵落叶狂风扫过画面。
export const meta = {
  title: 'Brom Bones',
  params: {
    name: {label: 'Name', type: 'text', default: 'Brom Bones', maxLength: 32},
    role: {label: 'Role', type: 'text', default: 'rival, rider, prankster', maxLength: 48},
    nameCue: {label: 'Name appears on', type: 'text', default: 'Brom', maxLength: 24},
    prankCue: {label: 'Victim circled on', type: 'text', default: 'Ichabod', maxLength: 24},
    victim: {label: 'Victim label', type: 'text', default: 'Ichabod', maxLength: 24},
    packCue: {label: 'Leaf gust on', type: 'text', default: 'packing', maxLength: 24},
  },
};
export default function Brom(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const name = at(txt(props, 'nameCue'), start(0, .5)), prank = at(txt(props, 'prankCue'), start(1, 2.5)), pack = at(txt(props, 'packCue'), start(2, 5));
  const cam = camera(t / dur, [1.08, -60, 30], [1.26, -150, 70]);
  const bob = Math.abs(Math.sin(t * Math.PI * 2.4)) * 7;
  const slam = clamp((t - name) / .25), [ix, iy] = cam.pt(.205, .55);
  const ring = clamp((t - prank) / .5), gust = sm((t - pack + .1) / .4);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .01)}}>
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${bob}px) ${shake(t, name + .2, 14, .4)}`}}>
      <Plate asset={slot(props, 'brom')} frame={props.frame} cam={cam} />
      <Glow x={cam.pt(.34, .52)[0]} y={cam.pt(.34, .52)[1]} r={120 * cam.s} t={t} seed={6} strength={.45} />
    </div>
    <Leaves frame={props.frame} amount={.45 + .55 * gust} wind={-1.4 - 2.6 * gust} seed={14} n={90} size={1.2} fall={.6} />
    <Svg>
      {ring > 0 && <ellipse cx={ix} cy={iy} rx={120 * cam.s * out3(ring)} ry={150 * cam.s * out3(ring)} fill="none" stroke={AMBER} strokeWidth={4}
        strokeDasharray="14 10" opacity={.9 * (1 - sm((t - prank - 2.2) / .5))} />}
    </Svg>
    <Callout from={[ix + 90 * cam.s, iy - 120 * cam.s]} to={[ix + 260, iy - 300]} label={txt(props, 'victim')} p={clamp((t - prank - .2) / .6) * (1 - sm((t - prank - 2.2) / .5))} size={28} />
    <div style={{position: 'absolute', left: 110, top: 84, transform: `scale(${1 + .6 * (1 - out3(slam))}) rotate(${-3 + 3 * out3(slam)}deg)`, transformOrigin: '0 0', opacity: clamp(slam * 3)}}>
      <Card x={0} y={0} title={txt(props, 'name')} sub={txt(props, 'role')} p={slam > 0 ? 1 : 0} size={74} />
    </div>
    <Finish vignette={.5} />
  </div>;
}
