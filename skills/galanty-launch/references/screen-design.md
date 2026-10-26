# 九种屏型 / Nine screen types

以下是九类叙事画面，不代表恰好九个代码组件。按故事选择和组合；接口以工程 `scenes/launch.tsx`、`scenes/primitives.tsx` 与类型声明为准。

These are editorial screen types, not an API count. Choose the few that prove the story; do not make every film a component showcase.

| 屏型 / Screen | 可用原语 / Primitives | 设计要点 / Direction |
| --- | --- | --- |
| 1. 终端开场 / Terminal | `LaunchTerminal`, `Terminal` | 命令、逐字输出与光标；放大主动作，不展示无出处的输出 |
| 2. 冲击词 / Impact | `ImpactWord` | 一次 2–4 个中文字或 1–3 个英文词；UI 可作柔化背景 |
| 3. 数字证据 / Metric | `ToolCounter`, `GrowthChart` | 分类与增长分清；显示口径，有真实数据才用曲线 |
| 4. 时间线与步骤轴 / Timeline | `MilestoneTimeline` | 历史节点有日期与出处；工作流用明确 STEP 标签，示例标注，不伪装历史 |
| 5. 全屏代码 / Code | `FullCode`, `CodeEditor` | 少量可读代码或命令，高亮真正重点；副文案也核对产品 |
| 6. 产品界面 / Product UI | `BrowserWindow`, `PhoneFrame` | 代码绘制代表性网页或手机状态；界面不暗示未有能力 |
| 7. 文件与功能层次 / Cards | `CardStack`, `FeatureTrio` | 用叠放、并列讲清工作流；不要全片重复同一种卡片 |
| 8. 规模网格 / Scale | `ScaleGrid` | 多窗口加大字幕表达规模，示意负载明确标注 |
| 9. 品牌揭示与行动 / Reveal | `PixelLogo`, `LogoReveal` | 原创/有权资产在强拍完成揭示；尾声留下口号和准确入口 |

## 画面规则 / Composition

满幅、单焦点，以 1920×1080 为基准：主标题约 96px 起，冲击词约 160px 起，其他尺寸等比调整。让代码、终端或主视觉真正占据画面；推拉、透视与缩放服务焦点。留白可以有意保留，但不能用空白掩盖缺乏设计。

长文案先人工压缩，或换成可读句子镜头；不自动截断、不缩冲击词迁就段落。重建示意 UI 时说明其为演示，禁止用真实第三方商标营造合作、客户或官方背书。

## 字体与动画 / Fonts and motion

- 必须本地加载随包 OFL 字体，保留授权与 manifest。当前入口使用 `@remotion/fonts`，通过 `delayRender` 等待两套字体和 `document.fonts.ready`，失败 `cancelRender`。
- 检查中文、英文、数字与符号的字形覆盖；缺字时补有权字体并更新相应清单/检查。系统 fallback 和在线字体请求不能替代本地加载证据。
- 全部由 scene-local frame、fps、beat grid、Remotion `interpolate` / `spring` 驱动。光标、噪点、粒子、代码滚动与镜头也一样。
- **禁止 CSS `transition`、CSS `animation`、`Date.now()`、`performance.now()` 驱动画面以及无 seed 的随机。** 同一帧不得因播放或渲染顺序不同而改变。
- 新屏型需适配入口调用契约。默认镜头使用 `LaunchProps`，旧原语使用 `PrimitiveProps`；修改路由/加适配器后才能加入计划，不能只写一个组件名就假设可渲染。

Load local fonts before rendering and keep motion deterministic. 保存每项画面修改后，立即预览并跳回改动秒数，检查关键字、边缘裁切、转场和字体实际显示。
