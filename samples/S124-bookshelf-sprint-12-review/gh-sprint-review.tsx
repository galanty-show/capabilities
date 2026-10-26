import React from 'react';
import type {SceneInput} from '@talkframe/scene';

/*
 * 改编自 claude-code-video-toolkit 的 hello-world 示例「SprintReview」
 * （https://github.com/digitalsamba/claude-code-video-toolkit ，提交 959e0fc6c202，
 * examples/hello-world/src/SprintReview.tsx、components/slides/、components/demos/DemoSection.tsx 与 lib/components/），
 * MIT License，Copyright (c) 2024 Digital Samba。
 * 保留原作的运动设计：标题页 logo 方块弹入、标题与各行依次淡入、整体从 0.95 放大；概览要点逐条从左滑入、高亮词着主色；
 * 演示段左下角标签条（带需求号）；总结页大数字弹入后计数上滚；致谢深色页标题与各组依次淡入上移；
 * 全程 AnimatedBackground（subtle 变体：三团缓慢漂移的径向渐变）与右上角 MazeDecoration（方块按到角距离起伏的波纹）；
 * SlideTransition 的 zoom（0.97→1 进、1→1.02 出）与 blur-fade（8px 模糊进出）。
 * 文影的改动：文字中文化，主题改为虚构的「书架」社区图书馆小程序第 12 周迭代回顾，内容全部进 meta.params；
 * 演示段原为录屏视频，改为代码画的手机界面示意（扫码框 → 书卡 → 手指点“确认借阅” → 成功与还书日期），右侧加步骤列表；
 * PointingHand 的表情符号手指改为 SVG 手形；合并为一个模块、六幕共用（props.shot 选段，props.f0 接全片时钟）；
 * 各元素入场按 100 BPM 配乐的拍点重排；去掉 Audio / OffthreadVideo / Img / staticFile 与 logo、截图素材槽；配色读 props.theme。
 */
export const meta = {
  title: '迭代回顾（改编自 claude-code-video-toolkit SprintReview）',
  description: '浅底柔和背景与角落迷宫装饰上的六段迭代回顾：标题页 logo 弹入、概览要点逐条滑入、手机界面示意扫码借书、三个数字计数上滚、深色致谢分组淡入。六幕共用本模块，props.shot 选段。',
  params: {
    logoChar: {label: 'logo 方块里的字', type: 'text', default: '书', maxLength: 2},
    product: {label: '产品名（标题页、致谢页底部）', type: 'text', default: '书架小程序', maxLength: 12},
    sprintLabel: {label: '副行前半', type: 'text', default: '迭代回顾', maxLength: 8},
    sprintName: {label: '副行高亮（主色）', type: 'text', default: '第 12 周', maxLength: 8},
    sprintJoin: {label: '副行连接符（前半与高亮之间）', type: 'text', default: '：', maxLength: 3},
    dateRange: {label: '日期行', type: 'text', default: '10 月 6 日 – 10 月 12 日', maxLength: 30},
    platform: {label: '平台行', type: 'text', default: '移动端 · v1.4', maxLength: 20},
    overviewEyebrow: {label: '概览眉题', type: 'text', default: '迭代概览', maxLength: 10},
    overviewTitle: {label: '概览标题', type: 'text', default: '本周做了什么', maxLength: 16},
    items: {label: '概览要点', type: 'list', min: 1, max: 4, maxLength: 16,
      default: [{text: '借书流程', highlight: '两步完成'}, {text: '到期提醒', highlight: '按天推送'}, {text: '读屏', highlight: '全页可用'}],
      item: [{key: 'text', label: '要点', type: 'text'}, {key: 'highlight', label: '高亮词', type: 'text'}]},
    demoLabel: {label: '演示标签', type: 'text', default: '演示：扫码借书', maxLength: 14},
    demoRef: {label: '需求号', type: 'text', default: '需求 #142', maxLength: 12},
    steps: {label: '右侧步骤', type: 'list', min: 1, max: 5, maxLength: 10, default: ['扫描书背条形码', '核对书目信息', '确认借阅', '记下还书日期']},
    scanHint: {label: '扫码提示', type: 'text', default: '将书背条形码放入框内', maxLength: 14},
    detectedText: {label: '识别成功小标签', type: 'text', default: '已识别', maxLength: 10},
    manualText: {label: '手动输入链接', type: 'text', default: '手动输入书号', maxLength: 24},
    bookTitle: {label: '书名（虚构）', type: 'text', default: '夏天的图书馆', maxLength: 8},
    bookQuotes: {label: '书名两侧的符号（左右各一个字，留空不加）', type: 'text', default: '《》', maxLength: 2},
    bookShelf: {label: '馆藏位置', type: 'text', default: 'B 区 3 架', maxLength: 12},
    bookStock: {label: '可借数量', type: 'text', default: '可借 2 本', maxLength: 10},
    confirmText: {label: '按钮文字', type: 'text', default: '确认借阅', maxLength: 8},
    loanTerm: {label: '按钮下说明', type: 'text', default: '借期 14 天 · 可续借 1 次', maxLength: 18},
    successText: {label: '成功标题', type: 'text', default: '借阅成功', maxLength: 8},
    dueText: {label: '还书日期', type: 'text', default: '还书日期 10 月 26 日', maxLength: 14},
    loanNote: {label: '成功页说明', type: 'text', default: '到期前一天会提醒你', maxLength: 16},
    summaryEyebrow: {label: '总结眉题', type: 'text', default: '迭代完成', maxLength: 10},
    summaryTitle: {label: '总结标题', type: 'text', default: '本周数字', maxLength: 12},
    stats: {label: '计数', type: 'list', min: 1, max: 3, maxLength: 8,
      default: [{value: 37, unit: '', label: '任务完成'}, {value: 2, unit: '步', label: '借完一本书'}, {value: 100, unit: '%', label: '页面读屏可用'}],
      item: [{key: 'value', label: '数字', type: 'number'}, {key: 'unit', label: '单位', type: 'text'}, {key: 'label', label: '说明', type: 'text'}]},
    creditsTitle: {label: '致谢标题', type: 'text', default: '致谢', maxLength: 8},
    credits: {label: '致谢分组', type: 'list', min: 1, max: 4,
      default: [{category: '参与', names: '产品 · 设计 · 前端 · 测试'}, {category: '下周', names: '预约到馆 · 借阅历史'}, {category: '制作', names: 'Claude Code · 文影'}],
      item: [{key: 'category', label: '分组', type: 'text'}, {key: 'names', label: '名单（用 · 分隔）', type: 'text'}]},
    shot: '段号 0～5：0 标题、1 概览、2 演示、3 总结、4 总结停留、5 致谢；改结构时用',
    f0: '本幕在全片的起始帧（30 fps）；背景漂移与迷宫波纹按全片时钟连续',
  },
};

