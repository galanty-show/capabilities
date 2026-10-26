<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img src="assets/banner-light.svg" alt="Galanty 文影 — Change one thing. Back to that second. 让视频制作更简单。" width="1280" height="320">
</picture>

# Galanty 文影 · 开放创作资料与工具

**简体中文** · [English](README.en.md)

**让视频制作更简单。用你自己的 Agent，打开、标注、修改。**

[官网](https://galanty.cn/) · [样片库](https://galanty.cn/samples/) · Mac App Store 即将上架 · [Agent 手册](https://galanty.cn/agents/)

## Galanty Launch · 30 秒产品发布片

把仓库或 README 编成有出处、按节拍推进的产品发布片，每次修改后立即回到改动秒数预览。

> **30 秒 GIF 占位 / Demo pending**：将补上“输入项目 → 代码绘制画面 → 12.5 秒修改回看”的实际录屏；当前不是已发布的演示 GIF。

三种装法，选择一种即可。插件包含制作技能与 CLI MCP 配置；单独安装技能不包含 MCP。可独立渲染的工具包需要另外取得。需要 Node.js 20+（工具包需要 22+）。**以下远端命令是发布入口；本分支尚未推送时请用后面的本地方式验证，不代表远端已有此版本。**

**skills.sh（兼容多种 Agent）**

```sh
npx skills add galanty-show/capabilities --list
npx skills add galanty-show/capabilities --skill galanty-launch
```

**Claude Code 插件**

```sh
npm install -g @galanty/cli
claude plugin marketplace add galanty-show/capabilities
claude plugin install galanty-launch@galanty-capabilities
```

会话内使用 `/galanty-launch:galanty-launch`。在仓库根目录，将 marketplace 命令的来源换为 `.` 即可安装本地 marketplace。

**Codex 插件**

```sh
npm install -g @galanty/cli
codex plugin marketplace add galanty-show/capabilities
codex plugin add galanty-launch@galanty-capabilities
```

需要支持 `plugin add` 的当前 Codex CLI；本地 marketplace 将 marketplace 命令的来源换成 `.`。也可让 `$skill-installer` 从本仓库的 `skills/galanty-launch` 安装单独技能。插件用 `npx -y @galanty/cli mcp` 启动本地 stdio MCP，提供 15 个工具，无需 App；首次安装后开始新会话。实际 Agent 使用仍需自己的服务登录。[官方技能文档](https://learn.chatgpt.com/docs/build-skills) · [官方插件文档](https://developers.openai.com/plugins/build/plugins)。

### 发布前：从 tarball 安装 CLI

`@galanty/cli` 尚未发布到 npm，上面每组的第一行是发布后的命令，现在请先取得维护者提供的 `galanty-cli-0.1.0.tgz`。在独立目录安装，并从该目录运行 Claude Code / Codex，使插件的 `npx` 能找到本地包：

```sh
mkdir cli-preview && cd cli-preview
npm install "file:../galanty-cli-0.1.0.tgz"
npx -y @galanty/cli --help
```

临时本地安装后，预览命令写成 `npx -y @galanty/cli open <工程> --at <秒>`；发布后全局安装才可直接使用 `galanty`。然后执行对应的 marketplace 与插件安装命令；本地 checkout 用其目录替换 marketplace 来源。不要在 npm 发布前依赖 registry 下载。tarball 不随本仓库分发。

<!-- TODO: @galanty/cli 发布到 npm 后，删除“发布前：从 tarball 安装 CLI”整节。 -->

### 两种预览通路

- **有 App：** 每次修改后在文影打开工程、自动前台并跳到改动秒。CLI 可用 `galanty open <工程> --at <秒> --app`；现有工具包也可用 `npm run preview -- --at 12.5`。
- **无 App：** 用 `galanty open <工程> --at <秒>` 打开 CLI 浏览器播放页，从改动秒检查。工程参数使用工程绝对路径；仅需输出链接时加 `--no-browser`。

### 已知限制

- Codex 的公开插件目录对本地 stdio MCP 提交要求组织白名单，且属于 Desktop only；本地 marketplace 结构校验不代表获得公开目录资格。[官方提交限制](https://developers.openai.com/plugins/deploy/desktop-only)。本仓库不绕过白名单。
- 本次 Codex 侧仅验证清单结构，未登录、未验证模型调用。CLI tarball 的独立 MCP 连接与宿主加载分别验收。
- 以上 npm、远端插件安装命令需要对应包与分支正式发布；本地验证不代表远端已可安装。

**先创建工程，再一条命令预览跳秒。** 创建器尚未发布到 npm，先在本仓库根目录打包：

```sh
mkdir -p .lane-data/packages
npm pack ./tools/galanty-launch/create --pack-destination .lane-data/packages
npx --yes --package ./.lane-data/packages/create-galanty-launch-0.1.0.tgz create-galanty-launch my-launch
cd my-launch
npm ci
npm run preview -- --at 12.5
```

需要 Node 22+、FFmpeg 6+ 和 ffprobe。创建器包含完整模板、锁文件、字体与技能，不覆盖已有目标，也不自动安装 App。预览优先在已安装的文影中打开工程并跳秒，否则打开 Remotion Studio，手动到目标秒数；不要求安装文影才能渲染。最终导出与检查见 [工具包说明](tools/galanty-launch/README.md)。计划中的 `npx create-galanty-launch my-launch` 需要另行 npm 发布，当前请使用上面的本地 tarball。

工具代码为 MIT；[Remotion 使用独立许可](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)：个人、员工不超过 3 人的营利组织和非营利组织可按免费条款使用；其他组织需核对 Company License。字体保留 OFL。许可核对日期：2026-10-21。[分发验证与限制](docs/distribution/README.md)。

## 文影的修改回路

| 01 · 打开播放 | 02 · 标注 | 03 · 交给 Agent | 04 · 回到原秒 | 05 · 导出 |
| --- | --- | --- | --- | --- |
| 原地打开视频或工程。 | 在那一刻写下想改什么。 | 交给你自己的 Agent。 | 从同一秒检查改动。 | 满意后导出。 |

文影支持 Remotion 工程、HyperFrames／HTML 动画工程、文影工程与 MP4／MOV／WebM 视频文件。文影格式只是推荐，播放和标注不以它为前提。HTML／HyperFrames 的文影内导出计划支持，目前请用工程自己的工具渲染；只有视频文件时，Agent 需要原工程或其他编辑工具完成修改。

本仓库提供**开放创作资料与独立工具**。应用引擎单独分发；安装包请从[官网](https://galanty.cn/)下载。

## 这个公开仓库里有什么

| 路径 | 内容 |
| --- | --- |
| [samples/](samples/) | 52 支样片的文本源码、提示词、制作记录与完整 Release ZIP 下载入口。 |
| [docs/experience/](docs/experience/) | 制作经验、常见坑与可复用技巧。 |
| [capabilities/](capabilities/) | 画面能力资料与示例。 |
| [templates/](templates/) | 题材模板与风格资料。 |
| [contracts/](contracts/) | 分镜、画面能力与转场的格式参考。 |
| [skills/](skills/) | Agent 工作流参考。 |
| [community/](community/) | 社区索引。 |
| [tools/galanty-launch/](tools/galanty-launch/) | 产品发布片起手工程：虚构示例、原创配乐、双渲检查与 15 个内部评测简介；[技能入口](skills/galanty-launch/SKILL.md)。 |
| [tools/beat-sync-promo/](tools/beat-sync-promo/) | 独立卡点宣传片工具：单个 HTML 页面、实测节拍网格、逐帧渲染与子帧运动模糊。 |

独立的 **`beat-sync-promo`** 工具无需文影引擎，使用 Node、Python／numpy、ffmpeg 和 Chromium 浏览器；用法见其 [README](tools/beat-sync-promo/README.md)。

这里保留的分镜与幕代码约定是参考资料，不是外部工程接入文影的格式门槛。

## 创作、播放与打磨

- **用模板起步，也能从零创作。** 复制模板、换上自己的内容，或让 Agent 直接写 React／TSX 幕代码，改布局、动效和配色。
- **也可以从文字起步。** 写一句想法，或导入 PDF、Word、Markdown 文档，由自己选择的 Agent 编成分镜；已有分镜也可以直接开始。
- **让旁白成为选择。** 配音、配乐和字幕按作品需要搭配，也可以用画面和音乐讲故事。先播放，再改配色、配音和节奏。
- **让 Agent 驾驭制作。** Claude Code、Codex 或其他兼容的 MCP 客户端可查模板、写分镜、改画面、返回播放链接。无需 App 的 stdio 客户端可用 `npx -y @galanty/cli mcp`，需要 Node.js 20 或更新版本；发布前先按上文安装 tarball。[查看手册 →](https://galanty.cn/agents/)
- **在本机完成默认配音和渲染。** 作品保存在你的电脑；交给外部 Agent 的内容、可选云端配音的文本会进入你自己选择的服务。

[样片库](https://galanty.cn/samples/)有 **50 支样片、8 类题材**：儿童故事、经典故事、诗词文化、产品宣传、科普讲解、数据报告、生活通知和文影介绍。中英文页面按已有语言版本展示，提供提示词与源码下载入口。

**Apple 芯片 Mac，macOS 13 或更新版本。** Mac App Store 版即将上架；官网版安装包请从[官网](https://galanty.cn/)下载。

## 规划中的开放格式

`video-review` 用于带时间的视频批注，`video-recipe` 用于可复现的制作记录；公开规范尚在计划中，不是已发布标准。格式将作为可选约定，外部工程无需遵守文影分镜或幕代码格式，也能打开、播放、标注。

## 贡献与许可

欢迎通过 [Issues](https://github.com/galanty-show/capabilities/issues) 和 [Pull requests](https://github.com/galanty-show/capabilities/pulls) 提出问题、建议或改进。贡献约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

- 契约、工具与 CI：[MIT](LICENSE-MIT)。
- 能力包、模板、示例与媒体：[CC BY 4.0](LICENSE-CC-BY-4.0)；具体文件以所在目录的许可声明为准。
- 仅提交你有权公开分享的内容。
- 上述公开资料许可不适用于私有应用引擎。

样片 Git 目录只存文本；内联媒体以 Release 引用表示，完整播放请下载各片 README 的 ZIP。新样片使用运行中 App 的 `galanty://schema/storyboard` 契约；本仓 `contracts/` 保留的旧 v2 资料不用于校验这些 v3-lite 样片。样片代码以各目录的 LICENSE（含上游许可）为准。
