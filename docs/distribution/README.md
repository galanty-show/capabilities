# Galanty Launch 分发 / Distribution

核对日期：2026-10-21。技能、插件安装、独立工程创建和影片验收是不同的证据。以下验证没有启动 App、QA 实例或 Agent 推理，也没有登录、推送或发布 npm 包。

## CLI MCP 验证

当前插件配置已增加 CLI MCP。隔离 HOME 中，从 tarball 以 `file:` 安装，再在安装目录运行 `claude plugin marketplace add <checkout>`、`claude plugin install galanty-launch`、`claude mcp list`：全部退出 0，最后显示 `plugin:galanty-launch:galanty … Connected`；`plugin details` 显示 1 skill、1 MCP。

SDK `Client` 经 `StdioClientTransport` 运行 `npx -y file:<tarball> mcp`，成功列出 **15 个工具、31 个资源、1 个 prompt**。当前 npm 将裸 tarball 绝对路径当作可执行文件，因此使用 `file:` 包规格。宿主检查和 tarball 检查各用独立数据/工作目录；两次启动的后台服务已仅按其记录 PID 关闭。未调用制作工具、打开 App 或可见窗口。

Codex 隔离环境的 `codex login status` 返回 `Not logged in`（退出 1），仅验证 portable manifest、MCP 与 marketplace 结构，不声称安装、宿主加载或模型调用通过。公开目录的本地 MCP 提交需要组织白名单，见下方官方依据及根目录“已知限制”。

本次记录见 [CLI MCP verification](cli-mcp-verification-2026-10-21.json)，包含脱敏命令、tarball 摘要和工具名。官方 Agent Plugins schema 校验通过；技能同步检查通过，分发测试共 5 项通过。此前技能分发的历史记录保留在后文，其安装成功不覆盖本次 Codex MCP 缺口。

English: in an isolated HOME, the Claude plugin installed and its MCP server reported Connected. An SDK stdio connection to the local tarball listed 15 tools, 31 resources and 1 prompt. Codex was not logged in; only manifest/catalog structure was checked. Both owned preview services were stopped by recorded PID. No App or visible window was opened. The older skill-distribution results below are historical.

## 安装入口

在仓库根目录，三个本地入口分别为：

```sh
# skills.sh：--copy 让安装结果独立于源码目录
npx skills add . --list
npx skills add . --skill galanty-launch --agent claude-code --global --yes --copy

# Claude Code
claude plugin validate .
claude plugin validate ./plugins/galanty-launch
claude plugin marketplace add .
claude plugin install galanty-launch@galanty-capabilities
claude plugin list
claude plugin details galanty-launch

# Codex CLI（需要支持 plugin add 的版本）
codex plugin marketplace add .
codex plugin add galanty-launch@galanty-capabilities
codex plugin list --json
```

远端来源用 `galanty-show/capabilities` 替换上述 `.`。**本次远端 skills 列表返回 6 个技能，未包含 `galanty-launch`；不能把本地安装成功写成远端已可安装。** 未推送此分支，未执行 npm 发布。插件通过 CLI 启动本地 stdio MCP，无需 App；无 hooks 或 Agent 子代理。开始真实制作仍需要自己的 Agent 登录。发布前 CLI 安装方式见根目录中英 README。

Codex 也支持 `$skill-installer` 从本仓库 `skills/galanty-launch` 安装单独技能。官方本地发现位置包括 `$HOME/.agents/skills` 与仓库 `.agents/skills`；创建器将 canonical skill 放在生成工程的 `.agents/skills/galanty-launch`。历史技能版本通过插件安装与清单检查验证 Codex 安装；当前 MCP 版本仅做结构校验，不把历史安装证据或文件存在当作 MCP 宿主加载成功。

## 可复验的隔离安装

```sh
node docs/distribution/sync-skills.mjs --check
node --test docs/distribution/*.test.mjs
npm test --prefix tools/galanty-launch/create
mkdir -p .lane-data/distribution/packages
npm pack ./tools/galanty-launch/create --pack-destination .lane-data/distribution/packages --json
node docs/distribution/verify-installations.mjs
```