// ---- 时间表：随包曲 Minimal Electronic 100（100 BPM，一拍 0.6 s），切点都在小节线上，拍点 = 0.532 + 0.6k ----
const CUT = [0, 4.732, 14.332, 21.532, 26.332, 28.732, 33.532];
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ramp = (t: number, at: number, len: number) => clamp((t - at) / len);
const outCubic = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const inOut = (x: number) => (x = clamp(x)) < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
/** 阻尼弹簧的解析解（与 remotion spring 同一物理模型：stiffness / damping / mass），t 为秒。 */
function spring(t: number, k = 100, c = 12, m = 1) {
  if (t <= 0) return 0;
  const w = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
  if (z >= 1) return 1 - (1 + w * t) * Math.exp(-w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
/** 原作 MazeDecoration 的固定种子伪随机。 */
const sr = (seed: number) => {const x = Math.sin(seed * 9301 + 49297) * 49297; return x - Math.floor(x);};
const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a: string, b: string, t: number) => {const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => lerp(v, y[i], t)));};
const rgba = (h: string, a: number) => `rgba(${rgb(h).join(',')},${a})`;
const lum = (h: string) => {const [r, g, b] = rgb(h); return (.2126 * r + .7152 * g + .0722 * b) / 255;};

function kit(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  const bg = HEX.test(th.background) ? th.background : '#ffffff';
  const ink = HEX.test(th.text) ? th.text : '#1e293b';
  const mute = HEX.test(th.muted) ? th.muted : '#64748b';
  const acc = HEX.test(th.accent) ? th.accent : '#ea580c';
  const light = lum(bg) > .5;
  return {bg, ink, mute, acc, light,
    mid: mix(ink, mute, .3),
    accLight: mix(acc, '#ffffff', .35),
    onAcc: lum(acc) > .62 ? '#111827' : '#ffffff',
    card: light ? mix(bg, '#ffffff', .7) : mix(bg, ink, .08),
    screen: light ? mix(bg, ink, .035) : mix(bg, ink, .05),
    line: mix(bg, ink, light ? .12 : .2),
    shadow: light ? 'rgba(15,23,42,.13)' : 'rgba(0,0,0,.5)',
    deep: light ? '#1a1a2e' : mix(bg, '#000000', .35)};
}
type Kit = ReturnType<typeof kit>;
const str = (v: unknown, d: string) => (v == null ? d : String(v));
const list = <T,>(v: unknown, d: T[]): T[] => (Array.isArray(v) && v.length ? v as T[] : d);
const D = meta.params;

