import React from 'react';
import type {SceneInput} from '@talkframe/scene';
// 第 8 镜（全片 775–885 帧，110 帧）：周报“自己写自己”——编辑器标题特写，正文两块一组逐字打出，琥珀光标跟着写字的前沿，
// 成员名写完后铺一层琥珀底；机位拉到整页后左右两栏自上而下揭开，历史周报（第 27～22 周）逐条从上方落进左栏。
// 改编自 Vincentwei1021/video-shotcraft 的 template/src/aifl/live/SceneWbr.tsx（提交 13c74a707786），
// Apache-2.0，Copyright 2026 Wei Yihao。我们改了什么：
// - 原作的 wbr-full.png 整页截图换成 DOM 现画的中文虚构周报编辑器（拾页 · 周报），左右栏坐标沿用 live-layout.json 的 wbr
//   （左栏 x 0 宽 208、右栏 x 1632 宽 288、y 61 起，页高 1080；历史周报从 y 228 起每条 56 高）；
// - 原作用纸色遮罩自左向右擦开截图里的文字，这里文字是现画的，改成真正的逐字打出（未打出的字透明占位，排版不跳），
//   节奏照原作：第 i 块在 6 + ⌊i/2⌋×3.5 帧开始、8 帧写完，光标只跟最新一块；
// - 机位关键帧、左栏 46 帧 / 右栏 54 帧的揭开与内缘琥珀线、历史周报 58+5i 帧下落回弹（落地对应原作 840–865 帧的 pop）照原作；
// - 去掉音效与 staticFile、主题钩子，并入文影幕代码格式（kit 由 build_scenes.mjs 拼入）；人名只用单字姓，内容全部虚构，进 meta.params。
export const meta = {
  title: '周报：自己写自己',
  description: '研究周报编辑器：标题特写起，正文“本周进展 / 风险 / 下周计划”逐块打字揭示，成员名铺琥珀底；拉到整页后左右栏揭开，历史周报逐条落进左栏。',
  aspects: ['landscape'],
  params: {
    f0: '本幕在全片的起始帧（30 fps，分镜给出，默认 775）；闪切与解说条按全片帧对齐',
    kicker: {label: '右上角标', type: 'text', default: '研究周报 · 2026-W28', maxLength: 20},
    title: {label: '周报标题', type: 'text', default: '2026 第 28 周 · 研究周报', maxLength: 20},
    authors: {label: '作者行', type: 'text', default: '周 · 林 · 许 · 唐 共同编辑', maxLength: 30},
    date: {label: '日期', type: 'text', default: '7月10日', maxLength: 8},
    headings: {label: '三段小标题', type: 'list', default: ['本周进展', '风险', '下周计划'], min: 1, max: 3, maxLength: 8},
    progress: {label: '本周进展', type: 'list', min: 0, max: 4, maxLength: 44, help: '每行：谁 | 内容；内容里 [[…]] 是带评论的划线片段',
      item: [{key: 'who', label: '谁', type: 'text'}, {key: 'text', label: '内容', type: 'text'}],
      default: [
        {who: '周', text: '置信度路由：阈值校准后，小模型承接率 [[62% → 71%]]，端到端质量持平。'},
        {who: '林', text: '传感器漂移预警：在留出的产线数据上收敛，比滚动统计基线[[提前 3.1 倍]]报警。'},
        {who: '许', text: '研究闭环跑完第 47 轮：自动提出的学习率调度超过人工扫参 1.8 个点。'},
        {who: '唐', text: '方言语音：合成增广后，低资源方言的错误率相对下降 12%。'},
      ]},
    risks: {label: '风险', type: 'list', min: 0, max: 3, maxLength: 44, help: '每行：谁（可空） | 内容',
      item: [{key: 'who', label: '谁', type: 'text'}, {key: 'text', label: '内容', type: 'text'}],
      default: [
        {who: '林', text: '标定数据 7 月批次有缺口，已提补采需求，预计下周三到位。'},
        {who: '周', text: '端侧持续微调第三轮出现遗忘，要讨论是否单独立项。'},
        {who: '', text: '评测集与线上分布偏差偏大，本周结论暂不外推。'},
      ]},
    plans: {label: '下周计划', type: 'list', min: 0, max: 4, maxLength: 44, help: '每行：谁（可空） | 内容',
      item: [{key: 'who', label: '谁', type: 'text'}, {key: 'text', label: '内容', type: 'text'}],
      default: [
        {who: '许', text: '把提议器的失败案例归因，写进实验注记。'},
        {who: '唐', text: '整理评测集 v2，把 13 个实验的结论卡片归档。'},
        {who: '周', text: '级联路由接入灰度，盯一周误分派率。'},
        {who: '林', text: '漂移预警接上反馈回路，和产线一起定阈值节奏。'},
      ]},
    pastWeeks: {label: '历史周报', type: 'list', min: 0, max: 6, maxLength: 16, help: '每行：周次 | 日期 | 一句话标题；逐条落进左栏',
      item: [{key: 'week', label: '周次', type: 'text'}, {key: 'date', label: '日期', type: 'text'}, {key: 'title', label: '标题', type: 'text'}],
      default: [
        {week: '2026 第 27 周', date: '7月3日', title: '漂移预警跑通留出集'},
        {week: '2026 第 26 周', date: '6月26日', title: '级联路由首版评测'},
        {week: '2026 第 25 周', date: '6月19日', title: '方言增广方案定稿'},
        {week: '2026 第 24 周', date: '6月12日', title: '编程任务集扩到 40 题'},
        {week: '2026 第 23 周', date: '6月5日', title: '研究闭环跑完第一圈'},
        {week: '2026 第 22 周', date: '5月29日', title: '端侧微调立项'},
      ]},
    comments: {label: '右栏评论', type: 'list', min: 0, max: 2, maxLength: 30, help: '每行：划线原文 | 谁 | 评论',
      item: [{key: 'quote', label: '划线原文', type: 'text'}, {key: 'who', label: '谁', type: 'text'}, {key: 'text', label: '评论', type: 'text'}],
      default: [
        {quote: '62% → 71%', who: '唐', text: '和第 26 周的结论对上了，可以合并汇报。'},
        {quote: '提前 3.1 倍', who: '许', text: '这个提前量够立项门槛了，评审时带上失败案例。'},
      ]},
    caption: {label: '底部解说条', type: 'text', default: '四个人，一份周报', maxLength: 16},
    'ui.synced': {label: '编辑器：同步状态', type: 'text', default: '● 已同步', maxLength: 12, group: '界面文字'},
    'ui.editing': {label: '编辑器：在线人数', type: 'text', default: '4 人正在编辑', maxLength: 20, group: '界面文字'},
    'ui.heading': {label: '编辑器：样式下拉', type: 'text', default: '标题 1 ▾', maxLength: 12, group: '界面文字'},
    'ui.export': {label: '编辑器：导出', type: 'text', default: '导出 ▾', maxLength: 12, group: '界面文字'},
    'ui.searchBody': {label: '左栏搜索占位', type: 'text', default: '搜索周报正文', maxLength: 20, group: '界面文字'},
    'ui.thisWeek': {label: '左栏：本周角标', type: 'text', default: '本周', maxLength: 10, group: '界面文字'},
    'ui.justNow': {label: '左栏：刚刚', type: 'text', default: '刚刚', maxLength: 12, group: '界面文字'},
    'ui.comments': {label: '右栏标题（{n} 换成条数）', type: 'text', default: '评论 · {n}', maxLength: 16, group: '界面文字'},
    'ui.replyHint': {label: '右栏：回复框占位', type: 'text', default: '回复…', maxLength: 12, group: '界面文字'},
    'ui.reply': {label: '右栏：回复按钮', type: 'text', default: '回复', maxLength: 8, group: '界面文字'},
    'ui.whoSep': {label: '正文成员名后的分隔符', type: 'text', default: '：', maxLength: 3, group: '界面文字'},
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


// ---- 本镜头机位与节奏（原作 SceneWbr + live-layout.json → wbr） ----
const WBR_H = 1080;
const L_RAIL = {x: 0, y: 61, w: 208, h: 1019}, R_RAIL = {x: 1632, y: 61, w: 288, h: 1019};
const W_CAM: CamKey[] = [
  {frame: 0, cx: 920, cy: 280, zoom: 1.25},
  {frame: 22, cx: 920, cy: 310, zoom: 1.21},
  {frame: 64, cx: 960, cy: 540, zoom: 0.997},
  {frame: 78, cx: 960, cy: 540, zoom: 1.003},
  {frame: 102, cx: 960, cy: 540, zoom: 0.995},
];
const TYPE_EASE = bez(0.4, 0, 0.6, 1);
const cueFor = (i: number) => 6 + Math.floor(i / 2) * 3.5;
const WIPE = 8;
const WEEK_Y0 = 228, WEEK_H = 56;
const WEEK_CUE = (i: number) => 58 + i * 5;
const WEEK_DROP = bez(0.2, 1.15, 0.3, 1);

type Seg = {t: string; k: 'plain' | 'who' | 'anchor'};
type Block = {tag: 'h1' | 'meta' | 'h2' | 'li'; segs: Seg[]};
type Row = Record<string, string>;

/** list 参数：项可以是对象，也可以是按字段顺序用 | 分隔的一行；纯文字列表传 keys=['text']。 */
function listRows(v: unknown, keys: string[], max: number): Row[] | null {
  if (!Array.isArray(v)) return null;
  const out = v.flatMap(item => {
    if (typeof item === 'string') {const parts = keys.length === 1 ? [item.trim()] : item.split('|').map(s => s.trim()); return parts.some(Boolean) ? [Object.fromEntries(keys.map((k, i) => [k, parts[i] ?? '']))] : [];}
    if (item && typeof item === 'object') {const o = item as Record<string, unknown>; return [Object.fromEntries(keys.map(k => [k, o[k] == null ? '' : String(o[k]).trim()]))];}
    return [];
  }).slice(0, max);
  return out.length ? out : null;
}
const rowsOf = (props: SceneInput, key: string, keys: string[], max: number, fallback: ReadonlyArray<unknown>) =>
  listRows(props.params[key], keys, max) ?? (listRows(fallback as unknown[], keys, max) ?? []);

/** 正文一行：[[…]] 拆成带评论的划线片段；有 who 时在前面加成员名。 */
const toSegs = (who: string, text: string, sep = '：'): Seg[] => {
  const segs: Seg[] = who ? [{t: who, k: 'who'}, {t: sep, k: 'plain'}] : [];
  text.split(/(\[\[[^\]]+\]\])/).filter(Boolean).forEach(p => {const m = p.match(/^\[\[(.+)\]\]$/); segs.push(m ? {t: m[1], k: 'anchor'} : {t: p, k: 'plain'});});
  return segs;
};

/** 顶部导航：整宽应用布局，品牌靠左（原作 wbr 页的导航），当前项是“周报”。 */
const BriefNav = ({P}: {P: Pal}) => <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 61, background: P.card, borderBottom: `1px solid ${P.line}`, fontFamily: SANS}}>
  <div style={{position: 'absolute', left: 24, top: 0, height: 61, display: 'flex', alignItems: 'center', gap: 22}}>
    <span style={{width: 28, height: 28, borderRadius: 7, border: `1px solid ${P.line}`, background: P.field, color: P.amber, display: 'grid', placeItems: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 16}}>{P.tx.logo}</span>
    <strong style={{fontSize: 18, color: P.ink, fontFamily: SERIF, marginLeft: -8}}>{P.tx.brand}</strong>
    {P.tx.nav.map((t, i) => <span key={i} style={{fontSize: 13, color: i === 2 ? P.amber : P.muted, height: 61, display: 'flex', alignItems: 'center',
      borderBottom: i === 2 ? `2px solid ${P.amber}` : 'none', boxSizing: 'border-box'}}>{t}</span>)}
    <span style={{fontSize: 11, color: P.muted, border: `1px solid ${P.line}`, padding: '3px 8px', borderRadius: 4}}>{P.tx.demo}</span>
  </div>
