import React from 'react';
import {Media, clamp, easeInOut, seeded, useScene, type SceneInput} from '@talkframe/scene';

// 《呼呼》AI 陪伴玩偶宣传片（S116）共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 样片版再把本幕用到的底图以 WebP data URI 内联进 MEDIA。运行时无随机、无时钟、无网络，画面只由帧号与旁白时间决定。
const W = 1920, H = 1080;
const CREAM = '#fbf3e4', HONEY = '#f2c27b', AMBER = '#ffc86e', MIST = '#8db4d6', CORAL = '#ef8a6d', NIGHT = '#141a2e', COCOA = '#5a3b2e', LEAF = '#8fb87a';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** 回弹入场（0→1，略过冲再回落）。 */
const pop = (v: number) => {const p = clamp(v); return p >= 1 ? 1 : 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);};
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// 随包样片没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"hero":"release-assets/60f5b8e1a351373e71f94ca37dbe9ec768a599e7ed573a9174b682af8c1e754f.webp"};
/** 素材：先用素材槽（制作任务），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 列表参数（文字或对象）。 */
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value as T[] : (meta as any).params?.[key]?.default ?? [];
}
/** 数字参数。 */
function num(props: SceneInput, key: string, fallback: number): number {
  const value = Number(props.params[key]);
  return Number.isFinite(value) ? value : fallback;
}

/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  /** 包含 phrase 的那一句（玩偶台词）在第几句；找不到为 -1。 */
  const find = (phrase: string) => props.sentences.findIndex(item => phrase && item.text.replace(/\s/g, '').includes(phrase.replace(/\s/g, '')));
  return {s, t: s.t, at, start, end, endAll, find, dur: s.seconds};
}

/**
 * 玩偶“说话”的亮度 0～1：在 sentences[i] 念的时候，每个字（逐字时间）开口时亮一下再回落；
 * 没有逐字时间时按句内节奏起伏。不在说话时返回 idle。
 */
function talk(props: SceneInput, indexes: number[], t: number, idle = .35) {
  let level = idle;
  for (const i of indexes) {
    const sentence = props.sentences[i];
    if (!sentence || t < sentence.start - .05 || t > sentence.end + .35) continue;
    const words = sentence.words ?? [];
    let pulse = 0;
    if (words.length) for (const word of words) {
      const d = t - word.start;
      if (d >= 0 && d < .6) pulse = Math.max(pulse, Math.exp(-d / .16));
    }
    else pulse = .5 + .5 * Math.abs(Math.sin((t - sentence.start) * 11) * Math.sin((t - sentence.start) * 4.3 + .7));
    const body = win(t, sentence.start - .05, sentence.end + .1, .15);
    level = Math.max(level, .62 * body + .38 * pulse * body);
  }
  return clamp(level);
}

/** 满幅底图 + 运镜；children 画在同一个运镜层里（幕坐标 1920×1080，跟着图一起推拉）。 */
function Plate({asset, frame, p, from = [1.02, 0, 0], to = [1.1, -20, -10], origin = '50% 50%', opacity = 1, children}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; origin?: string; opacity?: number; children?: any}) {
  const k = easeInOut(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {children}
    </div>
  </div>;
}

/** 整版 SVG 画布（幕坐标）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', ...style}}>{children}</svg>;

type Eye = {x: number; y: number; rx: number; ry: number};
/** 表情灯：眼睛从里面亮起来。level 0 为原画（不亮），1 为最亮；tint 是灯色。 */
function EyeGlow({eyes, level, id, tint = AMBER, core = '#fff4d6'}: {eyes: Eye[]; level: number; id: string; tint?: string; core?: string}) {
  if (level <= .01) return null;
  return <Svg>
    <defs>
      <radialGradient id={`${id}-halo`}><stop offset="0" stopColor={tint} stopOpacity=".9" /><stop offset=".35" stopColor={tint} stopOpacity=".35" /><stop offset="1" stopColor={tint} stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-iris`} cx=".45" cy=".42" r=".62"><stop offset="0" stopColor={core} /><stop offset=".45" stopColor={tint} /><stop offset=".85" stopColor={tint} stopOpacity=".55" /><stop offset="1" stopColor={tint} stopOpacity="0" /></radialGradient>
    </defs>
    {eyes.map((e, i) => <g key={i}>
      <ellipse cx={e.x} cy={e.y} rx={e.rx * 4.2} ry={e.ry * 3.6} fill={`url(#${id}-halo)`} opacity={.55 * level} style={{mixBlendMode: 'screen'}} />
      <ellipse cx={e.x} cy={e.y} rx={e.rx * 1.02} ry={e.ry * 1.02} fill={`url(#${id}-iris)`} opacity={.92 * level} />
      <circle cx={e.x - e.rx * .28} cy={e.y - e.ry * .32} r={Math.max(2, e.rx * .2)} fill="#fff" opacity={.85 * level} />
    </g>)}
  </Svg>;
}

