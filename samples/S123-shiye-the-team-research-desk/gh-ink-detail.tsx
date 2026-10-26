import React from 'react';
import type {SceneInput} from '@talkframe/scene';
/*
 * 详情（全片 465–565 帧）：改编自 Vincentwei1021/video-shotcraft 的 template/src/aifl/live/SceneDetail.tsx
 * （https://github.com/Vincentwei1021/video-shotcraft ，提交 13c74a707786，Apache-2.0，Copyright 2026 Wei Yihao）。
 * 保留：项目详情页从上往下缓推（cy 300→760、zoom 1.1→1.0，0–75 帧），五行“研究问题”依次从上方带倾斜飞入（第 i 行在 12 + 9i 帧起飞、12 帧落定），
 * 落定时琥珀接缝从中间向两边展开再淡去；开头接住上一镜的暖白闪。
 * 文影的改动：截图详情页换成 DOM 现画的中文虚构页面；问题文案与解说条进 meta.params；配色读 props.theme；去掉音效与 staticFile。
 */
export const meta = {
  title: '详情：实验行逐条嵌入（改编自 video-shotcraft SceneDetail）',
  description: '项目详情页缓缓下推，五行研究问题从上方带倾斜依次落进表格，琥珀接缝一闪。',
  params: {
    project: {label: '项目名', type: 'text', default: '自动化研究闭环'},
    questions: {label: '研究问题（每行一条）', type: 'longtext', default: '智能体能否自己找到更好的学习率曲线？\n失败的实验能不能自动写出复盘？\n同一个假设，换数据集还成立吗？\n哪些小改动最值得优先验证？\n一晚上能跑完几轮完整的闭环？'},
    caption: {label: '底部解说条', type: 'text', default: '每个问题，都追到它的实验'},
    field: {label: '分组标签', type: 'text', default: '研究基础设施', maxLength: 24},
    summary: {label: '项目简介', type: 'longtext', default: '提出假设、跑实验、写小结，一圈一圈自动往前推；每个研究问题都连着它的实验记录和相关论文。', maxLength: 120},
    facts: {label: '四格信息', type: 'list', min: 4, max: 4, maxLength: 20, item: [{key: 'k', label: '名称', type: 'text'}, {key: 'v', label: '内容', type: 'text'}],
      default: [{k: '负责人', v: '周'}, {k: '客户', v: '研究基建'}, {k: '阶段', v: '第 3 轮闭环'}, {k: '更新', v: '今天 08:40'}]},
    tabs: {label: '页签', type: 'list', min: 4, max: 4, maxLength: 16, default: ['研究问题 5', '实验 12', '论文 1', '周报 3']},
    columns: {label: '表头（编号、问题、状态、实验、负责人）', type: 'list', min: 5, max: 5, maxLength: 12, default: ['编号', '问题', '状态', '实验', '负责人']},
    status: {label: '状态（进行中、已完成、待开始）', type: 'list', min: 3, max: 3, maxLength: 12, default: ['进行中', '已完成', '待开始']},
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


const ROW_Y = [666, 760.5, 855.5, 950.5, 1045.5], ROW_H = 95;
const DETAIL_CAM: CamKey[] = [{frame: 0, cx: 960, cy: 300, zoom: 1.1}, {frame: 75, cx: 960, cy: 760, zoom: 1.0}];
const STATUS = [1, 0, 1, 2, 0] as const; // 0 已完成 1 进行中 2 待开始，文字在 meta.params.status（进行中、已完成、待开始）
const listOf = (props: SceneInput, key: 'facts' | 'tabs' | 'columns' | 'status') => (Array.isArray(props.params[key]) ? props.params[key] : meta.params[key].default) as unknown[];

function Row({P, i, text, status}: {P: Pal; i: number; text: string; status: string[]}) {
  const kind = STATUS[i % STATUS.length], label = status[[1, 0, 2][kind]] ?? '';
  const chip = kind === 0 ? {bg: P.faint, fg: P.muted} : kind === 1 ? {bg: P.amberSoft, fg: P.amber} : {bg: P.page, fg: P.muted};
  return <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '64px 1fr 110px 120px 90px', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box',
    background: P.card, borderBottom: `1px solid ${P.line}`, fontFamily: SANS, color: P.ink, fontSize: 17}}>
    <span style={{fontFamily: MONO, color: P.muted, fontSize: 14}}>Q{i + 1}</span>
    <span style={{fontWeight: 600}}>{text}</span>
    <span><span style={{fontSize: 12.5, padding: '4px 10px', borderRadius: 999, background: chip.bg, color: chip.fg, border: `1px solid ${P.line}`}}>{label}</span></span>
    <span style={{fontFamily: MONO, fontSize: 14, color: P.muted}}>{`${P.tx.experiments} `}<b style={{color: P.ink}}>{[3, 2, 4, 1, 2][i % 5]}</b></span>
    <span style={{fontSize: 13, color: P.muted}}>{P.tx.members[[0, 1, 2, 3, 0][i % 5]] ?? ''}</span>
  </div>;
}

