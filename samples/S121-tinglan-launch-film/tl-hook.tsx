// 样片 S121《听澜纪要 · 发布片》幕代码。由 tools/production/github-html-20261013/s121-tinglan/build.mjs 拼装（src/lib.tsx + 本幕正文），请改源文件后重拼。
// 改编自 https://github.com/heygen-com/hyperframes 的 skills/hyperframes-animation/examples/（提交 23d1fe5b42724a5a9c0458475176d6bddfa235b1；
// Apache License 2.0；Copyright 2026 HeyGen, Inc.；许可原文见本样片目录 LICENSE.upstream.txt）。
// 修改说明（Apache-2.0 第 4(b) 条）：GSAP 时间线改写为按帧求值的 React 幕代码；保留各段编排与缓动，时长按配乐小节重排；
// 品牌、文案、图标与标志全部替换为本片自绘的虚构产品“听澜纪要”，不含原作的任何商标、字体、视频或图片素材。
import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// ---------------------------------------------------------------------------
// 《听澜纪要 · 发布片》共用库（S121）。build.mjs 把本文件与各幕正文拼成
// templates/samples/github-html/tinglan-launch/scenes/<module>.tsx（幕代码不能相对导入）。
//
// 改编自 heygen-com/hyperframes 的 skills/hyperframes-animation/examples/*.html（发布片分段范例：
// hook → problem → concept → workflow → metric → CTA → brand；提交 23d1fe5b42724a5a9c0458475176d6bddfa235b1，
// Apache-2.0，Copyright 2026 HeyGen, Inc.）。保留：各段的编排与缓动（计数爆开、手机扇开再变形成圆、
// 乱码解码 + 跟随光标打字、步骤状态机 + 按钮按下、数字立体叠层、CTA 胶囊按压、标志组装再推镜）。
// 改动：GSAP 时间线改写为按帧求值的 React 幕代码；每段时长按配乐《Play On》（124 BPM）的乐句重排，
// 关键动作落在小节与重拍上；品牌、文案、图标全部换成本片自绘的虚构产品“听澜纪要”，不含原片任何商标或素材。
// ---------------------------------------------------------------------------

