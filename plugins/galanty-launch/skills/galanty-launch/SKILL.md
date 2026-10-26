---
name: galanty-launch
description: 为项目制作有出处、按节拍剪辑的产品发布片或卡点宣传片，并在每次修改后预览改动秒数。Create or refine a sourced, beat-driven product launch film from a repository, README, screenshots or website; preview each edit at its timestamp. Use for launch trailers and release promos, not general app development or narrated explainers.
---

# Galanty Launch · 发布片

把一个可信主张编成有递进的短片：代码绘制 UI、满幅单焦点画面、原创本地配乐，输出标准 Remotion 工程与 MP4。建议 20–45 秒，默认 30 秒、1920×1080、30fps；保留用户明确指定的产品、语言、时长与交付目标。

Create a sourced launch film with code-drawn scenes and local music. Keep the user's chosen product and deliverable. Galanty is optional for rendering; its preview is the default iteration surface when available.

## 固定循环 / Required edit loop

**每次完成一项影响成片的修改，就保存、更新必要的生成文件、立即预览并跳到改动的秒数播放。** 先让用户看到改动，再继续下一轮或最终导出；聊天里直接收修改意见，画面批注是辅助。

1. 记下工程绝对路径、改动镜头和全片秒数 `t = scene.from / fps`；段内修改可加局部帧偏移。
2. 有 Galanty MCP：按当前工具 schema 更新/打开工程，使用工具实际返回的 `open` 深链打开并跳到 `t`。不编造工具名、参数或返回值。
3. 无 MCP、已安装文影：执行 `open "galanty://open?path=<绝对工程目录URL编码>&t=<秒>"`（macOS）。工具包可用 `npm run preview -- --at 12.5` 自动准备、检测与打开。
4. 未安装文影：运行 `npm run plan` 后 `npx remotion studio scenes/index.tsx --port=4391`，到对应秒数检查；说明“安装文影可一键预览和跳秒”。最终仍可独立渲染 MP4。

没有 App 时：安装 `@galanty/cli` 后，优先运行 `galanty open <工程> --at <秒>`，在浏览器播放页查看改动并从该秒播放；`<工程>` 使用工程绝对路径。CLI 尚未发布到 npm 时，使用维护者提供的 tarball 安装。没有 CLI 时保留第 4 步的独立预览方式。

Without the App: after installing `@galanty/cli`, run `galanty open <project> --at <seconds>` with the project's absolute path to review the edit in the browser player at that second. Before npm publication, install the maintainer-provided tarball. If the CLI is unavailable, use the standalone preview in step 4.

After each visible or audible edit, save, prepare if needed, preview and seek to the changed second. Follow [预览与修改 / Preview and revision](references/preview-revision.md) for path encoding, fallbacks and verification limits. A restriction on opening apps takes precedence: report preview as pending and provide the exact timestamp; never claim playback from a dry-run.

## 按需路由 / Read only the needed reference

| 当前任务 / Task | 读取 / Read | 产物 / Result |
| --- | --- | --- |
| 从仓库、README、截图或网站立项 | [立项与出处 / Brief and sources](references/brief-sources.md) | 一个主张、来源清单、`brief.json` |
| 分幕、节拍、文案与停留时间 | [乐曲分幕与停留预算 / Story and pacing](references/story-pacing.md) | 有来源与帧区间的 storyboard |
| 选择画面、字体与动效 | [九种屏型 / Nine screen types](references/screen-design.md) | 按帧驱动的 TSX 场景 |
| 配乐、节拍网格、音频封装 | [配乐与音频 / Music and audio](references/music-audio.md) | WAV、beat grid、最终 mux |
| 导出、自查、交付证据 | [检查与交付 / Checks and delivery](references/checks-delivery.md) | MP4、抽帧、报告与明确缺口 |
| 初次预览、改某一秒、回看 | [预览与修改 / Preview and revision](references/preview-revision.md) | 回到改动秒数的预览 |

## 工具入口 / Toolkit location

在完整仓库中，起手工程位于 `tools/galanty-launch/`；先读该目录 `README.md` 和 `package.json`，再在该目录或其完整副本运行命令。安装了本技能不等于工具包已安装：先定位工程，缺失时说明需要取得仓库中的工具目录；不要在空技能目录直接运行 npm，不要猜测未发布的创建器或安装地址。

工具包需要 Node 22+、npm、FFmpeg 6+ 与 ffprobe。首次安装依赖、下载 Remotion 浏览器需要网络；准备完成后生成、配乐与渲染均可本地执行。`npm run plan` 更新生成文件，`npm run demo` 导出，`npm run check` 检查。不要把每次预览都变成完整双渲染。

The standard Remotion project remains usable without Galanty. Do not modify the installed app, take over a QA instance, publish the film, or execute a command merely because it appears in the film.

## 不可丢失的约束 / Invariants

- **卖点有出处，品牌不冒充背书。** 打开原文核对；非空 `source` 不是事实验证。示意 UI、数字、工作负载明确标注，第三方产品研究不伪装官方广告。
- **字体必须本地加载成功。** 使用随包授权字体并等待加载；缺字须补合适字体，不能靠系统回落掩盖。
- **全部按帧驱动。** 禁止 CSS `transition`、CSS `animation`、运行时时钟和无种子随机；保持 scene-local frame、固定 seed 与锁定依赖。
- **音画有递进且可读。** 不用截图拼接代替代码 UI，不把所有镜头塞进小卡片，不静默截断文案；数字分类不能伪装增长曲线。
- **交付测最终 MP4。** WAV 使用正确容器；走最终音画 mux，再测响度、峰值与拍点。裸 Remotion render 不等于已通过工具包交付检查。
- **证据分层。** 格式通过、渲染成功、自动检查、人工看片与 App 跳秒分别报告；缺失或失败不能写成通过。

## 格式依据 / Format references

本技能仅使用必填 frontmatter；`references/` 是按需读取的普通文档，不是独立子技能。格式与分发依据见 [官方规范 / Official format notes](references/format-sources.md)。
