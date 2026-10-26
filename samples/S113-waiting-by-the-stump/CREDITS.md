# S113 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S113 | 样片内容：原创儿童复述：旁白为自写（原文《韩非子·五蠹》公有领域）；底图、贴纸、配乐为 AI 原创生成（文影已核实可公开发布） |
| 画面代码 | `sz-tale.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S113/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Leda），播放不联网，27 句，约 78 秒 | 与样片内容同许可：原创儿童复述：旁白为自写（原文《韩非子·五蠹》公有领域）；底图、贴纸、配乐为 AI 原创生成 |
| 旁白种子（en） | `narration/S113-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Aoede），播放不联网，29 句，约 80 秒 | 与样片内容同许可：原创儿童复述：旁白为自写（原文《韩非子·五蠹》公有领域）；底图、贴纸、配乐为 AI 原创生成 |
| 配乐 | `music/waiting-stump.mp3` | 《Waiting by the Stump》，作者 Galanty，来源 talkframe://samples/S113/README.md；处理：Generated with Google Lyria (lyria-3.5) from an original timeline prompt; edited by tools/production/shouzhu-20261013/music_build.py (re-timed to the film, 230 Hz dip, NumPy-synthesized SFX: bonk, star twinkles, rooster, wind and rain beds, page flips, pops, woodblock steps, snores, chimes; no third-party samples), then encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S113; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S113, 原创儿童复述：旁白为自写（原文《韩非子·五蠹》公有领域）；底图、贴纸、配乐为 AI 原创生成 (verified for publication by Galanty). Scene code: MIT. Music: "Waiting by the Stump" by Galanty, CC0-1.0, no attribution required. Narration: S113 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Leda); playback stays offline; S113-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Aoede); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- visuals：Pillow + numpy (chroma key)（local）
- voice：Gemini TTS；模型 Gemini 2.5 Pro Preview TTS · Leda, Achird（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- music：Google Lyria；模型 lyria-3.5（cloud）
- music：numpy（local）
- music：Galanty music library · Waiting by the Stump（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