// ---- AnimatedBackground（subtle）：三团径向渐变缓慢漂移、缩放；g 为全片 30 fps 帧 ----
function Backdrop({g, C}: {g: number; C: Kit}) {
  const f1 = Math.sin(g * .008) * 30, f2 = Math.cos(g * .006) * 40, f3 = Math.sin(g * .005) * 50;
  const s1 = 1 + Math.sin(g * .004) * .1, s2 = 1 + Math.cos(g * .003) * .08;
  const blob = (st: React.CSSProperties, color: string, stop: number) =>
    <div style={{position: 'absolute', borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, ${rgba(C.bg, 0)} ${stop}%)`, ...st}} />;
  return <>
    {blob({top: -200 + f1, right: -150, width: 600, height: 600, transform: `scale(${s1})`}, rgba(C.acc, .09), 70)}
    {blob({top: 1080 - 400 + f2, left: -100 + f3, width: 500, height: 500, transform: `scale(${s2})`}, rgba(C.ink, .05), 70)}
    {blob({top: 432, left: -200 + f3 * .5, width: 400, height: 400, transform: `scale(${s1 * .9})`}, rgba(C.acc, .06), 60)}
  </>;
}

// ---- MazeDecoration（右上角）：9×7 方块，按到角距离错相位起伏 ----
const MAZE = (() => {
  const out: {r: number; c: number; primary: boolean; phase: number; speed: number}[] = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) {
    const s = r * 9 + c;
    if (sr(s * 7) > .25) out.push({r, c, primary: sr(s * 3) > .45, phase: Math.hypot(8 - c, r) + sr(s * 11) * 2, speed: .03 + sr(s * 13) * .02});
  }
  return out;
})();
const shades = (b: string) => ({base: b, light: hex(rgb(b).map(v => v * 1.3)), shadow: hex(rgb(b).map(v => v * .6))});
function Maze({g, C}: {g: number; C: Kit}) {
  const P = shades(C.acc), S = shades(C.light ? mix(C.ink, '#1a1a2e', .5) : C.mute);
  const mask = 'radial-gradient(ellipse at top right, black 20%, transparent 65%)';
  return <div style={{position: 'absolute', top: -30, right: 80, width: 820, height: 660, transform: 'rotate(-25deg) skewY(-8deg)',
    transformOrigin: 'top right', maskImage: mask, WebkitMaskImage: mask}}>
    {MAZE.map((b, i) => {
      const wave = (Math.sin(g * b.speed + b.phase) + 1) / 2, col = b.primary ? P : S, sh = wave * 8;
      return <div key={i} style={{position: 'absolute', left: b.c * 80 + 50, top: b.r * 80 + 50, width: 72, height: 72, borderRadius: 4,
        background: col.base, transform: `scale(${.7 + wave * .35})`, opacity: .18 * (.5 + wave * .5),
        boxShadow: `0 ${sh}px ${sh * 2}px ${col.shadow}`, borderTop: `2px solid ${col.light}`, borderLeft: `1px solid ${col.light}`}} />;
    })}
  </div>;
}

// ---- SlideTransition：zoom 与 blur-fade；td 为进出时长（秒，原作 15 帧 = 0.5 s） ----
function Slide({t, dur, kind, td = .5, extra = 1, children}: {t: number; dur: number; kind: 'zoom' | 'blur'; td?: number; extra?: number; children: React.ReactNode}) {
  const fin = clamp(t / td), fout = clamp((dur - t) / td), first = t < dur / 2;
  const s = kind === 'zoom' ? (first ? lerp(.97, 1, fin) : lerp(1.02, 1, fout)) : 1;
  const blur = kind === 'blur' ? 8 * (1 - (first ? fin : fout)) : 0;
  return <div style={{position: 'absolute', inset: 0, opacity: Math.min(fin, fout), transform: `scale(${s * extra})`,
    filter: blur > .05 ? `blur(${blur.toFixed(2)}px)` : undefined}}>{children}</div>;
}
const center: React.CSSProperties = {position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'};

// ---- 0 标题页：logo 在第一拍（0.532 s）弹入，其后每拍一行 ----
function Title({t, p, C}: {t: number; p: Record<string, unknown>; C: Kit}) {
  const logo = spring(t - .532, 170, 14);
  const rise = (at: number): React.CSSProperties => {const k = outCubic(ramp(t, at, .6)); return {opacity: k, transform: `translateY(${(1 - k) * 14}px)`};};
  return <div style={center}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(.95, 1, outCubic(t / 1))})`}}>
      <div style={{width: 200, height: 200, marginBottom: 48, borderRadius: 32, background: C.acc, color: C.onAcc, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 108, fontWeight: 700, opacity: clamp(logo * 3), transform: `scale(${logo}) rotate(${(1 - logo) * -12}deg)`,
        boxShadow: `0 18px 44px ${rgba(C.acc, .28)}`}}>{str(p.logoChar, D.logoChar.default)}</div>
      <div style={{fontSize: 88, fontWeight: 700, color: C.ink, lineHeight: 1.2, ...rise(1.132)}}>{str(p.product, D.product.default)}</div>
      <div style={{fontSize: 52, fontWeight: 500, color: C.ink, margin: '24px 0 12px', ...rise(1.732)}}>
        {str(p.sprintLabel, D.sprintLabel.default)}{str(p.sprintJoin, D.sprintJoin.default)}<span style={{color: C.acc, fontWeight: 600}}>{str(p.sprintName, D.sprintName.default)}</span>
      </div>
      <div style={{fontSize: 34, color: C.mute, marginBottom: 44, ...rise(2.332)}}>{str(p.dateRange, D.dateRange.default)}</div>
      <div style={{fontSize: 44, fontWeight: 700, color: C.ink, ...rise(2.632)}}>{str(p.platform, D.platform.default)}</div>
    </div>
  </div>;
}

