# 来源、改写与许可

整理日期：2026-10-21。本文记录此次本地内容迁移的依据；不暗示重新联网核验、重跑历史测试或审看所有成片。下面的源树相对路径用于追溯，不要求公开仓库包含应用源码。

| ID | 来源记录 | 本次采用内容 |
| --- | --- | --- |
| S1 | 制作源树 `.agents/skills/doc-to-video/SKILL.md`、`beat-sync-promo/SKILL.md`、`find-assets/SKILL.md`、`create-scene-template/SKILL.md`、`talker-reference-study/SKILL.md` | 五项技能的制作、配音、素材、定位、确定性和交付方法；去掉本机路径、私有 CLI 与内部调度 |
| S2 | 制作源树 `docs/Complete/配音选择与Agent声音引导.md`、`docs/Complete/系统语音仅试听.md` | 原声/服务/本机模型/字幕配乐阶梯，系统语音仅草稿；已有测试只作为来源记录，未在本轮重跑 |
| S3 | 制作源树 `packages/mcp-bridge/README.md` | `@galanty/mcp`、Node 20+、文件传送与 artifactDelivery 重试；不包含凭据和机器配置 |
| S4 | lab 技巧卡 `techniques/beat-grid-fit.md`、`slow-push-layers.md`、`dwell-budgets.md`、`sound-layers.md`；lab 教师/总览/开发者/创作者/故事片制作记录 | 网格、层级、停留、闪避与历史测量的边界；公开的三张摘要不是原卡全文复制 |
| S5 | 制作源树 `templates/samples/talkframe-promos/`（S095–S105）与 `templates/samples/ink-promo/`（S108）的制作技能记载；本仓库 `tools/beat-sync-promo/` | 固定时长与音乐结构、代码 UI、歌曲/床乐路径、最终文件复核 |
| S6 | 制作源树 `docs/Xplan/开放兼容-清除格式门槛.md`、`docs/Xplan/导入外部视频源码.md` 与 S1 | 原地打开、批注、Agent 修改、回原秒续播；计划中未完成能力不写成已交付 |
| S7 | 制作源树 `docs/Xplan/1.0.1上线后修复.md`（截至 2026-10-20 的兼容与合入记录） | 资源/CSS/字体、多音轨、原生 MP3 seek、monorepo/入口/paths 修复，以及 HTML 导出与 Sequence 非 1× 缺口 |
| S8 | 制作源树 `docs/Xplan/长安的荔枝故事短片.md`、S1 的 S107 经验及 S7 | 大底图/CSS filter/混合模式重复渲染不一致；不推导为所有 JPEG 或滤镜不可用 |
| S9 | lab `promos/tools/work-lib.mjs` | 提取固定帧换算、内容哈希素材占位 ID、分镜/素材清单构建为 `tools/work-builder/`；移除产品录屏默认说明并增加输入与边界校验 |

## 内容选择

lab `tools/admit.mjs` 依赖私有引擎接口和模板发布规则，本次不引入。`promos/tools/import-work.mjs` 直接加载私有源树，也不引入；公开技能用 App MCP 完成导入。单支片的裁剪、拼图、调响度等一次性脚本不收录。其他技巧仍可从作品学习，本批只发布有直接用途的三篇摘要。

## 许可

本批新写/改写的技能与原创经验文本采用仓库 [CC BY 4.0](../../LICENSE-CC-BY-4.0)，示意代码和 work-builder 采用 [MIT](../../LICENSE-MIT)，作者 Talkframe contributors。保留来源与本次改写说明。lab 技巧卡原有说明将其自写机制与示意代码列为原创/MIT；这里的摘要不复制外部教程、参考片、配图或独特编排。

没有迁移《导演手册》的第三方改写段，以免丢失其分别适用的 CC BY-SA / W3C 等许可通知。原始参考片、家人照片、第三方人物素材、未核实权利的音乐/字体均不随这些文档再分发。样片/模板中的第三方素材及 AI 生成素材依各自 CREDITS 和许可，不因本批文字或代码许可被重新授权。

贡献与文件类别边界见 [CONTRIBUTING](../../CONTRIBUTING.md)。历史记录中的产品计数、性能、响度与偏移都只对应其当时作品；本批没有把它们写成当前产品承诺。

English: This is a local migration and original summary of production records. No reference media or third-party tutorials were copied; historical results are attributed to their original scope. Text uses CC BY 4.0 and code uses MIT, subject to per-asset notices.
