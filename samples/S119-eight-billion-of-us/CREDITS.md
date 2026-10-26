# S119 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S119 | 样片内容：原创数据新闻短片：旁白与画面文字自写，数据来自联合国《世界人口展望 2024》等公开资料（出处见 source.md）；画面全部由代码绘制，配乐为 AI 原创生成后剪辑（文影已核实可公开发布） |
| 画面代码 | `pc-zoom.tsx`、`pc-title.tsx`、`pc-flat.tsx`、`pc-field.tsx`、`pc-bars.tsx`、`pc-why.tsx`、`pc-rate.tsx`、`pc-aging.tsx`、`pc-giants.tsx`、`pc-peak.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S119/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Charon），播放不联网，28 句，约 94 秒 | 与样片内容同许可：原创数据新闻短片：旁白与画面文字自写，数据来自联合国《世界人口展望 2024》等公开资料（出处见 source.md）；画面全部由代码绘制，配乐为 AI 原创生成后剪辑 |
| 旁白种子（en） | `narration/S119-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Charon），播放不联网，34 句，约 90 秒 | 与样片内容同许可：原创数据新闻短片：旁白与画面文字自写，数据来自联合国《世界人口展望 2024》等公开资料（出处见 source.md）；画面全部由代码绘制，配乐为 AI 原创生成后剪辑 |
| 配乐 | `music/eight-billion.mp3` | 《Eight Billion》，作者 Galanty，来源 talkframe://samples/S119/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt (take c of three, measured 104 BPM); edited by tools/production/code-population-20261013/music_build.py (re-timed so the drum entry hits the title, one bar removed before the drop, eight ambient bars repeated after it, 230 Hz dip, 65 NumPy-synthesized cues: bells, plucks, ticks, sweeps, no third-party samples), then encoded to 32 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S119; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S119, 原创数据新闻短片：旁白与画面文字自写，数据来自联合国《世界人口展望 2024》等公开资料（出处见 source.md）；画面全部由代码绘制，配乐为 AI 原创生成后剪辑 (verified for publication by Galanty). Scene code: MIT. Music: "Eight Billion" by Galanty, CC0-1.0, no attribution required. Narration: S119 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Charon); playback stays offline; S119-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Charon); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Charon（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Eight Billion（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
