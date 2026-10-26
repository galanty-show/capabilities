import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const INK = '#07090d', PAPER = '#efe6d2', AMBER = '#e8862a', EMBER = '#ffb45a', MOON = '#ebe8d8', FROST = '#cfdbe6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const MEDIA: Record<string, string> = {"ride":"release-assets/af20a9a77fd8fc0c6cccbf0095d4c4569bbe05dc07f9066b0235b312610e6c7b.webp"};
// 矢量剪影（trace.py 从 Gemini 黑剪影描出，高 1000、底边居中锚点）：horseman 无头骑士、ichabod 伊卡博德、throw 立镫掷物。
/** 素材：先用素材槽（制作任务，高清图），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

// 画面文字都是各幕 meta.params 声明的内容参数（默认值是英文原文），换语言只换参数、不换代码。
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

/** 夜云：一缕缕横向漂移的云（SVG 椭圆 + 径向渐变），可以从月亮前面飘过。 */
function Clouds({t, seed = 1, count = 8, y = 40, h = 360, speed = 14, color = '24,30,44', opacity = .85, light = 0, id = 'cl'}:
  {t: number; seed?: number; count?: number; y?: number; h?: number; speed?: number; color?: string; opacity?: number; light?: number; id?: string}) {
  const r = seeded(seed), span = W * 1.6;
  const clouds = Array.from({length: count}, () => ({x: r() * span, y: y + r() * h, w: 360 + r() * 700, hh: 36 + r() * 70, v: speed * (.6 + .8 * r()), a: .45 + .5 * r()}));
  return <g opacity={opacity}>
    <defs><radialGradient id={`${id}-g`}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity="1" /><stop offset=".6" stopColor={`rgb(${color})`} stopOpacity=".55" />
      <stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-l`}><stop offset="0" stopColor="#b9c6d8" stopOpacity=".5" /><stop offset="1" stopColor="#b9c6d8" stopOpacity="0" /></radialGradient></defs>
    {clouds.map((c, i) => {
      const x = (((c.x + c.v * t) % span) + span) % span - W * .3;
      return <g key={i} opacity={c.a}>
        {[[0, 0, 1, 1], [-.32, .25, .6, .8], [.3, .18, .55, .9], [.05, -.3, .5, .7]].map(([dx, dy, sw, sh], k) =>
          <ellipse key={k} cx={x + dx * c.w} cy={c.y + dy * c.hh} rx={c.w * .5 * sw} ry={c.hh * sh} fill={`url(#${id}-g)`} />)}
        {light > 0 && <ellipse cx={x} cy={c.y - c.hh * .45} rx={c.w * .42} ry={c.hh * .35} fill={`url(#${id}-l)`} opacity={light} />}
      </g>;
    })}
  </g>;
}
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

// 夜归：老马 Gunpowder 驮着 Ichabod 走在月下林间路。镜头跟着他慢慢横移；流雾、落叶、手里提灯一闪一闪。
// 念到 quietCue：落叶停了、雾也慢下来，云把月亮遮住，右边树杈里亮起一对眨眼的猫头鹰眼睛。
export const meta = {
  title: 'Riding home',
  params: {
    quietCue: {label: 'Woods go quiet on', type: 'text', default: 'quiet', maxLength: 24},
    eyes: {label: 'Owl eyes in the tree', type: 'boolean', default: true},
  },
};
export default function Ride(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const quiet = at(txt(props, 'quietCue'), start(2, dur - 2.5));
  const q = sm((t - quiet + .2) / 1.2);
  const cam = camera(t / dur, [1.08, 70, 0], [1.18, -90, -14]);
  const [mx, my] = cam.pt(.34, .17), [lx, ly] = cam.pt(.493, .512), [ox, oy] = cam.pt(.83, .29);
  const blink = (Math.floor((t - quiet) * 10) % 23 === 0) ? .1 : 1;
  const eyes = props.params.eyes !== false ? sm((t - quiet - .6) / .5) : 0;
  const tf = t < quiet ? t : quiet + (t - quiet) * .35;  // 静下来后，雾与云的流速放慢到三分之一
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .01, .1)}}>
    <Plate asset={slot(props, 'ride')} frame={props.frame} cam={cam} />
    <Glow x={mx} y={my} r={280 * cam.s} t={t} seed={1} color="210,222,240" strength={.32 * (1 - .75 * q)} />
    <Svg><Clouds t={tf + 4} seed={5} count={7} y={60} h={240} speed={22} color="16,22,34" opacity={.55 + .4 * q} light={.5 * (1 - q)} id="dc" /></Svg>
    <div style={{position: 'absolute', inset: 0, background: `rgba(2,4,10,${.32 * q})`}} />
    <Glow x={lx} y={ly} r={150 * cam.s} t={t} seed={4} strength={.6} />
    <Fog t={tf} amount={.55} y0={660} y1={1080} layers={3} speed={26} tint="125,140,162" seed={6} id="df" />
    <Leaves frame={props.frame} amount={.5 * (1 - q)} wind={.9} seed={17} n={40} />
    {eyes > 0 && <Svg><g opacity={eyes}>
      {[-16, 16].map(dx => <ellipse key={dx} cx={ox + dx} cy={oy} rx={7} ry={7 * blink} fill="#ffd36a" />)}
      <circle cx={ox} cy={oy} r={60} fill="#ffd36a" opacity={.08} />
    </g></Svg>}
    <Finish vignette={.7} />
  </div>;
}
