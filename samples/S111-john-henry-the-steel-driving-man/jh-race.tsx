import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"jh-down":"release-assets/8dd0d2c71229613809591af8b5e7daa22c1dda4a74a6882fae66d98d158323aa.webp","jh-up":"release-assets/676eaf9dd2c8b6af0704856320b6199e4b8ce0bf094216d9709bf4f171ad5ad6.webp"};
const W = 1920, H = 1080;
const INK = '#16110d', PAPER = '#f1e4c8', RUST = '#c2502e', OCHRE = '#e0a646', SLATE = '#6f8796', EMBER = '#ffb24a';
// 字体只按名称引用 macOS 自带的 Superclarendon / DIN Condensed（不随包、不内联）；其他系统依次回退。
const DISPLAY = '"Superclarendon", "Rockwell", "Roboto Slab", Georgia, "Songti SC", "STSong", serif';
const cjkLen = (text: string, k = 1.9) => Array.from(text).reduce((n, ch) => n + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? k : 1), 0);
const CONDENSED = '"DIN Condensed", "Oswald", "Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Songti SC", "STSong", serif';

const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
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
function num(props: SceneInput, key: string): number {
  const value = Number(props.params[key]);
  return Number.isFinite(value) ? value : Number((meta as any).params?.[key]?.default ?? 0);
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

/** 版画刻字：木活字感的粗衬线字（SVG），带刻痕滤镜与投影；p 为横扫显现 0→1。 */
function Woodtype({text, x, y, size, fill = PAPER, p = 1, anchor = 'middle', id, spacing = 2, stroke = INK, font = DISPLAY, weight = 900, rough = true, italic = false}:
  {text: string; x: number; y: number; size: number; fill?: string; p?: number; anchor?: 'start' | 'middle' | 'end'; id: string;
    spacing?: number; stroke?: string; font?: string; weight?: number; rough?: boolean; italic?: boolean}) {
  if (!text || p <= 0) return null;
  const reveal = clamp(p), approx = cjkLen(text, 1.5) * size * .68 + 400;
  const left = anchor === 'middle' ? x - approx / 2 : anchor === 'end' ? x - approx : x - 40;
  return <g>
    <defs>
      <clipPath id={`${id}-c`}><rect x={left} y={y - size * 1.2} width={approx * reveal} height={size * 1.6} /></clipPath>
      {rough && <filter id={`${id}-r`} x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={Math.max(2, size * .035)} xChannelSelector="R" yChannelSelector="G" /></filter>}
    </defs>
    <g clipPath={`url(#${id}-c)`}>
      <text x={x + size * .05} y={y + size * .06} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} letterSpacing={spacing}
        fontStyle={italic ? 'italic' : undefined} fill="rgba(0,0,0,.55)">{text}</text>
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} letterSpacing={spacing} fill={fill}
        fontStyle={italic ? 'italic' : undefined} stroke={stroke} strokeWidth={size * .025} paintOrder="stroke" filter={rough ? `url(#${id}-r)` : undefined}>{text}</text>
    </g>
  </g>;
}
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

/** 蒸汽钻机（版画风矢量图）：立式锅炉、气缸、十字头、钻杆、飞轮；stroke 为活塞位置 0（收回）→1（打出）。
 * 坐标：以气缸中心为原点、按 scale 缩放；钻杆朝右打。 */
