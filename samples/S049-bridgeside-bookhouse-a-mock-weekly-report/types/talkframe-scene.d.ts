// @talkframe/scene：幕代码运行时契约的单一来源。contracts/scene-code.ts 从这里重新导出类型，
// 宿主（src/components/CodeScene.tsx）按它注入 props；index.mjs 的辅助函数会被编译进每个幕模块。

/** 像素盒，幕内坐标（左上为原点）。 */
export type Box = {left: number; top: number; right: number; bottom: number};
export type Aspect = 'landscape' | 'portrait' | 'square';
export type Theme = {background: string; accent: string; text: string; muted: string};
/** 一个字 / 词的实测时间（秒，幕内）；汉字单独成词，拉丁字母与数字连成词，标点不出现；index 是它在去空白 text 里的位置。 */
export type Word = {text: string; start: number; end: number; index: number};
/** 一句旁白：秒，幕内，来自实际配音。有 words 时起止是实际开口与收声（本机逐字对齐）；
 * 没有时一段配音覆盖多句按字幕字数插值。 */
export type Sentence = {id: string; text: string; start: number; end: number; words?: ReadonlyArray<Word>};
/** content 已避开字幕带；captionBand 由宿主画字幕，幕代码不要在上面放东西。 */
export type Layout = {safeArea: Box; captionBand: Box; content: Box};
/** 宿主已加载的字体族；直接用作 CSS fontFamily。 */
export type Fonts = {text: string};

/** 一个素材槽：src 是渲染页可用 URL；svg 另有 PNG 兜底；video/audio 带时长（秒）。 */
export type SceneAsset = Readonly<{src: string; kind: 'image' | 'svg' | 'video' | 'audio'; width?: number; height?: number; duration?: number; fit?: 'contain' | 'cover'}>;

/** 每幕默认导出组件拿到的只读输入。 */
export type SceneInput = Readonly<{
  /** 幕内帧号，从 0 起。 */
  frame: number;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  aspect: Aspect;
  theme: Theme;
  layout: Layout;
  sentences: ReadonlyArray<Sentence>;
  /** 该句开始（加 offset 秒）后 seconds 秒内线性 0→1（seconds 默认 1）；未知句子恒为 0。 */
  progress: (sentenceId: string, offset?: number, seconds?: number) => number;
  /** 分镜素材槽 → 素材（scene 为整幕槽；scene.code 可用任意具名槽，如 logo、clip、point-1）。
   * 兼容一版：值同时是 URL 字符串对象，旧代码 `<Img src={assets.scene}>` 仍可用；新代码写 `.src` 或用 <Media>。 */
  assets: Readonly<Record<string, SceneAsset>>;
  /** 分镜 component.params.props 原样。 */
  params: Readonly<Record<string, unknown>>;
  /** 本幕固定种子（由幕 id 与模块名派生），配合 seeded() 做可复现的“随机”。 */
  seed: number;
  fonts: Fonts;
  /** 显式 semantic-glyph-v1 接力协议；宿主只传时钟与分层指令，模块仍负责自己的画面。
   * content 隐藏粒子，particles 只画透明粒子层；full 正常画。frame/seed 跨相邻幕保持连续。 */
  particleTrack?: Readonly<{frame: number; seed: number; layer: 'full' | 'content' | 'particles';
    from?: string; to?: string; progress?: number; hold: boolean; settled: boolean}>;
}>;

/** 默认导出的纯函数组件；返回值在渲染层是 JSX 元素（本包不依赖 React 类型）。 */
export type SceneComponent = (props: SceneInput) => unknown;

/** list 的项是对象时的一个字段；工作台每行一项，字段按声明顺序用 | 分隔。type 省略表示文字或数字都可以。 */
export type ParamTextLocales = Readonly<Record<string, Readonly<{label?: string; help?: string}>>>;
export type ParamField = Readonly<{key: string; label: string; type?: 'text' | 'number'; locales?: ParamTextLocales}>;
/**
 * 带类型的参数声明：只写模板已经在读的内容（文字、列表、数据、原有配色或选项），不为控件新增 props。
 * 工作台据此出控件；import_storyboard 与渲染报告据此给提示，不阻断出片。
 */
