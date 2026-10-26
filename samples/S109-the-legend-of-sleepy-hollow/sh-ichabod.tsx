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
const MEDIA: Record<string, string> = {"ichabod":"release-assets/8b1678a010186b1123ac30cb142b9b236842dab22f1d71e06b1a8e5169fde404.webp"};
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
/** 列表参数（文字或 {label, cue} 对象）。 */
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
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


// Ichabod Crane：学堂里捧着巫术书的瘦高先生。镜头推近；念到名字落名牌；念到每个特点，一条细线从身上引出标注
// （tags 的 cue 是卡点词）；念到 ghost，书页里升起一缕幽光；烛火一直在跳。
export const meta = {
  title: 'Ichabod Crane',
  params: {
    name: {label: 'Name', type: 'text', default: 'Ichabod Crane', maxLength: 32},
    role: {label: 'Role', type: 'text', default: 'the schoolmaster', maxLength: 40},
    nameCue: {label: 'Name appears on', type: 'text', default: 'Ichabod', maxLength: 24},
    tags: {label: 'Callouts', type: 'list', max: 3, maxLength: 30, item: [{key: 'label', label: 'Label'}, {key: 'cue', label: 'On word'}],
      default: [{label: 'Lanky', cue: 'scarecrow'}, {label: 'Always hungry', cue: 'hungry'}, {label: 'Believes every ghost story', cue: 'ghost'}]},
  },
};
export default function Ichabod(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const cam = camera(t / dur, [1.04, 0, 0], [1.22, -190, 40]);
  const name = at(txt(props, 'nameCue'), start(0, 1));
  const tags = list<{label: string; cue: string}>(props, 'tags');
  // 标注从身上的点（头、肚子、书）引到画面左侧的空处。
  const anchors: Array<[number, number]> = [[.69, .2], [.62, .5], [.74, .5]];
  const ends: Array<[number, number]> = [[880, 330], [800, 520], [840, 700]];
  const ghost = at(tags[2]?.cue ?? 'ghost', start(3, 7));
  const [bx, by] = cam.pt(.75, .44), [fx, fy] = cam.pt(.938, .6);
  const wisp = sm((t - ghost) / 1.2);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .1)}}>
    <Plate asset={slot(props, 'ichabod')} frame={props.frame} cam={cam} />
    <Glow x={fx} y={fy} r={260 * cam.s} t={t} seed={2} strength={.5} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(4,5,8,.72) 0%, rgba(4,5,8,.35) 38%, rgba(0,0,0,0) 55%)'}} />
    {wisp > 0 && <Svg>
      {[0, 1, 2].map(i => {
        const k = wisp, sway = Math.sin(t * 1.8 + i * 2) * 30 * k;
        return <path key={i} d={`M${bx + (i - 1) * 40} ${by} C ${bx - 80 + sway} ${by - 120 * k}, ${bx + 90 - sway} ${by - 220 * k}, ${bx + (i - 1) * 60 + sway} ${by - 330 * k}`}
          fill="none" stroke="#bfe8dc" strokeWidth={10 - i * 2} strokeLinecap="round" opacity={.35 * k * (1 - i * .2)} />;
      })}
    </Svg>}
    {wisp > 0 && <Motes frame={props.frame} kind="wisp" amount={wisp} n={14} seed={8} x0={bx - 200} x1={bx + 200} y0={by - 380} y1={by} />}
    {tags.slice(0, 3).map((tag, i) => {
      const cueAt = at(tag?.cue ?? '', start(i + 1, 2 + i * 1.5));
      return <Callout key={i} from={cam.pt(...anchors[i])} to={ends[i]} label={tag?.label ?? ''} p={clamp((t - cueAt + .1) / .7)} />;
    })}
    <Card x={110} y={84} title={txt(props, 'name')} sub={txt(props, 'role')} p={clamp((t - name + .1) / .8)} size={70} />
    <Finish vignette={.55} />
  </div>;
}
