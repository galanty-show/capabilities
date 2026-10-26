import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {};
const KERN: Record<string, Record<string, number>> = {};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"combs":"release-assets/a404a1729d34619daf35bda7ceed1fadc9f9a856e569029c02343a27ff2069ad.webp"};
const W = 1920, H = 1080;
const INK = '#0e0b09', GOLD = '#e8c27a', CREAM = '#f6ecd9', EMBER = '#ffb45a', SILVER = '#dfe6ee', NIGHT = '#141b33', COPPER = '#c27a4a';
const SERIF = '"STIX Two Text", Georgia, "Times New Roman", "Songti SC", "STSong", serif';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** 素材：先用素材槽（制作任务），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 句子时间：cue 找不到时退回给定秒数，保证改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

// ---------- 排印：内联 STIX Two 字形，按字距排；缺字整串退回 <text> ----------
const latinWidth = (text: string) => Array.from(text).reduce((w, ch) => w + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? 1000 : ch === ' ' ? 250 : /[A-Z]/.test(ch) ? 690 : /[il.,'’:;!|]/.test(ch) ? 280 : /[mwMW]/.test(ch) ? 800 : /[0-9]/.test(ch) ? 500 : 480), 0);
function layout(text: string, face: string, tracking: number, mono: boolean) {
  const g = GLYPHS[face] ?? {}, k = KERN[face] ?? {}, chars = Array.from(text);
  const ok = chars.every(ch => g[ch] || ch === ' ');
  if (!ok) return {ok, chars, xs: [] as number[], width: latinWidth(text) + tracking * chars.length};
  const digit = mono ? Math.max(...'0123456789'.split('').map(d => g[d]?.[0] ?? 0)) : 0;
  const xs: number[] = [];
  let x = 0;
  chars.forEach((ch, i) => {
    const adv = mono && /[0-9]/.test(ch) ? digit : g[ch]?.[0] ?? 250;
    const off = mono && /[0-9]/.test(ch) ? (digit - (g[ch]?.[0] ?? 0)) / 2 : 0;
    xs.push(x + off);
    x += adv + tracking + (i < chars.length - 1 ? k[ch + chars[i + 1]] ?? 0 : 0);
  });
  return {ok, chars, xs, width: x - tracking};
}
/** 一行字。p：揭示进度（rise 逐字升起淡入、wipe 横扫、fade 整体淡入）；size 是字号像素；tracking 是字距（1/1000 em）。 */
function Type({text, x, y, size, face = 'b', fill = CREAM, align = 'start', tracking = 0, p = 1, mode = 'rise', maxWidth = 0, opacity = 1, shadow = true, mono = false, id, stroke}:
  {text: string; x: number; y: number; size: number; face?: 'b' | 'i'; fill?: string; align?: 'start' | 'middle' | 'end'; tracking?: number; p?: number;
    mode?: 'rise' | 'wipe' | 'fade'; maxWidth?: number; opacity?: number; shadow?: boolean; mono?: boolean; id: string; stroke?: string}) {
  if (!text || p <= 0 || opacity <= 0) return null;
  const L = layout(text, face, tracking, mono);
  let k = size / 1000;
  if (maxWidth && L.width * k > maxWidth) k = maxWidth / L.width;
  const width = L.width * k, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
  const style = shadow ? {filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.7))'} : undefined;
  if (!L.ok) {
    return <g style={style} opacity={opacity * (mode === 'fade' || mode === 'rise' ? sm(p) : 1)}>
      {mode === 'wipe' && <defs><clipPath id={`${id}-w`}><rect x={left - 20} y={y - size * 1.2} width={(width + 40) * clamp(p)} height={size * 1.6} /></clipPath></defs>}
      <text x={left} y={y} fontFamily={SERIF} fontSize={size * k * 1000 / size} fontWeight={face === 'b' ? 600 : 400} fontStyle={face === 'i' ? 'italic' : undefined}
        letterSpacing={tracking * k} fill={fill} stroke={stroke} clipPath={mode === 'wipe' ? `url(#${id}-w)` : undefined}>{text}</text>
    </g>;
  }
  const g = GLYPHS[face], n = L.chars.length, S = 5;
  return <g style={style} opacity={opacity * (mode === 'fade' ? sm(p) : 1)}>
    {mode === 'wipe' && <defs><clipPath id={`${id}-w`}><rect x={left - 20} y={y - size * 1.2} width={(width + 40) * clamp(p)} height={size * 1.7} /></clipPath></defs>}
    <g clipPath={mode === 'wipe' ? `url(#${id}-w)` : undefined}>
      {L.chars.map((ch, i) => {
        if (ch === ' ' || !g[ch]) return null;
        const q = mode === 'rise' ? clamp((p * (n + S) - i) / S) : 1;
        if (q <= 0) return null;
        const e = out3(q);
        return <path key={i} d={g[ch][1]} fill={fill} stroke={stroke} strokeWidth={stroke ? 10 : undefined} opacity={mode === 'rise' ? e : 1}
          transform={`translate(${left + L.xs[i] * k} ${y + (1 - e) * size * .22}) scale(${k})`} />;
      })}
    </g>
  </g>;
}
/** 小字说明（系统衬线：macOS 上就是 STIX Two Text）。 */
const Label = ({children, x, y, size = 26, color = 'rgba(246,236,217,.82)', opacity = 1, align = 'left', italic = false, caps = false, spacing = 0}: any) =>
  !children || opacity <= 0 ? null : <div style={{position: 'absolute', left: align === 'center' ? x - 800 : align === 'right' ? undefined : x, right: align === 'right' ? W - x : undefined,
    width: align === 'center' ? 1600 : undefined, top: y, fontFamily: SERIF, fontStyle: italic ? 'italic' : undefined, textAlign: align,
    fontSize: size, letterSpacing: caps ? size * .16 : spacing, textTransform: caps ? 'uppercase' : undefined, color, opacity,
    textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap'}}>{children}</div>;
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
// ---------- 底图 ----------
/** 满幅底图 + 运镜（scale/位移随进度缓动）。不用 CSS filter：调色一律用叠色层，保证两次渲染逐像素一致。 */
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
/** 运镜舞台：底图与贴在画里的道具（雪、灯光、表盘、价签）一起缩放平移；k 为 0→1 的运镜进度。 */
function Stage({k, from = [1, 0, 0], to = [1.08, 0, 0], origin = '50% 50%', children, extra = ''}:
  {k: number; from?: number[]; to?: number[]; origin?: string; children: any; extra?: string}) {
  const e = easeInOut(clamp(k)), s = mix(from[0], to[0], e), x = mix(from[1], to[1], e), y = mix(from[2], to[2], e);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s}) ${extra}`, transformOrigin: origin}}>{children}</div>
  </div>;
}
/** 叠色层（替代 CSS filter 调色）。 */
const Wash = ({color, opacity, blend = 'normal'}: {color: string; opacity: number; blend?: string}) =>
  opacity <= 0 ? null : <div style={{position: 'absolute', inset: 0, background: color, opacity, mixBlendMode: blend as any}} />;
/** 暗角。 */
const Finish = ({vignette = .55}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 煤气灯/烛光：带闪烁的暖光晕（screen 叠加）。 */
function Glow({x, y, r, t, amount = 1, color = '255,186,96', seed = 1}: {x: number; y: number; r: number; t: number; amount?: number; color?: string; seed?: number}) {
  if (amount <= 0) return null;
  const f = .86 + .1 * Math.sin(t * 9.1 + seed * 1.7) * Math.sin(t * 5.3 + seed) + .04 * Math.sin(t * 23 + seed * 3);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', mixBlendMode: 'screen', opacity: amount * f,
    background: `radial-gradient(circle, rgba(${color},.75) 0%, rgba(${color},.28) 22%, rgba(${color},.08) 48%, rgba(${color},0) 70%)`}} />;
}
/** 闪光：四角星，at 起亮 len 秒（twinkle）。 */
function Sparkle({x, y, size, t, at, len = .7, color = '#fffbe8'}: {x: number; y: number; size: number; t: number; at: number; len?: number; color?: string}) {
  const d = (t - at) / len;
  if (d <= 0 || d >= 1) return null;
  const e = Math.sin(Math.PI * d), s = size * (.3 + .7 * e), a = s * .16;
  return <g transform={`translate(${x} ${y}) rotate(${d * 40})`} opacity={e} style={{filter: 'drop-shadow(0 0 8px rgba(255,240,200,.9))'}}>
    <path d={`M0 ${-s} L${a} ${-a} L${s} 0 L${a} ${a} L0 ${s} L${-a} ${a} L${-s} 0 L${-a} ${-a} Z`} fill={color} />
    <circle r={a * 1.6} fill={color} />
  </g>;
}
/** 一串闪光点：pts 上按 period 轮流闪，seed 错开相位。 */
function Glints({pts, t, from, size = 26, period = 1.6, seed = 1}: {pts: number[][]; t: number; from: number; size?: number; period?: number; seed?: number}) {
  const r = seeded(seed), phase = pts.map(() => r() * period);
  return <>{pts.map((p, i) => {
    if (t < from + phase[i] * .4) return null;
    const local = ((t - from - phase[i]) % period + period) % period;
    return <Sparkle key={i} x={p[0]} y={p[1]} size={size * (.7 + .5 * ((i * 37) % 10) / 10)} t={local} at={0} len={.6} />;
  })}</>;
}
/** 镜头震动（秒内衰减）。 */
const shake = (t: number, at: number, power = 12, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return 'none';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};

// ---------- 道具：硬币、钟表、表链、剪刀、发丝 ----------
const Defs = () => <defs>
  <radialGradient id="cu" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#f0b27c" /><stop offset=".45" stopColor="#b86a3c" /><stop offset="1" stopColor="#5e2f17" /></radialGradient>
  <radialGradient id="ag" cx="36%" cy="30%" r="78%"><stop offset="0" stopColor="#ffffff" /><stop offset=".4" stopColor="#c9ccd2" /><stop offset="1" stopColor="#62666e" /></radialGradient>
  <radialGradient id="au" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#fff3c4" /><stop offset=".35" stopColor="#e2ad4c" /><stop offset=".75" stopColor="#9a6420" /><stop offset="1" stopColor="#5a3510" /></radialGradient>
  <radialGradient id="dial" cx="45%" cy="40%" r="70%"><stop offset="0" stopColor="#fdf8ec" /><stop offset=".8" stopColor="#efe2c6" /><stop offset="1" stopColor="#cdb98f" /></radialGradient>
  <radialGradient id="wood" cx="40%" cy="35%" r="80%"><stop offset="0" stopColor="#7a4a2a" /><stop offset=".7" stopColor="#3e2412" /><stop offset="1" stopColor="#1e1008" /></radialGradient>
  <linearGradient id="pt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#b9c2cc" /><stop offset="1" stopColor="#6d7682" /></linearGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f6f8" /><stop offset=".5" stopColor="#9aa3ad" /><stop offset="1" stopColor="#4c535c" /></linearGradient>
</defs>;
/** 长发如瀑：一束起伏的发丝（canvas），从 top 流到 top+len*p；用于“长发”的幽灵影像与片名下的装饰。 */
function HairFlow({frame, x, top, len, width = 220, p = 1, seed = 4, opacity = 1, color = '150,92,48'}:
  {frame: number; x: number; top: number; len: number; width?: number; p?: number; seed?: number; opacity?: number; color?: string}) {
  const r = seeded(seed), n = 46, strands = Array.from({length: n}, () => ({u: r(), ph: r() * 6.28, amp: 10 + r() * 22, w: .8 + r() * 2.2, c: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30, L = len * clamp(p);
    if (L <= 2) return;
    strands.forEach(s => {
      const x0 = x + (s.u - .5) * width * .55;
      c.strokeStyle = `rgba(${color.split(',').map((v, i) => Math.round(Number(v) * (.75 + .5 * s.c) + (i === 0 ? 20 : 0))).join(',')},${.35 + .45 * s.c})`;
      c.lineWidth = s.w; c.beginPath(); c.moveTo(x0, top);
      for (let k = 1; k <= 24; k++) {
        const v = k / 24, yy = top + L * v, spread = (s.u - .5) * width * (.55 + .7 * v);
        c.lineTo(x + spread + Math.sin(v * 7 + t * 1.6 + s.ph) * s.amp * (.3 + v), yy);
      }
      c.stroke();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}

// 他的礼物：先是一个用牛皮纸和细绳包好的小包（她在说话）；念到“gift”纸角一片片掀开，露出宝石镶边的玳瑁梳，镶边逐颗闪光；
// 末句“her hair was gone”灯光转冷，一束长发的影子从画面边上流走、散去。
export const meta = {
  title: 'The combs',
  params: {
    openCue: {label: '拆包卡点词', type: 'text', default: 'gift', maxLength: 24},
    goneCue: {label: '转冷卡点词', type: 'text', default: 'gone', maxLength: 24},
    note: {label: '注记', type: 'text', default: 'pure tortoiseshell · jeweled rims', maxLength: 48},
  },
  slots: {combs: '拆开的纸包里一套宝石镶边的玳瑁梳'},
};
const RIMS = [[820, 420], [900, 405], [1000, 400], [1100, 410], [1200, 440], [1300, 500], [620, 505], [720, 530], [840, 600], [905, 690], [960, 790], [1060, 760], [1160, 700], [1220, 640]];
export default function Combs(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const openT = at(txt(props, 'openCue'), start(2, 3)) - .1, gone = at(txt(props, 'goneCue'), start(3, dur - 1.5)) - .5;
  const o = out3((t - openT) / 1.0);
  const flap = (i: number) => out3((t - openT - i * .12) / .7);
  const cold = sm((t - gone) / .9);
  const k = t < openT ? t / Math.max(1, openT) * .3 : .3 + .7 * (t - openT) / Math.max(1, dur - openT);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .15)}}>
    <Stage k={k} from={[1.04, 0, 30]} to={[1.16, -20, -10]} origin="50% 55%">
      <Plate asset={slot(props, 'combs')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
      <Glow x={710} y={30} r={300} t={t} amount={.7} seed={2} />
      <Svg><Defs />
        <defs>
          <radialGradient id="kraftLight" cx="30%" cy="10%" r="90%"><stop offset="0" stopColor="#ffd9a0" stopOpacity=".9" /><stop offset=".6" stopColor="#ffb860" stopOpacity=".25" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs>
        <defs>
          <filter id="fiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .04" numOctaves="2" seed="5" />
            <feColorMatrix values="0 0 0 0 .25  0 0 0 0 .16  0 0 0 0 .08  0 0 0 .5 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
          <filter id="paperEdge"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" /></filter>
        </defs>
        {o < 1 && <g opacity={1 - sm((o - .8) / .2)} style={{filter: 'drop-shadow(0 18px 26px rgba(0,0,0,.55))'}}>
          {[
            {d: 'M600 360 L1320 360 L960 600 Z', move: (q: number) => `translate(0 ${-470 * q}) rotate(${-10 * q} 960 360)`, fill: '#8f6435', light: .5},
            {d: 'M480 860 L1440 860 L960 600 Z', move: (q: number) => `translate(0 ${520 * q}) rotate(${8 * q} 960 860)`, fill: '#6f4a26', light: .1},
            {d: 'M600 360 L480 860 L975 605 Z', move: (q: number) => `translate(${-640 * q} 0) rotate(${-6 * q} 540 600)`, fill: '#83592e', light: .35},
            {d: 'M1320 360 L1440 860 L945 605 Z', move: (q: number) => `translate(${640 * q} 0) rotate(${6 * q} 1380 600)`, fill: '#7a5229', light: .2},
          ].map((f, i) => <g key={i} transform={f.move(flap(i))} style={{filter: 'url(#paperEdge)'}}>
            <path d={f.d} fill={f.fill} stroke="#3e2712" strokeWidth={1.5} />
            <path d={f.d} fill="url(#kraftLight)" opacity={f.light} />
            <path d={f.d} fill="#000" filter="url(#fiber)" opacity={.9} />
          </g>)}
          <g opacity={1 - sm(o / .15)} stroke="#d9c9a4" strokeLinecap="round" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.5))'}}>
            <line x1={960} y1={360} x2={960} y2={860} strokeWidth={5} />
            <line x1={540} y1={605} x2={1380} y2={605} strokeWidth={5} />
            <path d="M960 605 C 890 535 850 560 895 615 C 925 650 960 610 960 605 C 1030 535 1070 560 1025 615 C 995 650 960 610 960 605" fill="none" strokeWidth={5} />
            <path d="M955 610 L925 690 M965 610 L1000 685" strokeWidth={4.5} fill="none" />
          </g>
        </g>}
        <Glints pts={RIMS} t={t} from={openT + .6} size={30} period={1.5} seed={4} />
      </Svg>
    </Stage>
    <Wash color="#22355e" opacity={.45 * cold} blend="multiply" />
    <HairFlow frame={props.frame} x={1700} top={-40} len={1160} width={260} p={1} seed={7} opacity={.5 * win(t, gone, gone + 1.3, .5)} />
    <Svg><Type id="cn" text={txt(props, 'note')} x={960} y={150} size={40} face="i" align="middle" fill={GOLD} p={(t - openT - .9) / .6} opacity={1 - cold} maxWidth={1000} /></Svg>
    <Finish vignette={.5} />
  </div>;
}