function SteamDrill({x, y, scale = 1, stroke, spin, gauge = .5, flip = false}: {x: number; y: number; scale?: number; stroke: number; spin: number; gauge?: number; flip?: boolean}) {
  const rod = 120 + 70 * stroke;
  const steel = '#9aa7ad', dark = '#2a2622', brass = '#c99a4a';
  return <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
    {/* 车架与轮 */}
    <rect x={-330} y={70} width={520} height={34} fill={dark} stroke={INK} strokeWidth={5} />
    {[-250, 110].map((wx, i) => <g key={i} transform={`translate(${wx} 128)`}>
      <circle r={58} fill={dark} stroke={INK} strokeWidth={6} /><circle r={44} fill="none" stroke={steel} strokeWidth={4} />
      {[0, 1, 2, 3].map(s => <line key={s} x1={0} y1={0} x2={Math.cos(spin * .5 + s * 1.571) * 44} y2={Math.sin(spin * .5 + s * 1.571) * 44} stroke={steel} strokeWidth={5} />)}
      <circle r={10} fill={brass} stroke={INK} strokeWidth={3} /></g>)}
    {/* 立式锅炉 */}
    <rect x={-330} y={-250} width={150} height={320} rx={18} fill="#5d6870" stroke={INK} strokeWidth={6} />
    {[-200, -130, -60, 10].map(by => <line key={by} x1={-330} y1={by} x2={-180} y2={by} stroke={INK} strokeWidth={3} opacity={.7} />)}
    {/* 版画刻线：锅炉左侧阴影与右缘受光 */}
    {Array.from({length: 7}, (_, i) => <line key={i} x1={-322 + i * 7} y1={-236 + (i % 2) * 18} x2={-322 + i * 7} y2={56 - (i % 3) * 22} stroke={INK} strokeWidth={3} opacity={.55} />)}
    <line x1={-186} y1={-238} x2={-186} y2={60} stroke={OCHRE} strokeWidth={5} opacity={.8} />
    <rect x={-290} y={-360} width={70} height={115} fill={dark} stroke={INK} strokeWidth={6} />
    <rect x={-300} y={-372} width={90} height={20} fill={dark} stroke={INK} strokeWidth={5} />
    <circle cx={-255} cy={-160} r={34} fill={PAPER} stroke={INK} strokeWidth={5} />
    <line x1={-255} y1={-160} x2={-255 + Math.cos(-2.4 + gauge * 2.2) * 26} y2={-160 + Math.sin(-2.4 + gauge * 2.2) * 26} stroke={RUST} strokeWidth={4} />
    {/* 蒸汽管 */}
    <path d="M -180 -120 L -120 -120 L -120 -40" fill="none" stroke={brass} strokeWidth={14} />
    <path d="M -180 -120 L -120 -120 L -120 -40" fill="none" stroke={INK} strokeWidth={3} />
    {/* 气缸 */}
    <rect x={-150} y={-40} width={200} height={84} rx={10} fill="#77838a" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-52} width={24} height={108} fill={dark} stroke={INK} strokeWidth={4} /><rect x={30} y={-52} width={24} height={108} fill={dark} stroke={INK} strokeWidth={4} />
    {[18, 28, 36].map(hy => <line key={hy} x1={-120} y1={hy} x2={26} y2={hy} stroke={INK} strokeWidth={3} opacity={.5} />)}
    <line x1={-120} y1={-34} x2={26} y2={-34} stroke={OCHRE} strokeWidth={4} opacity={.75} />
    {/* 活塞杆、十字头、钻杆 */}
    <rect x={54} y={-9} width={rod} height={18} fill={steel} stroke={INK} strokeWidth={4} />
    <rect x={54 + rod - 10} y={-30} width={40} height={60} fill={dark} stroke={INK} strokeWidth={5} />
    <rect x={54 + rod + 30} y={-7} width={230} height={14} fill={steel} stroke={INK} strokeWidth={4} />
    <polygon points={`${54 + rod + 260},-12 ${54 + rod + 300},0 ${54 + rod + 260},12`} fill={steel} stroke={INK} strokeWidth={4} />
    {/* 飞轮 */}
    <g transform="translate(-60 -110)"><circle r={62} fill="none" stroke={INK} strokeWidth={16} /><circle r={62} fill="none" stroke={brass} strokeWidth={8} />
      {[0, 1, 2, 3, 4, 5].map(s => <line key={s} x1={0} y1={0} x2={Math.cos(spin + s * 1.047) * 58} y2={Math.sin(spin + s * 1.047) * 58} stroke={INK} strokeWidth={6} />)}
      <circle r={12} fill={brass} stroke={INK} strokeWidth={4} /></g>
    <line x1={-60 + Math.cos(spin) * 40} y1={-110 + Math.sin(spin) * 40} x2={54 + rod + 10} y2={0} stroke={dark} strokeWidth={10} />
  </g>;
}

/** 心跳包络：每拍一组“咚-哒”（第二下更轻）。 */
function heart(t: number, beats: number[], gain: number[] = []) {
  let v = 0;
  beats.forEach((b, i) => {
    const g = gain[i] ?? 1;
    for (const [off, amp] of [[0, 1], [.2, .55]] as const) {
      const d = t - b - off;
      if (d >= 0 && d < .6) v = Math.max(v, g * amp * Math.exp(-d / .14));
    }
  });
  return v;
}

