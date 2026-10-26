# S112 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S112 | 样片内容：儿童故事：旁白为自写口语复述（出自《三国志·魏书》，公有领域）；底图、配乐为 AI 原创生成，音效代码合成（文影已核实可公开发布） |
| 画面代码 | `cc-open.tsx`、`cc-court.tsx`、`cc-river.tsx`、`cc-end.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S112/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Aoede），播放不联网，25 句，约 69 秒 | 与样片内容同许可：儿童故事：旁白为自写口语复述（出自《三国志·魏书》，公有领域）；底图、配乐为 AI 原创生成，音效代码合成 |
| 旁白种子（en） | `narration/S112-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Leda），播放不联网，25 句，约 67 秒 | 与样片内容同许可：儿童故事：旁白为自写口语复述（出自《三国志·魏书》，公有领域）；底图、配乐为 AI 原创生成，音效代码合成 |
| 配乐 | `music/cao-chong.mp3` | 《Cao Chong Weighs the Elephant》，作者 Galanty，来源 talkframe://samples/S112/README.md；处理：Two cues generated with Google Lyria 3 Pro (lyria-3-pro-preview) from original timeline prompts (tools/production/cao-chong-20261013/music/cue1, cue2); joined by tools/production/cao-chong-20261013/music_build.py: cue 1 hard-stops on the 'reached the line' beat, cue 2 starts at the weighing scene, a 12 dB dip for the children's thinking pause, 5 dB pre-duck under narration, 137 NumPy-synthesized sound effects (pops, splashes, stone thuds, a bell 'ding', xylophone counting, a fanfare; no third-party samples), then encoded to 40 kbps MP3, 48 kHz stereo (stays under the 512 KiB repository file limit). Timed to sample S112; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S112, 儿童故事：旁白为自写口语复述（出自《三国志·魏书》，公有领域）；底图、配乐为 AI 原创生成，音效代码合成 (verified for publication by Galanty). Scene code: MIT. Music: "Cao Chong Weighs the Elephant" by Galanty, CC0-1.0, no attribution required. Narration: S112 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Aoede); playback stays offline; S112-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Leda); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Aoede（cloud）
- voice：Gemini TTS；模型 Gemini 2.5 Pro TTS · Aoede（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Cao Chong Weighs the Elephant（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
