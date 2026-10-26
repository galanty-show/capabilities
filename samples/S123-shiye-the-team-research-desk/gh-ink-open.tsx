import React from 'react';
import type {SceneInput} from '@talkframe/scene';
/*
 * 开场（全片 0–220 帧）：改编自 Vincentwei1021/video-shotcraft 的 template/src/aifl/live/SceneOpen.tsx
 * （https://github.com/Vincentwei1021/video-shotcraft ，提交 13c74a707786，Apache-2.0，Copyright 2026 Wei Yihao）。
 * 保留：琥珀十字由隐形笔画出、字标逐字压印（放大 1.6→1、模糊、落定时下方一道琥珀闪光）、副标打字 + 光标闪烁、整组上移缩小淡出；
 * 随后仪表盘全景 → 斜俯 2.5D 推近主角卡（rotX 8°、rotY 34°），追光游走后锁定，主角卡弹起悬浮、空槽琥珀描边、
 * 卡沿光束跑两圈、左侧 3D 浮签“一张卡，一个项目。”与马克笔高亮、卡片回落压实。机位关键帧、缓动与帧号沿用原作。
 * 文影的改动：截图换成 DOM 现画的中文虚构界面（拾页 · 团队研究台）；文字进 meta.params；配色读 props.theme；去掉音效与 staticFile。
 */
export const meta = {
  title: '开场：墨线字标 → 主角卡浮起（改编自 video-shotcraft SceneOpen）',
  description: '十字墨线、字标逐字压印、副标打字；推近仪表盘，主角卡在追光下浮起、光束绕卡两圈、浮签说明后回落。',
  params: {
    wordmark: {label: '字标', type: 'text', default: '拾页'},
    kicker: {label: '副标（逐字打出）', type: 'text', default: '团队研究台 · TEAM RESEARCH DESK'},
    noteLine1: {label: '浮签第一行', type: 'text', default: '一张卡，'},
    noteLine2: {label: '浮签第二行（马克笔高亮）', type: 'text', default: '一个项目。'},
    caption: {label: '底部解说条', type: 'text', default: '十个在研项目 · 四位研究员'},
    f0: '本幕在全片的起始帧（30 fps）',
    'ui.logo': {label: '导航 logo 字', type: 'text', default: '拾', maxLength: 2, group: '界面文字'},
    'ui.brand': {label: '导航品牌名', type: 'text', default: '拾页', maxLength: 12, group: '界面文字'},
    'ui.nav': {label: '导航三项（项目、论文雷达、周报）', type: 'list', default: ['项目', '论文雷达', '周报'], min: 3, max: 3, maxLength: 12, group: '界面文字'},
    'ui.demo': {label: '导航角标', type: 'text', default: '演示数据', maxLength: 12, group: '界面文字'},
    'ui.live': {label: '导航同步状态', type: 'text', default: '实时同步', maxLength: 12, group: '界面文字'},
    'ui.members': {label: '四位研究员（头像取首字）', type: 'list', default: ['周', '林', '许', '唐'], min: 4, max: 4, maxLength: 12, group: '界面文字'},
    'ui.search': {label: '搜索框占位', type: 'text', default: '搜索项目、负责人、客户或标签', maxLength: 40, group: '界面文字'},
    'ui.filter': {label: '筛选按钮', type: 'text', default: '筛选', maxLength: 8, group: '界面文字'},
    'ui.all': {label: '项目列表标题', type: 'text', default: '全部项目', maxLength: 16, group: '界面文字'},
    'ui.stats': {label: '项目列表统计', type: 'text', default: '10 个在研 · 4 位研究员', maxLength: 40, group: '界面文字'},
    'ui.count': {label: '分组计数（{n} 换成数字）', type: 'text', default: '{n} 个项目', maxLength: 16, group: '界面文字'},
    'ui.sections': {label: '四个分组', type: 'list', default: ['智能体与开发工具', '高效模型', '感知与传感', '研究基础设施'], min: 4, max: 4, maxLength: 24, group: '界面文字'},
    'ui.owner': {label: '卡片：负责人', type: 'text', default: '负责人', maxLength: 8, group: '界面文字'},
    'ui.client': {label: '卡片：客户', type: 'text', default: '客户', maxLength: 8, group: '界面文字'},
    'ui.questions': {label: '计数：问题', type: 'text', default: '问题', maxLength: 10, group: '界面文字'},
    'ui.experiments': {label: '计数：实验', type: 'text', default: '实验', maxLength: 12, group: '界面文字'},
    'ui.papers': {label: '计数：论文', type: 'text', default: '论文', maxLength: 10, group: '界面文字'},
    projects: {label: '十张项目卡（按页面顺序）', type: 'list', min: 10, max: 10, maxLength: 80, help: '每张：项目名 | 一句话 | 负责人 | 客户 | 分组 | 标签（用 · 分隔） | 更新时间', group: '界面文字',
      item: [{key: 'title', label: '项目名', type: 'text'}, {key: 'desc', label: '一句话', type: 'text'}, {key: 'owner', label: '负责人', type: 'text'}, {key: 'client', label: '客户', type: 'text'},
        {key: 'field', label: '分组', type: 'text'}, {key: 'tags', label: '标签', type: 'text'}, {key: 'age', label: '更新时间', type: 'text'}],
      default: [
      {title: '自愈式 CI 故障分诊', desc: '把失败的构建按根因分流给对应的修复智能体，减少人工排查。', owner: '许', client: '内部平台', field: '智能体与开发工具', tags: '智能体 · CI', age: '2 天前'},
      {title: '截图检索智能体', desc: '先看截图再检索文档，让回答落到界面上的具体位置。', owner: '唐', client: '未提供', field: '智能体与开发工具', tags: '多模态 · 检索', age: '4 天前'},
      {title: '端侧持续微调验证', desc: '验证手机端小模型能否在本地持续学习、又不遗忘旧能力。', owner: '林', client: '未提供', field: '高效模型', tags: '端侧 · 持续学习', age: '1 周前'},
      {title: '置信度路由模型级联', desc: '小模型拿不准时才交给大模型，推理成本降下来、准确率守得住。', owner: '周', client: '未提供', field: '高效模型', tags: '路由 · 级联', age: '4 天前'},
      {title: '表格基础模型探针', desc: '探测表格基础模型到底学到了什么，哪些特征真正可靠。', owner: '许', client: '数据组', field: '高效模型', tags: '表格 · 可解释', age: '6 天前'},
      {title: '传感器漂移预警', desc: '在传感器校准漂移变成故障之前，提前发出预警。', owner: '林', client: '产线 B', field: '感知与传感', tags: '时序 · 预警', age: '3 天前'},
      {title: '方言稳健语音识别', desc: '让识别模型听得懂带口音的普通话与几种方言。', owner: '唐', client: '客服中心', field: '感知与传感', tags: '语音 · 方言', age: '1 天前'},
      {title: '仓储重识别鲁棒性', desc: '货箱换了角度、换了光照，还能认出是同一件。', owner: '周', client: '仓储组', field: '感知与传感', tags: '视觉 · 重识别', age: '5 天前'},
      {title: '自动化研究闭环', desc: '提出假设、跑实验、写小结，一圈一圈自动往前推。', owner: '周', client: '研究基建', field: '研究基础设施', tags: '闭环 · 实验', age: '今天'},
      {title: '长程编程竞技场', desc: '给编程智能体出几小时才能做完的任务，看谁能坚持到最后。', owner: '许', client: '研究基建', field: '研究基础设施', tags: '评测 · 编程', age: '2 天前'},
      ]},
  },
};
// ---- 共用工具（由 build_scenes.mjs 拼进每个幕模块：幕代码不能相对导入） ----
// 改编自 Vincentwei1021/video-shotcraft 的成片模板「Ink Press」（template/src/aifl/），Apache-2.0，Copyright 2026 Wei Yihao。
// 这里是原作 PageCam、PaperTitleCard、FlashCut、Caption、DigitRoll 的代码移植，配色取原作 ink-press 主题；
// 原作用整页截图做“真实页面”，本样片改为用 DOM 现画的中文虚构界面（拾页 · 团队研究台）。

