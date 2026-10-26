# S109 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`zh/`、`cover*.webp` | Galanty 文影样片 S109 | 样片内容：原创英文复述：旁白为自写（原著 Washington Irving 1820 年公版小说，引原文一句）；底图、配乐为 AI 原创生成（文影已核实可公开发布） |
| 画面代码 | `sh-road.tsx`、`sh-title.tsx`、`sh-hollow.tsx`、`sh-ichabod.tsx`、`sh-katrina.tsx`、`sh-brom.tsx`、`sh-party.tsx`、`sh-ride.tsx`、`sh-shadow.tsx`、`sh-chase.tsx`、`sh-morning.tsx`、`sh-wedding.tsx`、`sh-credit.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（en） | `narration/S109/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Charon），播放不联网，41 句，约 101 秒 | 与样片内容同许可：原创英文复述：旁白为自写（原著 Washington Irving 1820 年公版小说，引原文一句）；底图、配乐为 AI 原创生成 |
| 旁白种子（zh） | `narration/S109-zh/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Charon），播放不联网，41 句，约 98 秒 | 与样片内容同许可：原创英文复述：旁白为自写（原著 Washington Irving 1820 年公版小说，引原文一句）；底图、配乐为 AI 原创生成 |
| 配乐 | `music/sleepy-hollow.mp3` | 《Sleepy Hollow》，作者 Galanty，来源 talkframe://samples/S109/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt; edited by tools/production/sleepy-hollow-20261013/music_build.py (cut into 7 segments on the S109 timeline: title hit, folk waltz, heartbeat pulse, 6/8 chase that stops dead on the pumpkin, music-box morning, waltz reprise, final chord; NumPy-synthesized wind, fire, thunder, cannon, flame whoosh, pumpkin crash and bells; no third-party samples), then trimmed to the film body and encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S109; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S109, 原创英文复述：旁白为自写（原著 Washington Irving 1820 年公版小说，引原文一句）；底图、配乐为 AI 原创生成 (verified for publication by Galanty). Scene code: MIT. Music: "Sleepy Hollow" by Galanty, CC0-1.0, no attribution required. Narration: S109 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Charon); playback stays offline; S109-zh pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Charon); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- visuals：numpy（local）
- voice：Gemini TTS；模型 Gemini 2.5 Pro TTS · Charon（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Sleepy Hollow（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
