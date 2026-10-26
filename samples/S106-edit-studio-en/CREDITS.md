# S106 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`cover*.webp` | Galanty 文影样片 S106 | 样片内容：原创（文影已核实可公开发布） |
| 画面代码 | `tf-open.tsx`、`tf-library.tsx`、`tf-live.tsx`、`tf-assets.tsx`、`tf-edit.tsx`、`tf-resume.tsx`、`tf-deliver.tsx` | 样片自写 | MIT（见 LICENSE） |
| 配乐 | `music/play-on.mp3` | 《Play On》，作者 Galanty，来源 talkframe://samples/S105/music/synth.py；处理：Synthesized by templates/samples/talkframe-promos/edit-studio/music/synth.py (numpy/scipy, 48 kHz WAV), then encoded to 64 kbps MP3, 48 kHz stereo; no samples, no third-party audio. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

版本：提交 `05382051b6aa34b34e263d30325ed774ceb9d09e`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S106, 原创 (verified for publication by Galanty). Scene code: MIT. Music: "Play On" by Galanty, CC0-1.0, no attribution required.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- music：numpy/scipy（local）
- music：Galanty music library · Play On（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