/** 声波：从 (x, y) 一圈圈扩散的弧线；speaking 为 0～1，按 0.32 秒一圈发出，只在说话时出现。 */
function Ripples({x, y, t, speaking, color = AMBER, r0 = 30, max = 190, angle = 0, spread = 70, id}: {x: number; y: number; t: number; speaking: (time: number) => number; color?: string; r0?: number; max?: number; angle?: number; spread?: number; id: string}) {
  const rings: any[] = [];
  const period = .32, life = 1.1;
  for (let k = Math.floor((t - life) / period); k <= Math.floor(t / period); k++) {
    const born = k * period, age = t - born;
    if (age < 0 || age > life) continue;
    const strength = speaking(born);
    if (strength < .5) continue;
    const r = r0 + (max - r0) * out3(age / life), a = (1 - age / life) * (strength - .45) * 1.6;
    const a0 = (angle - spread / 2) * Math.PI / 180, a1 = (angle + spread / 2) * Math.PI / 180;
    rings.push(<path key={k} d={`M ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)}`}
      fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={clamp(a)} />);
  }
  return <Svg><g id={id} style={{filter: 'drop-shadow(0 0 8px rgba(255,200,110,.7))'}}>{rings}</g></Svg>;
}

/** 五角星路径。 */
const starPath = (cx: number, cy: number, r: number, inner = .46, rot = -90) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (rot + i * 36) * Math.PI / 180, rr = i % 2 ? r * inner : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};
/** 圆角星（描边圆角）。 */
const Star = ({x, y, r, fill = AMBER, opacity = 1, rot = 0}: {x: number; y: number; r: number; fill?: string; opacity?: number; rot?: number}) =>
  <path d={starPath(x, y, r, .48, -90 + rot)} fill={fill} stroke={fill} strokeWidth={r * .22} strokeLinejoin="round" opacity={opacity} />;

/** 一把从 (x, y) 飘起的星星：born 秒起，按种子确定方向、速度与闪烁。 */
function StarBurst({x, y, t, born, count = 26, seed = 7, spread = 520, rise = 620, colors = [AMBER, '#fff1c2', HONEY, '#ffd9a0'], size = 1}:
  {x: number; y: number; t: number; born: number; count?: number; seed?: number; spread?: number; rise?: number; colors?: string[]; size?: number}) {
  const age = t - born;
  if (age < 0) return null;
  const r = seeded(seed);
  const stars = Array.from({length: count}, (_, i) => ({dx: (r() - .5) * spread, up: rise * (.45 + .55 * r()), delay: r() * .5, s: (10 + r() * 16) * size,
    spin: (r() - .5) * 140, tw: r() * 6.28, c: colors[i % colors.length], wob: 20 + r() * 40}));
  return <Svg><g style={{filter: 'drop-shadow(0 0 10px rgba(255,214,140,.85))'}}>{stars.map((st, i) => {
    const a = age - st.delay;
    if (a < 0) return null;
    const k = out3(a / 2.2), life = 1 - sm((a - 2.4) / 1.2);
    const px = x + st.dx * k + Math.sin(a * 2 + st.tw) * st.wob * k, py = y - st.up * k;
    const twinkle = .65 + .35 * Math.sin(a * 7 + st.tw);
    return <Star key={i} x={px} y={py} r={st.s * (.4 + .6 * out3(a / .3))} fill={st.c} opacity={life * twinkle} rot={st.spin * a} />;
  })}</g></Svg>;
}

