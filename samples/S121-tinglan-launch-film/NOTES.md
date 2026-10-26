# 听澜纪要 · 发布片（S121 · GitHub 热门工程改编）

一支 50 秒的横版产品发布片，虚构 App“听澜纪要”。画面全部由 `scenes/` 的幕代码按帧画出，无旁白，按随包配乐《Play On》卡点。

- 规格：1920×1080，30 fps，正文 50.33 秒（1510 帧），7 幕 `scene.code`、硬切；导出时按权益接约 4.9 秒品牌片尾，合计约 55.2 秒。
- 配乐：随包曲库 `library:original-play-on`（《Play On》，124 BPM，CC0）。幕切点就是它的乐句边界（第 0 小节从 0 秒起）。
- 幕代码读 `props.theme`：即时播放里换配色会整片生效（深色底设计，换浅色底需要同时改字色）。

## 上游与许可

| 项 | 内容 |
| --- | --- |
| 仓库 | https://github.com/heygen-com/hyperframes （2026-10-13 约 6.2 万星） |
| 提交 | `23d1fe5b42724a5a9c0458475176d6bddfa235b1` |
| 原作 | `skills/hyperframes-animation/examples/` 的 hook-counter-burst、problem-mockup-overwhelm、concept-demo-decode-pan、workflow-approve-press、metric-video-text-pivot、cta-morph-press、brand-reveal-assemble-zoom |
| 许可 | Apache License 2.0，Copyright 2026 HeyGen, Inc.；原文见 [LICENSE.upstream.txt](LICENSE.upstream.txt)（上游仓库没有 NOTICE 文件） |
| 本样片的许可 | 幕代码随上游为 Apache-2.0；文案、标志与图标为本项目原创 |

我们改了什么（Apache-2.0 第 4 条要求说明修改）：

1. 把每个范例的 GSAP 暂停时间线改写成按帧求值的 React 幕代码（`@talkframe/scene`），不再依赖 GSAP、CDN 或 HyperFrames 运行时；每个幕文件头部写明来源与修改。
2. 七段串成一支片：钩子 → 问题 → 概念 → 流程 → 数字 → 行动 → 品牌；每段时长按《Play On》的乐句重排，关键动作落在小节与重拍上（见下表）。
3. 品牌与内容全部替换：虚构产品“听澜纪要”，标志、图标、光标自绘；原范例的产品名、HyperFrames 标志、背景视频、Pexels 素材、Google 字体都不使用。
4. 删掉运行时滤镜（模糊、drop-shadow、backdrop-filter），光晕改成径向渐变，保证导出两次渲染逐像素一致。

## 幕表

| # | 幕 | 小节 | 帧 | 原范例 | 卡点 |
| --- | --- | --- | --- | --- | --- |
| 1 | 钩子：数字炸开 | 0–1 | 0–116 | hook-counter-burst | 第 1 小节底鼓进来时揭开下半句 |
| 2 | 问题：会后一团乱 | 2–5 | 116–348 | problem-mockup-overwhelm | 第 4 小节重拍手机变成“你”；气泡按八分音符弹出；最后一拍静音时定格压暗 |
| 3 | 概念：录音变待办 | 6–9 | 348–581 | concept-demo-decode-pan | Drop A 重拍落字并解码；十六分音符打字 |
| 4 | 流程：一键分发 | 10–13 | 581–813 | workflow-approve-press | 每个小节线完成一步；第 13 小节重拍按下确认 |
| 5 | 数字：三分钟 | 14–17 | 813–1045 | metric-video-text-pivot | 间奏（无底鼓）；第 15 小节大字弹出、随拍呼吸；八分音符打字 |
| 6 | 行动：按下试用 | 18–21 | 1045–1277 | cta-morph-press | 第 20 小节变成按钮；第 21 小节第 3 拍按下、最后一拍松开 |
| 7 | 品牌：就用听澜 | 22–25 | 1277–1510 | brand-reveal-assemble-zoom | Drop B 闪白；推镜进标志；每拍一圈光环、两次高光 |

## 可改参数

每幕的画面文字都在 `meta.params`：钩子的数字、单位与下半句；三台手机里的群名、消息、录音、文档；八个问题气泡；解码词与打字句；三个步骤、纪要窗口的结论与待办（写成“人：事”）；大字与两行打字；按钮文字；品牌段的产品名、口号与小字。工作台里改字即时生效，不用改代码。

## 重做与修改

```sh
node tools/production/github-html-20261013/s121-tinglan/build.mjs   # 改 src/*.tsx 后重拼 scenes/ 与 storyboard.json
```

源文件在 `tools/production/github-html-20261013/s121-tinglan/src/`（共用库 `lib.tsx` + 每幕一个文件），改编过程、原工程在文影里的打开与批注实走记录见 `tools/production/github-html-20261013/README.md`。

## 已知限制

- 节拍写在幕代码里（`Play On` 的 124 BPM 网格）：换曲或在即时播放里调节奏后，卡点不再对齐。
- 纯配乐片按管线默认床乐音量混音（`musicVolume` 上限 0.5），即时播放与导出原始成片约 −24 LUFS；交付用的投放版另做了整体响度（−16 LUFS）。
- 只做了横版与中文；英文版需要把各幕文字参数换成英文并检查长度。

## 另一语言版本（英文，2026-10-14）

- `locales/en.json`：品牌保留拼音字标 Tinglan，七段文案改写为英文发布片口吻（90% of meeting notes go unread. / Tinglan turns talk into to-dos / Meeting ends. Notes arrive. / Just use Tinglan 等），人名用 Lin Xia、Zhou Ke、Amu；数字与日期不变。
- 为英文改了三处共用逻辑，中文路径不变：逐字动画按 `typeUnits` 取单位（含中文按字、纯西文按词），所以“数字”段一拍一词打字、品牌段一拍一词拼出，跟拍点与中文同一网格；概念段乱码字表随强调词文字切换（西文用字母）；待办“人：事”也认 “Name: task”。概念段搜索框的西文逐字打字保留空格（中文仍按原样）。中文版改前改后七个时间点的整片单帧逐字节相同，中文封面字节未变。
- 无旁白；切点与配乐《Play On》共用，英文版正文同为 50.3 秒（含片尾 55.2 秒）。概念段 23 个字符按十六分音符打完约在 6.7 秒（中文 6.3 秒），仍在本幕内。
- 审片用免费整片单帧预览抽 22 帧拼图：钩子句、八个问题气泡、窗口待办、按钮与口号都不溢出；“3 min” 与左侧卡片的交叠是原片同一时刻的设计（中文“3 分钟”同样压在卡片右缘）。英文 MP4 未导出（当月导出额度已用完，见记录）。
