# S114 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S114 | 样片内容：中国神话（《淮南子》《山海经》《楚辞》，公有领域）的儿童复述，旁白自写；底图、配乐为 AI 原创生成，音效代码合成（文影已核实可公开发布） |
| 画面代码 | `hy-sky.tsx`、`hy-fusang.tsx`、`hy-land.tsx`、`hy-houyi.tsx`、`hy-end.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S114/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Kore），播放不联网，29 句，约 94 秒 | 与样片内容同许可：中国神话（《淮南子》《山海经》《楚辞》，公有领域）的儿童复述，旁白自写；底图、配乐为 AI 原创生成，音效代码合成 |
| 旁白种子（en） | `narration/S114-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Aoede），播放不联网，38 句，约 89 秒 | 与样片内容同许可：中国神话（《淮南子》《山海经》《楚辞》，公有领域）的儿童复述，旁白自写；底图、配乐为 AI 原创生成，音效代码合成 |
| 配乐 | `music/houyi.mp3` | 《Houyi Shoots the Suns》，作者 Galanty，来源 talkframe://samples/S114/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from original prompts (one full-length score and one opening cue); cut to the S114 timeline by tools/production/houyi-20261013/music_build.py (opening cue hit on the title, hero brass on Hou Yi's entrance, war-drum section under the volley, about 2 s of silence after the last arrow, gentle sections afterwards; 0.35 s equal-power crossfades on hard cuts, 260 Hz dip for the narrator), plus NumPy-synthesized sound effects (bowstring, arrow whistle, hit chime, gong, taiko, pops, slide whistle, crackle, rain, heat, wind, birdsong; no third-party samples), then encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S114; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S114, 中国神话（《淮南子》《山海经》《楚辞》，公有领域）的儿童复述，旁白自写；底图、配乐为 AI 原创生成，音效代码合成 (verified for publication by Galanty). Scene code: MIT. Music: "Houyi Shoots the Suns" by Galanty, CC0-1.0, no attribution required. Narration: S114 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Kore); playback stays offline; S114-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Aoede); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：Gemini 3 Pro Image；模型 gemini-3-pro-image（cloud）
- visuals：Ma Shan Zheng (SIL OFL 1.1)（local）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Kore, Fenrir, Leda, Iapetus, Despina（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- voice：Qwen3-ForcedAligner 0.6B（local）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Houyi Shoots the Suns（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
