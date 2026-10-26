# 批注 → Agent → 回原秒继续看

批注必需的只有时间和用户原话；框选、截图、幕句和源码位置都是可选线索。正常 MP4/MOV/WebM 与源码工程都应能进入回路，不要求先采用文影的分镜格式。

## 保留用户真正修改的工程

打开原视频文件或原工程 → 播放、拖动 → 在需要处写原话 → 复制给用户自己的 Agent → Agent 修改原工程 → 稳定保存或覆盖源视频 → App 刷新、回原秒继续检查。

Remotion 默认监听原工程，免费重新编译；HTML/HyperFrames 修改原文件后刷新。视频文件没有源码时，让 Agent 修改生成该视频的工程并重新输出到同一来源文件。只有用户明确复制为独立作品时才改副本，不要悄悄脱离原工程。

## 交接要让下一位能接着做

记录作品/来源、实际秒数、批注原话，以及存在时的归一化框、像素框、截图和源码线索。不要为了填满格式杜撰 sentenceId、段名或路径。分享交接前核对私人路径和画面中的个人信息，公开记录用相对路径及中性名称。

Agent 先读对应源码，确认用户指的对象。`preview_scene({jobId,atSeconds:5})` 返回可用线索，不能代替读代码。只有一幕需要改但共享同模块时先复制；外部项目改原工程，视频文件改生成工程，保留依赖与目录结构。

保存后确认新画面已出现、仍在合适的检查位置，并正常播放一段。旧渲染、旧截图或 changedSinceRender 的结果不能证明新修改。改过时间轴后，以改后实际位置检查，不机械回到无关的旧秒数。失败时保留诊断与最后可用版本，不把错误覆盖成成功。

文影作品需要手动重编时用 `make_video({jobId,compileOnly:true,focus:{atSeconds:5}})`，等待完成态后打开真实 play.url。外部文件自动刷新若已成功，不为完成形式再次导出。

## 记录真实完成状态

“源码已修改”“编译成功”“App 已打开”“已播放/试听”“导出文件已下载”是不同事实。按实际完成范围报告；没有可用 App/浏览器工具就给链接并写未打开。批注中的定位信息是辅助，不保证已找到唯一源码位置。

这一回路不要求共享内部应用代码。用户自己的 Agent 负责理解和修改工程，App 提供播放、批注、变化监听与导出。相关技能：[doc-to-video](../../skills/doc-to-video/SKILL.md)。依据：[来源 S1、S6](SOURCES.md)。

English: Keep the original project as the source of truth. Hand off the timestamp and exact comment, edit in place, then verify the updated picture at the relevant time. Compilation, playback and delivery are separate facts.
