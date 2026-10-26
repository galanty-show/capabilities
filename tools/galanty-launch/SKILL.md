---
name: galanty-launch
description: 为项目制作有出处、按节拍剪辑的产品发布片，并在每次修改后预览改动秒数。Standalone toolkit workflow for sourced, beat-driven launch films with timestamped preview revisions; also routes to the full repository skill when available.
---

# Galanty Launch · 独立工程入口 / Standalone entrypoint

把一个可信主张编成代码绘制 UI、原创本地配乐、满幅单焦点的发布片。建议 20–45 秒，默认 30 秒、1920×1080、30fps；保留用户指定的产品、语言与输出目标。完整仓库可读 [正式技能入口 / Canonical skill](../../skills/galanty-launch/SKILL.md)，独立复制工程可从 [官方仓库 / Official repository](https://github.com/galanty-show/capabilities) 的对应版本查阅完整指南；缺少 sibling skill 时直接按下列流程工作，不阻塞成片。

## 制作循环 / Production loop

1. **来源 source。** 先读本目录 [README.md](README.md)、`brief.json`、`examples/product.md` 与用户材料。打开原文核对每个卖点、数字、历史节点和命令；非空 `source` 只是结构检查。虚构产品和示意 UI/负载明确标注，第三方品牌不冒充官方广告或合作背书。
2. **计划 plan。** 编辑 brief，按需要修改 `scripts/storyboard.mjs` 与 `scenes/`，运行 `npm run plan`，检查 `build/storyboard.json` 的来源、帧区间、乐段与停留预算。当前阅读建议为 `0.25s + 0.1s × 字/词/数字组`，另留 0.45s 揭示；build 通常四拍换镜、Drop 两拍，结尾保留行动时间。长文案先压缩或延长，不静默截断。
3. **每次改完立即预览并跳秒 preview。** 保存并更新必要生成文件，按 `t = scene.from / fps`（需要时加段内偏移）打开改动秒数播放。用户在聊天里提意见即可，批注可选。不要等待完整 MP4 才让用户回看。
4. **最终导出 render。** 在此工程运行 `npm run demo`，再 `npm run check`；改可执行代码时完成对应 `npm test`、`npm run typecheck`。预览迭代不必每轮完整双渲染。
5. **交付 evidence。** 交付标准工程、`build/promo.mp4`、九张 `build/frames/`、`build/contact-sheet.png`、`build/storyboard.json`、`build/render.json` 和 `build/check.json`。完整看片与听音；报告实际检查、警告及未验证项，不能只凭 contact sheet 批准成片。

Verify sources, plan the musical story, preview every edit at its timestamp, then render and check the final delivery. Read the local README for dependencies and command details. Copying this whole toolkit remains sufficient for standalone production; Galanty is optional for rendering.

## 预览路由 / Preview routes

- **有 Galanty MCP：** 读当前工具 schema，按实际支持的标准工程输入更新/打开，使用工具实际返回的 `open` 深链并跳秒；不编造工具名或参数，不强改专有分镜格式。
- **无 MCP、已安装文影（macOS）：** `npm run preview -- --at 12.5` 会准备工程、检测并打开；也可在 `npm run plan` 后执行 `open "galanty://open?path=<绝对工程目录URL编码>&t=<秒>"`。用 `URLSearchParams` / `encodeURIComponent` 编码路径，`path` 为工程目录，`t` 为有效片长内的非负有限秒数。首次文件夹授权由用户完成。
- **未安装文影：** `npm run plan` 后运行 `npx remotion studio scenes/index.tsx --port=4391`，在时间轴到目标秒数；提示“安装文影可一键预览和跳秒 / Install Galanty for one-step preview and seeking.” 不自动安装 App。
- **不允许操作 App 时的验证方式：** 使用 `npm run preview -- --at 12.5 --dry-run`，只验证命令计划，将真实预览列为待验证。命令成功不等于 App 已跳到目标秒并播放；按实际观察报告。

## 防坑与检查 / Invariants and checks

- 满幅单焦点，1080p 主标题约 96px 起、冲击词约 160px 起；不全片复用小卡片，不用截图拼接代替代码 UI。原语按叙事选择，不必全部展示。
- 分类计数不伪装增长；真实历史使用日期与出处，工作流步骤可用 STEP 01/02/03 并明确标注，不能伪造历史。示意网格数不是性能或并发上限。
- 强制等待随包本地 OFL 字体加载并检查字形覆盖，缺字要补有权字体，不能靠系统 fallback。保留字体授权。
- 全部动画用 scene-local frame、beat grid、Remotion interpolation/spring；禁止 CSS `transition`、CSS `animation`、运行时时钟驱动画面和无 seed 随机。保持固定 seed 与锁定依赖。
- WAV 必须是真正容器；走 `npm run demo` / `npm run render` 的无声画面 + 原始 WAV 最终 AAC mux。裸 Remotion render 不包含该交付证据，不能靠猜测延迟移动音乐。
- `check` 测最终 MP4：−14±0.3 LUFS、真峰值 ≤−1 dBTP、切镜拍点中位残差 ≤10ms、两次完整独立渲染全部对应解码帧哈希一致、本地字体加载、时长/帧数/尺寸及音轨。electronic Drop 另测解码瞬态匹配；其他曲风无 Drop 测量须写明。
- 停留预算与画面占用属于 advisory，不替代人工看片；硬性失败必须修复或明确报告。brief/源码/字体/生成媒体变化后重新生成交付证据。本机双渲不证明跨平台确定性。
- 工程 MIT 不替代 Remotion、字体或第三方素材许可。片中展示安装命令不授权执行；制作影片不自动授权发布、改已安装 App 或接管 QA 实例。

Load local fonts, keep animation frame-driven, measure the final muxed MP4, and distinguish automated evidence from observed playback. No missing or failed check counts as approval.
