# 书架小程序 · 第 12 周迭代回顾（S124 · GitHub 改编 · claude-code-video-toolkit）

一支 33 秒的无旁白迭代回顾讲解片（周报 / 冲刺评审视频的模板），改编自 GitHub 上的 Claude Code 视频工具箱 **claude-code-video-toolkit** 的可直接渲染示例 **hello-world · SprintReview**。

| 项 | 内容 |
| --- | --- |
| 原仓库 | https://github.com/digitalsamba/claude-code-video-toolkit （10-13 约 2.2k 星） |
| 原作文件 | `examples/hello-world/src/`（SprintReview.tsx、components/slides/*、components/demos/DemoSection.tsx、config/*）与共享组件 `lib/components/`（AnimatedBackground、MazeDecoration、SlideTransition、Label、PointingHand） |
| 提交 | `959e0fc6c20210832078781e49daa7384cebb293` |
| 许可证 | MIT License，Copyright (c) 2024 Digital Samba；原文见 [LICENSE.upstream.txt](LICENSE.upstream.txt) |
| 原作者 | Digital Samba |

## 保留了什么（原作运动设计）

- 结构：标题 → 概览 → 演示段 → 总结数字 → 深色致谢，与原作 SprintReview 的 Series 顺序一致。
- 标题页 logo 方块弹入（带回弹）、标题与各行依次淡入上移；概览要点逐条从左滑入、高亮词着主色；总结页大数字弹入后计数上滚、落定时下划线展开；致谢页分组依次淡入。
- 全程柔和的 AnimatedBackground（subtle：三团缓慢漂移的径向渐变）与右上角 MazeDecoration（方块按到角距离起伏），SlideTransition 的 zoom 与 blur-fade 进出场；配色取原作 brand.ts（白底、橙色主色 `#ea580c`）。

## 改了什么

- 内容改成中文的虚构主题“书架”社区图书馆小程序第 12 周迭代回顾；所有文字（含概览三条、演示步骤、三个数字、致谢分组）都在 `meta.params`，工作台可直接改。
- 原作演示段播放录屏视频；本样片改为**代码画的手机界面**演示“扫码借书”：取景框扫描 → 识别 → 书卡弹出 → 手指点击“确认借阅” → 成功勾与还书日期，右侧步骤列表随之点亮（步骤列表为本样片新增）。原作的手指表情符号改为 SVG 手形。
- 六幕共用一个模块 `gh-sprint-review`（`props.shot` 选段、`props.f0` 是本幕全片起始帧），背景与迷宫装饰按全片时钟连续；切点落在随包曲 Minimal Electronic 100 的小节线上（[build.mjs](build.mjs)）。
- 配色读 `props.theme`，播放页换成深色预设时卡片与文字跟着变。去掉了原作的音频、视频、staticFile 与跨目录的共享库导入。
- 原作 hello-world 默认不开迷宫装饰，本样片打开；平台行写“移动端”（不写真实平台名）。

## 规格与限制

- 1920×1080，30 fps，正文 33.53 秒（1006 帧），6 幕硬切（幕内自带 zoom / blur-fade）；导出时按权益接约 4.9 秒品牌片尾。
- 无旁白、无宿主字幕；配乐 `library:generated-minimal-electronic-100`（CC0），切点按它的小节线排，换曲后不再对齐。
- 即时播放时播放器底部的操作栏会盖住演示段左下角的标签条与致谢页底部的产品名，导出的 MP4 不受影响。
- 手机界面里的小字（状态栏时间、“已识别”、条形码数字）写在代码里，没有做成参数。

## 另一语言版本（英文，2026-10-14）

- `locales/en.json`：产品名 Bookshelf（logo 字 B），副行 Sprint Review: Week 12，概览、演示手机界面、三个计数说明与致谢全部改写为英文；数字与日期不变（37、2、100%，10 月 6～12 日、10 月 26 日还书）；致谢“制作”组写 Claude Code · Galanty。
- 为了换语言，原来写死在代码里的四处文字挪进了 `meta.params`（默认值即原文）：副行连接符 `sprintJoin`（“：”）、识别标签 `detectedText`、手动输入链接 `manualText`、书名两侧符号 `bookQuotes`（“《》”，英文留空）；手机导航标题从演示标签去掉前缀时也认 `Demo:`。中文版同一时间轴六幕静帧改前改后逐字节相同，中文封面字节未变。
- 无旁白；切点、配乐与计数节拍共用，英文版正文同为 33.5 秒（含片尾 38.4 秒）。审片看了 16 帧拼图与手机界面原尺寸截图：英文都不换行、不截断，书卡标题在 202 px 栏内不触发省略号。
- 封面 `covers/S124-en.webp` 与中文同一帧（12.87 秒）。已知问题：无。
