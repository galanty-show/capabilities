# 拾页 · 团队研究台（S123 · GitHub 改编 · video-shotcraft Ink Press）

36 秒无旁白产品宣传片，改编自 GitHub 上 Claude Code / Codex 视频技能 **video-shotcraft** 的成片模板 **Ink Press**（纸墨晨读风）。

| 项 | 内容 |
| --- | --- |
| 原仓库 | https://github.com/Vincentwei1021/video-shotcraft （10-13 约 1.16 万星） |
| 原作文件 | `template/src/aifl/`（Main.tsx、PaperTitleCard.tsx、DigitRoll.tsx、FlashCut.tsx、Caption.tsx、live/PageCam.tsx、live/Scene*.tsx） |
| 提交 | `13c74a707786872a18e3317e48c5c94011027620` |
| 许可证 | Apache License 2.0，Copyright 2026 Wei Yihao；原文见 [LICENSE.upstream.txt](LICENSE.upstream.txt)（上游无 NOTICE 文件） |
| 原作者 | Wei Yihao（Vincentwei1021） |

## 保留了什么

十个镜头与帧号照原作 `AIFL_SHOTS`（合计 1085 帧）：墨线十字与字标逐字压印开场 → 2.5D 斜俯推近、追光锁定、主角卡浮起光束绕卡、3D 浮签 → 字卡（词组由大到小落定、琥珀强调词、下划线）→ 金属台面牌堆环拍、26 张卡越发越快飞入网格、扫到页底、搜索打字、筛选、命中卡上移、点击推近 → 详情行逐条嵌入 → 论文雷达列表压入与计数滚动 → 周报自己写自己、历史周报弹入 → 合影组装与铅印字标；切点暖白闪、底部等宽解说条。机位关键帧与缓动沿用原作 `PageCam`。

## 改了什么（Apache-2.0 第 4 条：修改说明）

- 原作的“真实页面”是整页截图；本样片全部改为 DOM 现画的**中文虚构界面**（拾页 · 团队研究台），坐标沿用原作 `live-layout.json`。
- 文案改成中文：字卡、解说条、字标、浮签、搜索词、问题列表都在各幕 `meta.params`；强调词用楷体代替西文斜体，标题用宋体（macOS 字体，其他系统回退衬线体）。
- 原作 Mixkit 采样音效全部去掉，按原作音效表同一帧号用 NumPy 重新合成，混进配乐 *Ink Press Morning*（Lyria 3 Pro 原创 + 剪辑，随包曲库 `library:original-gh-ink-press`，CC0）。
- 配色读 `props.theme`（纸、墨、琥珀、灰墨），原配色写在 `settings.theme`；去掉了混合模式与 staticFile。
- 七个幕模块共用一份工具（页面相机、项目卡、导航、解说条、闪切、里程表数字），由制作目录 `tools/production/github-remotion-20261013/s123-ink-press/build_scenes.mjs` 拼进每个 `scenes/gh-ink-*.tsx`；改共用部分请改那里的 `src/` 后重新拼装。

## 规格与限制

- 1920×1080，30 fps，正文 36.17 秒（1085 帧），10 幕硬切；导出时按权益接约 4.9 秒品牌片尾。无旁白、无宿主字幕。
- 音效与配乐按原作帧号钉死，改幕长后不再对齐；纯配乐片按默认混音偏轻。
- 发牌镜头一帧里有 26 张 DOM 卡片在 3D 空间飞，低配机器即时播放可能掉帧，不影响导出。

## 另一语言版本（英文，2026-10-14）

- `locales/en.json`：品牌保留拼音字标 Shiye（logo 字 S），四张字卡、开场浮签、十张项目卡、详情页、论文雷达五张卡、周报全文与评论、落版标语全部改写为英文；数字、日期与百分比不变（62% → 71%、3.1×、31 篇抓取 5 篇入选等）。四位研究员英文名 Zhou、Lin、Xu、Tang，头像取首字母。
- 为了换语言，幕代码里写死的界面文字全部挪进了 `meta.params`（默认值即中文原文）：共用界面（导航、搜索、分组、卡片标签与十张项目卡）是 `ui.*` 与 `projects`，由 `build_scenes.mjs` 把 `src/kit-params.txt` 注入六个用到界面的模块；详情页的分组、简介、四格信息、页签、表头、状态，落版的论文卡与周报条，雷达与周报编辑器的界面词也都成了参数。强调字体按文字选：含中文用楷体，纯西文用斜体衬线；字卡词距西文 0.26em、中文仍 0.12em。中文版改代码前后十幕静帧逐字节相同，中文封面字节未变。
- 无旁白；镜头、闪切、配乐与音效全部共用，英文版正文同为 36.2 秒（含片尾 41.1 秒）。搜索框逐字打出 “research loop”（13 个字母，3 帧一个，比中文多打 27 帧，筛选开始时还在打最后几个字母）。
- 审片用免费的整片单帧预览（与 `preview_scene({jobId, atSeconds})` 同一条渲染路径）抽 20 帧拼图并看了周报、雷达、详情原尺寸截图：字卡两行、周报正文在页内、雷达卡单行不截断。英文 MP4 未导出（当月导出额度已用完，见记录）。
- 已知问题：界面无衬线字体 PingFang SC 把西文连字符画得偏长；详情表格“Experiments 3”贴近负责人列。
