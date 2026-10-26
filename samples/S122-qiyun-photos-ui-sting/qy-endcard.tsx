// 样片 S122《栖云相册 · UI 开场动效》幕代码。由 tools/production/github-html-20261013/s122-qiyun/build.mjs 拼装（src/lib.tsx + 本幕正文），请改源文件后重拼。
// 改编自 https://github.com/heygen-com/hyperframes-launches 的 heygen-apple-motion/01-ui-sting/index.html
// （提交 d7ac35069d74a3a437780579b3b7fe2f3eeace5f；Apache License 2.0；Copyright 2026 HeyGen, Inc.；许可原文见本样片目录 LICENSE.upstream.txt 与 NOTICE.upstream.txt）。
// 修改说明（Apache-2.0 第 4(b) 条）：GSAP 时间线改写为按帧求值的 React 幕代码；七段结构、帧号、缓动与逐帧打点轨迹照原片；
// 品牌、文案、标志、图标、光标与字体全部替换为本片自绘的虚构产品“栖云相册”，不含原片的任何商标、字体或素材文件；尾卡由 0.7 秒延长到 2.2 秒。
import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// ---------------------------------------------------------------------------
// 《栖云相册 · UI 开场动效》共用库（S122）。assemble.mjs 把本文件与各幕正文拼成
// templates/samples/github-html/qiyun-sting/scenes/<module>.tsx（幕代码不能相对导入）。
//
// 改编自 heygen-com/hyperframes-launches 的 heygen-apple-motion/01-ui-sting/index.html
// （提交 d7ac35069d74a3a437780579b3b7fe2f3eeace5f，Apache-2.0，Copyright 2026 HeyGen, Inc.）。
// 保留：七段结构、全部帧号、EO/EI 一族缓动、逐帧打点的打字/里程表/高亮轨迹、切点处的同向运动。
// 改动：GSAP 时间线改写为按帧求值的 React 组件；品牌、文案、图标、标志、光标全部换成自绘的
// 虚构产品“栖云相册”；字体改用宿主字体；画布从 720² 放大到任意正方形；尾卡延长到 2.2 秒。
// ---------------------------------------------------------------------------

