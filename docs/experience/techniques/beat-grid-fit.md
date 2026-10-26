# 技巧：从实际音乐片段测网格

先测 beat0（首拍秒数）和 beat（拍长），镜头切点与动画包络都从它们推导。跨幕用 `(startFrame + frame) / fps` 的全局秒数，再换算拍号，避免各幕重新起拍。

适用于稳定节拍片；自由速度、氛围或无明显鼓点的曲子按段落剪更合适。检测出的起音需要听拍核对，残差也可能是检测器而非曲子的误差。残差中位 ≤10 ms 是原卡点工作流的目标，不做门禁。

历史 lab 记录过约 40 ms 的母版音画偏移，以及重封装后的改善。不要把该补偿写死进新模板：应测当前交付文件、修正一次，再复测。当前工具输出的音频特征也不保证覆盖你想测的高频段。

来源：lab 技巧卡 `techniques/beat-grid-fit.md`；对应作品总览、开发者和竖屏创作者版分别进入 S095、S097、S098。这里只保留可迁移做法，没有重新核验历史残差。许可及改写记录见 [SOURCES](../SOURCES.md)。

English: Measure the exact track section and derive global animation time from one grid. Re-measure final-file sync; never inherit historical compensation blindly.
