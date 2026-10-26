# 检查与交付 / Checks and delivery

预览用于每轮判断修改；最终导出后完成交付检查。运行前读当前工具包 README；在完整工程目录执行：

```sh
npm run demo
npm run check
```

改了可执行代码时完成对应 `npm test` 与 `npm run typecheck`。不要用全量双渲染阻塞每次修改的首次预览。当前 `check` 会独立再渲染完整影片，要求已有最新 `render` 输出；brief、脚本、场景、字体或生成媒体变化会使旧 fingerprint 失效。

Preview every edit, then render and validate the final delivery. Reuse valid evidence only for the unchanged inputs and toolchain it actually covers.

| 检查 / Check | 证据及边界 / Evidence and limit |
| --- | --- |
| 来源 | 人工打开原文；schema 只能验证引用已填 |
| 停留预算 | 每镜 actual/recommended；advisory，另检查副文案与命令 |
| 画面占用 | 全帧启发式报告；advisory，不能把有意留白判成失败 |
| 切镜与拍点 | 整数帧切镜相对网格中位残差 ≤10ms |
| 实际音频卡点 | 解码最终 MP4，低通 150Hz、5ms 窗口检测；electronic Drop 匹配率 ≥90%、中位残差 ≤10ms；其他曲风无此 Drop 测量须写明 |
| 响度与峰值 | 最终 MP4 −14±0.3 LUFS，真峰值 ≤−1 dBTP |
| 确定性 | 两次独立完整 Chromium 渲染；所有对应解码 RGBA 帧 SHA-256 一致，另保留九张代表帧哈希 |
| 字体 | 两套本地字体实际加载证据 + manifest 字形覆盖；缺字失败 |
| 时长与媒体 | ffprobe 时长误差不超过一帧；帧数、尺寸准确且有音轨 |

硬性指标失败时修复或明确报告，不能删检查、绕过失败或称“已通过”。预算与占用提示可经人工判断保留，但要说明有意选择。当前双渲证明本工具链的对应帧一致；不证明跨系统像素一致，也不要求 MP4 文件字节一致。

## 人工复核与交付 / Review and handoff

完整观看与听音，检查文字可读、镜头能量递进、转场、收尾停留、品牌归属、数字口径与音乐切点。九张图不能覆盖转场；contact sheet 不能代替全片。

交付标准工程、`build/promo.mp4`、九张 `build/frames/` 抽帧、`build/contact-sheet.png`、`build/storyboard.json`、`build/render.json` 与 `build/check.json`。当前 3×3 sheet 每格 640×360、沟槽 6px，总尺寸 1932×1092。

简洁报告：影片位置、关键改动秒数、实际执行与结果、警告、未验证项；App 打开/跳秒与 MP4 工程检查分开写。没有亲眼播放的预览写“打开已请求，播放未验证”。不把本技能成功等同技能商店发布、三家 Agent 首次成片率或性能目标达成。

Keep the final report concrete: artifacts, timestamp, measured checks, observed playback and remaining gaps. Publication requires the user's actual authorization; creating a film alone does not authorize publishing it.