测试器对每种方式使用独立 HOME、CODEX_HOME、CLAUDE_CONFIG_DIR、XDG 配置/缓存与 npm 缓存；仅传递执行所需的 PATH，不继承用户密钥、现有 Agent 配置或 Git 凭据。临时目录、逐命令 PID、日志、报告和工程都在 `.lane-data/distribution/<时间>/`。`latest.json` 指向最近一次完整报告。`--creator-only` 只复验变动后的创建器，保留此前未变的安装证据。

此前技能分发版本的历史验证（不包含本次新增 MCP；Claude Code 2.1.283、Codex CLI 0.160.1、Node 25.6.1、npm 11.9.0）：

| 范围 | 实测结果 | 证据 |
| --- | --- | --- |
| skills.sh 远端发现 | 6 个技能；`galanty-launch` 缺失，发布门阻塞 | `.lane-data/distribution/2026-10-21T04-28-11-554Z/skills-remote-list.log` |
| skills.sh 本地 | 发现 3 个技能，指定安装 1 个；安装副本与 canonical 相同 | 同目录 `skills-local-list.log`、`skills-local-install.log`、`skill-copy-check.log` |
| Claude marketplace | validate、add、install、list、details 全成功；1 skill、0 hooks、0 MCP | 同目录 `claude-*.log` |
| Codex marketplace | add、install、list 全成功；已安装并 enabled，版本 0.1.0 | 同目录 `codex-*.log` |
| 创建工程 | 本地 tarball 经 npx 创建；npm ci、plan、typecheck、preview dry-run 成功；重复目标拒绝（退出 1） | 同目录 `creator-*.log`、`starter-*.log`、`report.json`；最终包复验见 `latest.json` |

三份安装后的技能正文均与 canonical 逐字一致。真实模型调用、真实 App 打开/跳秒/播放、完整成片渲染和登录流程不在本安装测试范围。预览 dry-run 只验证命令计划；不代表播放通过。

最终包：101 个文件，压缩 2,330,599 字节，解包 2,749,437 字节；SHA-1 `21b2a828e3b8bd10ff2c208292eeae0f186ad35a`。包内含最终中英 Galanty 示例、品牌素材/署名、技能 CC BY 4.0 与字体 OFL；清单验证未混入生成媒体、缓存、日志或环境文件。三入口安装报告为 `.lane-data/distribution/2026-10-21T04-28-11-554Z/report.json`；最终影片源码冻结后，基于新 tarball 独立复验创建器，报告为 `.lane-data/distribution/2026-10-21T04-50-04-088Z/report.json`。9 项定向测试沿用此前通过证据；本轮 8 条创建器验证命令全部符合预期，最终生成工程类型检查与独立 Agent 技能路径解析通过。可公开留存的数字、SHA-256、命令及缺口见 [verification-2026-10-21.json](verification-2026-10-21.json)；此报告已移除私人绝对路径。

## 独立创建器

源码在 `tools/galanty-launch/create/`，包名 `create-galanty-launch`。`prepack` 从当前工具包重新准备模板，包含锁文件、源代码、测试、示例、本地字体及其 OFL、品牌署名和 canonical skill。固定根文件清单及递归排除规则阻止带入 `node_modules/`、`build/`、`public/generated/`、`.lane-data/`、`.env*`、日志和创建器自身。符号链接在模板准备阶段拒绝。安装后只读包内模板，不访问发布机器路径，不运行 Git、网络或 App。

```sh
npx --yes --package ./.lane-data/distribution/packages/create-galanty-launch-0.1.0.tgz create-galanty-launch my-launch
cd my-launch
npm ci
npm run preview -- --at 12.5
```

创建器只接受单个目录名，并用原子 `mkdir` 拒绝已有目录、文件和符号链接。它不自动安装依赖、不覆盖目标、不启动 App；下一步由使用者运行。Node 22+、FFmpeg 6+ 与 ffprobe 是外部前提。未来 `npx create-galanty-launch my-launch` 需要额外的 npm 发布；当前只保证本地 tarball 路径。