// ---- 1 概览：眉题与标题 1 s 淡入；三条要点落在 5.932 / 8.332 / 10.732 的拍上，从左滑入，高亮词随后划出底色 ----
type Item = {text?: string; highlight?: string} | string;
function Overview({t, p, C}: {t: number; p: Record<string, unknown>; C: Kit}) {
  const items = list<Item>(p.items, D.items.default).slice(0, 4).map(it => typeof it === 'string'
    ? {text: it.split('|')[0], hl: it.split('|')[1] ?? ''} : {text: str(it.text, ''), hl: str(it.highlight, '')});
  return <div style={{...center, opacity: clamp(t / 1)}}>
    <div style={{color: C.acc, fontSize: 34, fontWeight: 500, marginBottom: 20, letterSpacing: 8}}>{str(p.overviewEyebrow, D.overviewEyebrow.default)}</div>
    <div style={{color: C.ink, fontSize: 82, fontWeight: 700, marginBottom: 64}}>{str(p.overviewTitle, D.overviewTitle.default)}</div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 40}}>
      {items.map((it, i) => {
        const at = 1.2 + i * 2.4, k = outCubic(ramp(t, at, .667)), u = outCubic(ramp(t, at + .6, .5));
        const dot = 1 + .5 * Math.exp(-Math.max(0, t - at) * 5) * (t >= at ? 1 : 0);
        return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, opacity: k, transform: `translateX(${(1 - k) * -30}px)`}}>
          <div style={{width: 16, height: 16, borderRadius: 8, background: C.acc, flexShrink: 0, transform: `scale(${dot})`}} />
          <span style={{color: C.mid, fontSize: 56, whiteSpace: 'nowrap'}}>{it.text}
            {it.hl ? <span style={{color: C.acc, fontWeight: 700, marginLeft: '.35em', padding: '0 .06em',
              backgroundImage: `linear-gradient(${rgba(C.acc, .16)}, ${rgba(C.acc, .16)})`, backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 92%', backgroundSize: `${u * 100}% .34em`}}>{it.hl}</span> : null}
          </span>
        </div>;
      })}
    </div>
  </div>;
}

// ---- 2 演示：代码画的手机界面（扫码 → 书卡 → 点确认 → 成功），左下标签条，右侧步骤 ----
const SPINES = (() => {
  const out: {x: number; w: number; h: number; c: number}[] = [];
  for (let x = -6, i = 0; x < 380; i++) {const w = 18 + Math.floor(sr(i * 5 + 1) * 20); out.push({x, w, h: 190 + Math.floor(sr(i * 7 + 2) * 130), c: i % 6}); x += w + 3;}
  return out;
})();
const SPINE_COLORS = ['#3b4a6b', '#6b4f36', '#44604a', '#7a3b3b', '#4d4570', '#356464'];
const BARS = (() => {
  const out: {x: number; w: number}[] = [];
  for (let x = 0, i = 0; x < 186; i++) {const w = 1 + Math.floor(sr(i * 3 + 5) * 4); if (i % 2 === 0) out.push({x, w}); x += w;}
  return out;
})();
const STEP_AT = [.6, 2.4, 3.6, 4.8];
const stepAt = (i: number) => STEP_AT[i] ?? 4.8 + (i - 3) * .6;

function Hand() {
  // 指尖在 viewBox (52, 3)，按 1.3 倍画；原作用表情符号手指，这里画成 SVG，避免依赖系统表情字体。
  const shapes = (fill: string, stroke?: string) => <g fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0}>
    <rect x={26} y={60} width={66} height={66} rx={22} />
    <rect x={62} y={56} width={22} height={36} rx={11} />
    <rect x={76} y={64} width={20} height={32} rx={10} />
    <rect x={40} y={3} width={24} height={82} rx={12} />
    <rect x={8} y={74} width={38} height={22} rx={11} transform="rotate(-28 27 85)" />
  </g>;
  return <svg width={130} height={169} viewBox="0 0 100 130" style={{overflow: 'visible'}}>
    <g transform="translate(5 9)" opacity={.22}>{shapes('#000000')}</g>
    {shapes('#ffd6a8', '#c98a55')}
  </svg>;
}

