# S125 · 栖光 2 · 发布预告

栖光 2 · 发布预告：可交给自己的 Agent 阅读、修改的样片源码与制作记录。

Qiguang 2 · Release Teaser: sample source and production notes for your own Agent.

## 打开与修改 / Open and edit

1. 下载 [完整源码 ZIP](https://github.com/galanty-show/capabilities/releases/download/samples-2026.10.21/S125.zip)（发布 tag 由维护者确定；发布前链接为占位）。解压后得到 `S125/`，包含原始幕代码、分镜、旁白、可再分发配乐及图片。
2. 用文影的“打开工程”选择解压目录，或把目录交给自己的 Agent，通过 `@galanty/mcp` 连接正在运行的文影，调用 `make_video({codeDir: "<解压目录>"})`，等待完成后打开返回的播放入口。连接配置从 App 复制。
3. 播放、标注，把批注交给 Agent 修改源码，再回到原秒数预览。普通视频文件与其他源码工程同样可打开、播放和标注，无需改写为本片格式。

Download the complete ZIP, extract it, then open its folder in Galanty or ask your Agent to use `make_video({codeDir})` through `@galanty/mcp`. Review, annotate, edit and return to the same second.

## Git 与 Release

Git 只保留文本。内联图片、字体、音视频在此镜像中替换为 `release-assets/<SHA-256>.<扩展名>` 引用，映射见 manifest.json；这些引用不是已附媒体。**要播放或导出，请使用完整 ZIP 内的原始代码与媒体**。ZIP 由现有 sample-packs 打包器原样生成，Git 镜像不另造媒体包。

多语言分镜见对应语言子目录；让 Agent 使用对应分镜与设定，并保留根目录幕代码和旁白种子。配乐的授权、未附素材与生成工具见 [CREDITS.md](CREDITS.md)、[manifest.json](manifest.json) 和 [MAKING.md](MAKING.md)。

代码许可：MIT（含上游原文）；内容与新增制作说明：CC BY 4.0，第三方素材以 CREDITS 为准。