const FPS = 30;
const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 三次贝塞尔缓动（与 remotion Easing.bezier 同定义），二分求 t。 */
const bez = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const cx = (t: number) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const cy = (t: number) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  let lo = 0, hi = 1;
  for (let i = 0; i < 22; i++) {const m = (lo + hi) / 2; if (cx(m) < x) lo = m; else hi = m;}
  return cy((lo + hi) / 2);
};
const linear = (x: number) => x;
/** remotion interpolate 的子集：分段线性 + 缓动，两端夹紧。 */
function interp(f: number, xs: number[], ys: number[], ease: (x: number) => number = linear) {
  if (f <= xs[0]) return ys[0];
  if (f >= xs[xs.length - 1]) return ys[ys.length - 1];
  let i = 0; while (f > xs[i + 1]) i++;
  return lerp(ys[i], ys[i + 1], ease((f - xs[i]) / (xs[i + 1] - xs[i])));
}
const E = {
  push: bez(0.33, 0, 0.15, 1), pop: bez(0.2, 1.25, 0.3, 1), reseat: bez(0.4, 0, 0.3, 1.05), word: bez(0.2, 0.75, 0.3, 1),
  soft: bez(0.3, 0, 0.2, 1), settle: bez(0.3, 0, 0.25, 1.15), fly: bez(0.34, 1.4, 0.44, 1), roll: bez(0.25, 0.8, 0.25, 1),
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3), inOutQuad: (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
};
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join('');
};
const rgba = (hex: string, a: number) => {const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return `rgba(${r},${g},${b},${a})`;};

