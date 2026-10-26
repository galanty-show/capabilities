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

// 2 · 问题（第 2–5 小节，铺垫：军鼓越滚越密）：三台手机从中间扇开（群聊、两小时录音、没写完的纪要），
// 九个工具图标错拍弹出；第 4 小节重拍时中间那台手机缩成一个圆——“你”，八个问题气泡按八分音符一个个弹出围住你，
// 越到后面抖得越厉害；第 5 小节最后一拍音乐停住，画面同时定格压暗，接下一段的 Drop。
// 原作：problem-mockup-overwhelm.html（手机扇开 → 中间变形成圆 → 任务气泡环绕）。
export const meta = {title: '问题：会后一团乱', description: '三台手机扇开展示会后的乱象，中间手机变形成“你”，八个问题气泡随军鼓滚奏逐个弹出并越抖越急，最后一拍定格压暗。', params: {
  chatTitle: {label: '左手机：群名', type: 'text', default: '项目周会群（37）', maxLength: 12, help: '左边手机群聊顶部的群名'},
  chatLines: {label: '左手机：群消息', type: 'list', default: ['@所有人 纪要谁来发？', '上次定的是 A 还是 B？', '我没参会，结论是？', '录音发群里了，自己听'], maxLength: 16, help: '左边手机里一条条冒出的群消息'},
  chatBadge: {label: '左手机：未读角标', type: 'text', default: '99+', maxLength: 4, help: '群名右边的红色未读数'},
  recordTitle: {label: '中手机：录音名', type: 'text', default: '周会录音', maxLength: 10, help: '中间手机录音界面的标题'},
  recordTime: {label: '中手机：录音时长', type: 'text', default: '02:14:07', maxLength: 10, help: '中间手机的大号录音时长'},
  docTitle: {label: '右手机：文档名', type: 'text', default: '会议记录（草稿）', maxLength: 12, help: '右边手机里没写完的纪要文档名'},
  docMissing: {label: '右手机：红字缺项', type: 'list', default: ['决议：待补充…', '负责人：？'], max: 2, maxLength: 12, help: '文档末尾两行红字，表示没写完'},
  recordNote: {label: '中手机：录音下方小字', type: 'text', default: '还有 2 小时 14 分没听', maxLength: 16, help: '录音波形下面的灰色小字'},
  centerLabel: {label: '中间的圆', type: 'text', default: '你', maxLength: 3, help: '中间手机变成圆以后圆里的字'},
  bubbles: {label: '八个问题气泡', type: 'list', default: ['谁来负责？', '截止哪天？', '上次怎么定的？', '录音没人听完', '待办散在 17 个群', '决议没写下来', '会后各说各话', '下周再开一遍'], min: 8, max: 8, maxLength: 12, help: '围住中间圆的八个问题气泡，按八分音符逐个弹出'},
}};

const W = 1920, H = 1080;
const PHONE_W = 320, PHONE_H = 650;
const ICONS = [
  {n: 'chat', x: 330, y: 190}, {n: 'mail', x: 1560, y: 210}, {n: 'calendar', x: 250, y: 560}, {n: 'bell', x: 1660, y: 520},
  {n: 'link', x: 420, y: 880}, {n: 'users', x: 1480, y: 860}, {n: 'folder', x: 720, y: 120}, {n: 'doc', x: 1210, y: 110}, {n: 'clock', x: 960, y: 960},
];
const BUBBLES = [{a: 270, dx: 14, dy: -8}, {a: 315, dx: 122, dy: 63}, {a: 0, dx: 86, dy: 63}, {a: 45, dx: 79, dy: -9},
  {a: 90, dx: 0, dy: 0}, {a: 135, dx: -124, dy: -32}, {a: 180, dx: -79, dy: 1}, {a: 225, dx: -128, dy: 45}];

function Phone({children, C}: {children: React.ReactNode; C: Pal}) {
  return <div style={{position: 'absolute', inset: 0, borderRadius: 42, background: '#0B1020', border: '2px solid rgba(255,255,255,.14)',
    boxShadow: '0 40px 90px rgba(0,0,0,.55), inset 0 0 0 7px #05070F', overflow: 'hidden', color: C.ink}}>
    <div style={{position: 'absolute', left: 125, top: 14, width: 70, height: 20, borderRadius: 10, background: '#000'}} />
    <div style={{position: 'absolute', inset: '48px 18px 22px 18px'}}>{children}</div>
  </div>;
}

