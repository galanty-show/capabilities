---
name: doc-to-video
description: 用文影 MCP 制作、打开和精调视频；已有 Remotion、HTML 或视频文件保留原工程，新作品可用分镜与 TSX 幕，先播放再按需导出。
---

# 制作与修改视频

连接方式见 [talker-mcp](../talker-mcp/SKILL.md)。先读当前 App 的 `galanty://guide`、`galanty://guide/craft`、`galanty://environment`；编排建议见 [首版交付](references/first-delivery.md)。读完整源文，分清事实、推断和创作；保留引文、数字单位和时间口径。

## 先判断输入

- **已有视频文件**：`make_video({videoFilePath:"./video.mp4"})` 打开 MP4/MOV/WebM，不重新编稿。批注后修改生成它的原工程并重新渲染到同一来源文件，稳定写入后 App 刷新续播。
- **已有 Remotion**：`import_storyboard({external:{dir:"./project",composition:"Promo"}})` 或 `make_video` 的同名参数。默认原目录是真源，修改保存后免费重新编译并回到原秒数；composition 按实际目录选择，可省略时以当前工具为准。
- **已有 HTML / HyperFrames**：从 App“打开 HTML 动画工程”直接打开目录或 HTML。保留其原始结构；体检提示供诊断。播放、拖动与批注不要求改成文影分镜。
- **新作品**：可 fork 样片、复制模板或从零写。推荐 v3-lite + `scene.code`，便于按幕句定位；它不是打开、播放、批注的门槛。

外部工程说明和限制见 [打开外部工程](../../docs/experience/external-projects.md)。缺库由用户原工程管理，不假定 App 提供任意依赖。

## 新作品的可编辑路径

1. 用 `list_templates` 找模板或样片，`fork_template({id:"S040",name:"my-film"})` 获取本地可编辑副本。编号和可用性以当前目录为准。写幕前读 `get_scene_runtime`，不猜类型、导出或 import 白名单。
2. 读 `galanty://schema/storyboard` 和 `galanty://schema/settings`。典型分镜如下，实际字段和时长规则以 schema 为准：

```json
{"contractVersion":3,"title":"我的视频","scenes":[{"id":"opening","title":"开场","narration":"先说明问题。","component":{"id":"scene.code","params":{"module":"opening","props":{}}}},{"id":"closing","title":"结尾","narration":"再给出结论。","component":{"id":"scene.code","params":{"module":"closing","props":{}}}}]}
```

3. 幕文件默认导出组件，帧由 `frame/fps`、句时序和确定性函数决定。主体放 `layout.content`，字幕带留给宿主。读 `theme` 可让用户换色；有意固定品牌或画风色时照实说明。内容改 props，布局与动画改代码；不要为已有模板不断堆参数。
4. `preview_scene({module:"opening",codeDir:"./scenes",frame:30,props:{}})` 查看单帧；再 `import_storyboard({dryRun:true,storyboard,codeDir,sourceText})` 处理 errors、理解 warnings。时长估计只是预算。
5. `make_video({requestId:"my-film-v1",storyboard,codeDir:"./scenes",sourceText,compileOnly:true})`，保存 jobId，`wait_job({jobId,timeoutMs:5000})` 等到终态；重连用 `get_job`。同一次提交用同一 requestId 去重，修改内容用 jobId 更新或新的 requestId。

示例中的 storyboard、sourceText 和 props 都要替换为真实值。工具形状以当前 App schema 为准，旧接口不可直接套用。

## 配音、素材与同步

配音先读 [配音阶梯](../../docs/experience/voice-delivery.md)：原声种子/缓存 → 用户已授权服务或可用云工具 → 适用渠道的本机神经语音 → 字幕与授权配乐。系统语音只作草稿试听，不用于成片交付；未获授权不发送旁白到收费服务。种子不能生成新句，更换主音色应统一受影响句子。

素材用 [find-assets](../find-assets/SKILL.md) 核对来源与许可后导入。有旁白时以实际音频决定时长，动作按 `progress(sentenceId)` 或 `useScene(props).cue('词')` 跟随。cue 只有成功逐字对齐时才是实测字时间，否则是估算；找不到时写兜底。纯视觉幕可以旁白留空并给固定时长。卡点片见 [beat-sync-promo](../beat-sync-promo/SKILL.md)。

## 先播放，再导出

编译完成后主动打开返回的真实 `play.url`，确认对应作品显示并从改动处看与听。没有打开能力就给链接并写明未播放；不猜端口。修改已有作品传 `focus:{atSeconds:5}` 或 sceneId，定位改后的实际时间。

用户要求 MP4 时才 `make_video({jobId,export:true})`。先转告 App 返回的导出说明、权益与计次；失败按错误处理，不绕门禁。导出后核对实际文件、尺寸、时长、音轨，抽帧并正常速度播放试听。编译成功、渲染退出码和自动报告都不能代替审看。

## 按批注修改

读 `get_job` 的可编辑目标及实际批注。`preview_scene({jobId,atSeconds:5})` 或 `{jobId,text:"关键词"}` 找位置；返回的是线索，Agent 仍需读源码。内容改分镜，画面改对应模块，外部工程改原工程。共享模块只改一幕时先复制并更新该幕引用，避免连带改动。保存后检查续播位置，必要时 `make_video({jobId,compileOnly:true,focus:{atSeconds:5}})`；旧渲染不能证明新修改。

复用已有分镜，不为小改重新编稿；按句缓存的同源配音只重配变化句。发音问题通过发音词典处理，字幕保持原文。记录改了什么、实际看/听了什么及未验项。

English: Preserve existing projects, use current MCP schemas, preview at the edited timestamp, then export only when requested. Verify the delivered video and audio rather than treating compilation as review.
