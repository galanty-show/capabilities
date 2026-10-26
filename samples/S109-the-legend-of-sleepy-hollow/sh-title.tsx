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
/** 闪电：at 起 0.45 秒的双闪 + 折线电光。 */
function Lightning({t, at, x = 1200, strength = 1}: {t: number; at: number; x?: number; strength?: number}) {
  const d = t - at;
  if (d < 0 || d > .45) return null;
  const flash = (d < .08 ? 1 : d < .16 ? .25 : d < .24 ? .8 : Math.max(0, 1 - (d - .24) / .2) * .5) * strength;
  const r = seeded(Math.round(at * 100)), pts: string[] = [];
  let px = x, py = 0;
  while (py < 620) {pts.push(`${px},${py}`); px += (r() - .5) * 120; py += 40 + r() * 60;}
  return <>
    <div style={{position: 'absolute', inset: 0, background: `rgba(215,228,255,${.5 * flash})`, mixBlendMode: 'screen'}} />
    <Svg><polyline points={pts.join(' ')} fill="none" stroke="#f4f7ff" strokeWidth={4} opacity={flash} /></Svg>
  </>;
}
/** 枯树剪影：种子决定枝杈（递归分叉、逐级变细），返回按粗细分组的折线路径，缓存后每帧复用。 */
const TREE_CACHE = new Map<string, Array<{w: number; d: string}>>();
function treePaths(seed: number, height: number) {
  const key = `${seed}:${height}`;
  const hit = TREE_CACHE.get(key);
  if (hit) return hit;
  const r = seeded(seed), groups: string[][] = Array.from({length: 7}, () => []);
  const grow = (x: number, y: number, angle: number, len: number, depth: number) => {
    if (depth > 6 || len < 6) return;
    let px = x, py = y, a = angle;
    const steps = 3, parts = [`M${x.toFixed(0)} ${y.toFixed(0)}`];
    for (let i = 0; i < steps; i++) {a += (r() - .5) * .5; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; parts.push(`L${px.toFixed(0)} ${py.toFixed(0)}`);}
    groups[depth].push(parts.join(''));
    const kids = depth < 2 ? 2 + (r() > .5 ? 1 : 0) : 2;
    for (let k = 0; k < kids; k++) grow(px, py, a + (k - (kids - 1) / 2) * (.45 + r() * .5) + (r() - .5) * .3, len * (.64 + r() * .16), depth + 1);
  };
  grow(0, 0, -Math.PI / 2 + (r() - .5) * .2, height * .34, 0);
  const result = groups.map((g, i) => ({w: height * .045 * Math.pow(.62, i), d: g.join('')})).filter(g => g.d);
  TREE_CACHE.set(key, result);
  return result;
}
/** 一排枯树（视差层）：按 speed 向左滚动，循环铺满。 */
function TreeRow({t, speed = 60, y = 1000, seed = 11, count = 7, height = 520, color = '#05070b', opacity = 1, spread = 1}:
  {t: number; speed?: number; y?: number; seed?: number; count?: number; height?: number; color?: string; opacity?: number; spread?: number}) {
  const r = seeded(seed), span = W * 1.5 * spread;
  const trees = Array.from({length: count}, (_, i) => ({x: (i + r() * .6) * span / count, h: height * (.7 + .5 * r()), s: Math.floor(r() * 1000)}));
  return <g opacity={opacity}>{trees.map((tr, i) => {
    const x = ((((tr.x - speed * t) % span) + span) % span) - W * .2;
    return <g key={i} transform={`translate(${x.toFixed(1)} ${y})`}>
      {treePaths(seed * 100 + tr.s, Math.round(tr.h)).map((g, k) => <path key={k} d={g.d} fill="none" stroke={color} strokeWidth={g.w} strokeLinecap="round" strokeLinejoin="round" />)}
    </g>;
  })}</g>;
}
/** 起伏的地平线剪影（噪声山脊），填到画面底边。 */
function Ridge({y = 820, amp = 60, seed = 4, color = '#04060a', rough = 1, opacity = 1, shift = 0}: {y?: number; amp?: number; seed?: number; color?: string; rough?: number; opacity?: number; shift?: number}) {
  const n = noise2d(seed), pts: string[] = [];
  for (let x = -40; x <= W + 40; x += 24) pts.push(`${x},${(y + n((x + shift) / 520 * rough, 0) * amp + n((x + shift) / 140 * rough, 3) * amp * .18).toFixed(1)}`);
  return <polygon points={`-40,${H + 10} ${pts.join(' ')} ${W + 40},${H + 10}`} fill={color} opacity={opacity} />;
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

// 片名：整幕纯代码绘制——夜空、大月亮、流云、山脊与枯树剪影、地面流雾、南瓜灯；一道闪电照亮后片名逐字亮起。
export const meta = {
  title: 'Title',
  params: {
    kicker: {label: 'Kicker', type: 'text', default: 'The Legend of', maxLength: 40},
    title: {label: 'Title', type: 'text', default: 'Sleepy Hollow', maxLength: 32},
    subtitle: {label: 'Subtitle', type: 'text', default: 'after Washington Irving · 1820', maxLength: 60},
  },
};
export default function Title(props: SceneInput) {
  const {t, dur} = cues(props);
  const title = txt(props, 'title'), chars = Array.from(title);
  const reveal = (i: number) => sm((t - .45 - i * .07) / .35);
  const f = flicker(t, 3);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .01),
    background: 'linear-gradient(180deg, #0b1424 0%, #0a1220 45%, #06080d 100%)'}}>
    <Svg>
      <Moon x={1450} y={300} r={118} glow={1.1} id="tm" />
      <Clouds t={t + 6} seed={8} count={6} y={150} h={260} speed={40} color="14,20,32" opacity={.8} light={.7} id="tc" />
      <Ridge y={800} amp={70} seed={6} color="#0b111b" shift={t * 10} />
      <TreeRow t={t} speed={14} y={900} seed={31} count={6} height={560} color="#070a10" />
      <Ridge y={930} amp={40} seed={9} color="#05070b" shift={t * 22} />
      <TreeRow t={t} speed={30} y={1060} seed={47} count={4} height={820} color="#030407" spread={1.2} />
    </Svg>
    <Fog t={t} amount={.6} y0={820} y1={1080} layers={3} speed={40} tint="120,135,160" seed={4} id="tf" />
    <Svg><Pumpkin x={420} y={915} r={104} t={t} rot={-4} id="tp" /></Svg>
    <Glow x={420} y={915} r={320} t={t} seed={4} color="255,150,60" strength={.45} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SERIF, color: PAPER, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>
      <div style={{fontSize: 40, letterSpacing: 16, textTransform: 'uppercase', opacity: sm((t - .2) / .5) * .9}}>{txt(props, 'kicker')}</div>
      <div style={{fontSize: 168, lineHeight: 1.1, marginTop: 6, letterSpacing: 4}}>
        {chars.map((ch, i) => <span key={i} style={{opacity: reveal(i) * (.85 + .15 * f), color: i % 2 ? PAPER : '#f4ead2'}}>{ch}</span>)}
      </div>
      <div style={{width: 520 * out3((t - 1.4) / .8), height: 2, background: AMBER, margin: '14px auto 18px'}} />
      <div style={{fontSize: 34, letterSpacing: 5, fontStyle: 'italic', opacity: sm((t - 1.8) / .5) * .85}}>{txt(props, 'subtitle')}</div>
    </div>
    <Lightning t={t} at={.12} x={1180} strength={.9} />
    <Finish vignette={.75} />
  </div>;
}
