---
name: find-assets
description: 为视频查找、登记和导入有明确来源许可的图片、字体、音乐、视频与录屏，保留署名及再分发边界。
---

# 找素材

先看 App 的现有素材、`search_icons` 与 `galanty://music`。不够再查外部来源；当前具体素材页和许可页才是依据，搜索缩略图和首页不证明许可。不要把全站内容笼统写成 CC0。

1. 记录作者、具体来源页、许可版本、商用/修改/再分发范围及署名条件。用户自拍也要核查画面中的第三方内容、人物和音乐。
2. 取得完整文件，用 `import_asset({filePath,license,sourceUrl,credit,title,description})` 导入；实际必填参数以工具 schema 为准。`@galanty/mcp` 可传送本地文件；HTTP 直连先把文件放入 App 工作区。
3. 返回 assetId 后放素材槽或 clip，代码按运行时接口使用 Media/Icon。看实际画面确认出现；路径存在不代表成功入片。
4. 在 CREDITS 记来源、作者、许可、改动及授权核验范围，并落实署名。AI 素材另记生成工具和方式；不要把“AI 生成”自动等同无限制许可。

可从 Openverse、Wikimedia Commons 找逐项 CC/公有领域来源；Pexels、Pixabay、Unsplash、Mixkit 核对各自具体条款；Freesound 核对每个声音的许可；Google Fonts 核对具体字体许可和随包要求。这些只是检索入口，不能替代当次核验。

## 声音与录屏

曲库没有合适音乐时告诉用户可上传自己的曲子，或在授权范围内寻找可用音乐。`import_music({filePath})` 返回的 musicFile 可写入 settings；该入口不强制许可字段，仍须有真实权利依据。整片歌曲在 soundtrack 引用已导入音频，歌词也要有权使用。

用用户已有的系统录屏、模拟器或设备工具采集即可，不依赖私有仓库命令。确认录制范围、设备授权，避免通知、账户、个人信息入镜。代码重画 UI 时注明示意；真实录屏不自动代表所有画面可再分发。

许可未明就补核、替换或明确缺口，不能承诺公开/商用。资产提示报告不等于授权。制作与检查见 [doc-to-video](../doc-to-video/SKILL.md)。

English: Verify each asset's actual rights, provenance and attribution. Import files through MCP, then inspect the delivered picture and sound. A successful import is not a license audit.
