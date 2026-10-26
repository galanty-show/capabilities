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
const MEDIA: Record<string, string> = {"katrina":"release-assets/df6d1378b78d585d6087ae6d62c5e3ab396eeff51986118abf8e18e0c6d7892d.webp"};
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
/** 两个镜头之间按 w 过渡（甩镜头、切换焦点）。 */
function blendCam(a: {s: number; x: number; y: number}, b: {s: number; x: number; y: number}, w: number) {
  const s = mix(a.s, b.s, w), x = mix(a.x, b.x, w), y = mix(a.y, b.y, w);
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

// Katrina Van Tassel：镜头先停在门口的 Katrina，一条“目光虚线”从篱笆后的 Ichabod 牵到她身上（尾端一颗心）；
// 念到 turnCue 甩镜头到满仓的粮食，目光虚线跟着转过去；念到 pantryCue，火腿、奶酪、馅饼一处处亮晶晶。
export const meta = {
  title: 'Katrina Van Tassel',
  params: {
    name: {label: 'Name', type: 'text', default: 'Katrina Van Tassel', maxLength: 32},
    role: {label: 'Role', type: 'text', default: 'only daughter of Baltus Van Tassel', maxLength: 48},
    nameCue: {label: 'Name appears on', type: 'text', default: 'Katrina', maxLength: 24},
    turnCue: {label: 'Camera swings on', type: 'text', default: 'Well', maxLength: 24},
    pantryCue: {label: 'Food sparkles on', type: 'text', default: 'pantry', maxLength: 24},
  },
};
// 粮仓里会闪光的位置（底图相对坐标）。
const GOODS: Array<[number, number]> = [[.72, .24], [.79, .23], [.86, .21], [.76, .41], [.83, .42], [.8, .57], [.87, .55], [.6, .72], [.84, .73], [.94, .38]];
export default function Katrina(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const name = at(txt(props, 'nameCue'), start(0, .8)), turn = at(txt(props, 'turnCue'), start(2, 4)), pantry = at(txt(props, 'pantryCue'), turn + 1.6);
  const w = sm((t - turn + .05) / .5);
  const a = camera(t / Math.max(1, turn), [1.3, 285, 30], [1.36, 300, 40]), b = camera((t - turn) / Math.max(1, dur - turn), [1.3, -270, 40], [1.4, -370, 70]);
  const cam = blendCam(a, b, w);
  const whip = w > 0 && w < 1 ? Math.sin(Math.PI * w) : 0;
  const [ix, iy] = cam.pt(.49, .465), [kx, ky] = cam.pt(.17, .42), [px, py] = cam.pt(.78, .3);
  const gaze = clamp((t - name - .2) / .8);
  const tx = mix(kx, px, w), ty = mix(ky, py, w);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .1)}}>
    <Plate asset={slot(props, 'katrina')} frame={props.frame} cam={cam} />
    {whip > 0 && <Plate asset={slot(props, 'katrina')} frame={props.frame} cam={{s: cam.s, x: cam.x + 90 * whip, y: cam.y}} opacity={.4 * whip} />}
    <Glow x={cam.pt(.04, .34)[0]} y={cam.pt(.04, .34)[1]} r={180 * cam.s} t={t} seed={3} strength={.4} />
    <Glow x={cam.pt(.6, .36)[0]} y={cam.pt(.6, .36)[1]} r={160 * cam.s} t={t} seed={5} strength={.4} />
    <Svg>
      {gaze > 0 && <>
        <line x1={ix} y1={iy} x2={mix(ix, tx, gaze)} y2={mix(iy, ty, gaze)} stroke="#ffd9a0" strokeWidth={3} strokeDasharray="4 12" strokeLinecap="round" opacity={.8} />
        <g transform={`translate(${tx} ${ty - 20}) scale(${(w < .5 ? 1 - w * 2 : 0) * gaze})`} opacity={.9}>
          <path d="M0 14 C -26 -6, -14 -26, 0 -12 C 14 -26, 26 -6, 0 14Z" fill="#e0524a" /></g>
      </>}
      {GOODS.map(([fx, fy], i) => {
        const [x, y] = cam.pt(fx, fy);
        return <Sparkle key={i} x={x} y={y} size={34} p={clamp((t - pantry - i * .09) / .55)} />;
      })}
      {GOODS.map(([fx, fy], i) => {
        const [x, y] = cam.pt(fx, fy);
        return <Sparkle key={`b${i}`} x={x + 30} y={y - 20} size={22} p={clamp((t - pantry - .9 - i * .11) / .5)} />;
      })}
    </Svg>
    <Card x={1830} y={84} title={txt(props, 'name')} sub={txt(props, 'role')} p={clamp((t - name + .1) / .8) * (1 - w)} align="right" size={62} />
    <Finish vignette={.5} />
  </div>;
}