// 人机比赛（race）、比分（win）与定格（still）共用一个模块，两张锤击底图只内联一次。
// race：锤子按配乐节拍落下（props.beats，配乐逐小节加速），每拍切到“锤落”那一帧、火星迸出；钻机活塞按半拍打；
//       旁白念到 drill 切钻机、念到 John Henry 切人、念到 Faster 之后人机镜头按拍交替、越切越快；右上角实时进尺。
// win：尘埃散去，岩层剖面里两个炮眼按旁白定格在传说里的 9 英尺与 14 英尺；念到 won，他那一列放光。
// still：一切静止，只剩心跳（props.beats 为心跳时刻），画面褪色、变暗，最后一下之后黑场。
export const meta = {
  title: 'Man against machine',
  params: {
    mode: {label: 'Mode', type: 'select', default: 'race', options: [{value: 'race', label: 'Race'}, {value: 'win', label: 'Final count'}, {value: 'still', label: 'Stillness'}]},
    man: {label: 'Man label', type: 'text', default: 'John Henry', maxLength: 24},
    machine: {label: 'Machine label', type: 'text', default: 'Steam Drill', maxLength: 24},
    unit: {label: 'Unit', type: 'text', default: 'ft', maxLength: 8},
    manFinal: {label: 'Man final depth', type: 'number', min: 1, max: 30, default: 14},
    machineFinal: {label: 'Machine final depth', type: 'number', min: 1, max: 30, default: 9},
    drillCue: {label: 'Cut-to-drill cue word', type: 'text', default: 'drill', maxLength: 24},
    manCue: {label: 'Cut-to-man cue words', type: 'text', default: 'John Henry', maxLength: 24},
    swungCue: {label: 'Close-up cue word', type: 'text', default: 'swung', maxLength: 24},
    fasterCue: {label: 'Fast-cutting cue word', type: 'text', default: 'Faster', maxLength: 24},
    shookCue: {label: 'Shake cue word', type: 'text', default: 'shook', maxLength: 24},
    machineCue: {label: 'Machine total cue word', type: 'text', default: 'nine', maxLength: 24},
    manTotalCue: {label: 'Man total cue word', type: 'text', default: 'fourteen', maxLength: 24},
    wonCue: {label: 'Win cue word', type: 'text', default: 'won', maxLength: 24},
    won: {label: 'Win stamp', type: 'text', default: 'Won', maxLength: 16},
    footnote: {label: 'Footnote', type: 'text', default: 'Figures from the legend; the tellings vary.', maxLength: 80},
  },
  slots: {'jh-up': 'John Henry with the hammer raised', 'jh-down': 'The same shot at the moment of impact'},
};