export default function Problem(props: SceneInput) {
  const C = palette(props);
  const {t, dur, beat} = clock(props);
  const morphAt = 2 * BAR, morphDur = .6;                 // 第 4 小节重拍
  const stop = dur - BEAT;                                 // 第 5 小节最后一拍：音乐停住
  const frozen = Math.min(t, stop);                        // 停住之后画面定格
  const m = p3o(clamp01((frozen - morphAt) / morphDur));
  const entry = (at: number) => backO(1.4)(clamp01((frozen - at) / .7));
  const fan = (at: number) => expoO(clamp01((frozen - at) / 1.08));
  const sideOut = 1 - p2o(clamp01((frozen - morphAt) / (morphDur * .55)));
  const centerFade = 1 - clamp01((frozen - (morphAt + morphDur * .85)) / (morphDur * .15));
  const pressure = clamp01((frozen - (morphAt + 1.6)) / (stop - morphAt - 1.6));  // 越到后面越急
  const dim = clamp01((t - stop) / .12);
  const chat = list(props, 'chatLines'), labels = list(props, 'bubbles');
  const float = (i: number, amp = 1) => Math.sin(frozen * (1.6 + .2 * i) + i) * 4 * amp;
  const centerScaleX = 1 + (220 / PHONE_W - 1) * m, centerScaleY = 1 + (220 / PHONE_H - 1) * m;
  const phoneBase = (x: number, rot: number, s: number, o: number): React.CSSProperties => ({position: 'absolute', left: W / 2 - PHONE_W / 2, top: H / 2 - PHONE_H / 2,
    width: PHONE_W, height: PHONE_H, opacity: o, transform: `translateX(${x}px) rotate(${rot}deg) scale(${s})`});
  return <Stage props={props}>
    <Backdrop C={C} glowA="#14B8A6" glowB="#7C3AED" />
    {/* 九个工具图标 */}
    {ICONS.map((icon, i) => {
      const e = backO(1.6)(clamp01((frozen - .33 - i * .07) / .45));
      const out = 1 - p2o(clamp01((frozen - morphAt) / (morphDur * .5)));
      return <div key={i} style={{position: 'absolute', left: icon.x - 52, top: icon.y - 52, width: 104, height: 104, borderRadius: 30, ...glass(30),
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp01(e) * out, transform: `scale(${Math.max(0, e) * (.85 + .15 * out)}) translateY(${float(i)}px)`}}>
        <Icon name={icon.n} size={50} color={i % 3 === 0 ? C.accent : i % 3 === 1 ? C.purple : C.ink} />
      </div>;
    })}
    {/* 左：群聊 */}
    <div style={phoneBase(-370 * fan(.2), -10 * fan(.2), (.86 + .06 * fan(.2)) * (1 - .15 * (1 - sideOut)), clamp01(entry(.2)) * sideOut)}>
      <Phone C={C}>
        <div style={{fontSize: 21, fontWeight: 700, marginBottom: 14, display: 'flex', justifyContent: 'space-between'}}>{txt(props, 'chatTitle')}
          <span style={{background: C.red, borderRadius: 12, fontSize: 15, padding: '2px 9px'}}>{txt(props, 'chatBadge')}</span></div>
        {chat.map((line, i) => <div key={i} style={{marginTop: 14, marginLeft: i % 2 ? 46 : 0, padding: '12px 14px', borderRadius: 16, fontSize: 17, lineHeight: 1.35,
          background: i % 2 ? 'rgba(24,217,232,.16)' : 'rgba(255,255,255,.08)', opacity: clamp01((frozen - .5 - i * .35) / .25)}}>{line}</div>)}
      </Phone>
    </div>
    {/* 右：没写完的纪要 */}
    <div style={phoneBase(370 * fan(.28), 10 * fan(.28), (.86 + .06 * fan(.28)) * (1 - .15 * (1 - sideOut)), clamp01(entry(.28)) * sideOut)}>
      <Phone C={C}>
        <div style={{fontSize: 21, fontWeight: 700, marginBottom: 18}}>{txt(props, 'docTitle')}</div>
        {[0, 1, 2, 3, 4, 5, 6].map(r => <div key={r} style={{height: 12, borderRadius: 6, marginTop: 16, width: `${[92, 70, 84, 40, 76, 58, 66][r]}%`,
          background: r === 3 || r === 6 ? 'rgba(239,68,68,.55)' : 'rgba(255,255,255,.16)', opacity: clamp01((frozen - .7 - r * .12) / .2)}} />)}
        {list(props, 'docMissing').slice(0, 2).map((line, i) => <div key={i} style={{marginTop: i ? 10 : 26, fontSize: 18, color: C.red, fontWeight: 700, opacity: clamp01((frozen - 1.8 - i * .4) / .3)}}>{line}</div>)}
      </Phone>
    </div>
    {/* 中：两小时录音 → 变形成圆 */}
    <div style={{...phoneBase(0, 0, 1, 1), opacity: clamp01(entry(.08)) * centerFade,
      transform: `scale(${(.84 + .16 * clamp01(entry(.08))) * 1}) scaleX(${centerScaleX}) scaleY(${centerScaleY})`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: `${42 + (160 - 42) * m}px / ${42 + (325 - 42) * m}px`, background: `linear-gradient(135deg, #14B8A6, #06B6D4, #0EA5E9)`,
        opacity: m, boxShadow: `0 0 ${50 * m}px rgba(20,184,166,.5)`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - clamp01(m / .45)}}>
        <Phone C={C}>
          <div style={{fontSize: 21, fontWeight: 700}}>{txt(props, 'recordTitle')}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 120, justifyContent: 'center'}}>
            <span style={{width: 16, height: 16, borderRadius: 8, background: C.red, opacity: .5 + .5 * Math.sin(frozen * 6)}} />
            <span style={{fontSize: 48, fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontFamily: 'Inter, "SF Pro Display", Arial, sans-serif'}}>{txt(props, 'recordTime')}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: 120, marginTop: 40}}>
            {Array.from({length: 26}, (_, i) => <span key={i} style={{width: 6, borderRadius: 3, background: C.accent,
              height: 14 + 90 * Math.abs(Math.sin(i * 1.7 + frozen * 5)) * (.4 + .6 * hash(i))}} />)}
          </div>
          <div style={{textAlign: 'center', marginTop: 50, fontSize: 17, color: C.mute}}>{txt(props, 'recordNote')}</div>
        </Phone>
      </div>
    </div>
    {/* “你”：圆 + 环绕点 */}
    <div style={{position: 'absolute', left: W / 2 - 110, top: H / 2 - 110, width: 220, height: 220, borderRadius: 110,
      background: 'linear-gradient(135deg, #14B8A6, #06B6D4 55%, #0EA5E9)', boxShadow: '0 0 50px rgba(20,184,166,.5), 0 0 100px rgba(6,182,212,.25)',
      opacity: clamp01((frozen - (morphAt + .3)) / .3), transform: `scale(${backO(1.4)(clamp01((frozen - morphAt) / .55)) * (1 + .03 * Math.sin(frozen * 3.2))})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 104, fontWeight: 800}}>
      {txt(props, 'centerLabel')}
      {[0, 1, 2].map(d => {const a = frozen * (1.2 + d * .3) + d * 2.1; return <span key={d} style={{position: 'absolute', width: 12, height: 12, borderRadius: 6,
        background: d === 1 ? C.purple : C.ink, left: 110 - 6 + Math.cos(a) * 140, top: 110 - 6 + Math.sin(a) * 140, opacity: .8}} />;})}
    </div>
    {/* 八个问题气泡：从第 4 小节第 2 拍起每个八分音符弹一个 */}
    {BUBBLES.map((b, i) => {
      const at = morphAt + BEAT + i * BEAT / 2;
      const e = backO(1.4)(clamp01((frozen - at) / .45));
      const rad = b.a * Math.PI / 180;
      const x = W / 2 + Math.cos(rad) * 420 + b.dx, y = H / 2 + Math.sin(rad) * 420 * .82 + b.dy;
      const jitter = pressure * 7 * Math.sin(frozen * 31 + i * 1.9);
      return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translate(${jitter}px, ${float(i, 1.4) - jitter * .6}px) scale(${Math.max(0, e)})`,
        opacity: clamp01(e), ...glass(40), padding: '18px 30px', fontSize: 34, fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 14,
        borderColor: `rgba(239,68,68,${.2 + .5 * pressure})`}}>
        <span style={{width: 14, height: 14, borderRadius: 7, background: i % 3 === 0 ? C.red : i % 3 === 1 ? '#F59E0B' : C.purple}} />{labels[i] ?? ''}
      </div>;
    })}
    <Vignette />
    <div style={{position: 'absolute', inset: 0, background: '#000', opacity: .55 * dim}} />
  </Stage>;
}
