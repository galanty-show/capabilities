import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"salesman":"release-assets/df6946c5b54f42aa13beb684c108b94d018539d0c06549fb24be2edf62951820.webp"};
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

// 蒸汽钻机：推销员推来机器，烟囱与阀门冒汽；第二句切到一张 1870 年代广告传单——钻机线稿的活塞一下下打出，念到 outwork 落下大字口号。
export const meta = {
  title: 'The steam drill',
  params: {
    kicker: {label: 'Handbill kicker', type: 'text', default: 'New! Patent', maxLength: 24},
    headline: {label: 'Handbill headline', type: 'text', default: 'STEAM DRILL', maxLength: 20},
    claim: {label: 'Claim stamp', type: 'text', default: 'Will out-work any man alive!', maxLength: 40},
    claimCue: {label: 'Claim cue word', type: 'text', default: 'outwork', maxLength: 24},
    fine: {label: 'Fine print', type: 'text', default: 'Drills day & night · Never tires · Never quits', maxLength: 60},
  },
  slots: {salesman: 'Salesman presenting the steam drill to the crew'},
};
export default function Drill(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const billAt = start(1, 4.6) - .12, claimAt = at(txt(props, 'claimCue'), billAt + 1.2);
  const bill = t >= billAt, bt = t - billAt;
  const rate = 4.6, ph = bt * rate, stroke = Math.max(0, 1 - ((ph % 1) * 1.6)) ** 1.5;
  const slide = out3(clamp(bt / .3));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .06, .1)}}>
    {!bill ? <>
      <Plate asset={plate(props, 'salesman')} frame={props.frame} p={t / Math.max(1, billAt)} from={[1.03, 0, 0]} to={[1.11, 50, 30]} origin="35% 55%" />
      <Steam t={t} x={662} y={70} rate={3.2} life={2.4} size={1.1} seed={61} drift={70} />
      <Steam t={t} x={860} y={600} rate={2.2} life={1.4} size={.6} seed={62} drift={-40} opacity={.8} />
      <Finish vignette={.5} />
    </> : <>
      <div style={{position: 'absolute', inset: 0, background: '#1d150f'}} />
      <div style={{position: 'absolute', inset: 0, transform: `translate(${(1 - slide) * 1400}px, ${(1 - slide) * 60}px) rotate(${-1.6 + (1 - slide) * 6}deg)`, transformOrigin: '50% 50%'}}>
        <Svg>
          <rect x={250} y={40} width={1420} height={1000} fill={PAPER} stroke={INK} strokeWidth={6} />
          <rect x={272} y={62} width={1376} height={956} fill="none" stroke={INK} strokeWidth={3} />
          <rect x={284} y={74} width={1352} height={932} fill="none" stroke={INK} strokeWidth={1.2} />
          {Array.from({length: 22}, (_, i) => <line key={i} x1={300} y1={120 + i * 40} x2={1620} y2={122 + i * 40} stroke="#d9c9a5" strokeWidth={1} />)}
          <text x={960} y={130} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={44} fill={RUST}>{txt(props, 'kicker')}</text>
          <Woodtype id="hb" text={txt(props, 'headline')} x={960} y={245} size={118} fill={INK} stroke={PAPER} spacing={8} />
          <line x1={420} y1={276} x2={1500} y2={276} stroke={INK} strokeWidth={5} /><line x1={420} y1={288} x2={1500} y2={288} stroke={INK} strokeWidth={2} />
          <SteamDrill x={1000} y={650} scale={.78} stroke={stroke} spin={bt * 9} gauge={.55 + .1 * Math.sin(bt * 7)} />
          <text x={960} y={334} textAnchor="middle" fontFamily={CONDENSED} fontSize={32} letterSpacing={5} fill={INK} opacity={.85}>{txt(props, 'fine').toUpperCase()}</text>
          <Stamp x={960} y={856} text={txt(props, 'claim')} size={58} p={clamp((t - claimAt) / .28)} rotate={-2.5} />
        </Svg>
        <Steam t={bt} x={801} y={352} rate={4.6} life={1.5} size={.6} seed={63} drift={40} opacity={.8} />
      </div>
      <Finish vignette={.45} />
    </>}
  </div>;
}