/** 缓慢漂浮的光点（暖光尘埃）。 */
function Motes({t, count = 40, seed = 3, color = '255,222,160', area = [0, 0, W, H], opacity = 1, size = 1}:
  {t: number; count?: number; seed?: number; color?: string; area?: number[]; opacity?: number; size?: number}) {
  const r = seeded(seed);
  const motes = Array.from({length: count}, () => ({x: r(), y: r(), s: r(), ph: r() * 6.28, v: .3 + r() * .7}));
  const [x0, y0, x1, y1] = area;
  return <Svg><g opacity={opacity}>{motes.map((m, i) => {
    const y = y0 + (((m.y - t * .025 * m.v) % 1) + 1) % 1 * (y1 - y0), x = x0 + m.x * (x1 - x0) + Math.sin(t * .8 + m.ph) * 18;
    return <circle key={i} cx={x} cy={y} r={(1.5 + 3.5 * m.s) * size} fill={`rgba(${color},${.25 + .5 * Math.abs(Math.sin(t * 1.3 + m.ph))})`} />;
  })}</g></Svg>;
}

/** 对话气泡：p 控制弹出，type 控制打字进度（0～1）；tail 指向说话的人。 */
function Bubble({x, y, text, p, type = 1, tail = [0, 0], tone = 'light', size = 36, fonts, width, dots = false, id}:
  {x: number; y: number; text: string; p: number; type?: number; tail?: number[]; tone?: 'light' | 'amber' | 'night'; size?: number; fonts: any; width?: number; dots?: boolean; id: string}) {
  if (p <= 0 || !text) return null;
  const chars = Array.from(text), shown = chars.slice(0, Math.ceil(clamp(type) * chars.length)).join('');
  const w = width ?? Math.min(760, chars.reduce((sum, ch) => sum + (/[\x00-\xff]/.test(ch) ? size * .58 : size * 1.02), 0) + size * 1.4);
  const h = size * 2.1, k = pop(p);
  const bg = tone === 'amber' ? '#fff3dc' : tone === 'night' ? 'rgba(250,244,232,.94)' : '#fffaf2';
  const border = tone === 'amber' ? AMBER : 'rgba(90,59,46,.18)';
  const [tx, ty] = tail;
  return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none', opacity: clamp(p * 3)}}>
    {dots
      ? [0, 1, 2].map(i => {const f = (i + 1) / 4; return <div key={i} style={{position: 'absolute', left: mix(tx, x + w * .2, f) - (6 + i * 4), top: mix(ty, y + h, f) - (6 + i * 4),
          width: 12 + i * 8, height: 12 + i * 8, borderRadius: '50%', background: bg, opacity: clamp(p * 4 - i * .6), boxShadow: '0 6px 18px rgba(0,0,0,.25)'}} />;})
      : <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <path id={id} d={`M ${x + w * .22} ${y + h - 2} L ${tx} ${ty} L ${x + w * .42} ${y + h - 2} Z`} fill={bg} stroke={border} strokeWidth={2} opacity={k > .5 ? 1 : 0} />
        </svg>}
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: h / 2, background: bg, border: `3px solid ${border}`,
      boxShadow: tone === 'amber' ? '0 0 34px rgba(255,200,110,.55), 0 10px 30px rgba(0,0,0,.25)' : '0 12px 34px rgba(0,0,0,.28)',
      transform: `scale(${k})`, transformOrigin: `${(tx - x) / w * 100}% 100%`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fonts?.text, fontWeight: 700, fontSize: size, color: COCOA, letterSpacing: 1, whiteSpace: 'nowrap'}}>{shown}<span style={{opacity: 0}}>{chars.slice(shown.length).join('')}</span></div>
  </div>;
}

