# 乐曲分幕与停留预算 / Story and pacing

让音乐结构决定叙事能量，再把镜头切点对齐节拍。不要先做等长卡片，再随意铺音乐。以实际 `beat-grid.json` 为准，保留用户片长。

Use the composed music grid as the timing source. Build contrast between sections; preserve enough time to reveal and read each claim.

| 乐段 / Section | 叙事 / Story | 工具包默认节奏 / Default cadence |
| --- | --- | --- |
| 前奏 intro | 引出产品或问题，留悬念 | 8 拍；克制 |
| build / groove / rise | 主张与证据逐步展开 | 4 拍换镜 |
| Drop / climax | 最强卖点、规模、Logo 揭示 | 2 拍换镜，能量明显增加 |
| 尾声 outro | Logo、短口号、准确行动入口 | 保持结尾，不继续闪切 |

`electronic` 有 intro/build/drop/outro；`lofi` 是 intro/groove/outro；`epic` 是 intro/rise/climax/outro。不要把无 Drop 的曲风声称为已测 Drop 卡点。强烈卡点片优先 electronic；其他选择服从用户风格。

## 预算表 / Hold budget

运行 `npm run plan`，查看 `build/storyboard.json` 的每镜来源、`section`、`from`、`durationInFrames` 与 `budget`。当前计算：

- 每拍秒数 `60 / bpm`；普通切镜 4 拍，Drop 2 拍。
- 阅读时间 `0.25s + 0.1s × readingUnits(text)`；汉字、拉丁词、数字组各算一个单位。
- 默认揭示时间 `0.45s`；建议停留为 `max(乐段切镜时间, 阅读时间 + 揭示时间)`。
- 全片秒数 `from / fps`；片内帧使用整数，不累加浮点秒造成漂移。

这是建议，不是观众已读懂的证明。工具只统计主文案，作者还要计入副标题、代码、命令与多项列表的阅读负担。预算不足时先压缩文案、延长停留或调整镜头；不得静默截断、裁掉关键词或缩到不可读。

Keep a per-shot budget with start, duration, reveal, reading time and source. Automated pacing advice is advisory; a fast montage can be intentional, but core claims and the final action must remain readable.

## 创作与回看 / Iterate

修改 `brief.json`；需要改变镜头池、结构或预算时再编辑 `scripts/storyboard.mjs`，不要手改下次 plan 会覆盖的生成文件。原语只按故事选择，不要求九类全部出现。build 到 Drop 可增加切镜密度、规模、对比与运动幅度，但保留安静段落。

改完立即 `npm run plan` 并预览改动秒数，特别回看切入前后一拍，确认有铺垫、冲击、落稳与阅读时间。不要等待最终 MP4 才首次检查节奏。
