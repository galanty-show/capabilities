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
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// 随包样片（S109）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"shadow":"release-assets/ad401e48fdc7de1fe0227b22a8a090e803eaa313a0e24b9eb04475f83f94a4f1.webp"};
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
/** 两个镜头之间按 w 过渡（甩镜头、切换焦点）。 */
function blendCam(a: {s: number; x: number; y: number}, b: {s: number; x: number; y: number}, w: number) {
  const s = mix(a.s, b.s, w), x = mix(a.x, b.x, w), y = mix(a.y, b.y, w);
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

/** 月亮：光晕 + 月面（淡淡的月海）。tint 可换成血月、霜月。 */
function Moon({x, y, r = 70, opacity = 1, glow = 1, tint = MOON, id = 'moon'}: {x: number; y: number; r?: number; opacity?: number; glow?: number; tint?: string; id?: string}) {
  return <g opacity={opacity}>
    <defs><radialGradient id={`${id}-halo`}><stop offset="0" stopColor={tint} stopOpacity={.55 * glow} /><stop offset=".25" stopColor={tint} stopOpacity={.18 * glow} />
      <stop offset="1" stopColor={tint} stopOpacity={0} /></radialGradient>
      <radialGradient id={`${id}-disc`} cx=".42" cy=".4"><stop offset="0" stopColor="#ffffff" /><stop offset=".7" stopColor={tint} /><stop offset="1" stopColor={tint} stopOpacity=".9" /></radialGradient></defs>
    <circle cx={x} cy={y} r={r * 7} fill={`url(#${id}-halo)`} />
    <circle cx={x} cy={y} r={r} fill={`url(#${id}-disc)`} />
    {[[-.3, -.2, .28], [.25, .1, .22], [-.05, .35, .18], [.3, -.32, .12]].map(([dx, dy, rr], i) =>
      <circle key={i} cx={x + dx * r} cy={y + dy * r} r={rr * r} fill="#8d8a7c" opacity={.16} />)}
  </g>;
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
/** 闪白：at 起 len 秒从 peak 衰减（南瓜爆裂、雷击）。 */
function Flash({t, at, len = .35, peak = 1, color = '255,248,232'}: {t: number; at: number; len?: number; peak?: number; color?: string}) {
  const d = t - at;
  if (d < 0 || d > len) return null;
  return <div style={{position: 'absolute', inset: 0, background: `rgba(${color},${peak * Math.pow(1 - d / len, 2)})`}} />;
}


// 并辔而行：一开始 Ichabod 身边只有一团浓雾；念到 shadowCue，雾一点点散开，高大的骑手显形；
// 念到 moonCue，云从月亮前滑开，月光洒下来；念到 headCue，镜头猛推到他空空的领口，冷光一闪。
export const meta = {
  title: 'A shadow beside him',
  params: {
    shadowCue: {label: 'Fog parts on', type: 'text', default: 'rider', maxLength: 24},
    moonCue: {label: 'Moon breaks through on', type: 'text', default: 'moon', maxLength: 24},
    headCue: {label: 'Push in on', type: 'text', default: 'head', maxLength: 24},
  },
};
export default function Shadow(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const shadow = at(txt(props, 'shadowCue'), start(0, 1)), moon = at(txt(props, 'moonCue'), start(1, 4)), head = at(txt(props, 'headCue'), start(2, 6));
  const push = out3((t - head + .05) / .5);
  const cam = blendCam(camera(t / dur, [1.06, 30, 10], [1.14, -20, 0]), {s: 1.75, x: -210, y: 330}, push);
  const reveal = sm((t - shadow) / 3.2), moonOut = sm((t - moon + .1) / 1.1);
  const [mx, my] = cam.pt(.35, .17), [hx, hy] = cam.pt(.565, .29);
  const bob = Math.sin(t * Math.PI * 1.3) * 3;
  const r = seeded(77), veil = Array.from({length: 16}, () => ({x: .48 + r() * .28, y: .25 + r() * .62, w: 110 + r() * 170, h: 70 + r() * 120, ph: r() * 6}));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .1)}}>
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${bob}px) ${shake(t, head, 10, .4)}`}}>
      <Plate asset={slot(props, 'shadow')} frame={props.frame} cam={cam} />
    </div>
    {/* 月光：云散之后的光束 + 月晕 */}
    <Svg>
      <g opacity={.5 * moonOut} style={{mixBlendMode: 'screen'}}>
        {[0, 1, 2, 3, 4].map(i => {
          const a = 1.0 + i * .22 + Math.sin(t * .3 + i) * .03, len = 1500;
          return <polygon key={i} points={`${mx},${my} ${mx + Math.cos(a - .04) * len},${my + Math.sin(a - .04) * len} ${mx + Math.cos(a + .04) * len},${my + Math.sin(a + .04) * len}`}
            fill="#c9d7ea" opacity={.12 + .06 * (i % 2)} />;
        })}
      </g>
      <Clouds t={t} seed={13} count={5} y={my - 120} h={160} speed={10} color="14,18,28" opacity={.95 * (1 - moonOut)} id="sc1" />
    </Svg>
    <Glow x={mx} y={my} r={300 * cam.s} t={t} seed={1} color="220,230,245" strength={.2 + .4 * moonOut} />
    {/* 骑手身前的雾幕：随 reveal 变薄 */}
    <Svg><defs><radialGradient id="veil"><stop offset="0" stopColor="#3a4454" stopOpacity=".95" /><stop offset=".55" stopColor="#2c3440" stopOpacity=".7" />
      <stop offset="1" stopColor="#2c3440" stopOpacity="0" /></radialGradient></defs>
      <g opacity={.92 * (1 - reveal * .85)}>{veil.map((v, i) => {
        const [x, y] = cam.pt(v.x + Math.sin(t * .35 + v.ph) * .015, v.y);
        return <ellipse key={i} cx={x + (t - shadow) * 18 * reveal} cy={y} rx={v.w * cam.s * (1 + .4 * reveal)} ry={v.h * cam.s} fill="url(#veil)" />;
      })}</g>
    </Svg>
    <Fog t={t} amount={.55} y0={660} y1={1080} layers={3} speed={20} tint="125,140,162" seed={8} id="sf" />
    <Glow x={hx} y={hy} r={160 * cam.s} t={t} seed={2} color="190,215,255" strength={.45 * win(t, head, head + 1.6, .2)} />
    <Flash t={t} at={head} len={.35} peak={.35} color="210,225,255" />
    <Leaves frame={props.frame} amount={.3} wind={.6} seed={23} n={30} />
    <Finish vignette={.72} />
  </div>;
}
