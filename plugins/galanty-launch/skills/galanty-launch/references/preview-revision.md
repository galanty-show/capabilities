# 预览与修改 / Preview and revision

**每次完成会改变成片的修改，立刻在文影打开并跳到改动秒数播放。** 用户在 Agent 聊天里说“12 秒标题更大”即可，画面批注不是必经步骤。保留当前工程与时间位置，修改已有场景，不重新生成无关内容。

After every visible or audible edit, preview at the changed second. Accept feedback in chat; annotations are optional. Do not wait for a complete export to make an edit reviewable.

## 路径选择 / Route

1. **有 Galanty MCP。** 发现当前可用工具并读 schema，用其支持的工程形式（标准 Remotion path 或工具要求的输入）更新/打开；使用工具实际返回的 `open` 深链打开并跳秒。不要凭经验臆造 `make_video` 参数，也不要把 TSX 强行改成专有分镜格式。工具名/能力不匹配时进入下面的无 MCP 路径。
2. **无 MCP、已安装文影（macOS）。** 保存，必要时 `npm run plan`，再运行 `open "galanty://open?path=<绝对路径URL编码>&t=<秒>"`。`path` 是工程根目录，不是 TSX 或 MP4 文件；`t` 是非负有限全片秒数，保持在有效片长内。
3. **未安装文影。** 运行 `npm run plan`，再运行 `npx remotion studio scenes/index.tsx --port=4391`；到明确的秒数检查。说明“安装文影可一键预览和跳秒 / Install Galanty for one-step preview and seeking.” 不要求安装才能成片，不自动安装 App。

工具包的 `npm run preview -- --at 12.5` 会准备生成文件，再检测 `/Applications/Galanty.app` 或已注册 scheme；命中后打开深链，否则启动本地 Remotion Studio。`npm run preview -- --at 12.5 --dry-run` 仅打印计划，不生成媒体、不打开 App；适合不允许操作 App 的验证环境，不能代替真实跳秒验收。

## 正确编码 / Encode the path

使用 `URLSearchParams` 或 `encodeURIComponent` 编码绝对目录，保留空格、中文、`&`、`#` 等字符。不要把原始产品名或用户输入拼进 shell 命令。以下在工程根目录执行，使用参数数组调用 macOS `open`：

```sh
node --input-type=module <<'NODE'
import {execFileSync} from 'node:child_process';
const at = 12.5; // replace with the changed second
const query = new URLSearchParams({path: process.cwd(), t: String(at)});
execFileSync('open', [`galanty://open?${query}`], {stdio: 'inherit'});
NODE
```

商店版首次可能要求用户授权该工程文件夹；等待用户完成授权，不通过修改 App 或权限存储绕过。重复打开应复用同一工程；若观察到新作品或错误秒数，记录实际现象与工程路径，保留独立 Studio 路径，不能声称 App 路由通过。

## 修改循环 / Revision loop

- 把用户秒数映射到 `build/storyboard.json` 的镜头帧区间。选一个目标秒数；转场可选切点前一点开始播放。
- 改真实来源：文案改 brief，结构改 planner，画面改 scenes，配乐参数改 brief/music。生成 JSON 会被覆盖，不作为唯一修改源。
- 保存并更新必要生成文件；立即打开预览、跳回该秒数，检查该点前后播放。多镜头修改可逐个跳到相应秒数。
- 向用户给出可见结果和对应秒数；再按反馈迭代。最终需要 MP4 时才走导出与完整交付检查。

区分证据：命令构造正确 ≠ OS 已接受 ≠ App 已打开工程 ≠ 已跳到目标秒并正常播放。无画面观察能力时只报告实际做到的层级。环境明确禁止启动 App 时遵守限制，输出深链/秒数与 dry-run 结果，将真实预览列为待验证；不要因该验证限制把产品指南改成“预览可选”。