// ---- 界面文字：默认值在各幕 meta.params（ui.*、projects 由 build_scenes.mjs 注入 kit-params.txt；各幕自己的 ui.* 写在各自 meta），语言文件按幕覆盖 ----
const KIT_SPECS = meta.params as Record<string, any>;
const kitDefault = (key: string): unknown => KIT_SPECS[key] && typeof KIT_SPECS[key] === 'object' ? KIT_SPECS[key].default : undefined;
function kitText(props: SceneInput) {
  const raw = props.params.ui, ui = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const s = (k: string) => typeof ui[k] === 'string' ? ui[k] as string : String(kitDefault(`ui.${k}`) ?? '');
  const l = (k: string) => ((Array.isArray(ui[k]) ? ui[k] : kitDefault(`ui.${k}`) ?? []) as unknown[]).map(v => String(v));
  const list = (Array.isArray(props.params.projects) ? props.params.projects : kitDefault('projects') ?? []) as Array<Record<string, unknown>>;
  const projects = list.map(p => ({title: String(p.title ?? ''), desc: String(p.desc ?? ''), owner: String(p.owner ?? ''), client: String(p.client ?? ''),
    field: String(p.field ?? ''), tags: String(p.tags ?? '').split('·').map(t => t.trim()).filter(Boolean), age: String(p.age ?? '')}));
  return {ui: s, list: l, logo: s('logo'), brand: s('brand'), nav: l('nav'), demo: s('demo'), live: s('live'), members: l('members'), search: s('search'), filter: s('filter'),
    all: s('all'), stats: s('stats'), count: (n: number) => s('count').replace('{n}', String(n)), sections: l('sections'),
    owner: s('owner'), client: s('client'), questions: s('questions'), experiments: s('experiments'), papers: s('papers'), projects};
}
/** 头像取首字（中文名一字，英文名首字母）。 */
const initial = (name: string) => Array.from(name.trim())[0] ?? '';
/** 含中日文字时用楷体；纯西文改用斜体衬线（原作的强调写法）。 */
const CJK = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/;
const LATIN_SERIF = '"Iowan Old Style", "Palatino", Georgia, serif';
const accentFont = (text: string): React.CSSProperties => CJK.test(text) ? {fontFamily: KAI} : {fontFamily: LATIN_SERIF, fontStyle: 'italic'};

/** 原作 ink-press 配色；播放页换配色时，纸/墨/琥珀/灰墨跟着 props.theme 走（预设多为深底，卡片与纸面随之派生）。 */
function palette(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  const paper = HEX.test(th.background) ? th.background : '#f2eee6';
  const ink = HEX.test(th.text) ? th.text : '#13110f';
  const amber = HEX.test(th.accent) ? th.accent : '#955905';
  const muted = HEX.test(th.muted) ? th.muted : '#65635f';
  return {tx: kitText(props), paper, ink, amber, muted, page: mixHex(paper, '#ffffff', 0.42), card: mixHex(paper, '#ffffff', 0.72), field: mixHex(paper, '#ffffff', 0.85),
    line: mixHex(paper, ink, 0.12), faint: mixHex(paper, ink, 0.06), amberSoft: mixHex(paper, amber, 0.18), amberLite: mixHex(amber, '#ffffff', 0.25)};
}
type Pal = ReturnType<typeof palette>;
const SERIF = '"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", "SimSun", ui-serif, Georgia, serif';
const KAI = '"Kaiti SC", "STKaiti", "KaiTi", "Noto Serif CJK SC", serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
const SANS = '"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", system-ui, sans-serif';

/** 全片帧：分镜 props.f0 是本幕在全片的起始帧。 */
const globalFrame = (p: SceneInput) => Number(p.params.f0 ?? 0) + p.frame;
const str = (p: SceneInput, key: string, fallback: string) => {const v = p.params[key]; return typeof v === 'string' && v.trim() ? v : fallback;};

