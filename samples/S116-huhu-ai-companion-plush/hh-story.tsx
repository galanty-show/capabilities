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
const MEDIA: Record<string, string> = {"story":"release-assets/06ac4713c8795ce45ad20039f97458a3208df005141f1325342e36a7472fa3fa.webp"};
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

// 睡前故事：小满和呼呼并排躺着，前景一本代码画的绘本。念到“每晚”连翻三页（每晚不一样），停在小兔子和一扇圆门；
// 呼呼问“小兔子推开门”时门开、透出暖光，念到“门外”一把星星从门里飞出来、飘满画面。开头念到“呼呼”时左上角亮出品牌名。
export const meta = {
  params: {
    name: {label: '产品名', type: 'text', default: '呼呼', maxLength: 8},
    brandLine: {label: '品牌副标题', type: 'text', default: '絮光 AI 陪伴玩偶', maxLength: 20},
    nameCue: {label: '品牌名卡点词', type: 'text', default: '呼呼', maxLength: 12},
    flipCue: {label: '翻页卡点词', type: 'text', default: '每晚', maxLength: 12},
    doorCue: {label: '开门卡点词', type: 'text', default: '推开门', maxLength: 12},
    starsCue: {label: '星星飞出卡点词', type: 'text', default: '门外', maxLength: 12},
    toyLine: {label: '玩偶台词里的词', type: 'text', default: '小兔子', maxLength: 12, help: '用来找出哪一句是呼呼说的（那一句眼睛跟着亮）'},
  },
};
const EYES_STORY: Eye[] = [{x: 1211, y: 437, rx: 24, ry: 22}, {x: 1359, y: 436, rx: 24, ry: 22}];
const BX = 960, BY = 590, PW = 330, PH = 230, BOOK = 1.22;
/** 书在画面里的位置：以 (960, 690) 为中心放大 BOOK 倍；门的位置随之换算。 */
const DOOR = [BX + PW / 2 * BOOK, 690 + 30 * BOOK];
/** 绘本内页（原创简笔）：0 月亮小船、1 鲸鱼、2 萤火虫森林、3 小兔子和圆门。open 是门开的程度。 */
function Page({spread, side, open = 0}: {spread: number; side: 'l' | 'r'; open?: number}) {
  const x = side === 'l' ? BX - PW : BX, y = BY, cx = x + PW / 2, cy = y + PH / 2;
  const shade = side === 'l' ? 'url(#pg-shade-l)' : 'url(#pg-shade-r)';
  const art: any[] = [];
  if (spread === 0) {
    if (side === 'l') art.push(<path key="m" d={`M ${cx + 26} ${cy - 70} A 52 52 0 1 0 ${cx + 56} ${cy + 2} A 40 40 0 1 1 ${cx + 26} ${cy - 70} Z`} fill={AMBER} />,
      <path key="b" d={`M ${cx - 80} ${cy + 40} Q ${cx} ${cy + 90} ${cx + 80} ${cy + 40} Z`} fill={CORAL} />, <line key="s" x1={cx} y1={cy + 42} x2={cx} y2={cy - 20} stroke={COCOA} strokeWidth={4} />,
      <path key="f" d={`M ${cx + 2} ${cy - 18} L ${cx + 44} ${cy + 26} L ${cx + 2} ${cy + 26} Z`} fill="#fff" stroke={COCOA} strokeWidth={2} />);
    else art.push(...[0, 1, 2].map(i => <path key={i} d={`M ${x + 20} ${cy + 40 + i * 26} q 36 -18 72 0 t 72 0 t 72 0 t 72 0`} fill="none" stroke={MIST} strokeWidth={6} strokeLinecap="round" />),
      ...[[x + 80, y + 60, 16], [x + 190, y + 48, 11], [x + 260, y + 90, 14]].map(([sx, sy, r], i) => <Star key={`s${i}`} x={sx} y={sy} r={r} fill={AMBER} />));
  } else if (spread === 1) {
    if (side === 'l') art.push(<g key="w" transform={`translate(${cx} ${cy + 10}) scale(3.2)`}><path d="M -26 6 C -26 -14 4 -18 18 -4 C 24 2 26 8 24 12 C 30 8 32 0 30 -6 C 36 2 32 14 24 16 C 14 24 -26 24 -26 6 Z" fill={MIST} /><circle cx="-14" cy="4" r="2.6" fill={COCOA} /></g>);
    else art.push(<ellipse key="i" cx={cx} cy={cy + 60} rx={120} ry={34} fill={HONEY} />, <path key="t" d={`M ${cx} ${cy + 40} Q ${cx - 6} ${cy - 20} ${cx + 10} ${cy - 50}`} fill="none" stroke={COCOA} strokeWidth={7} strokeLinecap="round" />,
      <path key="l" d={`M ${cx + 10} ${cy - 50} q -50 -10 -70 20 M ${cx + 10} ${cy - 50} q 50 -14 70 18 M ${cx + 10} ${cy - 50} q -10 -40 -40 -50`} fill="none" stroke={LEAF} strokeWidth={9} strokeLinecap="round" />);
  } else if (spread === 2) {
    art.push(...[0, 1, 2].map(i => <path key={i} d={`M ${x + 40 + i * 100} ${y + PH - 30} l 40 -${120 + (i % 2) * 40} l 40 ${120 + (i % 2) * 40} Z`} fill={i % 2 ? '#7da36c' : LEAF} />),
      ...[[x + 70, y + 60], [x + 170, y + 90], [x + 250, y + 50], [x + 120, y + 120], [x + 290, y + 130]].map(([fx, fy], i) =>
        <circle key={`f${i}`} cx={fx + (side === 'l' ? 0 : 6)} cy={fy} r={7} fill="#fff1a8" style={{filter: 'drop-shadow(0 0 6px #ffe27a)'}} />));
  } else {
    if (side === 'l') art.push(<g key="r" transform={`translate(${cx} ${cy + 20}) scale(3.6)`}><ellipse cx="-9" cy="-22" rx="6" ry="16" fill="#fff" stroke={COCOA} strokeWidth="2" />
      <ellipse cx="9" cy="-22" rx="6" ry="16" fill="#fff" stroke={COCOA} strokeWidth="2" /><circle cx="0" cy="6" r="17" fill="#fff" stroke={COCOA} strokeWidth="2" />
      <circle cx="-6" cy="3" r="2.2" fill={COCOA} /><circle cx="6" cy="3" r="2.2" fill={COCOA} /><circle cx="0" cy="10" r="2" fill={CORAL} /></g>);
    else {
      const dx = cx, dy = cy + 30;
      art.push(<path key="h" d={`M ${x + 10} ${y + PH - 8} Q ${cx} ${y + 10} ${x + PW - 10} ${y + PH - 8} Z`} fill={LEAF} />,
        <circle key="glow" cx={dx} cy={dy} r={52 + 40 * open} fill={AMBER} opacity={.55 * open} style={{filter: 'blur(10px)'}} />,
        <ellipse key="hole" cx={dx} cy={dy} rx={46} ry={56} fill="#fff1c9" />,
        <g key="door" transform={`translate(${dx - 46} 0) scale(${1 - .9 * open} 1) translate(${-(dx - 46)} 0)`}>
          <ellipse cx={dx} cy={dy} rx={46} ry={56} fill="#b7774a" stroke={COCOA} strokeWidth={3} />
          <line x1={dx} y1={dy - 52} x2={dx} y2={dy + 52} stroke={COCOA} strokeWidth={2} opacity={.5} /><circle cx={dx + 26} cy={dy + 6} r={5} fill={AMBER} />
        </g>);
    }
  }
  return <g>
    <rect x={x} y={y} width={PW} height={PH} fill="#fffaf0" />
    <clipPath id={`pg-${spread}-${side}`}><rect x={x} y={y} width={PW} height={PH} /></clipPath>
    <g clipPath={`url(#pg-${spread}-${side})`}>{art}</g>
    <rect x={x} y={y} width={PW} height={PH} fill={shade} />
  </g>;
}
export default function Story(props: SceneInput) {
  const {t, at, start, end, find, dur} = cues(props);
  const toy = find(txt(props, 'toyLine'));
  const flip0 = at(txt(props, 'flipCue'), start(0, .4) + 1) - .05;
  const flips = [flip0, flip0 + .5, flip0 + 1.0], D = .42;
  const door = at(txt(props, 'doorCue'), start(Math.max(0, toy), 4) + .6), stars = at(txt(props, 'starsCue'), door + 1.2);
  const nameAt = at(txt(props, 'nameCue'), start(0, .4));
  // 翻页状态：spread 是当前摊开的一页，q 是正在翻的那一页的进度。
  let spread = 0, q = -1;
  flips.forEach((f, i) => {if (t >= f + D) spread = i + 1; else if (t >= f && q < 0) {spread = i; q = (t - f) / D;}});
  const open = sm((t - door) / .6);
  const rise = out3((t - .05) / .5), level = toy >= 0 ? talk(props, [toy], t, .22) : .22;
  const speaking = (time: number) => toy >= 0 ? talk(props, [toy], time, 0) : 0;
  const brand = win(t, nameAt - .1, end(0, 3) + .1, .3);
  return <div style={{position: 'absolute', inset: 0, background: NIGHT, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .2)}}>
    <Plate asset={slot(props, 'story')} frame={props.frame} p={t / dur} from={[1.04, 0, -10]} to={[1.1, 0, -30]} origin="50% 40%">
      <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: .45 * open,
        background: 'radial-gradient(ellipse 900px 600px at 1160px 727px, rgba(255,200,110,.5), rgba(255,180,90,0) 70%)'}} />
      <EyeGlow eyes={EYES_STORY} level={level} id={`sg${props.seed}`} />
      <Ripples x={1285} y={440} t={t} speaking={speaking} r0={190} max={330} angle={-5} spread={60} id={`sr${props.seed}`} />
    </Plate>
    <Svg style={{transform: `translateY(${(1 - rise) * 320}px)`, opacity: clamp(rise * 2)}}><g transform={`translate(${BX} 690) scale(${BOOK}) translate(${-BX} ${-(BY + PH / 2)})`}>
      <defs>
        <linearGradient id="pg-shade-l" x1="1" x2="0"><stop offset="0" stopColor="#5a3b2e" stopOpacity=".28" /><stop offset=".18" stopColor="#5a3b2e" stopOpacity="0" /></linearGradient>
        <linearGradient id="pg-shade-r" x1="0" x2="1"><stop offset="0" stopColor="#5a3b2e" stopOpacity=".28" /><stop offset=".18" stopColor="#5a3b2e" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x={BX - PW - 18} y={BY - 10} width={PW * 2 + 36} height={PH + 26} rx={16} fill={CORAL} style={{filter: 'drop-shadow(0 26px 40px rgba(0,0,0,.45))'}} />
      <Page spread={spread} side="l" />
      <Page spread={q >= 0 ? spread + 1 : spread} side="r" open={open} />
      {q >= 0 && q < .5 && <g transform={`translate(${BX} 0) scale(${1 - 2 * q} 1) translate(${-BX} 0)`}><Page spread={spread} side="r" />
        <rect x={BX} y={BY} width={PW} height={PH} fill="#5a3b2e" opacity={.35 * q * 2} /></g>}
      {q >= .5 && <g><g transform={`translate(${BX} 0) scale(${2 * q - 1} 1) translate(${-BX} 0)`}><Page spread={spread + 1} side="l" />
        <rect x={BX - PW} y={BY} width={PW} height={PH} fill="#5a3b2e" opacity={.35 * (2 - 2 * q)} /></g></g>}
      <line x1={BX} y1={BY} x2={BX} y2={BY + PH} stroke="#c9b48f" strokeWidth={3} />
    </g></Svg>
    {/* 门外的星星：一把飞出，再陆续飘出几颗 */}
    <StarBurst x={DOOR[0]} y={DOOR[1]} t={t} born={stars - .05} count={36} seed={11} spread={1100} rise={640} size={1.1} />
    {[.45, .9, 1.35, 1.8].map((d, i) => <StarBurst key={i} x={DOOR[0]} y={DOOR[1]} t={t} born={stars + d} count={6} seed={20 + i} spread={500} rise={520} size={.8} />)}
    {brand > 0 && <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 330, opacity: .75 * brand, background: 'radial-gradient(ellipse 420px 200px at 260px 140px, rgba(10,14,32,.7), rgba(10,14,32,0) 70%)'}} />
      <Svg style={{opacity: brand, transform: `translateY(${(1 - brand) * 14}px)`}}>
        <Mark x={150} y={150} size={120} glow={brand} id={`sm${props.seed}`} />
        <Word x={232} y={178} text={txt(props, 'name')} size={92} fonts={props.fonts} fill={CREAM} />
        <Word x={238} y={232} text={txt(props, 'brandLine')} size={30} weight={600} spacing={6} fonts={props.fonts} fill={HONEY} round={false} />
      </Svg>
    </>}
    <Finish vignette={.42} />
  </div>;
}
