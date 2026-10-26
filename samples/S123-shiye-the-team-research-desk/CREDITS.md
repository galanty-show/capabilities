# S123 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S123 | 样片内容：改编自 GitHub video-shotcraft「Ink Press」模板（Apache-2.0，提交 13c74a707786，Copyright 2026 Wei Yihao）；界面改为代码现画的中文虚构界面，文字原创；配乐与音效原创（文影已核实可公开发布） |
| 画面代码 | `gh-ink-open.tsx`、`gh-ink-card.tsx`、`gh-ink-deck.tsx`、`gh-ink-detail.tsx`、`gh-ink-radar.tsx`、`gh-ink-brief.tsx`、`gh-ink-outro.tsx` | 样片自写 | Apache-2.0 |
| 配乐 | `music/gh-ink-press.mp3` | 《Ink Press Morning》，作者 Galanty，来源 talkframe://samples/S123/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt (tools/production/github-remotion-20261013/s123-ink-press/music-prompt.txt, take score-s123a); re-timed by music_build.py (groove enters on the first deck shot, breath before the finale, the track's own ending placed after the wordmark stamp) plus NumPy-synthesized sound design pinned to the same frames as the upstream template's SFX table (whooshes, typing, pops, riser, impact, sparkle); no third-party recordings or samples; encoded to 40 kbps MP3, 48 kHz stereo. Timed to sample S123; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

版本：提交 `f1a152a442b33c08580ee3c1956d075f7e236e49`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S123, 改编自 GitHub video-shotcraft「Ink Press」模板（Apache-2.0，提交 13c74a707786，Copyright 2026 Wei Yihao）；界面改为代码现画的中文虚构界面，文字原创；配乐与音效原创 (verified for publication by Galanty). Scene code: Apache-2.0. Music: "Ink Press Morning" by Galanty, CC0-1.0, no attribution required.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Ink Press Morning（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