const TIP = {x: 1800, y: 832};
/** 钻机打击时刻：每个锤拍及其半拍。 */
function drillStrokes(beats: number[]) {
  const out: number[] = [];
  beats.forEach((b, i) => {out.push(b); const next = beats[i + 1]; if (next !== undefined) out.push((b + next) / 2);});
  return out;
}
function strokeAt(t: number, strokes: number[]) {
  const {d} = lastBeat(t, strokes);
  if (!(d < .4)) return 0;
  return d < .05 ? d / .05 : Math.max(0, 1 - (d - .05) / .2);
}
/** 人机镜头：锤落那一帧（0.16 秒）用 jh-down，其余 jh-up；火星跟着底图一起缩放。 */
function ManShot({props, t, beats, scale = 1.04, origin = '50% 50%', rotate = 0, dx = 0}: {props: SceneInput; t: number; beats: number[]; scale?: number; origin?: string; rotate?: number; dx?: number}) {
  const {d} = lastBeat(t, beats), down = d < .16;
  return <div style={{position: 'absolute', inset: 0, transform: `translate(${dx}px, 0) rotate(${rotate}deg) scale(${scale})`, transformOrigin: origin}}>
    <Plate asset={plate(props, down ? 'jh-down' : 'jh-up')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
    <Lamp t={t} x={960} y={140} power={.35 + .4 * hit(d, .3)} cone={.6} seed={9} />
    <Sparks t={t} beats={beats} x={TIP.x} y={TIP.y} dir={-Math.PI * .8} spread={1.1} n={50} seed={81} />
    <Flash amount={.3 * hit(d, .12)} />
  </div>;
}
/** 钻机镜头：代码画的钻机顶在右侧岩面上，活塞按半拍打、钻头迸火星、烟囱冒汽。 */
function DrillShot({t, strokes, x = 700, y = 560, scale = 1.55}: {t: number; strokes: number[]; x?: number; y?: number; scale?: number}) {
  const st = strokeAt(t, strokes), rockX = x + (54 + 190 + 300) * scale - 6;
  const tipBeats = strokes.map(s => s + .05);
  const {d} = lastBeat(t, strokes);
  return <div style={{position: 'absolute', inset: 0, transform: d < .12 ? `translate(${Math.sin(d * 120) * 4}px, ${Math.cos(d * 90) * 3}px)` : 'none'}}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 38% 40%, #4a3424 0%, #22170f 50%, #0b0806 100%)'}} />
    <Svg>
      <defs><linearGradient id="dr-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2a1d" /><stop offset="1" stopColor="#120c08" /></linearGradient></defs>
      <polygon points={`0,${y + 270} ${W},${y + 240} ${W},${H} 0,${H}`} fill="url(#dr-floor)" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => <line key={i} x1={-400 + i * 420} y1={H} x2={x + (i - 3) * 90} y2={y + 255} stroke={INK} strokeWidth={5} opacity={.55} />)}
      <path d={`M 0 0 L 0 ${H * .8} Q 40 ${H * .3} 220 110 Q 620 -50 ${rockX - 140} 50 L ${rockX} 0 Z`} fill="#0d0907" opacity={.9} />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M ${20 + i * 34} ${760 - i * 90} q 40 -34 96 -44`} stroke="#3e2f22" strokeWidth={7} fill="none" opacity={.85} />)}
      <polygon points={`${rockX},0 ${W},0 ${W},${H} ${rockX + 40},${H} ${rockX - 30},820 ${rockX + 20},640 ${rockX - 10},470 ${rockX + 30},300 ${rockX - 20},140`} fill="#4a3a2c" stroke={INK} strokeWidth={8} />
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${rockX + 30 + i * 30} ${60 + i * 110} l ${60 + (i % 3) * 30} ${30 - (i % 2) * 50}`} stroke={INK} strokeWidth={6} opacity={.7} />)}
      <SteamDrill x={x} y={y} scale={scale} stroke={st} spin={t * 7 * (1 + strokes.length / 80)} gauge={.6 + .3 * st} />
    </Svg>
    <Lamp t={t} x={560} y={40} power={.85} cone={1} seed={12} angle={-14} />
    <Steam t={t} x={x - 255 * scale} y={y - 380 * scale} rate={5} life={1.8} size={1.4} seed={83} drift={60} />
    <Steam t={t} x={x - 60 * scale} y={y - 40 * scale} rate={strokes.length ? 3.5 : 0} life={1} size={.9} seed={84} drift={-90} opacity={.75} />
    <Sparks t={t} beats={tipBeats} x={rockX + 4} y={y} dir={Math.PI * 1.1} spread={.9} n={30} speed={.9} life={.5} seed={85} />
  </div>;
}
/** 进尺：钻机先快后慢，人随锤数加速；超车在 Faster 前后。 */
function depths(t: number, dur: number, beats: number[], manFinal: number, machineFinal: number) {
  const u = clamp(t / dur), machine = (machineFinal - .5) * (1 - Math.pow(1 - u, 1.7));
  const {d, i} = lastBeat(t, beats), first = beats[0] ?? 0, last = beats[beats.length - 1] ?? dur;
  const at = (k: number) => k < 0 ? 0 : (manFinal - .6) * Math.pow(clamp((beats[k] - first) / Math.max(.1, last - first)), 1.45);
  const man = i < 0 ? 0 : mix(at(i - 1), at(i), out3(clamp(d / .12)));
  return {man, machine};
}
function Hud({t, man, machine, props, opacity}: {t: number; man: number; machine: number; props: SceneInput; opacity: number}) {
  if (opacity <= 0) return null;
  const max = Math.max(num(props, 'manFinal'), num(props, 'machineFinal')) + 1, unit = txt(props, 'unit');
  const row = (y: number, label: string, value: number, color: string, lead: boolean) => <g transform={`translate(1330 ${y})`}>
    <text x={0} y={0} fontFamily={CONDENSED} fontWeight={700} fontSize={30} letterSpacing={3} fill={lead ? OCHRE : PAPER}>{label.toUpperCase()}</text>
    <rect x={0} y={12} width={420} height={26} fill="rgba(0,0,0,.55)" stroke={PAPER} strokeWidth={2} />
    <rect x={2} y={14} width={416 * clamp(value / max)} height={22} fill={color} />
    <text x={540} y={38} textAnchor="end" fontFamily={CONDENSED} fontWeight={700} fontSize={52} fill={lead ? OCHRE : PAPER}>{value.toFixed(1)}<tspan fontSize={28}> {unit.toUpperCase()}</tspan></text>
  </g>;
  return <Svg style={{opacity}}>
    <rect x={1300} y={42} width={590} height={196} fill="rgba(14,9,6,.78)" stroke={PAPER} strokeWidth={2} />
    {row(92, txt(props, 'man'), man, RUST, man >= machine)}
    {row(182, txt(props, 'machine'), machine, SLATE, machine > man)}
  </Svg>;
}

