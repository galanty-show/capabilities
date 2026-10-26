# S120 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`zh/`、`cover*.webp` | Galanty 文影样片 S120 | 样片内容：原创科普讲解：英文旁白自写，事实出处见 source.md；画面全部代码绘制，城市为程序生成的虚构地图；配乐为 AI 原创生成（文影已核实可公开发布） |
| 画面代码 | `route-city.tsx`、`route-scale.tsx`、`route-steps.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（en） | `narration/S120/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Puck），播放不联网，45 句，约 99 秒 | 与样片内容同许可：原创科普讲解：英文旁白自写，事实出处见 source.md；画面全部代码绘制，城市为程序生成的虚构地图；配乐为 AI 原创生成 |
| 旁白种子（zh） | `narration/S120-zh/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Puck），播放不联网，45 句，约 97 秒 | 与样片内容同许可：原创科普讲解：英文旁白自写，事实出处见 source.md；画面全部代码绘制，城市为程序生成的虚构地图；配乐为 AI 原创生成 |
| 配乐 | `music/fastest-way-home.mp3` | 《Fastest Way Home》，作者 Galanty，来源 talkframe://samples/S120/README.md；处理：Generated with Google Lyria 3 Pro (lyria-3-pro-preview) from an original timeline prompt (take c of three, measured about 110 BPM); edited by tools/production/code-route-20261013/music_build.py (aligned 0.2 s so the title impact lands on the title card, dips at 250 Hz and 2.6 kHz for the narration, 158 NumPy-synthesized sound effects placed by the same cue() timing as the scene code: batched visit ticks, chimes, crash, reroute chime; no third-party samples), then encoded to 48 kbps MP3, 48 kHz stereo (library size budget). Timed to sample S120; other films will not hit its accents. | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S120, 原创科普讲解：英文旁白自写，事实出处见 source.md；画面全部代码绘制，城市为程序生成的虚构地图；配乐为 AI 原创生成 (verified for publication by Galanty). Scene code: MIT. Music: "Fastest Way Home" by Galanty, CC0-1.0, no attribution required. Narration: S120 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Puck); playback stays offline; S120-zh pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Puck); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 Claude Opus 5.5（cloud）
- code：Claude Code；模型 Claude Opus 5.5（cloud）
- visuals：SVG + Canvas 2D (code-drawn, no images)（local）
- voice：Gemini TTS；模型 Gemini 3.8 Flash TTS · Puck（cloud）
- voice：Gemini 3.5 Flash；模型 gemini-3.5-flash（cloud）
- music：Google Lyria 3 Pro；模型 lyria-3-pro-preview（cloud）
- music：numpy（local）
- music：Galanty music library · Fastest Way Home（local）
- edit：Claude Code；模型 Claude Opus 5.5（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
