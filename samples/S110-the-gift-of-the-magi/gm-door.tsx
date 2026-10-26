import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {};
const KERN: Record<string, Record<string, number>> = {};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"door":"release-assets/7f8854317768900cd3d8ff33bc4a641624b023f8f42a64697cedc9b13b1270f5.webp"};
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
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
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
/** 雪：三层景深，随风斜飘、轻摆；region 限定在窗玻璃等区域。 */
function Snow({frame, amount = 1, wind = 40, seed = 3, region, opacity = 1, size = 1}:
  {frame: number; amount?: number; wind?: number; seed?: number; region?: number[]; opacity?: number; size?: number}) {
  const r = seeded(seed), n = 340, flakes = Array.from({length: n}, () => ({x: r() * W, y: r() * H, z: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    if (region) {c.beginPath(); c.rect(region[0], region[1], region[2], region[3]); c.clip();}
    flakes.forEach((m, i) => {
      if (i / n > amount) return;
      const speed = 40 + 110 * m.z * m.z, y = ((m.y + speed * t) % (H + 40) + H + 40) % (H + 40) - 20;
      const x = (((m.x + wind * (.4 + m.z) * t + Math.sin(t * (.6 + m.z) + m.ph) * (10 + 26 * m.z)) % (W + 40)) + W + 40) % (W + 40) - 20;
      const rad = (.8 + 3.2 * m.z * m.z) * size;
      c.fillStyle = `rgba(240,245,255,${.25 + .55 * m.z})`; c.beginPath(); c.arc(x, y, rad, 0, 6.283); c.fill();
      if (m.z > .8) {c.fillStyle = `rgba(240,245,255,.12)`; c.beginPath(); c.arc(x, y, rad * 2.4, 0, 6.283); c.fill();}
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 镜头震动（秒内衰减）。 */
const shake = (t: number, at: number, power = 12, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return 'none';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};


// 门开了：黑场里一道竖光，念到“opened”门缝一下子拉开，楼道的暖光和雪一起涌进来；“stopped”画面定住；
// “anger”“surprise”两个词浮出又被划掉；最后一句镜头慢慢推到他的眼睛。
export const meta = {
  title: 'The door',
  params: {
    openCue: {label: '开门卡点词', type: 'text', default: 'opened', maxLength: 24},
    stopCue: {label: '定格卡点词', type: 'text', default: 'stopped', maxLength: 24},
    notWords: {label: '被划掉的词', type: 'list', min: 0, max: 3, maxLength: 20, default: ['anger', 'surprise'], help: '旁白念到每个词时浮出并被划掉；留空不显示'},
  },
  slots: {door: '门开着，Jim 站在门口，左侧是门与楼梯'},
};
export default function Door(props: SceneInput) {
  const {t, at, start, endAll, dur} = cues(props);
  const open = at(txt(props, 'openCue'), start(0, .2) + .3), stop = at(txt(props, 'stopCue'), start(1, 1.8));
  const reveal = out3((t - open + .1) / 1.1);
  const words = list<string>(props, 'notWords').map(String);
  const last = start(words.length + 2, endAll(dur) - 2);
  // 推镜：开门后慢推；念到 stopped 定住；最后一句推向眼睛。
  const k1 = clamp((Math.min(t, stop) - open) / 3) * .35, k2 = sm((t - last) / Math.max(1, dur - last));
  const scale = 1.02 + .05 * k1 + .55 * k2, ty = 160 * k2, tx = -40 * k2;
  const chill = sm((t - stop) / .4) * (1 - k2 * .6);
  const edge = mix(425, 0, reveal), right = mix(445, W, reveal);
  return <div style={{position: 'absolute', inset: 0, background: '#050403', overflow: 'hidden', opacity: fadeEdges(t, dur, .02, .15)}}>
    <div style={{position: 'absolute', inset: 0, clipPath: `polygon(${edge}px 0, ${right}px 0, ${right}px ${H}px, ${edge}px ${H}px)`}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '52% 22%'}}>
        <Plate asset={slot(props, 'door')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
        <Glow x={470} y={185} r={230} t={t} amount={.75} seed={8} />
        <Glow x={1775} y={470} r={100} t={t} amount={.5} seed={3} />
      </div>
      <Snow frame={props.frame} amount={.6 * (1 - k2)} wind={160} seed={19} opacity={sm((t - open) / .5) * (1 - sm((t - open - 3) / 1.5))} />
      <Wash color="#1a2846" opacity={.28 * chill} blend="multiply" />
    </div>
    {reveal < 1 && <div style={{position: 'absolute', left: edge - 30, top: 0, width: right - edge + 60, height: H, mixBlendMode: 'screen', opacity: 1 - reveal,
      background: 'linear-gradient(90deg, rgba(255,190,110,0), rgba(255,200,120,.65) 45%, rgba(255,200,120,.65) 55%, rgba(255,190,110,0))'}} />}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,4,3,.82) 0%, rgba(5,4,3,.55) 22%, rgba(5,4,3,0) 40%)',
      opacity: words.length ? sm((t - start(2, stop + 1.2) + .3) / .5) * (1 - sm((t - last) / .5)) : 0}} />
    <Svg>
      {words.map((word, i) => {
        const when = at(word, start(i + 2, stop + 1.2 + i * 1.2));
        const p = (t - when) / .45, strike = clamp((t - when - .5) / .35), fade = 1 - sm((t - last) / .5);
        return <g key={i} opacity={fade}>
          <Type id={`nw${i}`} text={word} x={150} y={460 + i * 120} size={92} face="i" fill={CREAM} p={p} />
          {strike > 0 && <line x1={150} y1={438 + i * 120} x2={140 + strike * (word.length * 43 + 40)} y2={428 + i * 120} stroke="#d0603f" strokeWidth={7} strokeLinecap="round" />}
        </g>;
      })}
    </Svg>
    <Finish vignette={.55} />
  </div>;
}
