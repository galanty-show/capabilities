# S126 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`cover*.webp` | Galanty 文影样片 S126 | 样片内容：原创脚本（史实依据 research.md 所列公开来源）；画作 AI 原创生成、配乐 AI 原创生成（CC0）；地形为公共领域高程，河流 © OpenStreetMap contributors (ODbL)，省界 Natural Earth（文影已核实可公开发布） |
| 画面代码 | `hook1.tsx`、`hook2.tsx`、`xiangjiang.tsx`、`zunyi.tsx`、`siege.tsx`、`tucheng.tsx`、`cross1.tsx`、`cross2.tsx`、`gouba.tsx`、`cross3.tsx`、`cross4.tsx`、`guiyang.tsx`、`jinsha.tsx`、`radio.tsx`、`lesson.tsx`、`ending.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S126/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Orus），播放不联网，86 句，约 323 秒 | 与样片内容同许可：原创脚本（史实依据 research.md 所列公开来源）；画作 AI 原创生成、配乐 AI 原创生成（CC0）；地形为公共领域高程，河流 © OpenStreetMap contributors (ODbL)，省界 Natural Earth |
| 配乐 | `music/sidu-chishui.mp3` | 《Four Crossings of the Chishui》，作者 Galanty，来源 talkframe://samples/S126/README.md；处理：Lyria 3 Pro 生成；由 tools/production/sidu-chishui-20261016/music/music_build.py 按本片时间表剪辑与合成 NumPy 音效，无第三方采样；64 kbps MP3、48 kHz 立体声。Lyria 段落未卡拍，92 BPM 为生成指示；未人耳试听。 | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

## 内联素材

画面代码里内联的图片来源、生成方式与许可逐项写在 `media-sources.json`；只有其中每一项都允许再分发，这支样片才提供源码包。

版本：提交 `c35b35803de5697c6e4373823eb359264cafadf6`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S126, 原创脚本（史实依据 research.md 所列公开来源）；画作 AI 原创生成、配乐 AI 原创生成（CC0）；地形为公共领域高程，河流 © OpenStreetMap contributors (ODbL)，省界 Natural Earth (verified for publication by Galanty). Scene code: MIT. Music: "Four Crossings of the Chishui" by Galanty, CC0-1.0, no attribution required. Narration: S126 pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Orus); playback stays offline.

## AI 素材与工具来历

- storyboard：Claude Code；模型 claude-fable-5-1（local）
- code：Codex CLI；模型 gpt-6-astra（local）
- voice：Gemini TTS；模型 gemini-3.8-flash-tts（cloud）
- music：Lyria 3 Pro（cloud）
- music：NumPy sound design（local）
- visuals：Codex image_gen；模型 gpt-image（cloud）
- visuals：Depth Anything V2；模型 Small（local）
- visuals：Mapzen Terrain Tiles / OpenStreetMap / Natural Earth（local）
- edit：Claude Code（local）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