const FPS = 30;
/** 原片的帧号：F(n) 是第 n 帧（从 1 数）的秒数。 */
const F = (n: number) => (n - 1) / FPS;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 原片唯一的缓动族：减速 EO、加速 EI（不回弹、不线性）。 */
const EO = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const EI = (p: number) => (p <= 0 ? 0 : Math.pow(2, 10 * (p - 1)));
const p1o = (p: number) => 1 - (1 - p) * (1 - p);
const p2o = (p: number) => 1 - Math.pow(1 - p, 3);
const p3i = (p: number) => Math.pow(p, 4);
const p1io = (p: number) => (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const p2io = (p: number) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const lin = (p: number) => p;
/** GSAP 式补间：at 秒开始、dur 秒内按 ease 从 a 到 b；之前停在 a，之后停在 b。 */
const tw = (t: number, at: number, dur: number, a: number, b: number, ease: (p: number) => number = lin) =>
  a + (b - a) * ease(clamp01((t - at) / dur));

const HEX = /^#[0-9a-f]{6}$/i;
/** 配色：读 props.theme（即时播放里换配色会生效），缺省是原片的浅灰底 + 青色强调。 */
function palette(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  return {
    ground: HEX.test(th.background) ? th.background : '#F2F4F7',
    ink: HEX.test(th.text) ? th.text : '#10121A',
    mute: HEX.test(th.muted) ? th.muted : '#7C8089',
    accent: HEX.test(th.accent) ? th.accent : '#1EC8FF',
    line: '#D5D9E0', field: '#FBFCFD', card: '#FFFFFF',
  };
}
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
/** 全片时钟：f0 是本幕在原片里的起始帧（分镜 props 给），返回原片秒数与原片帧号（从 1 数）。 */
function clock(props: SceneInput) {
  const g = Number(props.params.f0 ?? 0) + props.frame;
  return {t: g / FPS, n: g + 1};
}
/** 文字宽度估算（纯函数，渲染结果确定）：汉字一个字宽，西文按字母粗估。 */
/** 粗体字标的宽度：中文按字宽估算正好；西文粗体比估算宽约 15%，按此放大，避免图形压字、整组偏心。 */
const wordmarkWidth = (text: string, size: number, spacing = 0) => textWidth(text, size, spacing) * (/[　-鿿＀-￯]/.test(text) ? 1 : 1.15);
const textWidth = (text: string, size: number, spacing = 0) => Array.from(text).reduce((w, ch) => w + spacing + size *
  (/[　-鿿＀-￯]/.test(ch) ? 1 : ch === ' ' ? .28 : /[A-Z0-9]/.test(ch) ? .62 : /[il.,'’:;!|·]/.test(ch) ? .26 : /[mwMW]/.test(ch) ? .82 : .52), 0);

/** 720×720 设计画布，按实际画幅等比放大并居中（方版 1080² 时放大 1.5 倍）。 */
function Stage({props, children}: {props: SceneInput; children: React.ReactNode}) {
  const C = palette(props);
  const side = Math.min(props.width, props.height), k = side / 720;
  return <div style={{position: 'absolute', inset: 0, background: C.ground, overflow: 'hidden', fontFamily: props.fonts.text,
    WebkitFontSmoothing: 'antialiased', fontKerning: 'none'} as React.CSSProperties}>
    <div style={{position: 'absolute', left: (props.width - side) / 2, top: (props.height - side) / 2, width: 720, height: 720,
      transform: `scale(${k})`, transformOrigin: '0 0'}}>{children}</div>
  </div>;
}

/** 自绘的虚构产品标志：渐变圆角方块里一朵云托着一轮小太阳（不是任何真实品牌）。 */
function Mark({size, id}: {size: number; id: string}) {
  return <svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block'}}>
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5BD6FF" /><stop offset=".55" stopColor="#4C8DFF" /><stop offset="1" stopColor="#8A6BFF" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${id}-g)`} />
    <circle cx="30.5" cy="17.5" r="5.2" fill="#FFE27A" />
    <path d="M12.5 33.6c-3 0-5.1-2.2-5.1-4.9 0-2.6 2-4.7 4.6-4.9.9-3.6 4.1-6.2 7.9-6.2 3.4 0 6.3 2.1 7.5 5.1.5-.1 1-.2 1.5-.2 3.3 0 6 2.6 6 5.6s-2.7 5.5-6 5.5H12.5z" fill="#FFFFFF" />
  </svg>;
}

/** 线描图标（24×24，描边风格与原片一致，路径为本片自绘）。 */
const ICONS: Record<string, string> = {
  home: 'M4 17.2V9.4L12 3.1l8 6.3v7.8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z',
  memory: 'M12 20.4s-7.6-4.4-7.6-10A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.6 2.8c0 5.6-7.6 10-7.6 10Z',
  people: 'M8.6 11.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM2.8 19.6a5.8 5.8 0 0 1 11.6 0M16.2 11a2.9 2.9 0 1 0 0-5.8M17.6 13.9a5 5 0 0 1 3.6 4.8',
  place: 'M12 21s-6.4-5.6-6.4-11a6.4 6.4 0 0 1 12.8 0c0 5.4-6.4 11-6.4 11ZM12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z',
  shared: 'M3.4 7.4a2 2 0 0 1 2-2h4.2l2 2.2h7a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2ZM9.4 15.2a2.6 2.6 0 0 1 5.2 0',
  collage: 'M3.6 3.6h7.2v9.6H3.6ZM13.2 3.6h7.2v5.4h-7.2ZM13.2 11.4h7.2v9h-7.2ZM3.6 15.6h7.2v4.8H3.6Z',
  album: 'M5.4 3.4h11.2a2 2 0 0 1 2 2v15.2l-7.6-3.6-7.6 3.6V5.4a2 2 0 0 1 2-2Z',
  film: 'M3.2 5.6h17.6v12.8H3.2ZM3.2 9.2h3.2M3.2 14.8h3.2M17.6 9.2h3.2M17.6 14.8h3.2M10.4 9.6l4 2.4-4 2.4Z',
  share: 'M12 15.2V3.6M8 7.2l4-3.6 4 3.6M5.2 11.2v7.6a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6v-7.6',
};
function Icon({name, size, color, stroke = 1.7}: {name: string; size: number; color: string; stroke?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><path d={ICONS[name] ?? ICONS.home} /></svg>;
}

/** 箭头光标（自绘，不用原片的手形光标素材）。 */
function Cursor() {
  return <svg width="119.2" height="119.2" viewBox="0 0 32 32" style={{display: 'block', overflow: 'visible'}}>
    <path d="M11 6.2v18.4l4.5-4.4 2.9 6.6 3-1.3-2.9-6.5h6.3Z" fill="#10121A" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>;
}

/** 登录卡（B 小卡 / C 放大卡共用）。 */
function SignInCard({props, typed, shine}: {props: SceneInput; typed?: string; shine?: number}) {
  const C = palette(props);
  const field: React.CSSProperties = {position: 'absolute', left: 30, width: 372, height: 62, border: `1.5px solid ${C.line}`, borderRadius: 12,
    background: C.field, display: 'flex', alignItems: 'center', paddingLeft: 17, fontSize: 16, fontWeight: 500, color: C.ink, overflow: 'hidden', whiteSpace: 'nowrap', boxSizing: 'border-box'};
  const btn: React.CSSProperties = {position: 'absolute', left: 30, width: 372, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 600, borderRadius: 26, boxSizing: 'border-box'};
  return <>
    <div style={{position: 'absolute', left: 0, top: 32, width: '100%', display: 'flex', justifyContent: 'center'}}><Mark size={34} id="card-mark" /></div>
    <div style={{position: 'absolute', left: 0, top: 76, width: '100%', textAlign: 'center', fontSize: 30, fontWeight: 700, letterSpacing: -.4, color: C.ink}}>{txt(props, 'cardTitle')}</div>
    <div style={{...field, top: 132}}>{typed ?? ''}</div>
    <div style={{...field, top: 208, color: '#9AA1AD', fontWeight: 400}}>{txt(props, 'passwordHint')}</div>
    <div style={{...btn, top: 292, background: C.ink, color: '#FFFFFF', overflow: 'hidden'}}>
      {txt(props, 'continueLabel')}
      {shine !== undefined ? <span style={{position: 'absolute', top: '-30%', left: 0, width: 62, height: '160%', transform: `translateX(${shine}px) skewX(-24deg)`,
        background: `linear-gradient(90deg, ${C.accent}00 0%, ${C.accent}80 42%, #C8F4FFE6 54%, ${C.accent}00 100%)`}} /> : null}
    </div>
    <div style={{...btn, top: 360, background: '#FFFFFF', border: `1.5px solid ${C.line}`, color: C.ink}}>{txt(props, 'signupLabel')}</div>
  </>;
}
const cardStyle = (C: ReturnType<typeof palette>): React.CSSProperties => ({position: 'absolute', left: 0, top: 0, width: 432, height: 466, background: C.card,
  borderRadius: 20, boxShadow: '0 18px 44px rgba(16,26,44,0.10), 0 2px 6px rgba(16,26,44,0.05)', transformOrigin: '0 0'});

// G · 尾卡（原片帧 305 起）：从近处缩回（Z 轴反向进场），小字两段与标志按同一阻尼弹簧错拍弹开再合拢，
// 一道光只扫过字标本身。原片尾卡只有 0.7 秒，本片延长到 2.2 秒让产品名读得清。
export const meta = {title: 'G · 尾卡', description: '标志与口号从近处缩回落定，口号两段与标志错拍弹一下，一道光扫过产品名；停留到品牌片尾。', params: {
  taglineA: {label: '口号前半', type: 'text', default: '把日子，', maxLength: 10, help: '尾卡上方小字的前半，单独弹一下'},
  taglineB: {label: '口号后半', type: 'text', default: '好好收起来', maxLength: 10, help: '尾卡上方小字的后半，晚两帧弹一下'},
  brandName: {label: '产品名', type: 'text', default: '栖云相册', maxLength: 8, help: '标志与尾卡上的产品名'},
}};

const spring = (s: number) => (s <= 0 ? 0 : 19 * Math.exp(-s / 0.279) * Math.sin((2 * Math.PI * s) / 0.5));

export default function Endcard(props: SceneInput) {
  const C = palette(props);
  const {t, n} = clock(props);
  const name = txt(props, 'brandName');
  const scale = tw(t, F(305), 1.052, 248.7 / 181.4, 1, EO) * tw(t, F(330), 1.5, 1, 1.018, p1io);
  const blur = tw(t, F(305), .18, 7, 0, p2o);
  const s = (n - 306) / FPS;
  const w1 = -spring(s), w2 = -spring(s - 2 / FPS), lock = spring(s - 1 / FPS);
  const shineX = tw(t, F(309), .47, -90, 390, p1io);
  const shineA = t < F(322) ? tw(t, F(309), .06, 0, 1) : tw(t, F(322), .08, 1, 0);
  const wordW = wordmarkWidth(name, 64, 2), sym = 82, gap = 18, total = sym + gap + wordW;
  const shineStop = (x: number) => `linear-gradient(90deg, transparent ${x - 60}px, ${C.accent}8C ${x - 30}px, #DAFAFF ${x}px, ${C.accent}8C ${x + 30}px, transparent ${x + 60}px)`;
  return <Stage props={props}>
    <div style={{position: 'absolute', left: 60, top: 268, width: 600, height: 170, transformOrigin: '50% 50%', transform: `scale(${scale})`,
      filter: blur > .01 ? `blur(${blur}px)` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 34, textAlign: 'center', lineHeight: '34px', fontSize: 27, fontWeight: 500, color: C.mute, letterSpacing: 1}}>
        <span style={{display: 'inline-block', transform: `translateY(${w1}px)`}}>{txt(props, 'taglineA')}</span>
        <span style={{display: 'inline-block', marginLeft: 4, transform: `translateY(${w2}px)`}}>{txt(props, 'taglineB')}</span>
      </div>
      <div style={{position: 'absolute', left: 300 - total / 2, top: 62, width: total, height: 96, transform: `translateY(${lock}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 7}}><Mark size={sym} id="g-mark" /></div>
        <div style={{position: 'absolute', left: sym + gap, top: 0, height: 96, lineHeight: '96px', fontSize: 64, fontWeight: 800, letterSpacing: 2, color: C.ink, whiteSpace: 'nowrap'}}>{name}</div>
        {/* 光只扫过字标本身：同一行字用渐变做底、按字形裁切 */}
        <div style={{position: 'absolute', left: sym + gap, top: 0, height: 96, lineHeight: '96px', fontSize: 64, fontWeight: 800, letterSpacing: 2, whiteSpace: 'nowrap',
          color: 'transparent', backgroundImage: shineStop(shineX), WebkitBackgroundClip: 'text', backgroundClip: 'text', opacity: shineA} as React.CSSProperties}>{name}</div>
      </div>
    </div>
  </Stage>;
}