/** 呼呼标志：云朵般的小身子、两只小耳朵、两颗会亮的眼睛（原创图形）。 */
function Mark({x, y, size, glow = 1, id}: {x: number; y: number; size: number; glow?: number; id: string}) {
  const s = size / 100;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs><radialGradient id={`${id}-e`}><stop offset="0" stopColor="#fff4d6" /><stop offset=".55" stopColor={AMBER} /><stop offset="1" stopColor={AMBER} stopOpacity="0" /></radialGradient></defs>
    <ellipse cx={-26} cy={-44} rx={13} ry={17} fill={MIST} transform="rotate(-18 -26 -44)" />
    <ellipse cx={26} cy={-44} rx={13} ry={17} fill={MIST} transform="rotate(18 26 -44)" />
    <path d="M -46 18 C -62 18 -64 -6 -50 -12 C -56 -40 -22 -50 -10 -36 C -2 -54 30 -52 34 -32 C 56 -36 64 -6 48 2 C 62 14 50 34 34 30 C 22 44 -28 44 -36 30 C -48 34 -58 26 -46 18 Z" fill={CREAM} />
    <ellipse cx={0} cy={-2} rx={33} ry={26} fill={HONEY} />
    <circle cx={-12} cy={-4} r={13 * (.8 + .4 * glow)} fill={`url(#${id}-e)`} opacity={.9 * glow} />
    <circle cx={12} cy={-4} r={13 * (.8 + .4 * glow)} fill={`url(#${id}-e)`} opacity={.9 * glow} />
    <circle cx={-12} cy={-4} r={5.2} fill={glow > .5 ? '#fff4d6' : COCOA} />
    <circle cx={12} cy={-4} r={5.2} fill={glow > .5 ? '#fff4d6' : COCOA} />
    <path d="M -5 9 Q 0 13 5 9" fill="none" stroke={COCOA} strokeWidth={2.6} strokeLinecap="round" />
  </g>;
}

/** 品牌字：宿主正文字体的粗体，加同色圆角描边让笔画更圆润。 */
const Word = ({x, y, text, size, fill = CREAM, weight = 900, anchor = 'start', fonts, opacity = 1, spacing = 4, round = true}:
  {x: number; y: number; text: string; size: number; fill?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; fonts: any; opacity?: number; spacing?: number; round?: boolean}) =>
  !text ? null : <text x={x} y={y} textAnchor={anchor} fontFamily={fonts?.text} fontWeight={weight} fontSize={size} letterSpacing={spacing} fill={fill} opacity={opacity}
    stroke={round ? fill : 'none'} strokeWidth={round ? size * .06 : 0} strokeLinejoin="round" paintOrder="stroke">{text}</text>;

/** 小标签（圆角胶囊）：p 弹出。 */
function Chip({x, y, text, p, fonts, size = 26, bg = 'rgba(255,250,242,.92)', color = COCOA, icon}: {x: number; y: number; text: string; p: number; fonts: any; size?: number; bg?: string; color?: string; icon?: any}) {
  if (p <= 0 || !text) return null;
  const k = pop(p);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translateY(${(1 - k) * 18}px) scale(${.85 + .15 * k})`, transformOrigin: '0 50%', opacity: clamp(p * 3),
    display: 'flex', alignItems: 'center', gap: size * .4, padding: `${size * .36}px ${size * .8}px`, borderRadius: size * 2, background: bg,
    boxShadow: '0 10px 28px rgba(0,0,0,.22)', fontFamily: fonts?.text, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap'}}>{icon}{text}</div>;
}

/** 暗角。 */
const Finish = ({vignette = .45, tint = '0,0,0'}: {vignette?: number; tint?: string}) =>
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(${tint},0) 52%, rgba(${tint},${vignette}) 100%)`}} />;
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .2) => Math.min(sm(t / inS), sm((dur - t) / outS));
/** 小字说明（虚构声明等）。 */
const Note = ({children, x, y, size = 20, color = 'rgba(251,243,228,.72)', opacity = 1, fonts, align = 'left', shadow = true}: any) =>
  !children ? null : <div style={{position: 'absolute', left: align === 'right' ? undefined : x, right: align === 'right' ? W - x : undefined, top: y, fontFamily: fonts?.text, fontSize: size,
    letterSpacing: 2, color, opacity, textShadow: shadow ? '0 2px 8px rgba(0,0,0,.55)' : 'none', whiteSpace: 'nowrap'}}>{children}</div>;