export type ParamSpec = Readonly<{
  label: string;
  /** 可选界面译文，以界面语言代码为键（如 en、ja、zh-Hant）；只影响控件文字，不改变参数值。 */
  locales?: ParamTextLocales;
  type: 'text' | 'longtext' | 'color' | 'number' | 'select' | 'boolean' | 'list';
  /** 不传该参数时代码的实际取值；跟随主题等写不成定值时省略。 */
  default?: unknown;
  /** number 为取值范围；list 为条数范围。 */
  min?: number; max?: number; step?: number;
  options?: ReadonlyArray<Readonly<{value: string; label: string; locales?: ParamTextLocales}>>;
  /** 模板最多显示的字数（list 为每项）；超出只提示。 */
  maxLength?: number;
  help?: string;
  /** 预留：工作台目前不分组。 */
  group?: string;
  /** list 的项：默认文字；'number' 为数字；字段数组表示对象。 */
  item?: 'number' | ReadonlyArray<ParamField>;
}>;

/** 可选 `export const meta: SceneMeta`：给人和 agent 看的说明，宿主不执行它；写成字面量，工具只静态读取。 */
export type SceneMeta = Readonly<{
  title?: string;
  description?: string;
  /** params.props 的声明。字符串 = 只有说明（如布局、入场这类改代码更合适的参数，不出控件）；ParamSpec = 带类型、出控件。
   * 键可用点号指嵌套字段，如 `left.title`。随包模板的副本由 `npm run templates:meta` 写进 templates/scenes/index.json。 */
  params?: Readonly<Record<string, string | ParamSpec>>;
  aspects?: ReadonlyArray<Aspect>;
  /** 本幕会画出的素材槽及用途。 */
  slots?: Readonly<Record<string, string>>;
}>;

/** 宿主桥接的库：幕代码只能 import 这些裸模块名，其余第三方库必须写进幕代码目录 package.json 并本机安装。 */
export type HostLibrary = import('../../contracts/host-libraries').HostLibraryName | '@talkframe/scene';

/** 把 v 夹到 [min, max]（默认 [0, 1]）。 */
export declare function clamp(v: number, min?: number, max?: number): number;
/** 缓出（三次）：1 - (1 - t)^3，t 先夹到 [0, 1]。 */
export declare function ease(t: number): number;
/** 缓入缓出（三次）。 */
export declare function easeInOut(t: number): number;
export declare function lerp(from: number, to: number, t: number): number;
/** 数值轨道：帧号严格递增；区间使用终点的 ease，默认线性；首尾外保持端值。 */
export type TimelineKey = Readonly<{frame: number; value: number; ease?: (t: number) => number}>;
/** 同帧同值，支持乱序跳帧；轨道可用于 SVG 属性、CSS 数值或相机参数。非法轨道抛错。 */
export declare function timeline<T extends string>(frame: number, tracks: Record<T, ReadonlyArray<TimelineKey>>): Record<T, number>;
export type CanvasDraw = (context: CanvasRenderingContext2D, frame: number) => void;
/** 同步全量重绘，先清空像素和 context 状态；不能累计上帧轨迹或启动计时器。 */
export declare function drawFrame(canvas: HTMLCanvasElement, frame: number, draw: CanvasDraw): void;
/** 纯 ref 工厂，不是 React hook；<canvas ref={useCanvas(frame, draw)} width={width} height={height}/>。 */
export declare function useCanvas(frame: number, draw: CanvasDraw): (canvas: HTMLCanvasElement | null) => void;
export type AudioFrame = Readonly<{rms: number; bands: ReadonlyArray<number>}>;
/** params.audioFeatures 的歌曲投影；frames 以当前幕的起帧为零点，频段单位 Hz。 */
export type AudioFeatureTrack = Readonly<{fps: number; source: string; bandHz: ReadonlyArray<readonly [number, number]>; frames: ReadonlyArray<AudioFrame>}>;
/** 返回 params.audioFeatures 当前幕内帧；缺数据/帧率不符/越界返回 rms=0,bands=[]。 */
export declare function audioFeatures(props: SceneInput): AudioFrame;
/** 固定种子的伪随机数发生器（mulberry32）：同一种子每次得到同一序列，返回 [0, 1)。 */
export declare function seeded(seed: number | string): () => number;
/** 固定种子的 2D simplex 噪声：noise2d(seed) 返回 (x, y) => 约 [-1, 1]；同种子同输入必得同值（置换表按种子缓存）。 */
export declare function noise2d(seed?: number | string): (x: number, y: number) => number;
/** 固定种子的 3D simplex 噪声；常用第三维传时间 frame / fps 做流场。 */
export declare function noise3d(seed?: number | string): (x: number, y: number, z: number) => number;
/** 帧内进度：一帧里要做很久的同步计算（物理回放、逐帧积分）每做完一段调用一次。监督器 2 秒没有进度即判卡死，
 * 有进度时单帧最长 5 秒；页内节流为每 200 ms 最多一条，在 Node 或非渲染页里是空操作。 */