## 技能副本与审查

canonical source：`skills/galanty-launch/`。插件在 `plugins/galanty-launch/skills/galanty-launch/` 保存完整副本，不使用越出插件根的链接。修改 canonical 后运行 `node docs/distribution/sync-skills.mjs`，提交两处；`--check` 和定向测试拒绝副本漂移。插件根 `plugin.json` 为 OpenAI portable manifest，`.claude-plugin/plugin.json` 为 Claude manifest；两个 marketplace 分别使用各自官方格式。Codex portable 插件自动发现插件根目录 `mcp.json`（stdio 配置必须声明 `type`）；不在 marketplace 条目中添加服务器字段。Claude manifest 使用内联 `mcpServers`；两处都运行 `npx -y @galanty/cli mcp`。

插件 manifest 使用 `MIT AND CC-BY-4.0`：分发代码/manifest 为 MIT，技能内容保留 CC BY 4.0；两份许可证与出处说明随插件附带，不授予商标权。创建器另外保留字体 OFL，并把技能许可复制为生成工程根目录 `LICENSE-SKILL-CC-BY-4.0`。

安装前按 skill-vetter 审查了 `SKILL.md` 与全部 7 份 references。结论：**SAFE（在本任务授权的本地制作范围内）**。名称与目录相符，描述限定发布片制作；标准仅要求 name/description，因此无 version/author frontmatter 为信息项，发布者可由仓库与插件 manifest 识别。需要读用户提供的来源和工程、写本地制作工程、运行明确的 npm/FFmpeg/预览命令；初始 npm 依赖/浏览器下载需网络，事实来源访问需网络。未发现凭据读取、环境文件读取、外传、混淆、提权、系统配置修改或绕过安全设置的指令。网络链接为公开格式/产品文档；预览命令用于本地工程。技能不自动授权影片发布、修改已安装 App 或接管 QA 实例。

## 官方依据

- [skills.sh CLI](https://skills.sh/docs/cli)：仓库来源与 `npx skills add`；本地实测使用 `--skill`、`--agent`、`--global`、`--yes`、`--copy`。
- [Claude manifest reference](https://code.claude.com/docs/en/plugins-reference)：`mcpServers` 支持内联服务器命令。
- [OpenAI desktop-only plugins](https://developers.openai.com/plugins/deploy/desktop-only)：stdio MCP 格式与公开提交的组织白名单限制。本地分发不等同于公开提交。
- [Claude plugins overview](https://code.claude.com/docs/en/plugins)、[marketplace 创建与安装](https://code.claude.com/docs/en/plugin-marketplaces)：`.claude-plugin/marketplace.json`、插件 `.claude-plugin/plugin.json`、相对 source 与 CLI 验证/安装。
- [OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills)（[旧 Codex skills 入口](https://developers.openai.com/codex/skills) 当前重定向）：技能结构、`.agents/skills`、本地安装与插件分发边界。
- [OpenAI Package your plugin](https://developers.openai.com/plugins/build/plugins)：根 `plugin.json`、`.agents/plugins/marketplace.json`、相对插件路径、marketplace CLI；安装命令以本次 CLI 0.160.1 的 `plugin add --help` 和实测为证。
- [Remotion 4.0.523 License](https://github.com/remotion-dev/remotion/blob/v4.0.523/LICENSE.md)、[许可入口](https://www.remotion.dev/docs/license)：当前锁定版本允许个人、最多 3 名员工的营利组织和非营利组织依免费条款使用；不符合条件的组织需 Company License。工具 MIT 与字体 OFL 不替代 Remotion 许可。

English: the earlier skills-only version passed all three local installation methods in isolated homes. The remote repository currently lacks `galanty-launch`; npm publication, Agent invocation and observed App playback remain unverified. Local package creation, dependency installation, planning, typechecking and preview dry-run passed. See the versioned command logs and final package report above; do not infer remote publication or film approval from them.
