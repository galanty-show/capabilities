# Galanty Launch 固定评测 / Fixed evaluation

此目录是内部评测语料，不是对外广告。默认公开 demo 是 Zelqio；Bun 只用于本目录的独立开源产品研究，卖点、分类数量和历史节点引用官方文档，不表示背书。

15 个固定简介位于 `cases/<id>/brief.json`，独立来源在相邻 `source.md`，注册表为 `cases.json`。覆盖 CLI、SaaS、移动 App、硬件、开源库、数据产品、设计、教育、音频、安全、自动化、桌面、IoT、电商及真实开源项目。虚构简介全程保留 DEMO，真实研究保留 EVAL。

在上一级工具目录运行：

```sh
npm run eval
npm run eval -- --list
npm run eval -- --filter cli,saas
npm run eval -- --filter cli --deps shared
```

默认每例从空目标目录生成完整 starter，复制对应简介和来源，独立 `npm ci`，串行 `render → check`。模板矩阵的 `--deps shared` 仅在锁文件一致、`npm ls --all` 通过后使用明确记录的依赖链接；不是干净安装证明。Agent 试跑使用独立依赖，避免 Agent 运行 npm ci 清理共享链接的目标。浏览器通过官方 `ensureBrowser()` 在主工具目录预备一次，记录可执行文件哈希，作为子工程共同的渲染工具链，避免每例重复下载。下载失败会报错。

运行产物和进程日志位于 `.lane-data/eval/<run>/`，`latest.json` 指向最近结束的运行。`report.json` / `report.md` 输出成功与否、时长、LUFS、真峰值、切镜/音频拍点残差、全部 RGBA 帧双渲匹配数、低占用帧数和用时。失败继续收集其余案例，最终退出非零；缺失测量显示 `—`，不会填 0。占用与阅读预算是建议，不阻止作者渲染；交付硬检查不放宽。

报告保留每例文件 manifest、brief/source 哈希、浏览器哈希和进程 PID。固定使用独立端口 4392 和串行锁；不要和另一次评测/预览抢端口。DVS_DATA 指向本次评测目录；不操作已安装 App 或 QA 实例。

模板自动评测证明工程生成与渲染链路，不能证明 Agent 理解技能、人工观感或跨平台一致性。真实 Codex / Claude Code / Gemini CLI 空目录试跑见 [agent-runner.md](agent-runner.md)，首次成片与人工介入另计。提交的路径脱敏基线表放在 `results/`；原始报告和媒体留本地，不将私人路径、日志或范本画面带入公开 Git。

This corpus measures repeatable starter generation and delivery checks. Agent adoption, first-invocation success, human intervention counts and audiovisual review are separate evidence. The reference film is a local visual study; no unmeasured quality or speed score is invented.