export declare function pulse(): void;

/** useP5 传给 sketch 的 p5 实例（只列适配层用到的成员；其余照 p5 文档用）。 */
export type P5Instance = {setup?: () => unknown; draw?: () => unknown; frameCount: number; deltaTime: number; millis: () => number; [key: string]: any};
/** p5 构造函数（`import p5 from 'p5'`，幕代码目录自带库；宿主内置后同名导入）。 */
export type P5Constructor = new (sketch: (p: any) => void, node?: HTMLElement) => any;
export type UseP5Options = {
  /** 默认 true：画布不清空、逐帧累积（第 f 帧 = setup 后画 f+1 次，同页往后续画、倒退则重建回放）；false：每帧只画一次，作者自己清屏。 */
  accumulate?: boolean;
};
/**
 * p5 确定性适配（纯 ref 工厂，不是 React hook）：`<div ref={useP5(p5, props, p => {p.setup = ...; p.draw = ...})} style={{position: 'absolute', inset: 0}}/>`。
 * 停掉 p5 自己的动画循环，由宿主帧驱动 redraw；frameCount / millis() / deltaTime 绑定宿主帧，randomSeed / noiseSeed 用 props.seed；
 * 关闭 p5 友好错误系统（它在隔离页会抓取脚本源码并被 CSP 拒绝）。每画完一步向监督器报一次“帧完成”，单步 ≤ 5 秒。
 */
export declare function useP5(P5: P5Constructor, props: SceneInput, sketch: (p: P5Instance, props: SceneInput) => void, options?: UseP5Options): (node: HTMLElement | null) => void;

export type RevealOptions = {offset?: number; seconds?: number; ease?: (t: number) => number};
/** useScene(props) 返回的便捷对象；是纯函数，不是 React hook，可以在任意位置调用。 */
export type SceneHelpers = Readonly<{
  /** 幕内秒数（frame / fps）。 */
  t: number;
  /** 整幕秒数。 */
  seconds: number;
  box: Box & {width: number; height: number; centerX: number; centerY: number};
  portrait: boolean;
  /** 第 i 句（越界取最后一句；没有句子时为 undefined）。 */
  sentence: (index: number) => Sentence | undefined;
  /** 第 i 句开始后按 ease 揭示 0→1；offset/seconds 单位秒。 */
  reveal: (index: number, options?: RevealOptions) => number;
  /** 旁白念到 phrase（去空白后匹配，第 occurrence 次出现，默认 0）的幕内秒数；有 words 用实测，否则句内按字数插值；找不到为 undefined。 */
  cue: (phrase: string, occurrence?: number) => number | undefined;
  /** 念到 phrase 时按 ease 揭示 0→1；找不到 phrase 恒为 0。 */
  revealCue: (phrase: string, options?: RevealOptions & {occurrence?: number}) => number;
  /** 秒 → 幕内帧号（取整）。 */
  at: (seconds: number) => number;
  /** 幕末 frames 帧（默认 10）线性淡出系数 1→0。 */
  fadeOut: (frames?: number) => number;
  /** 本幕种子的伪随机数发生器；salt 用于区分不同用途。 */
  random: (salt?: number | string) => () => number;
}>;
export declare function useScene(props: SceneInput): SceneHelpers;
/** 归一化 props.assets：旧字符串值也变成 SceneAsset；缺槽不出现。 */
export declare function assets(props: SceneInput): Readonly<Record<string, SceneAsset>>;

// ---- 宿主原语：粒子引擎闭源，由渲染页宿主注入；幕代码 import 这些名字即可，看不到实现。
// 三者都画在铺满整幕的画布上（放在幕根元素下），x/y 为幕坐标；只按 frame、seed 与其余 props 生成，同帧同参必得同图。

