# S036 来源与许可 / Credits

| 内容 | 文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| 分镜、设定、原文、提示词、封面 | `storyboard.json`、`settings.json`、`source.md`、`prompt.json`、`en/`、`cover*.webp` | Galanty 文影样片 S036 | 样片内容：原创（文影已核实可公开发布） |
| 画面代码 | `water-notice.tsx` | 样片自写 | MIT（见 LICENSE） |
| 旁白种子（zh） | `narration/S036/` | 本机 Qwen3-TTS 预先生成（模型 mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit，Apache-2.0；音色 energetic_narrator），8 句，约 29 秒 | 与样片内容同许可：原创 |
| 旁白种子（en） | `narration/S036-en/` | 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Kore），播放不联网，9 句，约 24 秒 | 与样片内容同许可：原创 |
| 配乐 | `music/generated-calm-current-64.mp3` | 《Calm Current 64》，作者 Galanty Generated Audio，来源 talkframe://music-generator/ambient-v1?seed=120401 | CC0-1.0（https://creativecommons.org/publicdomain/zero/1.0/）；不需要署名 |
| 类型声明 | `types/talkframe-scene.d.ts` | Galanty `@talkframe/scene` | MIT |
| 说明文档 | `README.md`、`HOW-TO-USE.md`、`CREDITS.md`、`manifest.json`、`sample.json` | 打包器生成 | MIT |

版本：提交 `1a462eaa452ac7d7687f628334c616677f5657a8`。每个文件的 SHA-256 与许可见 `manifest.json` 的 `files`（`license` 为 `sample-content` 的文件按上表“样片内容”的许可）。

---

Content (storyboard, settings, source, prompts, covers, narration): Galanty sample S036, 原创 (verified for publication by Galanty). Scene code: MIT. Music: "Calm Current 64" by Galanty Generated Audio, CC0-1.0, no attribution required. Narration: S036 pregenerated locally with Qwen3-TTS (model mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit, Apache-2.0; voice energetic_narrator); S036-en pregenerated with a cloud voice (custom-command (pregenerated cloud voice); voice Kore); playback stays offline.

## AI 素材与工具来历

- storyboard：Codex CLI；模型 gpt-6-sol (high)（cloud）
- code：Codex CLI；模型 gpt-6-sol (high)（cloud）
- voice：macOS say；模型 Tingting（local）
- voice：Qwen3-TTS 0.6B；模型 Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（local）
- music：Galanty music library · Calm Current 64（local）
- edit：Codex CLI；模型 gpt-6-astra (high)（cloud）

Git 媒体均由完整 Release ZIP 提供；本次同步没有生成新媒体。内容及新增制作记录采用 CC BY 4.0；代码与上游素材按各自许可。