/** 1920×1080 逻辑画布，按输出宽度缩放。 */
const Stage = ({props, bg, children}: {props: SceneInput; bg: string; children: React.ReactNode}) =>
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: bg}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${props.width / 1920})`, transformOrigin: '0 0', overflow: 'hidden', fontFamily: SANS}}>
      {children}
    </div>
  </div>;

/** “*词*”是琥珀色强调词；中文按空格分词组逐组入场。 */
const parseWords = (text: string) => text.split(/\s+/).filter(Boolean).map(w => {const m = w.match(/^\*(.+)\*$/); return m ? {text: m[1], accent: true} : {text: w, accent: false};});

// ---- 2.5D 页面相机（原作 PageCam：关键帧插值 cx/cy/zoom/rotX/rotY/rotZ/persp，3D 时用 CSS zoom 做布局级放大保清晰） ----
type CamKey = {frame: number; cx: number; cy: number; zoom: number; rotX?: number; rotY?: number; rotZ?: number; persp?: number};
function camAt(keys: CamKey[], f: number, ease = E.push) {
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (f >= keys[i].frame && f <= keys[i + 1].frame) {a = keys[i]; b = keys[i + 1]; break;}
  if (f < keys[0].frame) b = a; if (f > keys[keys.length - 1].frame) a = b;
  const t = a.frame === b.frame ? 1 : ease(clamp((f - a.frame) / (b.frame - a.frame)));
  return {cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), zoom: lerp(a.zoom, b.zoom, t), rotX: lerp(a.rotX ?? 0, b.rotX ?? 0, t),
    rotY: lerp(a.rotY ?? 0, b.rotY ?? 0, t), rotZ: lerp(a.rotZ ?? 0, b.rotZ ?? 0, t), persp: lerp(a.persp ?? 1400, b.persp ?? 1400, t)};
}
function PageCam({cam, pageH, bg, children, filter, dof}: {cam: ReturnType<typeof camAt>; pageH: number; bg: string; children: React.ReactNode; filter?: string; dof?: number}) {
  const {cx, cy, zoom, rotX, rotY, rotZ, persp} = cam;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: bg}}>
    <div style={{position: 'absolute', inset: 0, perspective: `${persp * zoom}px`, perspectiveOrigin: '960px 540px'}}>
      <div style={{position: 'absolute', width: 1920, height: pageH, zoom, transformStyle: 'preserve-3d', filter,
        transform: `translate(${960 / zoom - cx}px, ${540 / zoom - cy}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
        {children}
      </div>
    </div>
    {dof && dof > 0.1 ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 260, backdropFilter: `blur(${dof}px)`,
      maskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)'}} /> : null}
  </div>;
}

// ---- 虚构界面数据：拾页 · 团队研究台 ----
const COLS = [408, 781.33, 1154.66], CARD_W = 357.33;
type CardData = {i: number; q: number; exp: number; paper: number; x: number; y: number; h: number};
// 卡片文字在 meta.params.projects（kitText），这里只留计数：问题、实验、论文。
const CARD_NUMS: [number, number, number][] = [[7, 1, 0], [4, 2, 1], [3, 1, 0], [7, 2, 0], [5, 3, 1], [6, 2, 0], [8, 4, 2], [4, 2, 0], [9, 5, 1], [5, 1, 0]];
const SLOT_ROWS = [{y: 247, h: 288, n: 2}, {y: 616, h: 312, n: 3}, {y: 1009, h: 312, n: 3}, {y: 1402, h: 312, n: 2}];
const CARDS: CardData[] = (() => {
  const out: CardData[] = []; let k = 0;
  for (const row of SLOT_ROWS) for (let c = 0; c < row.n; c++, k++) {
    const s = CARD_NUMS[k];
    out.push({i: k, q: s[0], exp: s[1], paper: s[2], x: COLS[c], y: row.y, h: row.h});
  }
  return out;
})();
const SECTIONS = [{y: 206, n: 2}, {y: 575, n: 3}, {y: 968, n: 3}, {y: 1361, n: 2}]; // 分组名在 ui.sections
const PAGE_H = 1746;

