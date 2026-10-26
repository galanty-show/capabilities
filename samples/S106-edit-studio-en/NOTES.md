# Fix a word. Play on.（S106 · 介绍片英文版）

S105《改一个字，接着播》（[`../edit-studio/`](../edit-studio/README.md)）的英文版：同一首配乐、同一张小节网格、同样的 7 幕与切点帧；改的是屏上文字，以及英文变长后必须调整的版式。`settings.json` 写 `language: "en"`。

- 规格：1920×1080，30 fps，正文 58.07 秒（1742 帧），导出时接约 4.9 秒品牌片尾（`brandOutro: "made-with"`）。
- 不配旁白；幕代码读 `props.theme`，即时播放里换配色会生效。
- 文字与画面原创，许可 MIT；配乐《Play On》原创代码合成（脚本在中文版目录 `music/synth.py`），CC0。来源与出处见 [CREDITS.md](CREDITS.md)。

## 中英对照

英文界面词沿用 `talkframe-promos/*-en` 已用过的说法（Swap colors / Voice / Pace、Watching, playing and editing are free.）；网页工作台目前只有中文界面，其余按简洁的产品英文意译。

| 位置 | 中文版 | 英文版 |
| --- | --- | --- |
| 开场 | 改一个字，又要等一遍？ / 渲染中 | Fix one word, render it all again? / Rendering |
| 样片库 | 在文影里，不用等。 / 停在封面上，就现场播放 / 精选样片… | In Galanty, no waiting. / Hover a cover. It plays live. / Built-in samples · all play live |
| 即时预览 | 即时预览 / 不渲染视频，本机逐帧现画 | Live Preview / No render. Drawn frame by frame, on your computer. |
| 播放器 | LIVE · 本机现场渲染 / 即时播放 / 现场渲染中，不是 MP4 | LIVE · drawn on your computer / Live Player / Drawn live — not an MP4 |
| 配色名 | 原配色 / 荧光绿 / 深海蓝 / 琥珀橙 / 玫瑰红 / 星云紫 / 青玉 | Original / Lime / Ocean / Amber / Rose / Violet / Jade（与 `LIVE_PALETTES` 的 id 对应） |
| 字幕 | 点开就播… / 按 C，换一套配色 / 拖到哪，就画到哪 / 配色、配音、节奏，当场生效 | Click and it plays. No render wait. / Press C for a new palette / Drag anywhere. It draws right there. / Colors · Voice · Pace — all switched live |
| 素材 | 每份素材，都记着来源和许可 / 署名自动写好 | Every asset keeps its source and license / Credit written for you |
| 精确修改 | 定位这一秒 / 这一秒 / 保存并更新画面 / 有修改还没保存 | Locate this moment / This moment / Save & update / Unsaved changes |
| 改字 | 下周一前提交报告 → 下周三前提交报告 | Report due Monday → Report due Wednesday（改一个词） |
| 同一秒 | 同一秒，接着播 / 不用从头看，也不用等导出 | Same moment. Plays on. / No restart. No export wait. |
| 交付 | 有新改动，重新导出 / 下载视频（这是改动前导出的版本） | New changes — export again / Download (exported before changes) |
| 三件事 | 即时预览 / 精确修改 / 素材管理 | Live preview / Precise edits / Asset tracking |
| 收尾 | Galanty 文影 / 播放和修改一直免费 | Galanty / Watching, playing and editing are free. |

## 版式改动（相对中文版）

- 字宽不按“字数 × 字号”估算：改字演示按词处理，光标跟在词后行内排版；《城市之光》的标题用 `measureText` 按词排开。
- 样片库：英文样片库默认只显示英文样片（`web/sample-locale.js`），所以网格改为 4×2：7 支精选英文样片 + 一格“Show all”，卡片放大到 420×236。
- 开场痛点句 112 → 92 px；Drop B 大字 176 → 124 px；三件事 112 → 72 px、间距 560 → 600；改字句 52 → 44 px；分段字幕 58 → 52 px。
- 分镜幕标题按 32 字上限改短（Render again? / Hover to play / Live Preview / Asset tracking / Locate, fix a word / Same moment / Export & recap）。

## 已知限制

与中文版相同；另外当前全局品牌片尾仍写“Galanty 文影”，按视频语言切换的片尾另行制作。
