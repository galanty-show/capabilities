# S125 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S125 | 样片内容：改编自 GitHub remocn 的 ReleaseTeaser 模板（MIT，提交 fd2d3010a818，Copyright (c) 2026 Remocn）；品牌为虚构，文字原创；配乐原创（文影已核实可公开发布） |
| 画面代码 | `gh-release-teaser.tsx` | 样片自写 | MIT（见 LICENSE） |
| 配乐 | `music/gh-release-teaser.mp3` | 《Qiguang Teaser》，作者 Galanty，来源 talkframe://samples/S125/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt (tools/production/github-remotion-20261013/s125-release-teaser/music-prompt.txt, take score-s125b); cut from 1.55 s so the strongest onset lands on the release reveal (10.18 s); NumPy-synthesized glass plucks on the five statements, a reverse swell, a low impact and a chime on the reveal; no third-party recordings or samples; encoded to 40 kbps MP3, 48 kHz stereo. Timed to sample S125; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

版本：提交 `edd30dcf7975e781754a2686904aae8e728645f8`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S125, 改编自 GitHub remocn 的 ReleaseTeaser 模板（MIT，提交 fd2d3010a818，Copyright (c) 2026 Remocn）；品牌为虚构，文字原创；配乐原创 (verified for publication by Galanty). Scene code: MIT. Music: "Qiguang Teaser" by Galanty, CC0-1.0, no attribution required.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Qiguang Teaser（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