/** 一张项目卡（页面坐标里用 left/top 定位，或在 transform 容器里 0,0 起画）。 */
function ProjectCard({c, P, style, hot}: {c: CardData; P: Pal; style?: React.CSSProperties; hot?: number}) {
  const t = P.tx.projects[c.i] ?? {title: '', desc: '', owner: '', client: '', field: '', tags: [], age: ''};
  return <div style={{position: 'absolute', width: CARD_W, height: c.h, borderRadius: 16, background: P.card, border: `1px solid ${P.line}`,
    boxSizing: 'border-box', padding: '20px 22px', color: P.ink, fontFamily: SANS, overflow: 'hidden', ...style}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: P.muted}}><span style={{letterSpacing: 1}}>{t.field}</span><span style={{color: P.amber}}>{t.age}</span></div>
    <div style={{fontSize: 17, fontWeight: 700, marginTop: 12, lineHeight: 1.3}}>{t.title}</div>
    <div style={{fontSize: 12.5, color: P.muted, marginTop: 8, lineHeight: 1.55, height: 40, overflow: 'hidden'}}>{t.desc}</div>
    <div style={{display: 'grid', gridTemplateColumns: '54px 1fr', rowGap: 4, fontSize: 12, marginTop: 14, color: P.muted}}>
      <span>{P.tx.owner}</span><span style={{color: P.ink}}>{t.owner}</span><span>{P.tx.client}</span><span style={{color: P.ink}}>{t.client}</span>
    </div>
    <div style={{display: 'flex', gap: 14, fontSize: 12, marginTop: 12, color: P.muted, fontFamily: MONO}}>
      <span>{`${P.tx.questions} `}<b style={{color: P.ink}}>{c.q}</b></span><span>{`${P.tx.experiments} `}<b style={{color: P.ink}}>{c.exp}</b></span><span>{`${P.tx.papers} `}<b style={{color: P.ink}}>{c.paper}</b></span>
    </div>
    <div style={{display: 'flex', gap: 6, marginTop: 12}}>
      {t.tags.map(tag => <span key={tag} style={{fontSize: 11, padding: '3px 9px', borderRadius: 999, background: P.faint, color: P.muted, border: `1px solid ${P.line}`}}>{tag}</span>)}
    </div>
    {hot ? <div style={{position: 'absolute', inset: 0, borderRadius: 16, boxShadow: `inset 0 0 0 2px ${rgba(P.amber, hot)}`}} /> : null}
  </div>;
}
/** 顶部导航（宽 1920，高 61）。 */
const NavBar = ({P}: {P: Pal}) => <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 61, background: P.card, borderBottom: `1px solid ${P.line}`, fontFamily: SANS}}>
  <div style={{position: 'absolute', left: 408, top: 0, height: 61, width: 1104, display: 'flex', alignItems: 'center', gap: 22}}>
    <span style={{width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.field, color: P.amber, display: 'grid', placeItems: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 16}}>{P.tx.logo}</span>
    <strong style={{fontSize: 18, color: P.ink, fontFamily: SERIF, marginLeft: -8}}>{P.tx.brand}</strong>
    {P.tx.nav.map((t, i) => <span key={i} style={{fontSize: 13, color: i === 0 ? P.amber : P.muted, height: 61, display: 'flex', alignItems: 'center', borderBottom: i === 0 ? `2px solid ${P.amber}` : 'none', boxSizing: 'border-box'}}>{t}</span>)}
    <span style={{fontSize: 11, color: P.muted, border: `1px solid ${P.line}`, padding: '3px 8px', borderRadius: 4}}>{P.tx.demo}</span>
    <span style={{marginLeft: 'auto', fontSize: 11, color: P.muted, display: 'flex', alignItems: 'center', gap: 8}}>
      <span style={{width: 6, height: 6, borderRadius: 3, background: P.amber}} />{P.tx.live}<span style={{width: 26, height: 26, borderRadius: 7, background: P.field, border: `1px solid ${P.line}`, color: P.amber, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700}}>{initial(P.tx.members[0] ?? '')}</span>
    </span>
  </div>
</div>;
/** 搜索框（x 408，y 130，宽 1016，高 44）与筛选按钮。query/caret 由镜头控制。 */
const SearchBar = ({P, query = '', caret = false, ripple}: {P: Pal; query?: string; caret?: boolean; ripple?: number}) => <>
  <div style={{position: 'absolute', left: 408, top: 130, width: 1016, height: 44, borderRadius: 10, background: P.field, border: `1px solid ${P.line}`, boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, fontSize: 15, color: P.ink, fontFamily: SANS}}>
    <svg width={16} height={16} viewBox="0 0 16 16"><circle cx={7} cy={7} r={5.2} fill="none" stroke={P.muted} strokeWidth={1.6} /><path d="M11 11l3.5 3.5" stroke={P.muted} strokeWidth={1.6} strokeLinecap="round" /></svg>
    {query ? <span>{query}</span> : <span style={{color: P.muted}}>{P.tx.search}</span>}
    {caret ? <span style={{display: 'inline-block', width: 2, height: 20, background: P.amber, marginLeft: -6}} /> : null}
  </div>
  <div style={{position: 'absolute', left: 1436, top: 130, width: 76, height: 44, borderRadius: 10, background: P.field, border: `1px solid ${ripple ? P.amber : P.line}`, boxSizing: 'border-box',
    display: 'grid', placeItems: 'center', fontSize: 13, color: ripple ? P.amber : P.muted}}>{P.tx.filter}</div>
</>;
/** 整页仪表盘背景（不含卡片本体时传 cards=false，由镜头自己画飞行的卡）。 */
function Dashboard({P, cards = true, sections = true, search}: {P: Pal; cards?: boolean | number[]; sections?: boolean; search?: React.ReactNode}) {
  const show = (i: number) => cards === true || (Array.isArray(cards) && cards.includes(i));
  return <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: PAGE_H, background: P.page, fontFamily: SANS}}>
    <NavBar P={P} />
    <div style={{position: 'absolute', left: 408, top: 88, width: 1104, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: P.ink}}>
      <span style={{fontWeight: 600}}>{P.tx.all}</span><span style={{color: P.muted}}>{P.tx.stats}</span>
    </div>
    {search ?? <SearchBar P={P} />}
    {sections ? SECTIONS.map((s, i) => <div key={i} style={{position: 'absolute', left: 408, top: s.y, width: 1104, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: P.muted, letterSpacing: 2}}>
      <span>{P.tx.sections[i]}</span><span>{P.tx.count(s.n)}</span></div>) : null}
    {CARDS.map((c, i) => show(i) ? <ProjectCard key={i} c={c} P={P} style={{left: c.x, top: c.y}} /> : null)}
  </div>;
}