export default function Scene(props: SceneInput) {
  const P = palette(props);
  const f = props.frame, g = globalFrame(props);
  const project = str(props, 'project', '自动化研究闭环');
  const qs = str(props, 'questions', String(meta.params.questions.default)).split('\n').filter(Boolean).slice(0, 5);
  while (qs.length < 5) qs.push('');
  const fly = bez(0.3, 0, 0.25, 1);
  return <Stage props={props} bg={P.page}>
    <PageCam cam={camAt(DETAIL_CAM, f, E.push)} pageH={1172} bg={P.page}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1172, background: P.page}} />
      <NavBar P={P} />
      <div style={{position: 'absolute', left: 408, top: 96, width: 1104, fontFamily: SANS, color: P.ink}}>
        <div style={{fontSize: 13, color: P.muted}}>{`${P.tx.nav[0] ?? ''} / ${project}`}</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 18}}>
          <span style={{fontFamily: SERIF, fontSize: 44, fontWeight: 700}}>{project}</span>
          <span style={{fontSize: 13, color: P.amber, border: `1px solid ${P.amberLite}`, borderRadius: 999, padding: '3px 10px'}}>{str(props, 'field', meta.params.field.default)}</span>
        </div>
        <div style={{fontSize: 16, color: P.muted, marginTop: 14, lineHeight: 1.6, width: 820}}>{str(props, 'summary', meta.params.summary.default)}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 30}}>
          {listOf(props, 'facts').map(x => x as {k?: unknown; v?: unknown}).map(({k, v}, i) => <div key={i} style={{background: P.card, border: `1px solid ${P.line}`, borderRadius: 12, padding: '14px 18px'}}>
            <div style={{fontSize: 12, color: P.muted}}>{String(k ?? '')}</div><div style={{fontSize: 18, fontWeight: 600, marginTop: 6}}>{String(v ?? '')}</div></div>)}
        </div>
        <div style={{display: 'flex', gap: 28, marginTop: 40, fontSize: 15, borderBottom: `1px solid ${P.line}`}}>
          {listOf(props, 'tabs').map(String).map((t, i) => <span key={i} style={{paddingBottom: 12, color: i === 0 ? P.amber : P.muted, borderBottom: i === 0 ? `2px solid ${P.amber}` : 'none', fontWeight: i === 0 ? 600 : 400}}>{t}</span>)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 408, top: 626, width: 1104, display: 'grid', gridTemplateColumns: '64px 1fr 110px 120px 90px', padding: '0 24px', boxSizing: 'border-box', fontSize: 12, color: P.muted, letterSpacing: 2, fontFamily: SANS}}>
        {listOf(props, 'columns').map(String).map((t, i) => <span key={i}>{t}</span>)}
      </div>
      <div style={{position: 'absolute', left: 408, top: ROW_Y[0], width: 1104, height: ROW_H * 5, borderRadius: 12, border: `1px dashed ${P.line}`, boxSizing: 'border-box'}} />
      {qs.map((q, i) => {
        const cue = 12 + i * 9, land = cue + 12, y = ROW_Y[i];
        if (f < cue) return null;
        const p = interp(f, [cue, cue + 12], [0, 1], fly), appear = interp(f, [cue, cue + 3], [0, 1]), air = f < land ? 1 - p : 0;
        const scale = f < land ? 1.06 - 0.065 * p : interp(f, [land, land + 4], [0.995, 1], E.outCubic);
        const spread = interp(f, [land, land + 5], [0, 1], E.outCubic), seamO = interp(f, [land, land + 2, land + 8], [1, 1, 0]);
        return <React.Fragment key={i}>
          <div style={{position: 'absolute', left: 408, top: y, width: 1104, height: ROW_H, borderRadius: 8, overflow: 'hidden', opacity: appear,
            transform: `perspective(900px) translateY(${-120 * air}px) rotateX(${16 * air}deg) scale(${scale})`,
            boxShadow: `0 ${30 * air}px ${60 * air}px rgba(30,25,18,${0.22 * air}), 0 ${8 * air}px ${16 * air}px rgba(30,25,18,${0.12 * air})`}}>
            <Row P={P} i={i} text={q} status={listOf(props, 'status').map(String)} />
          </div>
          {f >= land && f < land + 8 ? <div style={{position: 'absolute', left: 408 + (1104 - 1104 * spread) / 2, top: y + ROW_H - 2, width: 1104 * spread, height: 2,
            background: P.amber, boxShadow: `0 0 6px ${rgba(P.amber, 0.35)}`, opacity: seamO}} /> : null}
        </React.Fragment>;
      })}
    </PageCam>
    <Caption P={P} text={str(props, 'caption', '每个问题，都追到它的实验')} from={477} duration={68} g={g} />
    <Flash g={g} cuts={[465, 620]} />
  </Stage>;
}