function Race(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const fallback: number[] = [];
  for (let b = .35, k = 0; b < dur - .2; k++) {fallback.push(b); b += .652 * Math.pow(.985, k);}
  const beats = beatList(props, fallback), strokes = drillStrokes(beats);
  const drillAt = at(txt(props, 'drillCue'), 3.9), manAt = at(txt(props, 'manCue'), 6.4), fasterAt = at(txt(props, 'fasterCue'), 11.2);
  const shookAt = at(txt(props, 'shookCue'), 13.7);
  const swung = [0, 1, 2].map(i => at(txt(props, 'swungCue'), manAt + 1 + i * 1.3, i));
  const {man, machine} = depths(t, dur, beats, num(props, 'manFinal'), num(props, 'machineFinal'));
  let shot: 'split' | 'drill' | 'man' = 'split', variant = 0;
  if (t >= fasterAt - .05) {
    const after = beats.filter(b => b >= fasterAt - .05);
    const {i} = lastBeat(t, after);
    const cut = i < 0 ? 0 : i < 4 ? Math.floor(i / 2) : 2 + (i - 4);
    shot = cut % 2 === 0 ? 'drill' : 'man'; variant = cut % 3;
  } else if (t >= manAt - .05) {shot = 'man'; variant = swung.filter(s => t >= s - .05).length;}
  else if (t >= drillAt - .05) shot = 'drill';
  const quake = t >= shookAt ? shakeAt(t, [shookAt], 28, 1.1) : shakeAt(t, beats, shot === 'man' ? 8 : 4, .22);
  const VARIANTS = [{scale: 1.04, origin: '50% 50%', rotate: 0}, {scale: 1.4, origin: '30% 18%', rotate: 0}, {scale: 1.35, origin: '62% 76%', rotate: 0}, {scale: 1.12, origin: '40% 40%', rotate: -2.5}];
  const v = VARIANTS[variant % VARIANTS.length];
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .04, .04)}}>
    <div style={{position: 'absolute', inset: 0, transform: quake}}>
      {shot === 'split' && <>
        <div style={{position: 'absolute', left: 0, top: 0, width: W / 2, height: H, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -150, top: 0, width: W, height: H}}><ManShot props={props} t={t} beats={beats} scale={1.08} origin="25% 45%" /></div>
        </div>
        <div style={{position: 'absolute', left: W / 2, top: 0, width: W / 2, height: H, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -W / 2, top: 0, width: W, height: H}}><DrillShot t={t} strokes={strokes} x={1290} y={600} scale={.9} /></div>
        </div>
        <Svg>
          <rect x={0} y={84} width={W} height={92} fill="rgba(12,8,5,.62)" opacity={sm(t / .3)} />
          <rect x={W / 2 - 7} y={0} width={14} height={H} fill={RUST} stroke={INK} strokeWidth={4} />
          <circle cx={W / 2} cy={430} r={64} fill={RUST} stroke={INK} strokeWidth={6} opacity={sm(t / .3)} />
          <text x={W / 2} y={452} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={60} fill={PAPER} opacity={sm(t / .3)}>VS</text>
          <Woodtype id="lm" text={txt(props, 'man').toUpperCase()} x={480} y={150} size={74} p={sm((t - .1) / .4)} />
          <Woodtype id="lr" text={txt(props, 'machine').toUpperCase()} x={1440} y={150} size={74} p={sm((t - .4) / .4)} />
        </Svg>
      </>}
      {shot === 'man' && <ManShot props={props} t={t} beats={beats} scale={v.scale} origin={v.origin} rotate={v.rotate} />}
      {shot === 'drill' && <div style={{position: 'absolute', inset: 0, transform: variant === 1 ? 'scale(1.25)' : variant === 2 ? 'scale(1.12) rotate(2deg)' : 'none', transformOrigin: '70% 55%'}}>
        <DrillShot t={t} strokes={strokes} />
      </div>}
      {t >= shookAt && <Dust t={(t - shookAt) * 6} n={260} seed={87} rise={-1.4} color="200,170,130" opacity={1 - sm((t - shookAt - 1.2) / .8)} />}
      <Flash amount={.45 * hit(t - shookAt, .3)} color="255,230,190" />
    </div>
    <Hud t={t} man={man} machine={machine} props={props} opacity={sm((t - drillAt + .2) / .4)} />
    <Finish vignette={.55} />
  </div>;
}