/** 小图标（原创简笔，SVG）：rabbit 兔子、moon 月亮、whale 鲸鱼、apple 苹果、cake 蛋糕、tooth 牙、berry 草莓、lock 锁、heart 心、book 书。 */
function MiniIcon({kind, size = 40}: {kind: string; size?: number}) {
  const body: Record<string, any> = {
    rabbit: <g><ellipse cx="-9" cy="-22" rx="6" ry="16" fill="#fff" stroke={COCOA} strokeWidth="2.5" /><ellipse cx="9" cy="-22" rx="6" ry="16" fill="#fff" stroke={COCOA} strokeWidth="2.5" />
      <circle cx="0" cy="6" r="17" fill="#fff" stroke={COCOA} strokeWidth="2.5" /><circle cx="-6" cy="3" r="2.4" fill={COCOA} /><circle cx="6" cy="3" r="2.4" fill={COCOA} /><circle cx="0" cy="10" r="2" fill={CORAL} /></g>,
    moon: <path d="M 8 -22 A 24 24 0 1 0 22 10 A 18 18 0 1 1 8 -22 Z" fill={AMBER} stroke="#d99a3c" strokeWidth="2" strokeLinejoin="round" />,
    whale: <g><path d="M -26 6 C -26 -14 4 -18 18 -4 C 24 2 26 8 24 12 C 30 8 32 0 30 -6 C 36 2 32 14 24 16 C 14 24 -26 24 -26 6 Z" fill={MIST} stroke="#5f86a8" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="-14" cy="4" r="2.6" fill={COCOA} /><path d="M -4 -16 Q -6 -26 -12 -28 M -4 -16 Q -2 -27 4 -29" fill="none" stroke={MIST} strokeWidth="3" strokeLinecap="round" /></g>,
    apple: <g><path d="M 0 -12 C -10 -20 -26 -14 -24 4 C -22 20 -10 26 0 20 C 10 26 22 20 24 4 C 26 -14 10 -20 0 -12 Z" fill="#e2483d" stroke="#a8302a" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 0 -12 Q 2 -22 6 -26" fill="none" stroke={COCOA} strokeWidth="3" strokeLinecap="round" /><path d="M 4 -20 Q 14 -28 20 -20 Q 12 -14 4 -20 Z" fill={LEAF} /></g>,
    cake: <g><rect x="-22" y="-4" width="44" height="22" rx="5" fill="#fff4e8" stroke={COCOA} strokeWidth="2.4" /><path d="M -22 4 Q -16 10 -10 4 Q -4 10 2 4 Q 8 10 14 4 Q 18 9 22 4" fill="none" stroke={CORAL} strokeWidth="3" />
      <rect x="-2" y="-18" width="4" height="13" rx="2" fill={MIST} /><path d="M 0 -27 Q 5 -21 0 -18 Q -5 -21 0 -27 Z" fill={AMBER} /></g>,
    tooth: <path d="M -16 -18 C -8 -24 8 -24 16 -18 C 22 -12 18 2 14 10 C 11 18 10 24 6 24 C 2 24 2 12 0 12 C -2 12 -2 24 -6 24 C -10 24 -11 18 -14 10 C -18 2 -22 -12 -16 -18 Z" fill="#fff" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" />,
    berry: <g><path d="M -18 -8 C -18 -16 18 -16 18 -8 C 18 8 6 22 0 24 C -6 22 -18 8 -18 -8 Z" fill="#e8505b" stroke="#a83a42" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M -12 -14 L -4 -20 L 0 -14 L 4 -20 L 12 -14 Z" fill={LEAF} />{[[-8, -2], [6, -4], [0, 8], [-6, 12], [8, 8]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="1.4" ry="2.2" fill="#ffe7a8" />)}</g>,
    lock: <g><path d="M -11 -4 L -11 -12 A 11 11 0 0 1 11 -12 L 11 -4" fill="none" stroke={COCOA} strokeWidth="4" /><rect x="-17" y="-5" width="34" height="27" rx="6" fill={HONEY} stroke={COCOA} strokeWidth="2.4" /><circle cx="0" cy="7" r="3.6" fill={COCOA} /></g>,
    heart: <path d="M 0 20 C -24 4 -26 -14 -12 -18 C -6 -20 -1 -16 0 -11 C 1 -16 6 -20 12 -18 C 26 -14 24 4 0 20 Z" fill={CORAL} stroke="#c9604a" strokeWidth="2" strokeLinejoin="round" />,
    book: <g><path d="M -24 -14 Q -12 -20 0 -14 L 0 18 Q -12 12 -24 18 Z" fill="#fff8ec" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" /><path d="M 24 -14 Q 12 -20 0 -14 L 0 18 Q 12 12 24 18 Z" fill="#fff8ec" stroke={COCOA} strokeWidth="2.4" strokeLinejoin="round" /></g>,
  };
  return <svg width={size} height={size} viewBox="-32 -32 64 64" style={{display: 'block', overflow: 'visible'}}>{body[kind] ?? body.book}</svg>;
}