// ---- 叠加层：底部解说条、暖白闪切、里程表数字 ----
function Caption({P, text, from, duration, g}: {P: Pal; text: string; from: number; duration: number; g: number}) {
  const f = g - from;
  if (f < 0 || f > duration) return null;
  const inT = interp(f, [0, 8], [0, 1]), outT = interp(f, [duration - 8, duration], [1, 0]);
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 72, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
    fontFamily: MONO, fontSize: 24, letterSpacing: '0.18em', color: mixHex(P.muted, P.ink, 0.25), opacity: inT * outT, transform: `translateY(${(1 - inT) * 8}px)`}}>
    <span style={{width: 7, height: 7, background: P.amber, display: 'inline-block'}} /><span>{text}</span>
  </div>;
}
/** 暖白闪：跨骑硬切，from = 切点 − 5，共 10 帧，峰值 0.85。 */
function Flash({g, cuts}: {g: number; cuts: number[]}) {
  const o = Math.max(0, ...cuts.map(c => interp(g - (c - 5), [0, 4, 10], [0, 0.85, 0])));
  return o > 0.002 ? <div style={{position: 'absolute', inset: 0, opacity: o, background: 'radial-gradient(ellipse at 50% 45%, rgba(255,248,235,0.98), rgba(255,244,224,0.55) 55%, rgba(255,244,224,0) 80%)'}} /> : null;
}
const DIGITS = '0123456789';
function DigitRoll({value, f, delay = 0, size = 30, color}: {value: string; f: number; delay?: number; size?: number; color: string}) {
  const lineH = size * 1.15;
  return <span style={{display: 'inline-flex', overflow: 'hidden', height: lineH, verticalAlign: 'bottom', fontFamily: MONO}}>
    {value.split('').map((ch, i) => {
      const target = DIGITS.indexOf(ch);
      if (target < 0) return <span key={i} style={{fontSize: size, lineHeight: `${lineH}px`, color}}>{ch}</span>;
      const t = interp(f, [delay + i * 4, delay + i * 4 + 22], [0, 1], E.roll);
      return <span key={i} style={{display: 'inline-block', height: lineH}}><span style={{display: 'block', transform: `translateY(${-(10 + target) * t * lineH}px)`}}>
        {(DIGITS + DIGITS).split('').map((d, j) => <span key={j} style={{display: 'block', fontSize: size, lineHeight: `${lineH}px`, color, fontVariantNumeric: 'tabular-nums'}}>{d}</span>)}
      </span></span>;
    })}
  </span>;
}
/** 固定种子伪随机（同一 seed 同一序列）。 */
const seeded = (seed: number) => {let s = seed >>> 0; return () => {s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296;};};


const MAIN = CARDS[3];
const MCX = MAIN.x + CARD_W / 2, MCY = MAIN.y + MAIN.h / 2;
const OPEN_CAM: CamKey[] = [
  {frame: 82, cx: 960, cy: 540, zoom: 0.78, rotX: 0, rotY: 0, rotZ: 0, persp: 1200},
  {frame: 114, cx: 960, cy: 540, zoom: 0.78, rotX: 0, rotY: 0, rotZ: 0, persp: 1200},
  {frame: 130, cx: MCX - 30, cy: MCY, zoom: 2.6, rotX: 8, rotY: 34, rotZ: 2, persp: 1200},
  {frame: 220, cx: MCX - 30, cy: MCY, zoom: 2.58, rotX: 8, rotY: 34, rotZ: 2, persp: 1200},
];