const BPM = 124, BEAT = 60 / BPM, BAR = BEAT * 4;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lin = (p: number) => p;
const p1o = (p: number) => 1 - (1 - p) ** 2;
const p2o = (p: number) => 1 - (1 - p) ** 3;
const p3o = (p: number) => 1 - (1 - p) ** 4;
const p2i = (p: number) => p ** 3;
const p3i = (p: number) => p ** 4;
const p2io = (p: number) => (p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
const p3io = (p: number) => (p < .5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2);
const sineIO = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
const expoO = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
/** GSAP back.out(s)：先冲过头再回落。 */
const backO = (s = 1.7) => (p: number) => {const q = p - 1; return 1 + (s + 1) * q ** 3 + s * q ** 2;};
/** GSAP 式补间：at 秒开始、dur 秒内按 ease 从 a 到 b；之前停在 a，之后停在 b。 */
const tw = (t: number, at: number, dur: number, a: number, b: number, ease: (p: number) => number = lin) =>
  a + (b - a) * ease(clamp01((t - at) / dur));
/** 只在 [a, b) 秒里为 1，两端 f 秒淡入淡出。 */
const gate = (t: number, a: number, b: number, f = .2) => clamp01((t - a) / f) * (1 - clamp01((t - (b - f)) / f));
/** 确定性的“随机”：整数哈希到 0–1（不用 Math.random，两次渲染一致）。 */
const hash = (n: number) => {let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296;};

const HEX = /^#[0-9a-f]{6}$/i;
/** 配色：读 props.theme（即时播放里换配色会生效），缺省是深夜蓝底 + 青色主强调；绿、紫、金是固定辅色。 */
function palette(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  return {
    bg: HEX.test(th.background) ? th.background : '#070A14',
    ink: HEX.test(th.text) ? th.text : '#F8FAFC',
    mute: HEX.test(th.muted) ? th.muted : '#94A3B8',
    accent: HEX.test(th.accent) ? th.accent : '#18D9E8',
    green: '#22C55E', lime: '#7BEA5A', purple: '#A78BFA', violet: '#7C3AED', gold: '#EDCB50', red: '#EF4444',
  };
}
type Pal = ReturnType<typeof palette>;
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list(props: SceneInput, key: string): string[] {
  const value = props.params[key];
  const items = Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
  return items.map((item: unknown) => String(item));
}
function num(props: SceneInput, key: string): number {
  const value = Number(props.params[key]);
  return Number.isFinite(value) ? value : Number((meta as any).params?.[key]?.default ?? 0);
}
/** 幕内秒 t、幕时长，以及全片拍号（f0 是本幕起始帧，由分镜 props 给，用来对齐配乐网格）。 */
function clock(props: SceneInput) {
  const t = props.frame / props.fps, dur = props.durationInFrames / props.fps;
  const global = (Number(props.params.f0 ?? 0) + props.frame) / props.fps;
  return {t, dur, beat: global / BEAT, bar: global / BAR};
}
/** 文字宽度估算（纯函数）：汉字一个字宽，西文按字母粗估。 */
/** 逐字动画的单位：含中日文按字；纯西文按词（词后空格跟着词走），跟拍节奏不变、英文也不会拖长。 */
const CJK_RE = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/;
const typeUnits = (text: string) => CJK_RE.test(text) ? Array.from(text) : (text.match(/\S+\s*/g) ?? []);
const textWidth = (text: string, size: number, spacing = 0) => Array.from(text).reduce((w, ch) => w + spacing + size *
  (/[　-鿿＀-￯]/.test(ch) ? 1 : ch === ' ' ? .28 : /[A-Z0-9]/.test(ch) ? .64 : /[il.,'’:;!|·]/.test(ch) ? .28 : /[mwMW]/.test(ch) ? .84 : .54), 0);

/** 1920×1080 设计画布，按实际画幅等比缩放并居中。 */
function Stage({props, children, background}: {props: SceneInput; children: React.ReactNode; background?: string}) {
  const C = palette(props);
  const k = Math.min(props.width / 1920, props.height / 1080);
  return <div style={{position: 'absolute', inset: 0, background: background ?? C.bg, overflow: 'hidden', fontFamily: props.fonts.text, color: C.ink,
    WebkitFontSmoothing: 'antialiased'} as React.CSSProperties}>
    <div style={{position: 'absolute', left: (props.width - 1920 * k) / 2, top: (props.height - 1080 * k) / 2, width: 1920, height: 1080,
      transform: `scale(${k})`, transformOrigin: '0 0'}}>{children}</div>
  </div>;
}
/** 深色渐变底（静态，不做运行时滤镜，保证导出确定）。 */
function Backdrop({C, glowA = C.violet, glowB = C.accent, x = 0, y = 0}: {C: Pal; glowA?: string; glowB?: string; x?: number; y?: number}) {
  return <div style={{position: 'absolute', inset: -40, transform: `translate(${x}px, ${y}px)`,
    background: `radial-gradient(ellipse at 28% 30%, ${glowA}40, transparent 58%), radial-gradient(ellipse at 74% 72%, ${glowB}2E, transparent 60%), linear-gradient(135deg, #0A0D1F 0%, ${C.bg} 55%, #14091C 100%)`}} />;
}
const Vignette = () => <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none'}} />;

/** 线描图标（24×24，本片自绘）。 */
const ICON: Record<string, string> = {
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  mic: 'M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5ZM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21',
  doc: 'M6 3h8l4 4v14H6ZM14 3v4h4M9 12h6M9 16h6',
  check: 'M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10',
  chat: 'M4 5h16v11H9l-5 4Z',
  calendar: 'M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4ZM10 21h4',
  mail: 'M3 6h18v12H3ZM3 7l9 7 9-7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20a6 6 0 0 1 12 0M16 4.5a3.3 3.3 0 0 1 0 6.4M21 20a5.4 5.4 0 0 0-3.6-5.1',
  folder: 'M3 6h6l2 2h10v11H3Z',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
};
function Icon({name, size, color, stroke = 1.8, style}: {name: string; size: number; color: string; stroke?: number; style?: React.CSSProperties}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={{display: 'block', ...style}}><path d={ICON[name] ?? ICON.spark} /></svg>;
}
/** 虚构产品“听澜纪要”的标志：渐变圆角方块里三道声波收成一个对勾（自绘）。 */
function Logo({size, id, glow = 0}: {size: number; id: string; glow?: number}) {
  // 光晕用径向渐变底衬，不用 CSS filter（缩放运镜里的滤镜两次渲染可能不一致）。
  return <div style={{position: 'relative', width: size, height: size}}>
    {glow > 0 ? <div style={{position: 'absolute', inset: -size * .45, borderRadius: '50%', opacity: Math.min(1, glow),
      background: 'radial-gradient(circle, rgba(24,217,232,.45) 0%, rgba(124,58,237,.18) 38%, rgba(0,0,0,0) 68%)'}} /> : null}
    <svg width={size} height={size} viewBox="0 0 96 96" style={{position: 'relative', display: 'block', overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED" /><stop offset=".55" stopColor="#18A8E8" /><stop offset="1" stopColor="#22C55E" /></linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".35" /><stop offset=".5" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx="24" fill={`url(#${id}-g)`} />
      <rect x="4" y="4" width="88" height="88" rx="24" fill={`url(#${id}-s)`} />
      <path d="M22 50v-4M32 58V38M42 52v-8" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 50l9 9 17-20" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>;
}
/** 箭头光标（自绘）。 */
function Cursor({size = 64}: {size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 32 32" style={{display: 'block', overflow: 'visible'}}>
    <path d="M8.2 6v21l5.6-5.4 3.6 8.1 3.6-1.6-3.6-8h7.9Z" fill="rgba(0,0,0,.35)" />
    <path d="M7 4v21l5.6-5.4 3.6 8.1 3.6-1.6-3.6-8h7.9Z" fill="#FFFFFF" stroke="#0B0F1A" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>;
}
/** 毛玻璃面板（静态半透明底，不用 backdrop-filter，保证导出确定）。 */
const glass = (radius = 28): React.CSSProperties => ({borderRadius: radius, background: 'linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.035))',
  border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 30px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)'});

// 1 · 钩子（第 0–1 小节，前奏）：四个图标错拍弹入、贴着中心挤在一起，大数字从 0 数到 90 并越数越大，
// 图标随计数向四角炸开；百分号单独弹入；第 1 小节重拍时下面一行字揭开；镜头先聚焦再缓推。
// 原作：hook-counter-burst.html（Counting Icon Burst）。
export const meta = {title: '钩子：数字炸开', description: '大数字计数并放大，四个图标随计数向外炸开，百分号弹入，第 1 小节重拍揭开下半句。', params: {
  value: {label: '数字', type: 'number', default: 90, min: 1, max: 9999, help: '从 0 数到这个数，数字越数越大'},
  unit: {label: '单位', type: 'text', default: '%', maxLength: 3, help: '数字右边单独弹入的单位，比如 % 或 倍'},
  caption: {label: '数字下面一句', type: 'text', default: '的会议纪要，会后没人再看', maxLength: 18, help: '第 1 小节重拍时在数字下方揭开的一句'},
}};

const W = 1920, H = 1080, ICON_SIZE = 180;
const CX = W / 2 - ICON_SIZE / 2, CY = H / 2 - ICON_SIZE / 2 - 40;
const ICONS = [
  {name: 'clock', tx: W * .06, ty: H * .16, at: .17, rot: -180, s: 1.5},
  {name: 'mic', tx: W * .85, ty: H * .18, at: .30, rot: 0, s: 1.5},
  {name: 'doc', tx: W * .05, ty: H * .64, at: .43, rot: 0, s: 1.4},
  {name: 'check', tx: W * .87, ty: H * .62, at: .57, rot: 90, s: 1.5},
];

export default function Hook(props: SceneInput) {
  const C = palette(props);
  const {t, beat} = clock(props);
  const target = Math.max(1, Math.round(num(props, 'value')));
  const countAt = .47, countDur = 1.0;
  const cp = clamp01((t - countAt) / countDur), eased = 1 - (1 - cp) ** 2.5;
  const number = t < countAt ? 0 : Math.round(eased * target);
  const numScale = .476 + eased * (1 - .476);
  const entry = p3o(clamp01((t - .27) / .7));
  const pct = backO(1.4)(clamp01((t - 1.27) / .55));
  const camera = (t < 2.33 ? tw(t, .5, 1.83, .92, 1, p2o) : tw(t, 2.33, 1.54, 1, 1.09, p2o));
  const expand = p2o(cp);
  const capT = BAR; // 第 1 小节重拍（底鼓进来）
  const cap = p3o(clamp01((t - capT) / .5));
  const kick = beat >= 4 ? Math.exp(-(beat % 1) * 6) : 0;
  return <Stage props={props}>
    <Backdrop C={C} glowA="#5064C8" glowB="#B45096" x={tw(t, 0, 3.9, 0, 6, sineIO)} y={tw(t, 0, 3.9, 0, -4, sineIO)} />
    <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,.62)'}} />
    <div style={{position: 'absolute', inset: 0, transform: `scale(${camera}) translate(${tw(t, 0, 3.9, 0, 3, sineIO)}px, ${2 - 1.6 * clamp01(t / 3.9)}px)`, transformOrigin: '50% 50%'}}>
      {ICONS.map((icon, i) => {
        const p = clamp01((t - icon.at) / .55), e = backO(icon.s)(p);
        const k = (1 - .4) * (1 - expand); // 起点在离目标 60% 的路上，随计数同步炸开到目标位
        const x = icon.tx + (CX - icon.tx) * k, y = icon.ty + (CY - icon.ty) * k;
        const local = Math.max(0, t - icon.at);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: ICON_SIZE, height: ICON_SIZE, opacity: .85 * clamp01(e),
          transform: `scale(${Math.max(0, e)}) rotate(${icon.rot * (1 - Math.min(1, e))}deg)`}}>
          <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {icon.name === 'clock' ? <>
              <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - p2o(p))} />
              <line x1="12" y1="12" x2="12" y2="8" stroke="#FFFFFF" strokeWidth="1.6" />
              <line x1="12" y1="12" x2="12" y2="6.2" stroke={C.gold} strokeWidth="1.6" transform={`rotate(${120 * local} 12 12)`} />
              <circle cx="12" cy="12" r="1.3" fill={C.gold} />
            </> : icon.name === 'mic' ? <>
              <rect x="9.2" y="3.5" width="5.6" height="10.5" rx="2.8" stroke="#FFFFFF" strokeWidth="1.6" />
              <path d="M6 11a6 6 0 0 0 12 0M12 17v3.5" stroke="#FFFFFF" strokeWidth="1.6" />
              {[0, 1].map(w => <path key={w} d={`M${19.5 + w * 2} ${8 - w} q1.6 3 0 ${6 + w * 2}`} stroke={C.gold} strokeWidth="1.4"
                opacity={.35 + .65 * (.5 + .5 * Math.sin(local * 6 - w * 1.2))} />)}
            </> : icon.name === 'doc' ? <>
              <path d="M6 3h8l4 4v14H6Z" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="56" strokeDashoffset={56 * (1 - p2o(p))} />
              {[0, 1, 2].map(r => <line key={r} x1="9" y1={11 + r * 3} x2={9 + 6 * clamp01((local - .3 - r * .25) / .35)} y2={11 + r * 3} stroke={r === 2 ? C.red : '#FFFFFF'} strokeWidth="1.5" />)}
            </> : <>
              <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - p2o(p))} />
              <path d="M8 12.2l2.6 2.6L16.2 9" stroke={C.gold} strokeWidth="1.8" transform={`scale(${1 + .08 * Math.sin(local * 2.4)})`} style={{transformOrigin: '12px 12px'}} />
            </>}
          </svg>
        </div>;
      })}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H - 120, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 2000}}>
        <div style={{display: 'flex', alignItems: 'baseline', opacity: entry, transform: `translateZ(${-300 * (1 - entry)}px) rotateY(${10 * (1 - entry)}deg) scale(${.7 + .3 * entry})`}}>
          <span style={{fontSize: 640, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: .9, fontVariantNumeric: 'tabular-nums', display: 'inline-block',
            transform: `scale(${numScale})`, transformOrigin: 'center bottom', fontFamily: 'Inter, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'}}>{number}</span>
          <span style={{fontSize: 214, fontWeight: 700, color: C.gold, marginLeft: 16, display: 'inline-block', opacity: clamp01(pct * 1.2),
            transform: `translateX(${60 * (1 - pct)}px) rotate(${20 * (1 - pct)}deg) scale(${.4 + .6 * pct})`, fontFamily: 'Inter, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'}}>{txt(props, 'unit')}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 812, textAlign: 'center', fontSize: 76, fontWeight: 800, letterSpacing: 4,
        opacity: cap, transform: `translateY(${(1 - cap) * 40}px)`, clipPath: `inset(-20% ${100 - 100 * cap}% -20% 0)`}}>
        {txt(props, 'caption')}
      </div>
    </div>
    <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${180 + 120 * kick}px rgba(237,203,80,${.04 + .06 * kick})`, pointerEvents: 'none'}} />
    <Vignette />
  </Stage>;
}
