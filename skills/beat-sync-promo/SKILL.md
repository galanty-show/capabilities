---
name: beat-sync-promo
description: 用代码画界面并制作卡点宣传片，按真实音乐网格和乐曲段落安排换面；适用于原创合成或已授权配乐。
---

# 卡点宣传片

可在文影中用固定时长 `scene.code` 幕制作，也可用本仓库 [HTML 工具包](../../tools/beat-sync-promo/README.md)。前者便于批注与即时修改，后者提供音乐适配、逐帧渲染及离线混音。保留用户选定的工程形态。

1. 收集一句承诺、要展示的操作、强调色和音乐来源。片中产品数字须有当次可核对依据；代码重画的 UI 写明是示意，不充当真实功能证据。
2. 先听音乐并列段落表：铺垫、释放、间奏、收尾各几小节。原创合成曲保留脚本；现成曲实测网格，记录起点、拍长、残差。标称 BPM 和检测器输出不是已卡拍的证明。
3. 从网格换算分幕帧数。文影纯视觉幕用空 narration + `duration:{mode:"fixed",seconds}`；要满电平配乐可按当前 schema 选 soundtrack 歌曲模式，床乐会受归一化、音量和旁白闪避影响。
4. 界面可用 TSX/HTML 重画，逐帧由时间驱动；使用截图/录屏时也遵循用户选择。大揭示放结构跃升，换面尽量落强拍或乐句边界。跨幕共享动画用全局时间，避免硬切两侧跳相位。
5. 先算文字停留再堆镜头。默认建议：cut 间隔一小节、同位 swap 两拍、短语阅读约 `0.25 + 0.1 × 单位数` 秒。汉字、数字串、英文词各算一单位；叠加保留旧信息可逐拍加入。用户有意快切时记录意图，不阻断制作。
6. 音效按波形峰值对画面事件，whoosh 峰对最大速度；电平测量不能代替试听。音乐的裁剪、混音与再分发都要分别确认许可。
7. 先编译播放，按秒修改；按需导出，再核对实际 MP4 的音画同步、转场前后及手机尺寸阅读。

文影的具体 MCP 路径见 [doc-to-video](../doc-to-video/SKILL.md)。完整经验见 [卡点制作](../../docs/experience/beat-sync-promo.md)、[网格技巧](../../docs/experience/techniques/beat-grid-fit.md)。

## HTML 工具包

先读工具包 README 与 METHOD，按它实际提供的命令运行：`prepare_music.py` 适配曲子，`render.mjs lint` 给停留建议，`probe` 抽关键帧，`full` 渲染子帧，`finish.sh` 混音和编码。不要假设其他工程里同名脚本存在。

`renderAt(t,ft)` 的运动使用子帧 t，硬切用帧中心 ft；换图片后等 `img.decode()`，再等一次 rAF，保证分块/并行渲染无帧间状态。以最终成片复测，而非照抄历史音画偏移。

## 常见坑

- preserve-3d 层上设 opacity/filter 可能压平两面，淡化/模糊放外层。
- JPEG、transform、混合模式或滤镜可能造成重复渲染差异；详见 [技术坑](../../docs/experience/rendering-pitfalls.md)。
- 换曲要一起改网格、分镜和幕内拍长；播放器倍速不等于重新编排或成片已对拍。
- 混音转 int16 前先防削波；AAC 编码后真峰值仍要复测。

English: Build scenes from a measured beat grid, budget reading time, and verify the final encoded soundtrack and cuts. Timing values are recommendations, not creative gates.