function Win(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const manFinal = num(props, 'manFinal'), machineFinal = num(props, 'machineFinal'), unit = txt(props, 'unit').toUpperCase();
  const machineAt = at(txt(props, 'machineCue'), 2.8), manAt = at(txt(props, 'manTotalCue'), 5.5), wonAt = at(txt(props, 'wonCue'), 7.2);
  const beats = beatList(props, [wonAt]);
  const mDepth = mix(machineFinal - .5, machineFinal, out3(clamp((t - machineAt) / .5)));
  const jDepth = mix(manFinal - .6, manFinal, out3(clamp((t - manAt) / .5)));
  const dust = 1 - sm((t - .15) / 1.5), glow = sm((t - wonAt) / .3);
  const top = 300, ft = 38, xs = {man: 820, machine: 1180};
  const shaft = (x: number, depth: number, color: string, label: string, value: number, show: number, lead: boolean) => <g>
    <text x={x} y={top - 34} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={40} letterSpacing={4} fill={lead && glow > 0 ? OCHRE : PAPER}>{label.toUpperCase()}</text>
    <rect x={x - 26} y={top} width={52} height={depth * ft} fill="#0c0806" stroke={INK} strokeWidth={4} />
    <rect x={x - 8} y={top} width={16} height={depth * ft} fill={color} opacity={.9} />
    <polygon points={`${x - 26},${top + depth * ft} ${x + 26},${top + depth * ft} ${x},${top + depth * ft + 26}`} fill="#0c0806" stroke={INK} strokeWidth={4} />
    <g opacity={show}>
      <text x={x + 52} y={top + depth * ft + 18} fontFamily={CONDENSED} fontWeight={700} fontSize={96} fill={lead && glow > 0 ? OCHRE : PAPER} stroke={INK} strokeWidth={8} paintOrder="stroke">{Math.round(value)}<tspan fontSize={44}> {unit}</tspan></text>
    </g>
  </g>;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .03, .02)}}>
    <div style={{position: 'absolute', inset: 0, transform: shakeAt(t, beats, 10, .4)}}>
      <Plate asset={plate(props, 'jh-up')} frame={props.frame} p={t / dur} from={[1.1, 0, 0]} to={[1.16, 0, 0]} opacity={.45} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(12,8,5,.55)'}} />
      <Svg>
        <defs>
          <pattern id="strata" width="1920" height="38" patternUnits="userSpaceOnUse"><rect width="1920" height="38" fill="#5a4634" /><path d="M0 30 Q 480 22 960 31 T 1920 28" stroke="#3b2d21" strokeWidth={5} fill="none" /></pattern>
          <radialGradient id="won-rays"><stop offset="0" stopColor="#ffd98a" stopOpacity=".85" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
        </defs>
        <rect x={560} y={top} width={860} height={16 * ft} fill="url(#strata)" stroke={INK} strokeWidth={6} opacity={.95} />
        <rect x={520} y={top - 14} width={940} height={14} fill="#2c4a2a" stroke={INK} strokeWidth={4} />
        {Array.from({length: 16}, (_, k) => <g key={k}>
          <line x1={560} y1={top + k * ft} x2={k % 5 === 0 ? 600 : 584} y2={top + k * ft} stroke={PAPER} strokeWidth={3} />
          {k % 5 === 0 && <text x={548} y={top + k * ft + 10} textAnchor="end" fontFamily={CONDENSED} fontSize={30} fill={PAPER}>{k}</text>}
        </g>)}
        {glow > 0 && <g style={{mixBlendMode: 'screen'}} opacity={glow}>
          {Array.from({length: 16}, (_, k) => {const a = k * Math.PI / 8 + (t - wonAt) * .25;
            return <polygon key={k} points={`${xs.man},${top + 200} ${xs.man + Math.cos(a - .06) * 900},${top + 200 + Math.sin(a - .06) * 900} ${xs.man + Math.cos(a + .06) * 900},${top + 200 + Math.sin(a + .06) * 900}`} fill="#ffcf7a" opacity={.16} />;})}
          <circle cx={xs.man} cy={top + 200} r={420} fill="url(#won-rays)" opacity={.5} />
        </g>}
        {shaft(xs.man, jDepth, RUST, txt(props, 'man'), jDepth, sm((t - manAt + .1) / .3), true)}
        {shaft(xs.machine, mDepth, SLATE, txt(props, 'machine'), mDepth, sm((t - machineAt + .1) / .3), false)}
        <Stamp x={xs.man - 150} y={top + manFinal * ft - 30} text={txt(props, 'won')} size={60} p={clamp((t - wonAt) / .28)} rotate={-6} />
      </Svg>
      {dust > 0 && <div style={{position: 'absolute', inset: 0, opacity: dust}}>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(120,96,70,.55)'}} />
        {Array.from({length: 9}, (_, i) => {const r = seeded(700 + i), x = r() * W, y = 200 + r() * 700, size = 500 + r() * 600, drift = (r() - .5) * 260;
          return <div key={i} style={{position: 'absolute', left: x - size / 2 + drift * t, top: y - size / 2 - 40 * t, width: size, height: size * .7, borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(214,190,150,.9) 0%, rgba(190,160,120,.5) 45%, rgba(170,140,100,0) 72%)'}} />;})}
      </div>}
      <Dust t={t} n={220} seed={91} rise={-.5} color="230,205,165" opacity={.25 + .6 * dust} />
      <Flash amount={.5 * hit(t - wonAt, .25)} />
    </div>
    <div style={{position: 'absolute', left: 96, top: 852, padding: '6px 14px', background: 'rgba(16,11,8,.72)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: PAPER, opacity: .9 * sm((t - machineAt) / .5)}}>{txt(props, 'footnote')}</div>
    <Finish vignette={.55} />
  </div>;
}

function Still(props: SceneInput) {
  const {t, dur} = cues(props);
  const beats = beatList(props, [.3, 1.1, 1.95, 2.85]);
  const gains = beats.map((_, i) => Math.max(.25, 1 - i * .22));
  const h = heart(t, beats, gains);
  const fade = sm((t - (beats[beats.length - 1] ?? dur - .5) - .15) / .35);
  return <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1.06 + .012 * h})`, transformOrigin: '45% 45%', opacity: 1 - fade}}>
      <Plate asset={plate(props, 'jh-down')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
      <Sparks t={.11} beats={[0]} x={TIP.x} y={TIP.y} dir={-Math.PI * .8} spread={1.1} n={50} seed={81} />
      <Dust t={5} n={200} seed={93} opacity={.8} />
      <div style={{position: 'absolute', inset: 0, background: '#8a8a8a', mixBlendMode: 'saturation', opacity: sm(t / .5)}} />
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${.25 + .45 * sm((t - .4) / 2.4) - .2 * h})`}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(110,14,6,${.55 * h}) 100%)`}} />
    </div>
  </div>;
}

export default function RaceScene(props: SceneInput) {
  const mode = txt(props, 'mode');
  return mode === 'win' ? <Win {...props} /> : mode === 'still' ? <Still {...props} /> : <Race {...props} />;
}
