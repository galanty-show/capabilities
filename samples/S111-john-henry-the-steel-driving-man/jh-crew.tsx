import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"crew":"release-assets/591e56b30e78a569976afb391e0799f8750e747ca5e592a139bd1d1c40ebf386.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
const cjkLen = (text: string, k = 1.9) => Array.from(text).reduce((n, ch) => n + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? k : 1), 0);
const CONDENSED = '"DIN Condensed", "Oswald", "Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Songti SC", "STSong", serif';

const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
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

/** 全屏闪光（撞击、爆破）。 */
const Flash = ({amount, color = '255,214,150'}: {amount: number; color?: string}) =>
  amount > .001 ? <div style={{position: 'absolute', inset: 0, background: `rgba(${color},${amount})`, mixBlendMode: 'screen', pointerEvents: 'none'}} /> : null;

/** 暗角。 */
const Finish = ({vignette = .6}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(10,6,3,${vignette}) 100%)`, pointerEvents: 'none'}} />;

/** 整版 SVG（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** 印章式标签：锈红底版、纸色窄体大写字，落下时由大到小砸实。 */
function Stamp({x, y, text, size = 40, p, color = RUST, ink = PAPER, rotate = -3, anchor = 'middle'}:
  {x: number; y: number; text: string; size?: number; p: number; color?: string; ink?: string; rotate?: number; anchor?: 'start' | 'middle' | 'end'}) {
  if (p <= 0 || !text) return null;
  const k = out3(p), sc = 1 + 1.2 * (1 - k), w = cjkLen(text) * size * .52 + size * 1.2, h = size * 1.5;
  const ox = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0;
  return <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rotate * k})`} opacity={clamp(p * 3)}>
    <rect x={ox} y={-h / 2} width={w} height={h} fill={color} stroke={INK} strokeWidth={3} />
    <rect x={ox + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} fill="none" stroke={ink} strokeWidth={2} opacity={.6} />
    <text x={ox + w / 2} y={size * .36} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={size} letterSpacing={size * .08} fill={ink}>{text.toUpperCase()}</text>
  </g>;
}
/** 小号说明字（窄体大写）。 */
const Caption = ({children, x, y, size = 30, color = PAPER, opacity = 1, align = 'left', spacing = 4, font = CONDENSED, width}: any) =>
  !children ? null : <div style={{position: 'absolute', left: align === 'right' ? undefined : align === 'center' ? x - (width ?? 1600) / 2 : x,
    right: align === 'right' ? W - x : undefined, width: align === 'center' ? (width ?? 1600) : undefined, top: y, fontFamily: font, fontSize: size,
    letterSpacing: spacing, color, opacity, textAlign: align, textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>;

// 打钎：扶钎的老工人（shaker）每锤转一次钢钎，钢钎手抡锤。旁白念到谁就给谁挂标签；之后锤子按配乐节拍落下，钎头迸火星；念到 John Henry 落他的名字印。
export const meta = {
  title: 'Driving steel',
  params: {
    shaker: {label: 'Shaker label', type: 'text', default: 'The Shaker', maxLength: 24},
    shakerNote: {label: 'Shaker note', type: 'text', default: 'holds the steel, turns it after every blow', maxLength: 60},
    driver: {label: 'Driver label', type: 'text', default: 'The Steel Driver', maxLength: 24},
    driverNote: {label: 'Driver note', type: 'text', default: 'swings the hammer', maxLength: 60},
    name: {label: 'Name stamp', type: 'text', default: 'John Henry', maxLength: 24},
    nameCue: {label: 'Name cue words', type: 'text', default: 'John Henry', maxLength: 24},
    swungCue: {label: 'First strike cue word', type: 'text', default: 'swung', maxLength: 24},
  },
  slots: {crew: 'The shaker holds the steel while John Henry swings'},
};
export default function Crew(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const nameAt = at(txt(props, 'nameCue'), start(2, 5));
  const firstStrike = at(txt(props, 'swungCue'), start(1, 3)) + .25;
  const beats = beatList(props, Array.from({length: 8}, (_, i) => firstStrike + i * 1.3));
  const {d, i: count} = lastBeat(t, beats);
  const TIP = {x: 1846, y: 846}, SHAKER = {x: 1270, y: 600}, DRIVER = {x: 830, y: 420}, HANDS = {x: 1300, y: 860};
  const off = 1 - sm((t - nameAt + .1) / .35), l1 = sm((t - start(0, .4)) / .4) * off, l2 = sm((t - start(1, 3)) / .4) * off;
  const turn = (count + 1) * 90 + 90 * out3(clamp(d / .25));
  const leader = (x: number, y: number, tx: number, ty: number, p: number) => p > 0 && <g opacity={p}>
    <line x1={x} y1={y} x2={mix(x, tx, p)} y2={mix(y, ty, p)} stroke={PAPER} strokeWidth={4} strokeDasharray="12 8" />
    <circle cx={x} cy={y} r={10} fill={OCHRE} stroke={INK} strokeWidth={3} />
  </g>;
  const box = (tx: number, ty: number, title: string, note: string, p: number, align: 'left' | 'center') => p > 0 && <div style={{position: 'absolute',
    left: tx, top: ty, transform: `translate(${align === 'center' ? -50 : 0}%, -100%)`, opacity: p, background: 'rgba(16,11,8,.82)', border: `2px solid ${OCHRE}`,
    padding: '10px 20px 12px', textAlign: align}}>
    <div style={{fontFamily: CONDENSED, fontWeight: 700, fontSize: 48, letterSpacing: 5, color: PAPER, textTransform: 'uppercase', lineHeight: 1, whiteSpace: 'nowrap'}}>{title}</div>
    <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: OCHRE, marginTop: 6, whiteSpace: 'nowrap'}}>{note}</div>
  </div>;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .06, .1)}}>
    <div style={{position: 'absolute', inset: 0, transform: shakeAt(t, beats, 7, .25)}}>
      <Plate asset={plate(props, 'crew')} frame={props.frame} p={t / dur} from={[1.03, 0, 0]} to={[1.1, 30, 10]} origin="45% 40%" />
      <Svg>
        {leader(SHAKER.x, SHAKER.y, 1560, 470, l1)}
        {leader(DRIVER.x, DRIVER.y, 1420, 250, l2)}
        {l1 > 0 && <g transform={`translate(${HANDS.x} ${HANDS.y}) rotate(${turn})`} opacity={.85 * l1}>
          <path d="M 0 -46 A 46 46 0 1 1 -40 23" fill="none" stroke={OCHRE} strokeWidth={6} />
          <polygon points="-52,14 -26,34 -44,40" fill={OCHRE} />
        </g>}
        <Stamp x={1450} y={330} text={txt(props, 'name')} size={68} p={clamp((t - nameAt) / .3)} rotate={-3} />
      </Svg>
      {box(1560, 470, txt(props, 'shaker'), txt(props, 'shakerNote'), l1, 'center')}
      {box(1560, 290, txt(props, 'driver'), txt(props, 'driverNote'), l2, 'center')}
      <Sparks t={t} beats={beats} x={TIP.x} y={TIP.y} dir={-Math.PI * .75} spread={1.0} n={46} seed={41} />
      <Flash amount={.22 * hit(d, .14)} />
    </div>
    <Finish vignette={.5} />
  </div>;
}
