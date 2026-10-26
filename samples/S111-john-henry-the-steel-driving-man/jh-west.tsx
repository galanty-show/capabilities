import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"west":"release-assets/12dd4bac85942f8da7fc725900e7b2937e3b8cba820e4b307c284089e48ca176.webp"};
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

// 铁路向西：版画全景里一队工人铺轨；左上角的线路图随旁白从里士满往西画到俄亥俄河，枕木一根根钉上去；念到 Black workers，光扫过人群，“BUILT BY HAND”落印。
export const meta = {
  title: 'Rails west',
  params: {
    railroad: {label: 'Railroad name', type: 'text', default: 'Chesapeake & Ohio Railway · 1870s', maxLength: 48},
    east: {label: 'East end', type: 'text', default: 'Richmond', maxLength: 24},
    west: {label: 'West end', type: 'text', default: 'Ohio River', maxLength: 24},
    mountains: {label: 'Mountains label', type: 'text', default: 'Allegheny Mts.', maxLength: 24},
    stamp: {label: 'Stamp', type: 'text', default: 'Built by hand', maxLength: 24},
    stampCue: {label: 'Stamp cue word', type: 'text', default: 'Black', maxLength: 24},
  },
  slots: {west: 'Track gang laying rails toward the western mountains'},
};
export default function West(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props);
  const p = sm((t - start(0, .4)) / Math.max(1, end(0, 4) - start(0, .4) + .6));
  const stampAt = at(txt(props, 'stampCue'), start(1, 4.4));
  const ties = 42, shown = Math.floor(p * ties);
  // 线路：东（右）→ 西（左），中段翻山
  const route = 'M 860 190 C 790 186 760 200 700 192 S 610 168 560 176 S 470 200 420 182 S 330 168 280 180 S 190 196 150 186';
  const sweep = clamp((t - stampAt + .2) / 1.6);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .1)}}>
    <Plate asset={plate(props, 'west')} frame={props.frame} p={t / dur} from={[1.05, 40, 10]} to={[1.13, -50, 0]} origin="70% 40%" />
    {sweep > 0 && sweep < 1 && <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen',
      background: `linear-gradient(100deg, rgba(255,200,120,0) ${sweep * 120 - 30}%, rgba(255,205,130,.32) ${sweep * 120 - 12}%, rgba(255,200,120,0) ${sweep * 120 + 6}%)`}} />}
    <Svg>
      <g opacity={sm((t - .1) / .4)}>
        <rect x={90} y={58} width={830} height={200} fill={PAPER} opacity={.94} stroke={INK} strokeWidth={4} />
        <rect x={100} y={68} width={810} height={180} fill="none" stroke={INK} strokeWidth={1.5} opacity={.6} />
        <text x={505} y={104} textAnchor="middle" fontFamily={CONDENSED} fontWeight={700} fontSize={26} letterSpacing={5} fill={RUST}>{txt(props, 'railroad').toUpperCase()}</text>
        {[0, 1, 2, 3, 4].map(i => <polygon key={i} points={`${410 + i * 32},176 ${428 + i * 32},${146 - (i % 2) * 10} ${446 + i * 32},176`} fill={SLATE} stroke={INK} strokeWidth={2} opacity={.85} />)}
        <text x={490} y={232} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={20} fill={INK} opacity={.75}>{txt(props, 'mountains')}</text>
        <path d={route} fill="none" stroke={INK} strokeWidth={5} pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - p)} />
        {Array.from({length: shown}, (_, i) => {
          const u = (i + .5) / ties, x = mix(860, 150, u), y = 190 - 8 * Math.sin(u * 9) - 6 * Math.sin(u * 3.3);
          return <line key={i} x1={x} y1={y - 9} x2={x} y2={y + 9} stroke={INK} strokeWidth={3} />;
        })}
        <circle cx={860} cy={190} r={8} fill={RUST} stroke={INK} strokeWidth={2} />
        <text x={860} y={226} textAnchor="middle" fontFamily={CONDENSED} fontSize={22} letterSpacing={2} fill={INK}>{txt(props, 'east').toUpperCase()}</text>
        <g opacity={sm((p - .9) / .1)}>
          <circle cx={150} cy={186} r={8} fill={RUST} stroke={INK} strokeWidth={2} />
          <text x={150} y={222} textAnchor="middle" fontFamily={CONDENSED} fontSize={22} letterSpacing={2} fill={INK}>{txt(props, 'west').toUpperCase()}</text>
        </g>
        {p > 0 && p < 1 && <circle cx={mix(860, 150, p)} cy={190 - 8 * Math.sin(p * 9) - 6 * Math.sin(p * 3.3)} r={11} fill={OCHRE} stroke={INK} strokeWidth={3} />}
        <text x={120} y={146} fontFamily={CONDENSED} fontSize={24} fill={INK} opacity={.8}>◀ W</text>
      </g>
      <Stamp x={1580} y={850} text={txt(props, 'stamp')} size={46} p={clamp((t - stampAt - .15) / .3)} rotate={3} />
    </Svg>
    <Finish vignette={.5} />
  </div>;
}