/** 原语的返回值在渲染层是 JSX 元素（本包不依赖 React 类型）。 */
export type PrimitiveElement = any;
/** 粒子字形表；audio 是 note 的别名。 */
export type ParticleGlyphName = 'wallet' | 'key' | 'network' | 'coins' | 'lock' | 'compare' | 'shield' | 'globe' | 'book' | 'rocket'
  | 'film' | 'record' | 'note' | 'audio' | 'play' | 'question' | 'code';
export declare const particleGlyphs: ReadonlyArray<ParticleGlyphName>;

type PrimitiveBase = {
  /** 幕内帧（传 props.frame）。 */
  frame: number;
  /** 中心点，幕坐标像素。 */
  x: number; y: number;
  /** 默认 0；换 seed 只改漂移相位，不改字形。传 props.seed 让每幕不同。 */
  seed?: number;
  opacity?: number;
  /** 主色 / 副色；默认深色调 #C9F65A / #57D9E8，浅色调 #78A31B / #157B89。 */
  accent?: string; secondary?: string;
};
export type OrbitHaloOptions = {
  /** 轨道环数，默认 3。 */
  rings?: number;
  /** 轨道光点数，默认 4（network 字形 9）。 */
  dots?: number;
};
export type ParticleGlyphProps = PrimitiveBase & {
  name: ParticleGlyphName;
  /** 尺寸单位（像素）：主体约 1.3×size 宽；横屏 0.64×短边、竖屏 0.5×宽与旧片相同。 */
  size: number;
  /** 聚拢起点：另一个字形或 'scatter'（散点），默认与 name 相同。 */
  from?: ParticleGlyphName | 'scatter';
  /** from → name 的形变进度 0～1，默认 1；逐粒子错峰。 */
  progress?: number;
  /** 接力时固定形变相机相位；形状仍按 progress 变形，避免端点重置 yaw。 */
  stableYaw?: boolean;
  /** light 用于浅底（前景粒子变深色）。 */
  tone?: 'dark' | 'light';
  /** 粒子数 60～6000，默认 1800。 */
  count?: number;
  /** 细线轮廓（wallet/key 本就没有），默认 true。 */
  contour?: boolean;
  /** 同一画布里加轨道光环（环在粒子下、光点在上），true 或选项。 */
  halo?: boolean | OrbitHaloOptions;
};
export declare function ParticleGlyph(props: ParticleGlyphProps): PrimitiveElement;
export type OrbitHaloProps = PrimitiveBase & OrbitHaloOptions & {
  /** 与 ParticleGlyph 的 size 同义：最外环半长轴约 1.08×size。 */
  size: number;
};
export declare function OrbitHalo(props: OrbitHaloProps): PrimitiveElement;
export type ParticleTextProps = PrimitiveBase & {
  /** ≤ 200 字；用宿主随包字体（Noto Sans SC / Latin）栅格化，中文可用。 */
  text: string;
  fontSize: number;
  /** 字重，默认 800。 */
  weight?: number;
  /** 粒子色，默认 #F5F4EC；highlight 为每 7 个点一个的点缀色。 */
  color?: string; highlight?: string;
  /** 聚拢 0～1（默认 1）；dissolve 散开 0～1（默认 0）。 */
  progress?: number; dissolve?: number;
  /** 聚拢前的散布范围（像素），默认 4×fontSize。 */
  spread?: number;
  /** 每字号的格数，默认 34（格距 = fontSize / density）。 */
  density?: number;
};
export declare function ParticleText(props: ParticleTextProps): PrimitiveElement;

/** 素材槽画面：image/svg 用图片，video 静音逐帧同步 frame（短于本幕时循环）；audio 不画（音轨由管线混入）。 */
export type MediaProps = {
  asset: SceneAsset | string | undefined | null;
  /** 幕内帧（传 props.frame）。 */
  frame: number;
  fit?: 'contain' | 'cover';
  style?: Record<string, unknown>;
  /** 素材缺失时画的内容（默认不画）。 */
  fallback?: PrimitiveElement;
};
export declare function Media(props: MediaProps): PrimitiveElement;
/** 随包实心图标（131 个，Bootstrap Icons MIT）；名称用 npm run icons:search 或 MCP search_icons 查（-fill 后缀可省），未知名称抛 ICON_NOT_FOUND。 */
export type IconProps = {name: string; size: number; color?: string; style?: Record<string, unknown>};
export declare function Icon(props: IconProps): PrimitiveElement;
