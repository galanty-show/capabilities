# S108 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S108 | 样片内容：原创；诗句公有领域（李白、柳宗元、杜甫、王维）（文影已核实可公开发布） |
| 画面代码 | `ink-open.tsx`、`ink-poem-painting.tsx`、`ink-edit.tsx`、`ink-finale.tsx` | 样片自写、随包模板 T23 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S108/` | 本机 Qwen3-TTS 预先生成（模型 Qwen3-TTS CustomVoice，Apache-2.0；音色 poem_reader），13 句，约 40 秒 | 与样片内容同许可：原创；诗句公有领域（李白、柳宗元、杜甫、王维） |
| 旁白种子（en） | `narration/S108-en/` | 本机 Qwen3-TTS 预先生成（模型 mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit，Apache-2.0；音色 english_storyteller），17 句，约 46 秒 | 与样片内容同许可：原创；诗句公有领域（李白、柳宗元、杜甫、王维） |
| 配乐 | `music/luobi.mp3` | 《Luobi》，作者 Galanty，来源 talkframe://samples/S108/music/synth.py；处理：Synthesized by templates/samples/ink-promo/music/synth.py (numpy/scipy additive and subtractive synthesis: guzheng, pipa, dizi, xiao, taiko, tanggu, gong, woodblock, bells, water drop, brush swish; 48 kHz WAV), instrumental version without the narration mix, then encoded to 48 kbps MP3, 48 kHz stereo (library size budget); no samples, no third-party audio, no AI-generated audio. Timed to sample S108 (96 BPM grid of its narration); other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 配乐制作代码 | `production/` | 样片配乐的合成脚本 | MIT |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S108, 原创；诗句公有领域（李白、柳宗元、杜甫、王维） (verified for publication by Galanty). Scene code: MIT. Music: "Luobi" by Galanty, CC0-1.0, no attribution required. Narration: S108 pregenerated locally with Qwen3-TTS (model Qwen3-TTS CustomVoice, Apache-2.0; voice poem_reader); S108-en pregenerated locally with Qwen3-TTS (model mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit, Apache-2.0; voice english_storyteller).

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：macOS fonts · Xingkai SC, Weibei SC（local）
- voice：Qwen3-TTS 0.6B；模型 Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Uncle_Fu（local）
- voice：Qwen3-TTS 0.6B；模型 Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Aiden（local）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：numpy/scipy（local）
- music：Galanty music library · Luobi（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
