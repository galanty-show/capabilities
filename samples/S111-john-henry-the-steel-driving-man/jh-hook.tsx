import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"tunnel":"release-assets/77370c40db6cbe4729b289f5e26d8686ab8e3104b5e8f6dfabc8e38f45265748.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
const CONDENSED = '"DIN Condensed", "Oswald", "Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .15, outS = .15) => Math.min(inS > 0 ? sm(t / inS) : 1, outS > 0 ? sm((dur - t) / outS) : 1);

/** 底图：先用分镜素材槽（若有），再用内联底图。 */
function plate(props: SceneInput, name: string): any {
  return (props.assets as any)[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value as T[] : (meta as any).params?.[key]?.default ?? [];
}
/** 句子与卡点：cue 找不到词时退回给定秒数，保证改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}
/** 节拍表（幕内秒）：props.beats 优先（music_build.py 写入），缺了用兜底。 */
function beatList(props: SceneInput, fallback: number[]): number[] {
  const value = props.params.beats;
  const parsed = Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : [];
  return parsed.length ? parsed : fallback;
}
/** 最近一次节拍：经过的秒数 d 与序号 i（还没到第一拍时 d = Infinity、i = -1）。 */
function lastBeat(t: number, beats: number[]) {
  let i = -1;
  for (let k = 0; k < beats.length; k++) if (beats[k] <= t + 1e-6) i = k;
  return i < 0 ? {d: Infinity, i} : {d: t - beats[i], i};
}
/** 撞击包络：节拍后 len 秒内由 1 衰减到 0。 */
const hit = (d: number, len = .35) => d >= 0 && d < len ? Math.pow(1 - d / len, 2) : 0;
/** 镜头震动：节拍后衰减。 */
function shakeAt(t: number, beats: number[], power = 10, len = .3) {
  const {d, i} = lastBeat(t, beats);
  if (!(d < len)) return 'none';
  const k = (1 - d / len) * power, r = seeded(9100 + i)();
  return `translate(${Math.sin(d * 95 + r * 6) * k}px, ${Math.cos(d * 80 + r * 3) * k * .8}px)`;
}

/** 满幅底图 + 运镜（scale / 位移随 p 缓动）。不在运行时调色：调色离线做（荔枝经验，避免两次渲染不一致）。 */
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

/** 火星：每个节拍从 (x, y) 迸出一簇，带重力、拖尾与冷却变色；纯函数，同帧同图。 */
function Sparks({t, beats, x, y, n = 44, spread = 1.4, dir = -Math.PI / 2, speed = 1, life = .75, seed = 3, scale = 1}:
  {t: number; beats: number[]; x: number; y: number; n?: number; spread?: number; dir?: number; speed?: number; life?: number; seed?: number; scale?: number}) {
  const ref = useCanvas(Math.round(t * 1000), (c) => {
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    beats.forEach((b, bi) => {
      const age = t - b;
      if (age < 0 || age > life) return;
      const r = seeded(seed * 131 + bi * 17);
      for (let i = 0; i < n; i++) {
        const a = dir + (r() - .5) * spread * 2, v = (500 + 1300 * r()) * speed * scale, l = life * (.45 + .55 * r());
        if (age > l) {r(); continue;}
        const k = age / l, drag = Math.exp(-age * 2.2);
        const px = (tt: number) => x + Math.cos(a) * v * (1 - Math.exp(-tt * 2.2)) / 2.2;
        const py = (tt: number) => y + Math.sin(a) * v * (1 - Math.exp(-tt * 2.2)) / 2.2 + 900 * scale * tt * tt;
        const t0 = Math.max(0, age - .035);
        const hot = 1 - k, w = (1.2 + 2.6 * r()) * scale * (.5 + .5 * drag);
        c.strokeStyle = `rgba(255,${Math.round(150 + 105 * hot)},${Math.round(60 + 160 * hot * hot)},${(1 - k * k) * .95})`;
        c.lineWidth = w;
        c.beginPath(); c.moveTo(px(t0), py(t0)); c.lineTo(px(age), py(age)); c.stroke();
      }
      // 撞击点白热闪光
      if (age < .12) {
        const g = c.createRadialGradient(x, y, 0, x, y, 120 * scale);
        g.addColorStop(0, `rgba(255,250,225,${.9 * (1 - age / .12)})`); g.addColorStop(1, 'rgba(255,170,60,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 120 * scale, 0, 6.283); c.fill();
      }
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}} />;
}

/** 浮尘：慢慢漂的颗粒，落在光束里的更亮（beams 为光源 x 列表）；freeze 给定时刻则定格不动。 */
function Dust({t, n = 180, beams = [] as number[], seed = 5, opacity = 1, rise = 1, color = '255,226,170'}:
  {t: number; n?: number; beams?: number[]; seed?: number; opacity?: number; rise?: number; color?: string}) {
  const ref = useCanvas(Math.round(t * 1000), (c) => {
    const r = seeded(seed);
    for (let i = 0; i < n; i++) {
      const bx = r() * W, by = r() * H, s = r(), ph = r() * 6.283;
      const x = ((bx + Math.sin(t * .35 + ph) * 40 + t * (8 + 14 * s)) % W + W) % W;
      const y = ((by - t * (10 + 16 * s) * rise + Math.cos(t * .5 + ph) * 18) % H + H) % H;
      let lit = .25;
      for (const b of beams) lit = Math.max(lit, Math.exp(-Math.pow((x - b) / 260, 2)));
      c.fillStyle = `rgba(${color},${(.12 + .55 * lit) * (.4 + .6 * s)})`;
      c.beginPath(); c.arc(x, y, .8 + 2.2 * s, 0, 6.283); c.fill();
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}

/** 汽灯光：灯点光晕 + 向下的光锥，按 seed 轻微闪烁。 */
function Lamp({t, x, y, power = 1, cone = 1, seed = 1, angle = 0}: {t: number; x: number; y: number; power?: number; cone?: number; seed?: number; angle?: number}) {
  const flick = .86 + .1 * Math.sin(t * 11 + seed * 2) * Math.sin(t * 6.3 + seed) + .04 * Math.sin(t * 23 + seed * 5);
  const a = power * flick, id = `lg${seed}`;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none'}}>
    <defs>
      <radialGradient id={`${id}h`}><stop offset="0" stopColor="#fff4d0" stopOpacity={.95 * a} /><stop offset=".25" stopColor="#ffc46a" stopOpacity={.45 * a} /><stop offset="1" stopColor="#ff9a30" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd28a" stopOpacity={.38 * a * cone} /><stop offset="1" stopColor="#ffb050" stopOpacity="0" /></linearGradient>
    </defs>
    {cone > 0 && <polygon transform={`rotate(${angle} ${x} ${y})`} points={`${x - 26},${y + 10} ${x + 26},${y + 10} ${x + 330},${y + 820} ${x - 330},${y + 820}`} fill={`url(#${id}c)`} />}
    <circle cx={x} cy={y} r={260} fill={`url(#${id}h)`} />
  </svg>;
}

/** 全屏闪光（撞击、爆破）。 */
const Flash = ({amount, color = '255,214,150'}: {amount: number; color?: string}) =>
  amount > .001 ? <div style={{position: 'absolute', inset: 0, background: `rgba(${color},${amount})`, mixBlendMode: 'screen', pointerEvents: 'none'}} /> : null;

/** 暗角。 */
const Finish = ({vignette = .6}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(10,6,3,${vignette}) 100%)`, pointerEvents: 'none'}} />;

/** 小号说明字（窄体大写）。 */
const Caption = ({children, x, y, size = 30, color = PAPER, opacity = 1, align = 'left', spacing = 4, font = CONDENSED, width}: any) =>
  !children ? null : <div style={{position: 'absolute', left: align === 'right' ? undefined : align === 'center' ? x - (width ?? 1600) / 2 : x,
    right: align === 'right' ? W - x : undefined, width: align === 'center' ? (width ?? 1600) : undefined, top: y, fontFamily: font, fontSize: size,
    letterSpacing: spacing, color, opacity, textAlign: align, textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>;

// 钩子：漆黑的山腹里一声锤响。每一锤迸出火星、闪光照亮隧道一瞬，汽灯随之一点点亮起来，浮尘在光束里漂。
export const meta = {
  title: 'A hammer rings in the dark',
  params: {
    cues: {label: 'Strike cue words', type: 'list', min: 1, max: 6, maxLength: 24, default: ['rings', 'Steel', 'steel', 'again', 'again'],
      help: 'A hammer strikes when the narration reaches each word in turn (used when props.beats is absent)'},
    place: {label: 'Place and time', type: 'text', default: 'The Allegheny Mountains · 1870s', maxLength: 48},
  },
  slots: {tunnel: 'Tunnel heading lit by oil lamps (revealed by the strikes)'},
};
export default function Hook(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const words = list<string>(props, 'cues').map(String);
  const occ: Record<string, number> = {};
  const fallback = [.12, ...words.map((w, i) => {const n = occ[w] ?? 0; occ[w] = n + 1; return at(w, 2 + i * 1.2, n);})];
  const beats = beatList(props, fallback);
  const {d} = lastBeat(t, beats);
  const strike = hit(d, .7);
  const floor = (t < (beats[0] ?? 0) ? 0 : .1) + .55 * sm((t - (beats[1] ?? 3)) / 5);
  const reveal = Math.max(floor, .92 * strike);
  const STRIKE = {x: 1240, y: 742};
  return <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', opacity: fadeEdges(t, dur, .02, .25)}}>
    <div style={{position: 'absolute', inset: 0, transform: shakeAt(t, beats, 9, .28)}}>
      <Plate asset={plate(props, 'tunnel')} frame={props.frame} p={t / dur} from={[1.1, 0, 0]} to={[1.2, -20, -10]} origin="64% 68%" opacity={reveal} />
      <div style={{position: 'absolute', inset: 0, opacity: reveal}}>
        <Lamp t={t} x={644} y={282} power={floor * 1.1 + strike * .5} cone={floor} seed={1} angle={6} />
        <Lamp t={t} x={1016} y={300} power={floor * 1.1 + strike * .5} cone={floor} seed={2} angle={-6} />
      </div>
      <Dust t={t} n={160} beams={[644, 1016]} seed={11} opacity={.3 + .7 * reveal} />
      <Sparks t={t} beats={beats} x={STRIKE.x} y={STRIKE.y} dir={-Math.PI * .62} spread={1.25} n={54} seed={7} />
      <Flash amount={.35 * hit(d, .16)} />
    </div>
    <Caption x={110} y={830} size={30} spacing={6} color={OCHRE} opacity={sm((t - start(1, 5)) / .6) * (1 - sm((t - dur + .8) / .5))}>{txt(props, 'place')}</Caption>
    <Finish vignette={.75} />
  </div>;
}
