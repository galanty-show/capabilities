import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// 随包样片（S109）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"morning":"release-assets/806b5d0f79b8f833515e265a38683b19efbc834020e3caf65c8af8ed77d598f6.webp"};
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
/** 四角闪光（贪吃的眼睛看见的“亮晶晶”）。 */
function Sparkle({x, y, size, p}: {x: number; y: number; size: number; p: number}) {
  if (p <= 0 || p >= 1) return null;
  const k = Math.sin(Math.PI * p), r = size * k;
  return <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(p * 90).toFixed(1)})`} opacity={k}>
    <circle r={r * 1.6} fill="#ffd27a" opacity={.25} />
    <path d={`M0 ${-r} Q${r * .12} ${-r * .12} ${r} 0 Q${r * .12} ${r * .12} 0 ${r} Q${-r * .12} ${r * .12} ${-r} 0 Q${-r * .12} ${-r * .12} 0 ${-r}Z`} fill="#fff4cf" />
  </g>;
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
/** 闪白：at 起 len 秒从 peak 衰减（南瓜爆裂、雷击）。 */
function Flash({t, at, len = .35, peak = 1, color = '255,248,232'}: {t: number; at: number; len?: number; peak?: number; color?: string}) {
  const d = t - at;
  if (d < 0 || d > len) return null;
  return <div style={{position: 'absolute', inset: 0, background: `rgba(${color},${peak * Math.pow(1 - d / len, 2)})`}} />;
}

/** 代码画的南瓜灯：棱瓣、瓜蒂、刻出的脸透出烛光；carved=false 是没刻的南瓜。 */
function Pumpkin({x, y, r, t, rot = 0, light = 1, carved = true, opacity = 1, id = 'pk'}:
  {x: number; y: number; r: number; t: number; rot?: number; light?: number; carved?: boolean; opacity?: number; id?: string}) {
  const f = flicker(t, 5) * light;
  return <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`} opacity={opacity}>
    <defs><radialGradient id={`${id}-skin`} cx=".4" cy=".35"><stop offset="0" stopColor="#ffb347" /><stop offset=".55" stopColor="#e2701c" /><stop offset="1" stopColor="#8a3409" /></radialGradient>
      <radialGradient id={`${id}-halo`}><stop offset="0" stopColor="#ffb45a" stopOpacity={.55 * f} /><stop offset="1" stopColor="#ff8a2a" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-fire`}><stop offset="0" stopColor="#fff3b0" /><stop offset=".6" stopColor="#ffc244" /><stop offset="1" stopColor="#ff7a18" /></radialGradient></defs>
    {light > 0 && <circle r={r * 3.2} fill={`url(#${id}-halo)`} />}
    {[[-.62, .42], [.62, .42], [-.33, .55], [.33, .55], [0, .6]].map(([dx, rx], i) =>
      <ellipse key={i} cx={dx * r} cy={0} rx={rx * r} ry={r * .86} fill={`url(#${id}-skin)`} stroke="#6b2806" strokeWidth={r * .025} />)}
    <path d={`M${-r * .06} ${-r * .8} q${r * .02} ${-r * .3} ${r * .2} ${-r * .38} l${r * .06} ${r * .08} q${-r * .12} ${r * .1} ${-r * .12} ${r * .32} z`} fill="#4a5a22" />
    {carved && <g fill={`url(#${id}-fire)`} opacity={.55 + .45 * clamp(f)}>
      <path d={`M${-r * .5} ${-r * .12} l${r * .18} ${-r * .3} l${r * .18} ${r * .3} z`} />
      <path d={`M${r * .14} ${-r * .12} l${r * .18} ${-r * .3} l${r * .18} ${r * .3} z`} />
      <path d={`M${-r * .07} ${r * .02} l${r * .07} ${-r * .14} l${r * .07} ${r * .14} z`} />
      <path d={`M${-r * .56} ${r * .2} q${r * .56} ${r * .5} ${r * 1.12} 0 l${-r * .12} ${r * .1} l${-r * .1} ${-r * .07} l${-r * .12} ${r * .12} l${-r * .12} ${-r * .1}
        l${-r * .12} ${r * .12} l${-r * .12} ${-r * .1} l${-r * .12} ${r * .12} l${-r * .1} ${-r * .1} z`} />
    </g>}
  </g>;
}