</div>;

const ellipsis: React.CSSProperties = {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'};
const Avatar = ({P, ch, size = 26, tint = 0}: {P: Pal; ch: string; size?: number; tint?: number}) => <span style={{width: size, height: size, borderRadius: size / 2, flex: 'none',
  background: mixHex(P.field, P.amber, tint), border: `1.5px solid ${P.card}`, color: tint > 0.5 ? P.card : P.amber, display: 'grid', placeItems: 'center',
  fontSize: size * 0.45, fontWeight: 700, fontFamily: SERIF, boxSizing: 'border-box'}}>{initial(ch)}</span>;

/** 逐字揭示：前 shown 个字可见，其余透明占位（排版不跳）；光标是零宽元素，夹在可见与未见之间。 */
function Typed({P, segs, shown, caret, wash}: {P: Pal; segs: Seg[]; shown: number; caret: number; wash: number}) {
  const out: React.ReactNode[] = [];
  let used = 0, caretDone = caret <= 0;
  const caretEl = (k: string) => <span key={k} style={{display: 'inline-block', width: 0, height: '1em', position: 'relative'}}>
    <span style={{position: 'absolute', left: 1, top: -1, width: 2, height: '1.2em', background: P.amber, opacity: caret}} /></span>;
  segs.forEach((s, i) => {
    const chars = Array.from(s.t), vis = chars.slice(0, Math.max(0, shown - used)).join(''), hid = chars.slice(Math.max(0, shown - used)).join('');
    used += chars.length;
    const base: React.CSSProperties = s.k === 'who' ? {fontWeight: 700} : {};
    if (vis) {
      const st: React.CSSProperties = s.k === 'anchor' ? {background: rgba(P.amber, 0.1), borderBottom: `1.5px solid ${rgba(P.amber, 0.75)}`}
        : s.k === 'who' ? {backgroundImage: `linear-gradient(${P.amberSoft}, ${P.amberSoft})`, backgroundRepeat: 'no-repeat', backgroundSize: `${wash * 100}% 100%`, borderRadius: 3, padding: '0 2px', margin: '0 -2px'} : {};
      out.push(<span key={`v${i}`} style={{...base, ...st}}>{vis}</span>);
    }
    if (!caretDone && (hid || i === segs.length - 1)) {out.push(caretEl(`c${i}`)); caretDone = true;}
    if (hid) out.push(<span key={`h${i}`} style={{...base, color: 'transparent'}}>{hid}</span>);
  });
  return <>{out}</>;
}

export default function Scene(props: SceneInput) {
  const P = palette(props);
  const g = globalFrame(props), f = props.frame;
  const f0 = Number(props.params.f0 ?? 0);
  const m = meta.params;
  const kicker = str(props, 'kicker', m.kicker.default), title = str(props, 'title', m.title.default);
  const authors = str(props, 'authors', m.authors.default), date = str(props, 'date', m.date.default);
  const caption = str(props, 'caption', m.caption.default);
  const heads = rowsOf(props, 'headings', ['text'], 3, m.headings.default).map(r => r.text);
  const lists = [rowsOf(props, 'progress', ['who', 'text'], 4, m.progress.default), rowsOf(props, 'risks', ['who', 'text'], 3, m.risks.default), rowsOf(props, 'plans', ['who', 'text'], 4, m.plans.default)];
  const weeks = rowsOf(props, 'pastWeeks', ['week', 'date', 'title'], 6, m.pastWeeks.default);
  const notes = rowsOf(props, 'comments', ['quote', 'who', 'text'], 2, m.comments.default);

  const blocks: Block[] = [{tag: 'h1', segs: [{t: title, k: 'plain'}]}, {tag: 'meta', segs: [{t: authors, k: 'plain'}]}];
  heads.forEach((h, s) => {
    blocks.push({tag: 'h2', segs: [{t: h, k: 'plain'}]});
    (lists[s] ?? []).forEach(r => r.text && blocks.push({tag: 'li', segs: toSegs(r.who, r.text, P.tx.ui('whoSep'))}));
  });
  let caretIdx = -1;
  blocks.forEach((_, i) => {if (f >= cueFor(i) && f <= cueFor(i) + WIPE + 2) caretIdx = i;});

  const cam = camAt(W_CAM, f, E.push);
  const kick = interp(f, [8, 16], [0, 1]);
  const mainBg = P.card, railBg = mixHex(P.page, P.ink, 0.02);
  const memberTint = (who: string) => P.tx.members.indexOf(who) >= 0 ? [0.85, 0.5, 0.3, 0.15][P.tx.members.indexOf(who)] ?? 0.2 : 0.2;

  return <Stage props={props} bg={mainBg}>
    <PageCam cam={cam} pageH={WBR_H} bg={mainBg}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: WBR_H, background: mainBg, fontFamily: SANS, color: P.ink}}>
        <BriefNav P={P} />

        {/* 编辑器页眉与工具栏 */}
        <div style={{position: 'absolute', left: 208, top: 61, width: 1424, height: 46, borderBottom: `1px solid ${P.faint}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', boxSizing: 'border-box', fontSize: 13}}>
          <strong style={{fontFamily: SERIF, fontSize: 14}}>{title.split('·')[0].trim()}</strong><span style={{color: P.muted}}>{date}</span>
          <span style={{color: P.amber, fontSize: 12}}>{P.tx.ui('synced')}</span>
          <span style={{marginLeft: 'auto', color: P.muted, fontSize: 12, marginRight: 4}}>{P.tx.ui('editing')}</span>
          <span style={{display: 'flex'}}>{P.tx.members.map((c, i) => <span key={i} style={{marginLeft: i ? -7 : 0}}><Avatar P={P} ch={c} tint={memberTint(c)} /></span>)}</span>
        </div>
        <div style={{position: 'absolute', left: 208, top: 107, width: 1424, height: 42, borderBottom: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', boxSizing: 'border-box', fontSize: 15, color: P.muted}}>
          <span>↶</span><span>↷</span><span style={{fontSize: 13, color: P.ink}}>{P.tx.ui('heading')}</span>
          <b>B</b><i style={{fontFamily: SERIF}}>I</i><u>U</u><s>S</s><span style={{borderBottom: `2px solid ${P.amber}`, lineHeight: 1}}>A</span><span style={{fontFamily: MONO, fontSize: 13}}>{'</>'}</span>
          <span>☰</span><span style={{fontFamily: MONO, fontSize: 13}}>1.</span><span>⌘</span><span>▦</span>
          <span style={{marginLeft: 'auto', fontSize: 13}}>{P.tx.ui('export')}</span>
        </div>

        {/* 正文：逐块打字揭示 */}
        <div style={{position: 'absolute', left: 560, top: 188, width: 720}}>
          {blocks.map((b, i) => {
            const cue = cueFor(i);
            const p = interp(f, [cue, cue + WIPE], [0, 1], TYPE_EASE);
            const total = b.segs.reduce((s, x) => s + Array.from(x.t).length, 0);
            const shown = Math.round(total * p);
            const caret = i !== caretIdx ? 0 : p < 1 ? 1 : interp(f, [cue + WIPE, cue + WIPE + 2], [1, 0]);
            const wash = interp(f, [cue + WIPE + 4, cue + WIPE + 12], [0, 1], bez(0.3, 0, 0.2, 1));
            const typed = <Typed P={P} segs={b.segs} shown={shown} caret={caret} wash={wash} />;
            if (b.tag === 'h1') return <div key={i} style={{fontFamily: SERIF, fontSize: 31, fontWeight: 700, lineHeight: '40px', letterSpacing: 0.5}}>{typed}</div>;
            if (b.tag === 'meta') return <div key={i} style={{fontSize: 13.5, color: P.muted, lineHeight: '22px', marginTop: 8, marginBottom: 20, letterSpacing: 1}}>{typed}</div>;
            if (b.tag === 'h2') return <div key={i} style={{fontFamily: SERIF, fontSize: 21, fontWeight: 700, lineHeight: '28px', marginTop: blocks[i - 1]?.tag === 'meta' ? 0 : 30, marginBottom: 10}}>{typed}</div>;
            return <div key={i} style={{position: 'relative', fontSize: 16, lineHeight: '32px', paddingLeft: 24, marginBottom: 9}}>
              {f >= cue ? <span style={{position: 'absolute', left: 7, top: 14, width: 5, height: 5, borderRadius: 3, background: mixHex(P.muted, P.ink, 0.5)}} /> : null}
              {typed}
            </div>;
          })}
        </div>

        {/* 左栏：周报列表 */}
        <div style={{position: 'absolute', left: L_RAIL.x, top: L_RAIL.y, width: L_RAIL.w, height: L_RAIL.h, background: railBg, borderRight: `1px solid ${P.line}`, boxSizing: 'border-box'}}>
          <div style={{position: 'absolute', left: 12, right: 12, top: 14, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600}}><span>{P.tx.nav[2] ?? ''}</span><span style={{color: P.muted, fontWeight: 400}}>«</span></div>
          <div style={{position: 'absolute', left: 12, right: 12, top: 50, height: 34, borderRadius: 8, background: P.field, border: `1px solid ${P.line}`, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', fontSize: 12, color: P.muted}}>
            <svg width={12} height={12} viewBox="0 0 16 16"><circle cx={7} cy={7} r={5.2} fill="none" stroke={P.muted} strokeWidth={1.8} /><path d="M11 11l3.5 3.5" stroke={P.muted} strokeWidth={1.8} strokeLinecap="round" /></svg>{P.tx.ui('searchBody')}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 98, height: 66, background: P.amberSoft, padding: '8px 12px', boxSizing: 'border-box'}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 13, fontWeight: 600}}>{title.split('·')[0].trim()}<span style={{fontSize: 10, color: P.amber, fontWeight: 400}}>{P.tx.ui('thisWeek')}</span>
              <span style={{marginLeft: 'auto', fontSize: 10, color: P.muted, fontWeight: 400}}>{date}</span></div>
            <div style={{fontSize: 11, color: P.muted, marginTop: 3, ...ellipsis}}>{authors}</div>
            <div style={{fontSize: 10, color: P.muted, marginTop: 1}}>{P.tx.ui('justNow')}</div>
          </div>
        </div>

        {/* 右栏：评论 */}
        <div style={{position: 'absolute', left: R_RAIL.x, top: R_RAIL.y, width: R_RAIL.w, height: R_RAIL.h, background: P.page, borderLeft: `1px solid ${P.line}`, boxSizing: 'border-box'}}>
          <div style={{position: 'absolute', left: 14, right: 14, top: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12.5}}><span>{P.tx.ui('comments').replace('{n}', String(notes.length))}</span><span style={{color: P.muted}}>»</span></div>
          {notes.map((c, i) => <div key={i} style={{position: 'absolute', left: 12, right: 12, top: 50 + i * 158, height: 144, borderRadius: 10, background: P.card, border: `1px solid ${P.line}`, padding: '10px 12px', boxSizing: 'border-box'}}>
            <div style={{fontFamily: MONO, fontSize: 11, color: P.muted, background: P.faint, borderRadius: 4, padding: '4px 8px', ...ellipsis}}>“{c.quote}”</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, fontSize: 12, fontWeight: 600}}><Avatar P={P} ch={c.who || '?'} size={18} tint={memberTint(c.who)} />{c.who}<span style={{fontSize: 10, color: P.muted, fontWeight: 400}}>刚刚</span></div>
            <div style={{fontSize: 12.5, lineHeight: '18px', marginTop: 5, height: 36, overflow: 'hidden'}}>{c.text}</div>
            <div style={{display: 'flex', gap: 8, marginTop: 8, fontSize: 11, color: P.muted}}><span style={{flex: 1, border: `1px solid ${P.line}`, borderRadius: 4, padding: '2px 6px', background: P.field}}>{P.tx.ui('replyHint')}</span><span>{P.tx.ui('reply')}</span></div>
          </div>)}
        </div>

        {/* 两栏揭开：纸面补丁自上而下收走，内缘亮一道琥珀线再淡掉 */}
        {[{rail: L_RAIL, cue: 46, inner: 'right'}, {rail: R_RAIL, cue: 54, inner: 'left'}].map(({rail, cue, inner}, i) => {
          const t = interp(f, [cue, cue + 10], [0, 1], bez(0.3, 0, 0.2, 1));
          const lineFade = interp(f, [cue + 10, cue + 24], [1, 0]);
          return <div key={`rail${i}`}>
            {t < 1 ? <div style={{position: 'absolute', left: rail.x - 2, top: rail.y + rail.h * t, width: rail.w + 4, height: rail.h * (1 - t), background: mainBg}} /> : null}
            {f >= cue && lineFade > 0 ? <div style={{position: 'absolute', left: inner === 'right' ? rail.x + rail.w - 1.5 : rail.x, top: rail.y, width: 1.5, height: rail.h * t, background: P.amber, opacity: lineFade}} /> : null}
          </div>;
        })}

        {/* 历史周报逐条从上方落进左栏，带一点回弹 */}
        {weeks.map((w, i) => {
          const cue = WEEK_CUE(i);
          if (f < cue) return null;
          const t = interp(f, [cue, cue + 8], [0, 1], WEEK_DROP);
          const appear = interp(f, [cue, cue + 3], [0, 1]);
          const air = Math.max(0, 1 - t);
          return <div key={i} style={{position: 'absolute', left: 4, top: WEEK_Y0 + i * WEEK_H, width: L_RAIL.w - 8, height: WEEK_H, transform: `translateY(${-44 * air}px)`, opacity: appear,
            boxShadow: air > 0.02 ? `0 ${10 * air}px ${20 * air}px ${rgba(P.ink, 0.16 * air)}` : 'none', background: railBg, borderBottom: `1px solid ${P.line}`, padding: '9px 8px 0', boxSizing: 'border-box'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}><span style={{fontSize: 13, fontWeight: 500}}>{w.week}</span><span style={{fontSize: 10, color: P.muted}}>{w.date}</span></div>
            <div style={{marginTop: 3, fontSize: 11, color: P.muted, ...ellipsis}}>{w.title}</div>
          </div>;
        })}
      </div>
    </PageCam>

    <div style={{position: 'absolute', top: 16, right: 96, textAlign: 'right', fontFamily: MONO, fontSize: 24, letterSpacing: '0.14em', color: P.muted, opacity: kick}}>{kicker}</div>
    <Caption P={P} text={caption} from={f0 + 14} duration={78} g={g} />
    <Flash g={g} cuts={[f0]} />
  </Stage>;
}
