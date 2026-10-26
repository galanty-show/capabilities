# 栖光 2 · 发布预告（S125 · GitHub 改编 · remocn ReleaseTeaser）

一支 16 秒的无旁白暗场发布预告，改编自 GitHub 上的 Remotion 组件库 **remocn** 的成片模板 **ReleaseTeaser**。

| 项 | 内容 |
| --- | --- |
| 原仓库 | https://github.com/Remocn/remocn （10-13 约 1.6k 星） |
| 原作文件 | `registry/remocn-templates/release-teaser/`（index.tsx、background.tsx、geometry.ts、motion.ts、scenes/statement.tsx、scenes/closing.tsx、ui.tsx） |
| 提交 | `fd2d3010a8183985553f9ddeb364313d57fb36b9` |
| 许可证 | MIT License，Copyright (c) 2026 Remocn；原文见 [LICENSE.upstream.txt](LICENSE.upstream.txt) |
| 原作者 | Remocn |

## 保留了什么（原作运动设计）

- 320° 带八条倒角边的实体圆环（96 段 × 8 面），画布逐面着色：主光随时间转动、边缘轮廓光、倒角高光；前 610 帧缓慢下移缩小，602～702 帧归位到落版位置，858～946 帧淡出（原作 `geometry.ts`、`background.tsx`、`motion.ts` 的 `ringPose`）。
- 短句从中心向两侧逐字对焦：每字透明度 + 模糊（5px→0）+ 2px 位移，离中心越远越晚（最多 7 帧），离场同理；整句 0.99→1.025 缓推（`statement.tsx` 的 `characterState`）。
- 字号按字宽估算自适应（`fitText`，中文按 1.02 字宽计），960×540 逻辑画布等比放大。
- 六段时间表：原作 59.94 fps 的 0/104/208/326/446/610/960 帧，换算到 30 fps 的整帧切点（0/52/104/163/223/305/480），见 [build.mjs](build.mjs)。
- 落版：开口圆环标志（原作自带的通用标志，非任何品牌）+ 品牌名与版本号 + 标语，32 帧内从模糊淡入，整体 0.97→1.03 缓推。

## 改了什么

- 文字改成中文，品牌改为虚构的“栖光 2”；每句文字、品牌名、版本号、标语、圆环光强都在幕代码 `meta.params` 里，工作台可直接改。
- 六段拆成六幕共用一个模块 `gh-release-teaser`（`props.shot` 选段、`props.f0` 是本幕全片起始帧），圆环按全片时钟跨幕连续转动；每幕可单独批注、定位。
- 配色读 `props.theme`（背景、正文、次要文字、强调色），播放页换配色会生效；原配色写在 `settings.theme`。
- 去掉了 `@fontsource/inter` 字体包（改用宿主字体）、logo 图片槽、remotion 的 `Interactive`/`Img` 与音频参数。
- 配乐：原作不带音乐；本片配乐 *Qiguang Teaser* 为原创（Lyria 3 Pro 生成，剪辑让全曲最强的一次起音落在落版那一帧，另用 NumPy 合成五记玻璃拨弦、落版前的反向铺底和落版冲击），随包曲库 `library:original-gh-release-teaser`，CC0。制作脚本在仓库 `tools/production/github-remotion-20261013/s125-release-teaser/`。

## 规格与限制

- 1920×1080，30 fps，正文 16.0 秒（480 帧），6 幕硬切；导出时按权益接约 4.9 秒品牌片尾。
- 无旁白、无宿主字幕；`language: "zh"`。
- 配乐重音按本片时间表剪好，换曲或改幕长后不再对齐。管线按默认床乐音量混音，纯配乐片在即时播放里听起来偏轻。
- 圆环在画布里逐帧绘制（约 770 个面），低配机器即时播放时可能掉帧，不影响导出。

## 另一语言版本（英文，2026-10-14）

- `locales/en.json`：五句短句、品牌落版与标语译成英文发布片文案（It starts with an idea. / Room to make better work. / Every detail, alive. / Go together. Go further. / A new chapter. No starting over.），品牌保留拼音字标“Qiguang 2”，标语 The next chapter starts here.；幕标题同步英文。
- 无旁白、无配音与种子；时间表、圆环与配乐重音全部共用，英文版正文同为 16.0 秒（含片尾 20.9 秒），卡点不变。
- 字号沿用 `fitText` 的字宽估算（拉丁字母按 0.63 字宽），五句都在 48 px 上限内、不换行不截断；逐字对焦按字母逐个进行。
- 封面 `covers/S125-en.webp` 与中文同一帧（7.1 秒）。已知问题：无。
