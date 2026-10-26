# S107 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S107 | 样片内容：原创故事导读：旁白为自写概述（原著马伯庸《长安的荔枝》），诗句公有领域；底图、配乐为 AI 原创生成（文影已核实可公开发布） |
| 画面代码 | `lc-poem.tsx`、`lc-title.tsx`、`lc-changan.tsx`、`lc-edict.tsx`、`lc-decay.tsx`、`lc-map.tsx`、`lc-south.tsx`、`lc-trials.tsx`、`lc-relay.tsx`、`lc-arrive.tsx`、`lc-cost.tsx`、`lc-truth.tsx`、`lc-war.tsx`、`lc-credit.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S107/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Orus），播放不联网，20 句，约 97 秒 | 与样片内容同许可：原创故事导读：旁白为自写概述（原著马伯庸《长安的荔枝》），诗句公有领域；底图、配乐为 AI 原创生成 |
| 旁白种子（en） | `narration/S107-en/` | 本机 Qwen3-TTS 预先生成（模型 mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit，Apache-2.0；音色 english_storyteller），51 句，约 115 秒 | 与样片内容同许可：原创故事导读：旁白为自写概述（原著马伯庸《长安的荔枝》），诗句公有领域；底图、配乐为 AI 原创生成 |
| 配乐 | `music/changan-lychee.mp3` | 《Chang'an Lychee》，作者 Galanty，来源 talkframe://samples/S107/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt; edited by tools/production/lychee-20261007/music_build.py (re-timed, one 4-bar loop, 230 Hz dip, NumPy-synthesized SFX and rain/wind/fire beds, no third-party samples), then encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S107; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S107, 原创故事导读：旁白为自写概述（原著马伯庸《长安的荔枝》），诗句公有领域；底图、配乐为 AI 原创生成 (verified for publication by Galanty). Scene code: MIT. Music: "Chang'an Lychee" by Galanty, CC0-1.0, no attribution required. Narration: S107 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Orus); playback stays offline; S107-en pregenerated locally with Qwen3-TTS (model mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit, Apache-2.0; voice english_storyteller).

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- visuals：Veo 3.1 Fast；模型 veo-3.1-fast-generate-preview（cloud）
- visuals：Ma Shan Zheng (SIL OFL 1.1)（local）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Orus（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- voice：Qwen3-TTS 0.6B；模型 Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Aiden（local）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Chang'an Lychee（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
