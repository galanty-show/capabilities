# 文影自证发布片 · 制作记录

本记录对应在 `skill/launch-pack` 制作文影自己的中英双语 30 秒、1920×1080、30fps
发布片；保留默认虚构 Zelqio 示例。每种语言用九个有出处的镜头，突出
**Agent 对话一句 → 代码局部修改 → 文影播放器跳回 12.5 秒接着播**。
片中不出现价格、未经验收的延迟数字或平台背书。

## 出处与品牌

- [中英 brief 与全部卖点来源](../../tools/galanty-launch/examples/galanty-sources.md)：
  2026-10-21 实际读取中英官网、主仓库 README、官网文案与指定计划，区别旧 README
  定位和当前官网的预览回路；`12.5s` 是示意内容时间，不是性能成绩。
- [品牌与授权](../../tools/galanty-launch/CREDITS.md)：只读取得当前三横杠与行末播放键
  几何、App 图标，复制所需文件并保留出处；荧光绿 `#C9F65A`。
- UI、代码改动和播放器都由代码绘制。HyperFrames 镜头说明打开/播放；导出镜头
  特别限定 Remotion 工程，没有把尚未支持的原生 HTML 导出写成事实。
- 用户给的第三方宣传片九帧图仅用于本地左右对照，不入 Git/npm，也不公开分发。

## 复现与产物

先在 `tools/galanty-launch/` 安装依赖；两种语言必须串行执行，因为共享生成目录：

```sh
npm ci
GALANTY_RENDER_PORT=4397 npm run film:self-proof -- --language zh --output ./build/delivery
GALANTY_RENDER_PORT=4397 npm run film:self-proof -- --language en --output ./build/delivery
```

可选 `--reference /path/to/local-nine-frame-sheet.png` 生成本地对照。默认渲染端口仍为
4392；本次制作因该端口被其他进程占用，使用 4397，没有操作其他进程。
`--render-only` 是首次看画面的方便入口，不等于通过最终检查。

交付根目录：本地交付目录，不入库。每个 `zh/`、`en/` 目录
包含 MP4、九张 PNG、3×3 九帧图、范本对照、brief、storyboard、render/check 与
production 报告。`sources/` 保存实际抓取的官网 HTML；`installation/` 保存最终
本地 npx tarball。`review.html` 可作为审片入口；临时 HTTP 服务收尾关闭。

## 问题定位与修复

1. 本地字体不含文本播放/箭头符号，改为代码 SVG 图标；没有依赖系统字体回落。
2. 固定 4392 与其他任务冲突，增加严格校验的 `GALANTY_RENDER_PORT`；不自动抢占端口。
3. 首次双渲只有 516/900 解码帧一致。问题代码镜头 113 对原始 PNG 有 5 对不同；
   扩大到对话与代码两幕后，225 对中有 20 对在同一个字形边缘出现单像素差异。
   改成静态清晰的全句与代码差异，取消文字淡入和窗口位移，225/225 原始帧一致。
   独立复核又发现首幕大标志第三根白条圆帽 56/169 帧不同，每帧仅 5 个像素。
   保持品牌几何不变，改用原生 SVG 圆角矩形并取消标志父容器变换，169/169 原始帧一致。
   这些实测支持浏览器绘制边界/缓存历史相关的机制推断；没有 Skia trace，不能确称内部根因。
   H.264 帧间预测会扩散源帧局部波动，九帧抽样不能代替全部 900 帧比较。
   保持 4 路并发与完整逐帧哈希检查，没有提高容差或绕过失败。最终整片以 verification JSON 为准。
4. 自证片九帧覆盖九个实际镜头；播放器那张取刚跳回 `12.5s` 的帧，便于检查传播点。

## 验证范围与未完成事项

最终机器指标见 `verification-2026-10-21.json`。全量公开工具包测试使用用户指定的
`node --test --test-concurrency=4 --test-timeout=300000 "tests/*.test.mjs"`；
另跑全部分发/创建器测试、工具包 typecheck 与公共内容边界扫描。

此公开工作树无根应用 `package.json`、`desktop/` 或 `size:assert` 脚本。
`npx tsc -p desktop --noEmit` 实际报 TS5058，`npm run size:assert` 实际报脚本不存在；
它们不记作通过，也没有改预算。主应用只读，没有借用其他工作树跑写入型检查。

所有者看片验收尚未取得；按约定不操作已安装 App/QA，故未做实机跳秒、
性能验收或实机过程录屏。代码示意片与真实 App 录屏是不同交付。浏览器播放和抽帧审看
不替代主观听审。独立工具包不走主应用 jobs 管线，没有 job.json/ai.log；每片 AI token
用量不可用，不能算零，也不能把本次开发对话计入成片制作。最终出片报告的计时仅覆盖
该轮本地制作/渲染/检查，不是首次编稿到验收的全流程。

安装证据、官方文档、远端发布缺口见[分发记录](../distribution/README.md)。
本记录对应的改动未发布 npm；远端发布另行进行。