function Phone({t, T, p, C}: {t: number; T: number; p: Record<string, unknown>; C: Kit}) {
  const detect = t >= 1.8, flash = detect ? 1 - ramp(t, 1.8, .5) : 0, chip = spring(t - 1.8, 200, 16);
  const sheet = spring(t - 2.4, 120, 17), sheetTop = lerp(792, 360, sheet);
  const handIn = spring(t - 3.6, 80, 15, .8), handOut = outCubic(ramp(t, 4.9, .45));
  const press = Math.sin(Math.PI * ramp(t, 4.2, .24)) * (t >= 4.2 && t <= 4.44 ? 1 : 0), ripple = outCubic(ramp(t, 4.2, .5));
  const done = outCubic(ramp(t, 4.8, .45)), check = outCubic(ramp(t, 4.95, .45)), pill = spring(t - 5.4, 160, 15);
  const title = str(p.bookTitle, D.bookTitle.default);
  const quotes = Array.from(typeof p.bookQuotes === 'string' ? p.bookQuotes : D.bookQuotes.default), quoted = `${quotes[0] ?? ''}${title}${quotes[1] ?? ''}`;
  const cover = (w: number, h: number, fs: number) => <div style={{width: w, height: h, borderRadius: 8, flexShrink: 0, position: 'relative', overflow: 'hidden',
    background: `linear-gradient(160deg, ${C.accLight}, ${C.acc})`, boxShadow: `0 6px 14px ${rgba('#000000', .18)}`}}>
    <div style={{position: 'absolute', right: w * .16, top: h * .12, width: w * .3, height: w * .3, borderRadius: '50%', background: '#fff3c4'}} />
    {[.5, .62].map(y => <div key={y} style={{position: 'absolute', left: 8, right: 8, top: h * y, height: 2, background: 'rgba(255,255,255,.55)'}} />)}
    <div style={{position: 'absolute', left: 9, bottom: 9, right: 9, color: '#ffffff', fontSize: fs, fontWeight: 700, lineHeight: 1.25}}>{title}</div>
  </div>;
  const nav = str(p.demoLabel, D.demoLabel.default).replace(/^(演示|Demo)\s*[：:]\s*/i, '');
  return <div style={{position: 'absolute', left: 500, top: 130, width: 400, height: 820, transform: `translateY(${(1 - outCubic(t / .7)) * 40 + Math.sin(T * 1.1) * 5}px)`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 60, background: '#111418', border: `2px solid ${C.line}`, boxShadow: `0 40px 80px ${C.shadow}`}} />
    <div style={{position: 'absolute', left: 14, top: 14, width: 372, height: 792, borderRadius: 46, overflow: 'hidden', background: C.screen, color: C.ink}}>
      {/* 状态栏与导航 */}
      <div style={{position: 'absolute', left: 134, top: 11, width: 104, height: 30, borderRadius: 15, background: '#000000'}} />
      <div style={{position: 'absolute', left: 32, top: 16, fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>10:12</div>
      <div style={{position: 'absolute', right: 28, top: 19, display: 'flex', gap: 3, alignItems: 'flex-end'}}>
        {[5, 8, 11, 14].map(h => <div key={h} style={{width: 4, height: h, borderRadius: 1, background: C.ink}} />)}
        <div style={{width: 26, height: 13, marginLeft: 6, borderRadius: 4, border: `2px solid ${C.ink}`, padding: 1}}><div style={{width: '70%', height: '100%', background: C.ink, borderRadius: 1}} /></div>
      </div>
      <div style={{position: 'absolute', left: 18, top: 52, fontSize: 40, lineHeight: '44px', fontWeight: 300}}>‹</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontSize: 22, fontWeight: 700}}>{nav}</div>
      {/* 取景框：书架、条形码、扫描线 */}
      <div style={{position: 'absolute', left: 0, top: 110, width: 372, height: 440, overflow: 'hidden', background: '#10141b'}}>
        {SPINES.map((s, i) => <div key={i} style={{position: 'absolute', left: s.x, top: 362 - s.h, width: s.w, height: s.h, borderRadius: '3px 3px 0 0',
          background: SPINE_COLORS[s.c], boxShadow: 'inset -3px 0 0 rgba(0,0,0,.25)'}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 362, height: 16, background: '#3a2c1f'}} />
        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,.48)'}} />
        <div style={{position: 'absolute', left: 61, top: 145, width: 250, height: 150}}>
          <div style={{position: 'absolute', left: 18, top: 19, width: 214, height: 112, borderRadius: 6, background: '#f8f8f6', transform: 'rotate(-2deg)'}}>
            {BARS.map((b, i) => <div key={i} style={{position: 'absolute', left: 14 + b.x, top: 14, width: b.w, height: 62, background: '#111111'}} />)}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', fontFamily: MONO, fontSize: 13, color: '#111111', letterSpacing: 2}}>9 787000 001421</div>
          </div>
          <div style={{position: 'absolute', inset: 0, background: rgba(C.acc, .32 * flash), borderRadius: 8}} />
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => <div key={i} style={{position: 'absolute', width: 32, height: 32,
            [x ? 'right' : 'left']: 0, [y ? 'bottom' : 'top']: 0, borderColor: C.acc, borderStyle: 'solid', borderWidth: 0,
            [`border${y ? 'Bottom' : 'Top'}Width`]: 5, [`border${x ? 'Right' : 'Left'}Width`]: 5,
            borderRadius: `${!x && !y ? 8 : 0}px ${x && !y ? 8 : 0}px ${x && y ? 8 : 0}px ${!x && y ? 8 : 0}px`}} />)}
          {!detect && <div style={{position: 'absolute', left: 8, right: 8, height: 3, top: 150 * ((t / .6) % 1), background: C.acc,
            boxShadow: `0 0 16px 4px ${rgba(C.acc, .55)}`}} />}
          {detect && <div style={{position: 'absolute', left: 0, right: 0, top: -50, display: 'flex', justifyContent: 'center'}}>
            <div style={{padding: '6px 16px', borderRadius: 16, background: C.acc, color: C.onAcc, fontSize: 17, fontWeight: 600, transform: `scale(${chip})`}}>{str(p.detectedText, D.detectedText.default)}</div>
          </div>}
        </div>
        <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${.45 * sheet})`}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 578, textAlign: 'center', fontSize: 19, color: C.mute}}>{str(p.scanHint, D.scanHint.default)}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 618, textAlign: 'center', fontSize: 17, color: C.acc}}>{str(p.manualText, D.manualText.default)}</div>
      {/* 书卡（底部抽屉） */}
      <div style={{position: 'absolute', left: 0, top: sheetTop, width: 372, height: 432, borderRadius: '28px 28px 0 0', background: C.card,
        boxShadow: `0 -10px 30px ${rgba('#000000', .18 * sheet)}`, opacity: t >= 2.4 ? 1 : 0}}>
        <div style={{position: 'absolute', left: 166, top: 10, width: 40, height: 5, borderRadius: 3, background: C.line}} />
        <div style={{position: 'absolute', left: 24, top: 34, display: 'flex', gap: 18}}>
          {cover(104, 144, 14)}
          <div style={{paddingTop: 4, width: 202}}>
            <div style={{fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{quoted}</div>
            <div style={{fontSize: 17, color: C.mute, marginTop: 12}}>{str(p.bookShelf, D.bookShelf.default)}</div>
            <div style={{display: 'inline-block', marginTop: 14, padding: '4px 12px', borderRadius: 12, fontSize: 15, color: C.acc, background: rgba(C.acc, .12)}}>{str(p.bookStock, D.bookStock.default)}</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 24, top: 200, width: 324, height: 66, borderRadius: 33, overflow: 'hidden', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: mix(C.acc, '#000000', .16 * press), color: C.onAcc, fontSize: 24, fontWeight: 700, transform: `scale(${1 - .045 * press})`}}>
          {t >= 4.2 && <div style={{position: 'absolute', left: 162, top: 33, width: 20 + 320 * ripple, height: 20 + 320 * ripple, borderRadius: '50%',
            transform: 'translate(-50%, -50%)', background: `rgba(255,255,255,${.4 * (1 - ripple)})`}} />}
          <span style={{position: 'relative'}}>{str(p.confirmText, D.confirmText.default)}</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontSize: 16, color: C.mute}}>{str(p.loanTerm, D.loanTerm.default)}</div>
      </div>
      {/* 成功页 */}
      {t >= 4.8 && <div style={{position: 'absolute', left: 0, right: 0, top: 104, bottom: 0, background: C.screen, opacity: done,
        transform: `translateY(${(1 - done) * 30}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 96}}>
        <div style={{position: 'relative', width: 132, height: 132}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${C.acc}`, opacity: .45 * (1 - ramp(t, 4.95, .7)),
            transform: `scale(${1 + .6 * outCubic(ramp(t, 4.95, .7))})`}} />
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.acc, transform: `scale(${spring(t - 4.8, 180, 14)})`}} />
          <svg width={132} height={132} viewBox="0 0 132 132" style={{position: 'absolute', inset: 0}}>
            <path d="M38 68 L58 88 L96 48" fill="none" stroke={C.onAcc} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - check)} />
          </svg>
        </div>
        <div style={{marginTop: 34, fontSize: 34, fontWeight: 700, opacity: outCubic(ramp(t, 5.1, .4))}}>{str(p.successText, D.successText.default)}</div>
        <div style={{marginTop: 22, padding: '10px 22px', borderRadius: 24, fontSize: 23, fontWeight: 600, color: C.acc, background: rgba(C.acc, .12),
          opacity: clamp(pill * 2), transform: `scale(${.6 + .4 * pill})`, whiteSpace: 'nowrap'}}>{str(p.dueText, D.dueText.default)}</div>
        <div style={{marginTop: 18, fontSize: 18, color: C.mute, opacity: outCubic(ramp(t, 5.7, .5))}}>{str(p.loanNote, D.loanNote.default)}</div>
        <div style={{marginTop: 40, width: 300, padding: 14, borderRadius: 16, background: C.card, display: 'flex', gap: 14, alignItems: 'center',
          boxShadow: `0 6px 18px ${C.shadow}`, opacity: outCubic(ramp(t, 5.7, .5)), transform: `translateY(${(1 - outCubic(ramp(t, 5.7, .5))) * 16}px)`}}>
          {cover(44, 60, 8)}
          <div><div style={{fontSize: 18, fontWeight: 700}}>{quoted}</div><div style={{fontSize: 14, color: C.mute, marginTop: 6}}>{str(p.bookShelf, D.bookShelf.default)}</div></div>
        </div>
      </div>}
      <div style={{position: 'absolute', left: 119, bottom: 9, width: 134, height: 5, borderRadius: 3, background: rgba(C.ink, .35)}} />
    </div>
    {/* PointingHand：从下方弹入，指尖落在“确认借阅”按钮中心（手机坐标 200, 603），4.2 s 点下 */}
    {t >= 3.6 && <div style={{position: 'absolute', left: 132, top: 599, opacity: clamp((t - 3.6) / .33) * (1 - handOut),
      transform: `translateY(${(1 - handIn) * 240 + handOut * 260 + press * 10}px) scale(${1 - .05 * press})`, transformOrigin: '68px 4px'}}><Hand /></div>}
  </div>;
}

function Demo({t, T, p, C}: {t: number; T: number; p: Record<string, unknown>; C: Kit}) {
  const steps = list<unknown>(p.steps, D.steps.default).slice(0, 5).map(s => str(s, ''));
  const n = steps.length, label = outCubic(ramp(t, .6, .5));
  let active = -1;
  for (let i = 0; i <= n; i++) if (t >= (i < n ? stepAt(i) : stepAt(n - 1) + .6)) active = i;
  const top = 520 - (n * 112) / 2, fill = Math.min(n - 1, active);
  const fillH = fill <= 0 ? 0 : lerp((fill - 1) * 112, fill * 112, outCubic(ramp(t, stepAt(fill), .4)));
  return <>
    <Phone t={t} T={T} p={p} C={C} />
    <div style={{position: 'absolute', left: 1010, top, width: 640, height: n * 112}}>
      <div style={{position: 'absolute', left: 27, top: 56, width: 3, height: (n - 1) * 112, background: C.line}} />
      <div style={{position: 'absolute', left: 27, top: 56, width: 3, height: fillH, background: C.acc}} />
      {steps.map((s, i) => {
        const on = i === active, done = i < active, at = stepAt(i), pop = on ? 1 + .14 * Math.exp(-(t - at) * 6) : 1;
        const appear = outCubic(ramp(t, .2 + i * .12, .5));
        return <div key={i} style={{position: 'absolute', left: 0, top: i * 112 + 28, height: 56, display: 'flex', alignItems: 'center', gap: 28,
          opacity: appear, transform: `translateX(${(1 - appear) * 24}px)`}}>
          <div style={{width: 56, height: 56, borderRadius: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700,
            background: on || done ? C.acc : C.bg, color: on || done ? C.onAcc : C.mute, border: `3px solid ${on || done ? C.acc : C.line}`, boxSizing: 'border-box',
            transform: `scale(${pop})`, boxShadow: on ? `0 0 0 ${10 * Math.exp(-(t - at) * 3)}px ${rgba(C.acc, .18)}` : undefined}}>
            {done ? <svg width={26} height={26} viewBox="0 0 26 26"><path d="M6 13.5 L11 18.5 L20.5 8" fill="none" stroke={C.onAcc} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" /></svg> : i + 1}
          </div>
          <div style={{fontSize: 38, fontWeight: on ? 700 : 500, color: on ? C.ink : done ? C.mid : C.mute, whiteSpace: 'nowrap'}}>{s}</div>
        </div>;
      })}
    </div>
    {/* Label：左下角标签条 + 需求号 */}
    <div style={{position: 'absolute', left: 48, bottom: 48, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 32px', borderRadius: 12,
      background: rgba(C.card, .95), color: C.ink, fontSize: 32, fontWeight: 500, boxShadow: `0 4px 12px ${C.shadow}`,
      opacity: label, transform: `translateX(${(1 - label) * -40}px)`}}>
      {str(p.demoLabel, D.demoLabel.default)}<span style={{color: C.acc, fontSize: 24, fontFamily: MONO}}>{str(p.demoRef, D.demoRef.default)}</span>
    </div>
  </>;
}

// ---- 3/4 总结：三个数字在 22.132 / 23.332 / 24.532 的拍上起滚，落定后（第 4 幕）停留并轻微推近 ----
type Stat = {value?: unknown; unit?: unknown; label?: unknown};
function Summary({t, p, C}: {t: number; p: Record<string, unknown>; C: Kit}) {
  const stats = list<Stat>(p.stats, D.stats.default).slice(0, 3);
  const enter = outCubic(clamp(t / .833));
  return <div style={{...center, transform: `scale(${(1 + .035 * inOut((t - 4.8) / 2.4)) * lerp(.9, 1, enter)})`}}>
    <div style={{color: C.acc, fontSize: 34, fontWeight: 500, marginBottom: 24, letterSpacing: 8, opacity: clamp(t / .667)}}>{str(p.summaryEyebrow, D.summaryEyebrow.default)}</div>
    <div style={{color: C.ink, fontSize: 72, fontWeight: 700, marginBottom: 84, opacity: clamp(t / .667)}}>{str(p.summaryTitle, D.summaryTitle.default)}</div>
    <div style={{display: 'flex', gap: 120}}>
      {stats.map((s, i) => {
        const at = .6 + i * 1.2, v = Number(s.value), value = Number.isFinite(v) ? v : 0;
        const pop = spring(t - (at - .3), 100, 12), count = outCubic(ramp(t, at, 1.5)), settle = outCubic(ramp(t, at + 1.5, .4));
        const shown = count >= 1 ? value : Math.round(value * count);
        return <div key={i} style={{width: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(pop), transform: `scale(${.5 + pop * .5})`}}>
          <div style={{display: 'flex', alignItems: 'baseline', color: C.acc, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            transform: `scale(${1 + .06 * Math.sin(Math.PI * ramp(t, at + 1.5, .3))})`}}>
            <span style={{fontSize: 140}}>{shown}</span>{s.unit ? <span style={{fontSize: 64, marginLeft: 8}}>{str(s.unit, '')}</span> : null}
          </div>
          <div style={{width: 72 * settle, height: 5, borderRadius: 3, background: C.acc, margin: '22px 0 18px', opacity: .7}} />
          <div style={{color: C.mute, fontSize: 32, whiteSpace: 'nowrap'}}>{str(s.label, '')}</div>
        </div>;
      })}
    </div>
  </div>;
}

// ---- 5 致谢（深色）：标题 1 s 淡入，各组每拍一组淡入上移，第 2 小节线落产品名 ----
type Credit = {category?: unknown; names?: unknown};
function Credits({t, p, C}: {t: number; p: Record<string, unknown>; C: Kit}) {
  const groups = list<Credit>(p.credits, D.credits.default).slice(0, 4);
  const foot = clamp((t - 2.4) / 1);
  return <div style={{position: 'absolute', inset: 0, background: C.deep}}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${rgba(C.acc, .14)} 0%, ${rgba(C.acc, 0)} 70%)`}} />
    <div style={{...center, gap: 44}}>
      <div style={{fontSize: 54, fontWeight: 600, color: C.acc, letterSpacing: 14, marginBottom: 12, opacity: clamp(t / 1)}}>{str(p.creditsTitle, D.creditsTitle.default)}</div>
      {groups.map((g, i) => {
        const k = outCubic(ramp(t, .6 + i * .6, .667));
        const names = Array.isArray(g.names) ? (g.names as unknown[]).map(x => str(x, '')).join(' · ') : str(g.names, '');
        return <div key={i} style={{textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>
          <div style={{fontSize: 28, fontWeight: 500, color: C.acc, letterSpacing: 8, marginBottom: 12}}>{str(g.category, '')}</div>
          <div style={{fontSize: 42, fontWeight: 400, color: '#ffffff', lineHeight: 1.4, whiteSpace: 'nowrap'}}>{names}</div>
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', fontSize: 28, fontWeight: 600, color: C.acc, letterSpacing: 6,
      opacity: foot}}>{str(p.product, D.product.default)}</div>
  </div>;
}

export default function Scene(props: SceneInput) {
  const C = kit(props), p = props.params;
  const shot = clamp(Math.round(Number(p.shot ?? 0)) || 0, 0, 5);
  const f0 = p.f0 == null ? Math.round(CUT[shot] * props.fps) : Number(p.f0);
  const T = (f0 + props.frame) / props.fps, g = T * 30, t = T - CUT[shot];
  let content: React.ReactNode;
  if (shot === 0) content = <Slide t={t} dur={CUT[1] - CUT[0]} kind="zoom"><Title t={t} p={p} C={C} /></Slide>;
  else if (shot === 1) content = <Slide t={t} dur={CUT[2] - CUT[1]} kind="zoom"><Overview t={t} p={p} C={C} /></Slide>;
  else if (shot === 2) content = <Slide t={t} dur={CUT[3] - CUT[2]} kind="blur"><Demo t={t} T={T} p={p} C={C} /></Slide>;
  else if (shot <= 4) {const ts = T - CUT[3]; content = <Slide t={ts} dur={CUT[5] - CUT[3]} kind="zoom" td={.667}><Summary t={ts} p={p} C={C} /></Slide>;}
  else content = <Credits t={t} p={p} C={C} />;
  return <div style={{position: 'absolute', inset: 0, background: shot === 5 ? C.deep : C.bg, overflow: 'hidden', fontFamily: props.fonts?.text ?? 'system-ui, sans-serif'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${props.width / 1920})`, transformOrigin: '0 0', overflow: 'hidden'}}>
      {shot < 5 && <><Backdrop g={g} C={C} /><Maze g={g} C={C} /></>}
      {content}
    </div>
  </div>;
}