export default function Scene(props: SceneInput) {
  const P = palette(props);
  const f = props.frame, g = globalFrame(props), duration = 220;
  const WORD = str(props, 'wordmark', '拾页'), KICK = str(props, 'kicker', '团队研究台 · TEAM RESEARCH DESK');
  const note1 = str(props, 'noteLine1', '一张卡，'), note2 = str(props, 'noteLine2', '一个项目。');

  // ---- 品牌组（0–83） ----
  const vDraw = interp(f, [0, 9], [100, 0], bez(0.3, 0, 0.2, 1)), hDraw = interp(f, [8, 18], [100, 0]);
  const crossFade = interp(f, [24, 34], [1, 0]);
  const kickStart = 28, perChar = 0.7, kickChars = Math.floor(Math.max(0, f - kickStart) / perChar), kickDone = kickStart + KICK.length * perChar;
  const cursorOn = f >= kickStart && (f < kickDone || (f <= 74 && Math.floor((f - kickDone) / 2) % 2 === 0));
  const brandOut = interp(f, [76, 83], [0, 1], bez(0.4, 0, 0.5, 1));

  // ---- 仪表盘推近（84–220） ----
  const macroIn = interp(f, [82, 90], [0, 1], bez(0.3, 0, 0.2, 1));
  const spotE = bez(0.4, 0, 0.3, 1);
  const spotX = interp(f, [86, 90, 98, 104, 110, 130], [25, 25, 70, 42, 50, 50], spotE);
  const spotY = interp(f, [86, 90, 98, 104, 110, 130], [30, 30, 45, 60, 67, 50], spotE);
  const spotOn = interp(f, [84, 92], [0, 1]);
  const poolBase = interp(f, [104, 114, 130], [620, 420, 360], spotE), poolPulse = interp(f, [114, 118, 123], [0, 0.06, 0]);
  const vignette = interp(f, [104, 114, 130], [0.16, 0.34, 0.42]);
  const dof = interp(f, [114, 130, 140, 150], [0, 9, 9, 0]);
  const rise = interp(f, [130, 140], [0, 1], E.pop), reseat = interp(f, [194, 212], [0, 1], E.reseat);
  const lift = rise * (1 - reseat), bob = Math.sin(((f - 140) / 40) * Math.PI * 2) * 4 * lift, z = 110 * lift + bob;
  const press = interp(f, [208, 211, 212], [1, 0.997, 1]);
  const slotVis = Math.min(1, rise * 2) * (1 - reseat), landPulse = interp(f, [208, 212, 216], [0, 1, 0]);
  const slotEdge = Math.min(1, 0.4 * (1 - reseat)) + landPulse * 0.6;
  const beam1 = interp(f, [142, 156], [0, 1]), beam1On = f >= 141 && f <= 157;
  const beam2 = interp(f, [162, 182], [0, 1], bez(0.4, 0, 0.4, 1)), beam2On = f >= 161 && f <= 183;
  const trail = interp(f, [182, 194], [0.35, 0]);
  const noteIn = interp(f, [142, 152], [0, 1], E.word), noteVis = noteIn * interp(f, [198, 208], [1, 0]);
  const noteZ = 92 + Math.sin(((f - 142) / 44) * Math.PI * 2) * 3, hl = interp(f, [156, 168], [0, 1], bez(0.3, 0, 0.2, 1));
  const out = 1 - interp(f, [duration - 5, duration], [0, 1], bez(0.5, 0, 0.6, 1));
  const bw = CARD_W + 6, bh = MAIN.h + 6;

  return <Stage props={props} bg={P.page}>
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      {f >= 84 ? <div style={{position: 'absolute', inset: 0, opacity: macroIn}}>
        <PageCam cam={camAt(OPEN_CAM, f)} pageH={PAGE_H} bg={P.page} dof={dof}>
          <Dashboard P={P} cards={CARDS.map((_, i) => i).filter(i => i !== 3)} />
          {/* 近边缘的轮廓光 */}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: 'rgba(255,255,255,0.85)', filter: 'blur(6px)', opacity: 0.6 * Math.min(1, lift + Math.max(0, (f - 114) / 16))}} />
          <div style={{transformStyle: 'preserve-3d'}}>
            {slotVis > 0.02 ? <div style={{position: 'absolute', left: MAIN.x - 2, top: MAIN.y - 2, width: CARD_W + 4, height: MAIN.h + 4, borderRadius: 16,
              background: P.faint, boxShadow: `inset 0 0 26px ${rgba(P.amber, 0.12 * slotEdge)}`, opacity: slotVis}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 16, border: `1.5px solid ${P.amberLite}`, opacity: slotEdge}} />
            </div> : null}
            <div style={{position: 'absolute', left: MAIN.x, top: MAIN.y, width: CARD_W, height: MAIN.h, transform: `translateZ(${z}px) scale(${press})`, transformStyle: 'preserve-3d'}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden',
                boxShadow: f >= 212 ? 'none' : `0 ${8 * lift}px ${10 + 12 * lift}px rgba(40,30,20,${0.18 * lift}), 0 ${46 * lift}px ${90 * lift}px rgba(40,30,20,${0.22 * lift})`}}>
                <ProjectCard c={MAIN} P={P} style={{left: 0, top: 0}} />
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 40%)', opacity: lift}} />
              </div>
              <div style={{position: 'absolute', inset: 0, borderRadius: 16, boxShadow: `inset 0 0 0 1px rgba(255,255,255,${0.7 * lift})`}} />
              {(beam1On || beam2On) && lift > 0.4 ? <svg width={bw} height={bh} viewBox={`0 0 ${bw} ${bh}`} style={{position: 'absolute', left: -3, top: -3, overflow: 'visible', opacity: beam1On ? 1 : 0.62,
                filter: `drop-shadow(0 0 6px ${P.amber}) drop-shadow(0 0 18px rgba(255,240,210,0.55))`}}>
                <rect x={2} y={2} width={bw - 4} height={bh - 4} rx={16} fill="none" stroke={P.amber} strokeWidth={beam1On ? 5 : 3.5} strokeLinecap="round" pathLength={1} strokeDasharray="0.14 1" strokeDashoffset={-(beam1On ? beam1 : beam2)} />
                <rect x={2} y={2} width={bw - 4} height={bh - 4} rx={16} fill="none" stroke="rgba(255,248,232,0.98)" strokeWidth={beam1On ? 2.5 : 1.75} strokeLinecap="round" pathLength={1} strokeDasharray="0.14 1" strokeDashoffset={-(beam1On ? beam1 : beam2)} />
              </svg> : null}
              {trail > 0.01 ? <div style={{position: 'absolute', inset: -3, borderRadius: 19, border: `1.5px solid ${P.amber}`, opacity: trail}} /> : null}
            </div>
          </div>
          {f >= 142 && f <= 212 ? <div style={{transformStyle: 'preserve-3d'}}>
            <div style={{position: 'absolute', left: 566, top: 736, width: 210, height: 74, transform: 'translateZ(2px)', background: 'radial-gradient(ellipse at 50% 50%, rgba(40,30,20,0.3), rgba(40,30,20,0) 70%)', filter: 'blur(12px)', opacity: 0.55 * noteVis}} />
            <div style={{position: 'absolute', left: 540, top: 664, width: 250, transform: `translateZ(${noteZ}px) translateY(${(1 - noteIn) * 26}px)`, opacity: noteVis, filter: noteIn < 0.99 ? `blur(${(1 - noteIn) * 4}px)` : undefined}}>
              <div style={{fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: P.ink, lineHeight: 1.2}}>{note1}</div>
              <div style={{position: 'relative', display: 'inline-block'}}>
                <div style={{position: 'absolute', left: -5, top: '14%', bottom: '4%', width: `calc(${hl} * (100% + 10px))`, background: mixHex(P.amber, '#ffffff', 0.74), borderRadius: 4}} />
                <div style={{position: 'relative', ...accentFont(note2), fontSize: 40, fontWeight: 600, color: P.ink, lineHeight: 1.2}}>{note2}</div>
              </div>
            </div>
          </div> : null}
        </PageCam>
        <div style={{position: 'absolute', inset: 0, opacity: spotOn,
          background: `radial-gradient(${poolBase * (1 + poolPulse)}px ${poolBase * 0.8 * (1 + poolPulse)}px at ${spotX}% ${spotY}%, rgba(255,241,214,0.30), rgba(255,241,214,0.08) 45%, rgba(70,56,38,${vignette * spotOn}) 100%)`}} />
        <div style={{position: 'absolute', inset: 0, opacity: spotOn * 0.7, background: `radial-gradient(300px 220px at ${spotX - 6}% ${spotY + 10}%, rgba(255,246,228,0.18), rgba(255,246,228,0) 70%)`}} />
      </div> : null}

      {brandOut < 1 ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f >= 84 ? 'transparent' : P.paper, opacity: 1 - brandOut}}>
        <div style={{textAlign: 'center', transform: `translateY(${-brandOut * 40}px) scale(${1 - brandOut * 0.12})`}}>
          <svg width={64} height={64} viewBox="0 0 64 64" style={{display: 'block', margin: '0 auto 34px', opacity: crossFade}}>
            <line x1={32} y1={2} x2={32} y2={62} stroke={P.amber} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={vDraw} />
            <line x1={2} y1={32} x2={62} y2={32} stroke={P.amber} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={hDraw} />
          </svg>
          <div style={{fontFamily: SERIF, fontSize: 176, fontWeight: 700, color: P.ink, lineHeight: 1, display: 'inline-flex', alignItems: 'flex-end', letterSpacing: '0.06em'}}>
            {Array.from(WORD).map((ch, i) => {
              const d = 10 + i * 6, t = interp(f, [d, d + 12], [0, 1], bez(0.2, 0.7, 0.25, 1)), glint = interp(f, [d + 8, d + 12, d + 16], [0, 1, 0]);
              return <span key={i} style={{position: 'relative', display: 'inline-block', opacity: t, transform: `scale(${1.6 - 0.6 * t})`, transformOrigin: 'center bottom', filter: t < 0.99 ? `blur(${(1 - t) * 6}px)` : undefined}}>
                {ch}<span style={{position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', width: `${glint * 100}%`, height: 3, background: P.amber, opacity: glint, borderRadius: 2}} />
              </span>;
            })}
          </div>
          <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: '0.16em', color: P.muted, marginTop: 34, height: 34, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <span style={{whiteSpace: 'pre'}}>{Array.from(KICK).slice(0, kickChars).join('')}</span>
            <span style={{display: 'inline-block', width: 14, height: 26, marginLeft: 4, background: P.amber, opacity: cursorOn ? 0.85 : 0}} />
          </div>
        </div>
      </div> : null}
      <Caption P={P} text={str(props, 'caption', '十个在研项目 · 四位研究员')} from={90} duration={40} g={g} />
    </div>
  </Stage>;
}
