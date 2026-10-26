# S127 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S127 | 样片内容：伊索寓言公共领域故事原创改写；AI 原创画作、Veo 动画、Gemini 配音与 Lyria 配乐；Ma Shan Zheng 字形 SIL OFL 1.1（文影已核实可公开发布） |
| 画面代码 | `wc-night.tsx`、`wc-day.tsx`、`wc-cry1.tsx`、`wc-hill.tsx`、`wc-cry2.tsx`、`wc-dusk.tsx`、`wc-cry3.tsx`、`wc-village.tsx`、`wc-dawn.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S127/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Algieba），播放不联网，31 句，约 117 秒 | 与样片内容同许可：伊索寓言公共领域故事原创改写；AI 原创画作、Veo 动画、Gemini 配音与 Lyria 配乐；Ma Shan Zheng 字形 SIL OFL 1.1 |
| 旁白种子（en） | `narration/S127-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Algieba），播放不联网，32 句，约 114 秒 | 与样片内容同许可：伊索寓言公共领域故事原创改写；AI 原创画作、Veo 动画、Gemini 配音与 Lyria 配乐；Ma Shan Zheng 字形 SIL OFL 1.1 |
| 配乐 | `music/wolf-third-cry.mp3` | 《The Third Cry》，作者 Galanty production，来源 talkframe://samples/S127/README.md | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S127, 伊索寓言公共领域故事原创改写；AI 原创画作、Veo 动画、Gemini 配音与 Lyria 配乐；Ma Shan Zheng 字形 SIL OFL 1.1 (verified for publication by Galanty). Scene code: MIT. Music: "The Third Cry" by Galanty production, CC0-1.0, no attribution required. Narration: S127 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Algieba); playback stays offline; S127-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Algieba); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code（local）
- code：Claude Code（local）
- voice：Gemini TTS（cloud）
- music：Lyria 3 Pro（cloud）
- music：NumPy（local）
- visuals：Codex image_gen（cloud）
- visuals：Veo 3.1 Fast（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
