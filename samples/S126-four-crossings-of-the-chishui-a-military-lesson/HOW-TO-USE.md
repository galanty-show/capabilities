# 怎么用 S126 源码包 / How to use this pack

## 一、在文影里打开即播放

**最快（不需要这个包）**：打开 Galanty 文影 → 样片库，搜索 `S126`，点“复制并编辑”。本机即时播放，不调用 AI。

**用这个包**（例如改过的副本、或想从官网拿最新版）：

1. 解压，把 `S126` 文件夹放进文影的工作区——官网版是 Agent 与 App 共用的工作区文件夹（Agent 接入时配置的 `DVS_WORKSPACE`）；App Store 版走本机桥时可以直接写这个文件夹的本地路径，会自动上传。
2. 在已接入文影的 Agent（Claude Code、Codex 等，接入方法见 https://galanty.cn/agents/ ）里说：

   > 用 S126 这个目录出片，先只编译给我看。

   Agent 会调用：

   ```
   make_video({codeDir: "S126", compileOnly: true})
   ```

3. 文影读取目录里的 `storyboard.json`、`settings.json`、`source.md` 和同层的 `.tsx` 画面代码，并自动使用 `narration/` 里的旁白种子（解码进本机配音缓存，不需要配音模型、不联网、不调用 AI），在你的电脑上即时播放。把返回的播放链接打开即可；满意了再让 Agent 导出 MP4。

说明：

- 旁白种子只在旁白文字、音色与语速都不变时生效；改了旁白文字，新句需要本机配音（文影会提示“改用本机配音整片重配”）。种子来源：S126 云端配音预先生成（custom-command (pregenerated cloud voice)；音色 Orus），播放不联网。
- 配乐用文影自带的曲库曲目 `library:original-sidu-chishui`，播放不需要包里的 `music/sidu-chishui.mp3`；包里这份是给你在别处使用的（许可见 CREDITS.md）。
- 目前文影工作台界面还没有“导入源码包”按钮，导入要经 Agent（MCP 工具 `make_video` 的 `codeDir`）。工作台的“粘贴分镜”只收分镜 JSON，不带画面代码。

## 二、交给 Claude Code / Codex 复做

- `prompt.json` 的 `prompt` 是九种语言的“做一支类似的”提示词：复制一种语言给接入了文影 MCP 的 Agent，它会自己写分镜和画面代码。模型输出不确定，从零生成会相似，但不会逐帧相同。
- `tools` 记录了当时用的工具与做法（Claude Code / Codex、模型、配音、配乐）。
- `rounds` 是当时给 Agent 的原话（按轮）。
- 想要几乎一模一样：让 Agent 从这支样片起步再改，而不是从零写——例如：“先 fork_template({id: "S126"}) 复制 S126，再把旁白换成我的内容，画面结构不变，先只编译给我看。”（本机没有这支样片时，用上面的 codeDir 做法。）

## 三、只看代码

- 每个 `.tsx` 默认导出一幕 React 组件（Remotion），在分镜里写 `component: {id: "scene.code", params: {module: "<文件名>", props}}` 引用。
- 依赖 `@talkframe/scene`：类型见 `types/talkframe-scene.d.ts`；`useScene`、`ease` 等是纯函数，粒子等原语由文影运行时注入（实现不公开），所以画面代码要在文影里播放或导出。
- 分镜格式与校验：Agent 可读文影 MCP 资源 `talkframe://schema/storyboard`，或 `import_storyboard({dryRun: true})` 干跑。

---

## 1. Open and play in Galanty

**Fastest (no pack needed)**: open Galanty → Samples, search for `S126` and choose "Copy and edit". It plays instantly on your Mac and calls no AI.

**With this pack**:

1. Unzip it and put the `S126` folder in your Galanty workspace — on the website version that is the folder the Agent and the app share (`DVS_WORKSPACE` in your Agent setup); with the App Store version over the local bridge, just pass the folder's local path and it is uploaded for you.
2. In an Agent connected to Galanty (Claude Code, Codex…; setup: https://galanty.cn/en/agents/), say: "Make a video from the S126 folder, compile only." It calls `make_video({codeDir: "S126", compileOnly: true})`.
3. Galanty reads `storyboard.json`, `settings.json`, `source.md` and the `.tsx` files next to them, and uses the pregenerated narration in `narration/` automatically (decoded into the local voice cache: no voice model, no network, no AI), then plays it live on your computer. Open the returned play link; ask for an MP4 export only when you are happy.

- The narration seed is used only while the narration text, voice and speed are unchanged; edited sentences need a local voice (Galanty offers to re-voice the whole film).
- The workbench has no "import source pack" button yet; import through an Agent (MCP `make_video` with `codeDir`). "Paste storyboard" in the workbench takes storyboard JSON only, without scene code.

## 2. Remake it with Claude Code or Codex

- `prompt.json` → `prompt` holds the "make one like this" prompt in nine languages. Paste one into an Agent connected to Galanty MCP. Model output varies: a fresh run comes out similar, not frame-identical.
- For a near-identical result, start from this sample instead of from scratch: e.g. "fork_template({id: "S126"}), replace the narration with my text, keep the scene structure, compile only." (Without the sample installed, use the codeDir steps above.)

## 3. Just read the code

- Each `.tsx` default-exports one scene (React / Remotion), referenced from the storyboard as `component: {id: "scene.code", params: {module: "<file name>", props}}`.
- It imports `@talkframe/scene` (types in `types/talkframe-scene.d.ts`); helpers such as `useScene` and `ease` are pure functions, while particle primitives are injected by the Galanty runtime, so the scenes play and export inside Galanty.
