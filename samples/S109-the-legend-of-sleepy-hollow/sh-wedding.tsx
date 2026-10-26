import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const INK = '#07090d', PAPER = '#efe6d2', AMBER = '#e8862a', EMBER = '#ffb45a', MOON = '#ebe8d8', FROST = '#cfdbe6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// 随包样片（S109）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"wedding":"release-assets/af6f0dc444a659da6f7d89a0ee73ec80a876a77ad784beeba670b793059c0517.webp"};
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

// 结局：Brom 与 Katrina 的婚宴，烛火摇曳。镜头慢慢推向 Brom；念到 laughCue，镜头跟着他的笑声颠三下；
// 念到 pumpkinCue，镜头一下甩到桌上的南瓜（南瓜亮一下），再回到 Brom，眼角一点闪光——像在眨眼。
export const meta = {
  title: 'Brom laughs',
  params: {
    laughCue: {label: 'Laugh bounce on', type: 'text', default: 'laughed', maxLength: 24},
    pumpkinCue: {label: 'Snap to the pumpkin on', type: 'text', default: 'pumpkin', maxLength: 24},
  },
};
const CANDLES: Array<[number, number, number]> = [[.265, .49, 90], [.3, .465, 80], [.855, .6, 90], [.92, .09, 120], [.94, .78, 110], [.22, .07, 70], [.41, .11, 60], [.3, .37, 200]];
export default function Wedding(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const laugh = at(txt(props, 'laughCue'), start(1, 4)), pumpkin = at(txt(props, 'pumpkinCue'), start(2, 8));
  const snap = win(t, pumpkin - .1, pumpkin + .75, .18);
  const base = camera(t / dur, [1.05, 0, 0], [1.28, -250, 150]);
  const cam = blendCam(base, {s: 1.7, x: (0.5 - .36) * W * 1.7, y: (0.5 - .66) * H * 1.7 + 60}, snap);
  const d = t - laugh, bounce = d > 0 && d < 1.2 ? Math.abs(Math.sin(d * Math.PI * 2.5)) * 12 * (1 - d / 1.2) : 0;
  const [ex, ey] = cam.pt(.622, .255), wink = clamp((t - pumpkin - .9) / .6);
  const [px, py] = cam.pt(.36, .67);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .01, .01)}}>
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${-bounce}px)`}}>
      <Plate asset={slot(props, 'wedding')} frame={props.frame} cam={cam} />
      {CANDLES.map(([x, y, r], i) => {
        const [gx, gy] = cam.pt(x, y);
        return <Glow key={i} x={gx} y={gy} r={r * cam.s} t={t} seed={20 + i} strength={.45} />;
      })}
      <Glow x={px} y={py} r={320 * cam.s} t={t} seed={30} color="255,140,40" strength={.75 * snap + .1} />
    </div>
    <Svg><Sparkle x={ex} y={ey - bounce} size={36} p={wink} /></Svg>
    <Motes frame={props.frame} kind="ember" amount={.25} n={60} seed={41} />
    <Finish vignette={.5} />
  </div>;
}
