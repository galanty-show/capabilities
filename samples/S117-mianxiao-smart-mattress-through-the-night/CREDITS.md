# S117 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S117 | 样片内容：原创虚构品牌宣传片：旁白与画面文字自写，品类卖点为公开报道归纳、参数为演示数据；底图、配乐为 AI 原创生成（文影已核实可公开发布） |
| 画面代码 | `mx-hook.tsx`、`mx-brand.tsx`、`mx-stages.tsx`、`mx-bed.tsx`、`mx-snore.tsx`、`mx-report.tsx`、`mx-finale.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S117/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Iapetus），播放不联网，13 句，约 40 秒 | 与样片内容同许可：原创虚构品牌宣传片：旁白与画面文字自写，品类卖点为公开报道归纳、参数为演示数据；底图、配乐为 AI 原创生成 |
| 旁白种子（en） | `narration/S117-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Iapetus），播放不联网，16 句，约 37 秒 | 与样片内容同许可：原创虚构品牌宣传片：旁白与画面文字自写，品类卖点为公开报道归纳、参数为演示数据；底图、配乐为 AI 原创生成 |
| 配乐 | `music/mianxiao-dawn.mp3` | 《Mianxiao Dawn》，作者 Galanty，来源 talkframe://samples/S117/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt; edited by tools/production/promo-mattress-20261013/music_build.py (re-timed: starts 1.55 s in, one 2-bar night loop so the sunrise bloom lands on the narration's 'dawn' line, 4 bright bars then the original ending; dynamics halved, 200 Hz dip for a low male voice, end card +3 dB, 47 NumPy-synthesized sound effects incl. a breathing bed, no third-party samples), then encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S117; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S117, 原创虚构品牌宣传片：旁白与画面文字自写，品类卖点为公开报道归纳、参数为演示数据；底图、配乐为 AI 原创生成 (verified for publication by Galanty). Scene code: MIT. Music: "Mianxiao Dawn" by Galanty, CC0-1.0, no attribution required. Narration: S117 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Iapetus); playback stays offline; S117-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Iapetus); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Iapetus（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Mianxiao Dawn（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
