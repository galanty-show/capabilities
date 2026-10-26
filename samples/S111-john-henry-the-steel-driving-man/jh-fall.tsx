import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《John Henry》共用画面库（S111）。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，并把该幕用到的底图以 WebP data URI
// 内联进 MEDIA（制作任务 1920 宽、样片 1600 宽）。画面文字与卡点词都是各幕 meta.params 的内容参数；锤击、心跳等时刻
// （props.beats）由 music_build.py 按配乐节拍算好写进分镜，画面与声音读同一张表。运行时无随机、无时钟、无网络。
const MEDIA: Record<string, string> = {"fall":"release-assets/9b92720253a2494f2589e2f61baf044aa640e14032e861f8130040da67c481fb.webp"};
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

/** 整版 SVG（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** 小号说明字（窄体大写）。 */
const Caption = ({children, x, y, size = 30, color = PAPER, opacity = 1, align = 'left', spacing = 4, font = CONDENSED, width}: any) =>
  !children ? null : <div style={{position: 'absolute', left: align === 'right' ? undefined : align === 'center' ? x - (width ?? 1600) / 2 : x,
    right: align === 'right' ? W - x : undefined, width: align === 'center' ? (width ?? 1600) : undefined, top: y, fontFamily: font, fontSize: size,
    letterSpacing: spacing, color, opacity, textAlign: align, textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>;

// 倒下：从黑场里慢慢亮起。工友围着他，汽灯摇曳，浮尘缓缓落下；念到 hammer，他手里的锤头闪一下微光。
export const meta = {
  title: 'Hammer in hand',
  params: {
    glintCue: {label: 'Glint cue word', type: 'text', default: 'hammer', maxLength: 24},
  },
  slots: {fall: 'John Henry at rest, hammer in hand, the crew around him'},
};
export default function Fall(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const glintAt = at(txt(props, 'glintCue'), 4);
  const HAMMER = {x: 1236, y: 690};
  const g = sm((t - glintAt) / .35) * (1 - sm((t - glintAt - 1.4) / .8));
  return <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', opacity: fadeEdges(t, dur, 1.1, .1)}}>
    <Plate asset={plate(props, 'fall')} frame={props.frame} p={t / dur} from={[1.08, 0, -10]} to={[1.16, -30, -30]} origin="62% 62%" />
    <Lamp t={t} x={1722} y={598} power={.6} cone={0} seed={14} />
    <Lamp t={t} x={330} y={760} power={.5} cone={0} seed={15} />
    <Dust t={t} n={150} beams={[1722, 330]} seed={95} rise={-.35} opacity={.8} />
    <Svg>
      {g > 0 && <g style={{mixBlendMode: 'screen'}} opacity={g}>
        <circle cx={HAMMER.x} cy={HAMMER.y} r={90} fill="#ffe2a0" opacity={.25} />
        {[0, 1, 2, 3].map(i => {const a = i * Math.PI / 2 + .4, l = 70 * g;
          return <line key={i} x1={HAMMER.x} y1={HAMMER.y} x2={HAMMER.x + Math.cos(a) * l} y2={HAMMER.y + Math.sin(a) * l} stroke="#fff6dc" strokeWidth={4} strokeLinecap="round" />;})}
      </g>}
    </Svg>
    <Finish vignette={.7} />
  </div>;
}