// 产品英雄镜头：呼呼站在暖色背景上。三句旁白各点亮一个卖点：念到“亲肤短绒”左侧出材质与身高标尺、身上一圈柔光；
// “充一次电”右上电池充满、写续航；“外套”右下指向叠好的备用外套、冒出肥皂泡。参数是虚构示意，左下写明。
export const meta = {
  params: {
    fabric: {label: '材质', type: 'text', default: '亲肤短绒', maxLength: 10},
    fabricSub: {label: '材质说明', type: 'text', default: '抱着刚刚好', maxLength: 16},
    fabricCue: {label: '材质卡点词', type: 'text', default: '亲肤', maxLength: 12},
    height: {label: '身高', type: 'text', default: '约 28 cm', maxLength: 12},
    sizeCue: {label: '标尺卡点词', type: 'text', default: '刚刚好', maxLength: 12},
    battery: {label: '续航', type: 'text', default: '连续对话约 6 小时', maxLength: 14},
    batterySub: {label: '续航说明', type: 'text', default: '唤醒词本机识别', maxLength: 16},
    batteryCue: {label: '续航卡点词', type: 'text', default: '充一次电', maxLength: 12},
    coat: {label: '外套', type: 'text', default: '外套可拆 · 可水洗', maxLength: 14},
    coatCue: {label: '外套卡点词', type: 'text', default: '外套', maxLength: 12},
    note: {label: '示意说明', type: 'text', default: '产品与参数为虚构演示', maxLength: 30},
  },
};
const EYES_HERO: Eye[] = [{x: 965, y: 409, rx: 35, ry: 34}, {x: 1140, y: 400, rx: 25, ry: 32}];
export default function Hero(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const f = props.fonts;
  const fabricAt = at(txt(props, 'fabricCue'), start(0, .4)), sizeAt = at(txt(props, 'sizeCue'), fabricAt + 1);
  const batAt = at(txt(props, 'batteryCue'), start(1, 3)), coatAt = at(txt(props, 'coatCue'), start(2, 6));
  const glow = .35 + .2 * Math.sin(t * 2.2) ** 2 + .3 * Math.exp(-Math.max(0, t - batAt) / .6) * (t > batAt ? 1 : 0);
  const pF = (t - fabricAt) / .5, pS = (t - sizeAt) / .7, pB = (t - batAt) / .5, pC = (t - coatAt) / .5;
  const charge = clamp((t - batAt - .2) / 1.2);
  const r = seeded(17), bubbles = Array.from({length: 18}, () => ({x: 1300 + r() * 360, d: r() * 2.2, s: 10 + r() * 22, w: r() * 6.28}));
  return <div style={{position: 'absolute', inset: 0, background: '#f6e4c4', overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .2)}}>
    <Plate asset={slot(props, 'hero')} frame={props.frame} p={t / dur} from={[1.06, 0, 10]} to={[1.0, 0, 0]} origin="50% 50%">
      {pF > 0 && <div style={{position: 'absolute', left: 960 - 330, top: 760 - 200, width: 560, height: 400, borderRadius: '50%', mixBlendMode: 'screen',
        background: 'radial-gradient(ellipse at center, rgba(255,240,210,.7), rgba(255,240,210,0) 70%)', opacity: clamp(pF) * (.6 + .4 * Math.sin((t - fabricAt) * 3) ** 2)}} />}
      <EyeGlow eyes={EYES_HERO} level={glow} id={`hg${props.seed}`} />
    </Plate>
    <Svg>
      {/* 身高标尺 */}
      {pS > 0 && <g opacity={clamp(pS * 2)} stroke={COCOA} strokeWidth={3} strokeLinecap="round">
        <line x1={650} y1={556 - 412 * out3(pS)} x2={650} y2={556 + 412 * out3(pS)} />
        <line x1={632} y1={556 - 412 * out3(pS)} x2={668} y2={556 - 412 * out3(pS)} />
        <line x1={632} y1={556 + 412 * out3(pS)} x2={668} y2={556 + 412 * out3(pS)} />
      </g>}
      {pS > 0 && <Word x={612} y={572} text={txt(props, 'height')} size={42} anchor="end" fill={COCOA} fonts={f} opacity={clamp(pS * 2 - .5)} spacing={1} />}
      {/* 外套指示线 */}
      {pC > 0 && <path d={`M 1440 650 L 1470 ${650 + 130 * out3(pC)}`} stroke={COCOA} strokeWidth={3} fill="none" strokeLinecap="round" opacity={clamp(pC * 2)} />}
      {pC > 0 && <circle cx={1470} cy={790} r={9 * pop(pC)} fill={AMBER} stroke="#fff" strokeWidth={3} />}
      {bubbles.map((b, i) => {
        const a = t - coatAt - .3 - b.d * .5;
        if (a < 0) return null;
        const y = 820 - a * 120, x = b.x + Math.sin(a * 2 + b.w) * 16, life = 1 - sm((a - 1.6) / .6);
        return <g key={i} opacity={life * clamp(a * 4)}><circle cx={x} cy={y} r={b.s} fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.9)" strokeWidth={2.4} />
          <circle cx={x - b.s * .35} cy={y - b.s * .35} r={b.s * .22} fill="#fff" /></g>;
      })}
    </Svg>
    {/* 材质 */}
    {pF > 0 && <div style={{position: 'absolute', left: 120, top: 250, opacity: clamp(pF * 2), transform: `translateX(${(1 - out3(pF)) * -40}px)`, fontFamily: f.text, color: COCOA}}>
      <div style={{fontSize: 76, fontWeight: 900, letterSpacing: 4}}>{txt(props, 'fabric')}</div>
      <div style={{fontSize: 34, fontWeight: 600, opacity: .7, marginTop: 6, letterSpacing: 6}}>{txt(props, 'fabricSub')}</div>
    </div>}
    {/* 续航：电池充满 */}
    {pB > 0 && <div style={{position: 'absolute', left: 1300, top: 170, opacity: clamp(pB * 2), transform: `translateY(${(1 - out3(pB)) * 24}px)`, fontFamily: f.text, color: COCOA}}>
      <div style={{position: 'relative', width: 150, height: 74, borderRadius: 16, border: `6px solid ${COCOA}`, boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: `${(150 - 24) * charge}px`, borderRadius: 8, background: charge >= 1 ? LEAF : HONEY}} />
        <div style={{position: 'absolute', right: -16, top: 22, width: 10, height: 24, borderRadius: 4, background: COCOA}} />
        <svg width={40} height={52} viewBox="0 0 40 52" style={{position: 'absolute', left: 50, top: 5}}><path d="M 24 2 L 6 30 L 19 30 L 15 50 L 34 20 L 21 20 Z" fill="#fff" stroke={COCOA} strokeWidth={3} strokeLinejoin="round" /></svg>
      </div>
      <div style={{fontSize: 48, fontWeight: 900, marginTop: 20, letterSpacing: 2, whiteSpace: 'nowrap'}}>{txt(props, 'battery')}</div>
      <div style={{fontSize: 28, fontWeight: 600, opacity: .65, marginTop: 4, letterSpacing: 4}}>{txt(props, 'batterySub')}</div>
    </div>}
    {/* 外套 */}
    {pC > 0 && <div style={{position: 'absolute', left: 1300, top: 560, opacity: clamp(pC * 2), transform: `scale(${.85 + .15 * pop(pC)})`, transformOrigin: '20% 100%',
      padding: '16px 30px', borderRadius: 40, background: 'rgba(255,250,242,.95)', boxShadow: '0 12px 30px rgba(90,59,46,.2)', fontFamily: f.text, fontSize: 44, fontWeight: 900, color: COCOA,
      letterSpacing: 2, whiteSpace: 'nowrap'}}>{txt(props, 'coat')}</div>}
    <Note x={60} y={806} size={18} fonts={f} shadow={false} color="rgba(90,59,46,.65)" opacity={sm((t - .5) / .5)}>{txt(props, 'note')}</Note>
  </div>;
}