// 第二天清晨：雾慢慢抬升、变薄，天光斜照。镜头从桥头全景推向泥地上的帽子与摔碎的南瓜；
// 念到 hatCue 帽子边亮起一圈冷光；念到 pumpkinCue，一下橙色的“回闪”与碎片闪光（昨夜那一击的回声）；
// 念到 goneCue，几只乌鸦从右边的树上飞走。
export const meta = {
  title: 'Next morning',
  params: {
    hatCue: {label: 'Hat highlighted on', type: 'text', default: 'hat', maxLength: 24},
    pumpkinCue: {label: 'Pumpkin flash on', type: 'text', default: 'pumpkin', maxLength: 24},
    goneCue: {label: 'Crows fly off on', type: 'text', default: 'never', maxLength: 24},
  },
};
/** 一只飞走的乌鸦：两段折线翅膀上下扑。 */
function Crow({x, y, s, t}: {x: number; y: number; s: number; t: number}) {
  const flap = Math.sin(t * 16) * .9;
  return <path d={`M${x - 26 * s} ${y - 14 * s * flap} Q${x - 10 * s} ${y - 4 * s} ${x} ${y} Q${x + 10 * s} ${y - 4 * s} ${x + 26 * s} ${y - 14 * s * flap}`}
    fill="none" stroke="#141416" strokeWidth={5 * s} strokeLinecap="round" strokeLinejoin="round" />;
}
export default function Morning(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const hat = at(txt(props, 'hatCue'), start(0, 2)), pumpkin = at(txt(props, 'pumpkinCue'), start(1, 5)), gone = at(txt(props, 'goneCue'), start(2, 8));
  const cam = camera(t / dur, [1.03, 0, 0], [1.34, 320, -175]);
  const [hx, hy] = cam.pt(.185, .775), [kx, ky] = cam.pt(.31, .755);
  const lift = t / dur, ring = win(t, hat, hat + 2.4, .3);
  const r = seeded(3), crows = Array.from({length: 4}, () => ({x: .74 + r() * .12, y: .2 + r() * .1, vx: 120 + r() * 160, vy: -90 - r() * 120, s: .7 + r() * .5, d: r() * .5}));
  return <div style={{position: 'absolute', inset: 0, background: '#9aa3ab', overflow: 'hidden', opacity: fadeEdges(t, dur, .5, .01)}}>
    <Plate asset={slot(props, 'morning')} frame={props.frame} cam={cam} />
    <Svg><g style={{mixBlendMode: 'screen'}} opacity={.35}>
      {[0, 1, 2, 3].map(i => <polygon key={i} points={`${-200 + i * 260},-40 ${60 + i * 260},-40 ${700 + i * 330},${H} ${360 + i * 330},${H}`} fill="#fff6e0"
        opacity={.08 + .05 * Math.sin(t * .6 + i)} />)}
    </g></Svg>
    <Fog t={t} amount={.95 - .55 * lift} y0={mix(420, 160, lift)} y1={mix(1080, 820, lift)} layers={3} speed={16} tint="215,220,226" seed={11} id="mf" />
    <Svg>
      {ring > 0 && <ellipse cx={hx} cy={hy} rx={110 * cam.s} ry={50 * cam.s} fill="none" stroke="#e8f0ff" strokeWidth={3} opacity={.7 * ring} />}
      {[[-.02, -.01], [.03, .015], [.0, .03], [.05, -.02], [-.04, .02]].map(([dx, dy], i) => {
        const [x, y] = cam.pt(.31 + dx, .76 + dy);
        return <Sparkle key={i} x={x} y={y} size={20} p={clamp((t - pumpkin - .15 - i * .1) / .6)} />;
      })}
      {crows.map((c, i) => {
        const d = t - gone - c.d;
        if (d < 0) return null;
        const [x0, y0] = cam.pt(c.x, c.y);
        return <Crow key={i} x={x0 + c.vx * d} y={y0 + c.vy * d} s={c.s * cam.s} t={t + i} />;
      })}
    </Svg>
    <Glow x={kx} y={ky} r={260 * cam.s} t={t} seed={9} color="255,140,50" strength={.8 * Math.max(0, 1 - Math.abs(t - pumpkin - .1) / .35)} />
    <Flash t={t} at={pumpkin} len={.25} peak={.22} color="255,170,90" />
    <div style={{position: 'absolute', inset: 0, background: `rgba(20,24,30,${.25 * sm((t - gone) / 1.5)})`}} />
    <Finish vignette={.45} />
  </div>;
}
