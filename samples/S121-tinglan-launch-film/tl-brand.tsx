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

// 7 · 品牌（第 22–25 小节，Drop B）：重拍一闪，“开会，就用”逐字拼出，标志带弹性弹入、产品名落定；
// 前半句滑走、整体回到正中；第 23 小节后半镜头推进到标志里，标志成为满屏中心的大图标，
// 第 24 小节重拍口号浮现，标志随拍呼吸到段尾。原作：brand-reveal-assemble-zoom.html（拼字 → 标志弹入 → 推镜进标志）。
export const meta = {title: '品牌：就用听澜', description: '重拍一闪，前半句逐字拼出、标志弹入、产品名落定；推镜进标志，第 24 小节重拍口号浮现，标志随拍呼吸。', params: {
  lead: {label: '前半句（逐字拼出）', type: 'text', default: '开会，就用', maxLength: 8, help: '重拍时落下的前半句'},
  brand: {label: '产品名', type: 'text', default: '听澜纪要', maxLength: 8, help: '标志旁与推镜后大图标下方的产品名'},
  slogan: {label: '口号', type: 'text', default: '会开完，纪要就好', maxLength: 14, help: '推镜后产品名下面的渐变口号'},
  note: {label: '最下面一行小字', type: 'text', default: '听澜纪要为样片虚构产品', maxLength: 20, help: '画面最下面的灰色小字'},
}};

const W = 1920, H = 1080;

export default function Brand(props: SceneInput) {
  const C = palette(props);
  const {t, beat} = clock(props);
  const lead = typeUnits(txt(props, 'lead')), brand = txt(props, 'brand');     // 中文逐字、西文逐词拼出
  const flash = 1 - clamp01(t / .35);
  const charIn = (i: number) => p3o(clamp01((t - i * BEAT / 2 * .55) / .25));    // 逐字拼出（0–0.67 s）
  const logoPop = backO(2.2)(clamp01((t - .73) / .5));
  const nameIn = p3o(clamp01((t - 1.0) / .45));
  const leadOut = p3io(clamp01((t - 1.5) / .7));
  const leadW = textWidth(lead.join(''), 110, 4) + 40;
  const zoomAt = 1.5 * BAR, zoom = p3io(clamp01((t - zoomAt) / .9));
  const logoSize = 150;
  const nameW = textWidth(brand, 120, 6);
  const groupW = logoSize + 36 + nameW;
  const groupX = W / 2 - groupW / 2 + (leadW / 2) * (1 - leadOut);       // 前半句滑走后整体回正
  const logoCX = groupX + logoSize / 2, logoCY = H / 2 - 40;
  // 推镜：以标志中心为焦点放大到 2.6 倍并移到画面中上
  const zs = 1 + 1.6 * zoom, fx = W / 2, fy = 430;
  const final = p3o(clamp01((t - 2 * BAR) / .6));
  const breathe = 1 + .025 * Math.sin(beat * Math.PI) * clamp01((t - 2 * BAR) / .4);
  return <Stage props={props} background="#000000">
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, ${C.violet}${zoom > 0 ? '3A' : '22'}, transparent 60%), radial-gradient(ellipse at 50% 70%, ${C.green}1C, transparent 60%)`}} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0',
      transform: `translate(${(fx - logoCX * zs) * zoom}px, ${(fy - logoCY * zs) * zoom}px) scale(${1 + (zs - 1) * zoom})`}}>
      {/* 前半句 */}
      <div style={{position: 'absolute', left: groupX - leadW - 10, top: logoCY - 70, width: leadW, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        fontSize: 110, fontWeight: 800, letterSpacing: 4, opacity: 1 - leadOut, transform: `translateX(${-240 * leadOut}px)`}}>
        {lead.map((ch, i) => <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: charIn(i), transform: `translateY(${30 * (1 - charIn(i))}px)`}}>{ch}</span>)}
      </div>
      {/* 标志 + 产品名 */}
      <div style={{position: 'absolute', left: groupX, top: logoCY - logoSize / 2, transform: `scale(${Math.max(0, logoPop) * (zoom > 0 ? breathe : 1)})`, transformOrigin: '50% 50%', opacity: clamp01(logoPop * 2)}}>
        <Logo size={logoSize} id="b-logo" glow={.6 + .6 * zoom} />
      </div>
      <div style={{position: 'absolute', left: groupX + logoSize + 36, top: logoCY - 75, height: 150, display: 'flex', alignItems: 'center', fontSize: 120, fontWeight: 900, letterSpacing: 6,
        whiteSpace: 'nowrap', opacity: nameIn * (1 - clamp01(zoom / .45)), transform: `translateX(${30 * (1 - nameIn)}px)`}}>{brand}</div>
    </div>
    {/* 推镜落定后：每拍一圈光环从图标向外扩散；第 24、25 小节重拍各有一道高光扫过图标 */}
    {zoom >= 1 ? <>
      <div style={{position: 'absolute', left: fx - 195, top: fy - 195, width: 390, height: 390, borderRadius: 98, border: `3px solid ${C.accent}`,
        opacity: .32 * (1 - (beat % 1)), transform: `scale(${(1 + .45 * (beat % 1)) * breathe})`}} />
      <div style={{position: 'absolute', left: fx - 176 * breathe, top: fy - 176 * breathe, width: 352 * breathe, height: 352 * breathe, borderRadius: 96 * breathe, overflow: 'hidden'}}>
        {[2 * BAR, 3 * BAR].map((at, i) => {const p = clamp01((t - at) / .55); return <div key={i} style={{position: 'absolute', top: -200, left: -300 + 1000 * p2io(p), width: 120, height: 800,
          transform: 'rotate(24deg)', opacity: p > 0 && p < 1 ? .55 : 0, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.85), rgba(255,255,255,0))'}} />;})}
      </div>
    </> : null}
    {/* 推镜后：大图标下方的产品名与口号 */}
    <div style={{position: 'absolute', left: 0, width: W, top: 650, textAlign: 'center', opacity: clamp01((zoom - .55) / .45)}}>
      <div style={{fontSize: 96, fontWeight: 900, letterSpacing: 8, transform: `translateY(${20 * (1 - zoom)}px)`}}>{brand}</div>
      <div style={{marginTop: 26, fontSize: 52, fontWeight: 700, letterSpacing: 6, opacity: final, transform: `translateY(${24 * (1 - final)}px)`,
        backgroundImage: `linear-gradient(90deg, ${C.purple}, ${C.accent}, ${C.lime})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} as React.CSSProperties}>{txt(props, 'slogan')}</div>
    </div>
    <div style={{position: 'absolute', left: 0, width: W, bottom: 44, textAlign: 'center', fontSize: 22, color: C.mute, opacity: .7 * final}}>{txt(props, 'note')}</div>
    <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', opacity: .55 * flash * flash}} />
  </Stage>;
}
