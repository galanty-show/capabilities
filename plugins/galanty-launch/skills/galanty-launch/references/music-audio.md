# 配乐与音频 / Music and audio

默认用 Node 参数化合成原创配乐，无需 Python、云端账户或下载音乐。现有三曲风，不虚报更多：

| `musicStyle` | BPM | 乐段 / Structure |
| --- | --- | --- |
| `electronic` | 128 | intro → build → drop → outro |
| `lofi` | 80 | intro → groove → outro；有意 swing |
| `epic` | 100 | intro → rise → climax → outro |

`scripts/music.mjs` 的 `synthesize({style, seed, durationSeconds, outDir})` 输出 `music.wav` 和 `beat-grid.json`。后者记录 composed beats、bars、sections、seed、采样率、测量和来源；它是作曲网格，不是从最终成片检测出来的拍点。尾小节可以为精确片长而不完整。

Synthesize local original music with a fixed seed. The composed grid drives editing; measure decoded delivery audio separately to establish actual sync.

## 容器、时序与交付 / Container and timing

- 音频用真正 WAV 容器封装，不能把裸 PCM 字节改名 `.wav`；保持 48kHz、双声道。合成源为 float WAV，母带为 FFmpeg 输出的 PCM 24-bit WAV。
- 不靠猜测延迟、随意移歌或静音补偿修 AAC。当前固定 Remotion 版本的 ADTS 路径有 priming 元数据问题；工具包先渲染无声画面，再由 `scripts/mux.mjs` 把从零起点的原始 WAV 编成 AAC mux 入 MP4，保留编码延迟时序信息。
- 使用 `npm run render` / `npm run demo` 走该交付路径；裸 `npx remotion render` 可运行标准工程，但不包含工具包最终 mux 和检查证据。不得把裸 render 的成功视为音画已达标。
- 默认交付目标 −14 LUFS（±0.3 LU）、真峰值 ≤ −1 dBTP。WAV 母带瞄准 −3 dBTP 留编码余量；**最终 MP4 解码后再测**，不能只交 WAV 指标。
- 最终编码当前为 AAC 320kbps、18kHz cutoff；改编码或升级依赖后重新验证，不继承旧指标。

## 确定性与授权 / Determinism and rights

固定 seed、曲风、时长与工具链；同一 Node/FFmpeg 环境下验证样本一致。跨平台浮点、编码与版本差异需要独立验证，不能推广本机结论。使用外部音乐时遵从用户选择，先核对使用许可与来源，不能把工具包 MIT 许可套到第三方音乐、字体或 Remotion。

每次配乐修改后更新计划并立即预览改动秒数，听切入前后一段；最终完整听一遍，不用波形或报告代替听音。No loudness, sync or licensing claim is established merely by synthesis succeeding.
