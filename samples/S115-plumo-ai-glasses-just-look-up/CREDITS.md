# S115 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S115 | 样片内容：原创：虚构品牌与产品、自写旁白；底图与配乐为 AI 原创生成，音效代码合成（文影已核实可公开发布） |
| 画面代码 | `pg-hook.tsx`、`pg-translate.tsx`、`pg-navigate.tsx`、`pg-capture.tsx`、`pg-prompter.tsx`、`pg-notify.tsx`、`pg-hero.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S115/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Zephyr），播放不联网，11 句，约 21 秒 | 与样片内容同许可：原创：虚构品牌与产品、自写旁白；底图与配乐为 AI 原创生成，音效代码合成 |
| 旁白种子（en） | `narration/S115-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Aoede），播放不联网，9 句，约 20 秒 | 与样片内容同许可：原创：虚构品牌与产品、自写旁白；底图与配乐为 AI 原创生成，音效代码合成 |
| 配乐 | `music/plumo-heads-up.mp3` | 《PLUMO Heads Up》，作者 Galanty，来源 talkframe://samples/S115/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt; edited by tools/production/promo-glasses-20261013/music_build.py (one splice on a measured 126 BPM grid so the groove enters on the first feature cut and the drop lands on the product reveal, voice-section pre-duck and 2.7 kHz dip, +4 dB drop, NumPy-synthesized UI sounds, shutter, whooshes and impacts, no third-party samples), normalized to -18 LUFS, then encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S115; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S115, 原创：虚构品牌与产品、自写旁白；底图与配乐为 AI 原创生成，音效代码合成 (verified for publication by Galanty). Scene code: MIT. Music: "PLUMO Heads Up" by Galanty, CC0-1.0, no attribution required. Narration: S115 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Zephyr); playback stays offline; S115-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Aoede); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Zephyr（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · PLUMO Heads Up（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
