import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"mountain":"release-assets/46fb50bee6d87e9e19d75640f70e184cd3e8876e1562e2c941f47aeaa46e55e9.webp"};
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

/** 蒸汽：从 (x, y) 定时喷出的烟团，上升、变大、变淡；rate 为每秒团数。 */
function Steam({t, x, y, rate = 3, life = 2.2, size = 1, seed = 2, drift = 60, opacity = 1, startAt = 0}:
  {t: number; x: number; y: number; rate?: number; life?: number; size?: number; seed?: number; drift?: number; opacity?: number; startAt?: number}) {
  const ref = useCanvas(Math.round(t * 1000), (c) => {
    const first = Math.max(0, Math.floor((t - life - startAt) * rate)), last = Math.floor((t - startAt) * rate);
    for (let i = first; i <= last; i++) {
      const born = startAt + i / rate, age = t - born;
      if (age < 0 || age > life) continue;
      const r = seeded(seed * 977 + i), k = age / life;
      const px = x + (r() - .5) * 30 + drift * k + Math.sin(age * 2 + i) * 12 * k;
      const py = y - (90 + 60 * r()) * age * size;
      const rad = (30 + 120 * k) * size * (.7 + .5 * r());
      const g = c.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(240,232,214,${.55 * (1 - k) * opacity})`); g.addColorStop(1, 'rgba(240,232,214,0)');
      c.fillStyle = g; c.beginPath(); c.arc(px, py, rad, 0, 6.283); c.fill();
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}} />;
}

// 大山挡路：念到“a mile and more”，一条虚线隧道从洞口钻进山体、标尺量出长度；念到 Drill / blast / haul 依次落印，blast 时洞口炸出烟尘。
export const meta = {
  title: 'The mountain',
  params: {
    length: {label: 'Tunnel length label', type: 'text', default: '≈ 1¼ miles of solid rock', maxLength: 40},
    lengthCue: {label: 'Tunnel cue word', type: 'text', default: 'mile', maxLength: 24},
    steps: {label: 'Work steps', type: 'list', min: 3, max: 3, maxLength: 16, default: ['Drill', 'Blast', 'Haul out']},
    stepCues: {label: 'Step cue words', type: 'list', min: 3, max: 3, maxLength: 24, default: ['Drill', 'blast', 'haul']},
    footnote: {label: 'Footnote', type: 'text', default: 'Big Bend Tunnel, W. Va. — or Lewis Tunnel, Va.; the tellers disagree.', maxLength: 90},
  },
  slots: {mountain: 'The mountain above the river bend, tunnel portal at its foot'},
};
export default function Mountain(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const stepNames = list<string>(props, 'steps').map(String), stepWords = list<string>(props, 'stepCues').map(String);
  const steps = stepWords.map((w, i) => at(w, start(2, 6) + i * 1));
  const beats = beatList(props, steps);
  const lenAt = at(txt(props, 'lengthCue'), start(1, 3));
  const dig = sm((t - lenAt + .2) / 1.6);
  const blastAt = beats[1] ?? steps[1];
  const PORTAL = {x: 640, y: 688};
  const tunnel = 'M 640 688 C 900 660 1300 650 1790 700';
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .06, .1)}}>
    <div style={{position: 'absolute', inset: 0, transform: shakeAt(t, [blastAt], 16, .5)}}>
      <Plate asset={plate(props, 'mountain')} frame={props.frame} p={t / dur} from={[1.02, 0, 0]} to={[1.1, 0, 14]} origin="45% 60%" />
      <Svg>
        {dig > 0 && <g>
          <path d={tunnel} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" pathLength={100} strokeDasharray={`${100 * dig} 100`} opacity={.75} />
          <defs><clipPath id="mt-dig"><rect x={600} y={600} width={1240 * dig} height={160} /></clipPath></defs>
          <path d={tunnel} fill="none" stroke={PAPER} strokeWidth={7} pathLength={100} strokeDasharray="3 2.2" clipPath="url(#mt-dig)" />
          <g opacity={sm((dig - .5) / .3)}>
            <line x1={640} y1={590} x2={1790} y2={590} stroke={PAPER} strokeWidth={4} />
            <line x1={640} y1={570} x2={640} y2={610} stroke={PAPER} strokeWidth={4} /><line x1={1790} y1={570} x2={1790} y2={610} stroke={PAPER} strokeWidth={4} />
            <text x={1215} y={570} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={46} letterSpacing={4} fill={PAPER} stroke={INK} strokeWidth={7} paintOrder="stroke">{txt(props, 'length').toUpperCase()}</text>
          </g>
        </g>}
        {stepNames.map((name, i) => <Stamp key={i} x={560 + i * 400} y={180} text={name} size={58} p={clamp((t - (beats[i] ?? steps[i])) / .28)} rotate={i % 2 ? 3 : -3} color={i === 1 ? RUST : SLATE} />)}
      </Svg>
      <Steam t={t} x={PORTAL.x} y={PORTAL.y - 20} rate={9} life={2.4} size={1.6} seed={51} drift={90} startAt={blastAt} opacity={t > blastAt ? 1 - sm((t - blastAt - .9) / 1.2) : 0} />
      <Sparks t={t} beats={[blastAt]} x={PORTAL.x} y={PORTAL.y - 30} dir={-Math.PI * .5} spread={1.4} n={70} speed={.9} seed={53} />
      <Flash amount={.5 * hit(t - blastAt, .3)} color="255,226,180" />
    </div>
    <div style={{position: 'absolute', left: 96, top: 852, padding: '6px 14px', background: 'rgba(16,11,8,.72)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: PAPER,
      opacity: .9 * sm((t - start(0, .4) - .3) / .5)}}>{txt(props, 'footnote')}</div>
    <Finish vignette={.5} />
  </div>;
}
