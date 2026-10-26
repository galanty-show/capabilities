# 直接打开 Remotion、HTML 与 HyperFrames

用户工程保留自己的组织方式。文影分镜、幕模块和宿主库是新项目可选推荐，不是打开、播放或批注外部工程的前置条件。无法直接打开时先诊断原工程兼容问题；临时用它导出的视频继续批注，修复目标仍是让原工程可打开。

## Remotion

在 App 选择“打开 Remotion 工程”，或通过当前 MCP 的 `external:{dir,composition?}` 参数导入。多个 Composition 按目录选择；多入口、monorepo 和 tsconfig paths 按体检结果指定入口/允许根，以当前工具 schema 为准，不猜参数名。

库属于用户原工程。确认依赖已在项目正确安装；缺少 `@remotion/*` 时诊断所需包与原项目版本，不能假定宿主提供全部包，也不擅自替换工程的版本和锁文件。上层共享代码需要正确的仓库根，不能绕过路径或符号链接守卫。

图片、视频、字体和 CSS 都要实际加载后看结果，尤其 @fontsource 字体与相对资源。元数据能读取不代表预览或导出已加载同一字体。默认监听原目录，保存后重新编译并续播；用户明确复制时才脱离原工程。

## HTML / HyperFrames

从 App“打开 HTML 动画工程”选目录或页面；原代码、素材和子合成保留原位。HyperFrames 的子合成挂载与 clip 调度需要其运行时语义，不是把所有 HTML 片段叠起来，也不是只把几条时间线各 seek 一次。

逐项看：子合成是否出现、data-start/data-duration 显隐是否正确、连续播放与前后拖动是否一致、暂停后是否稳定。缺文件、外部 CDN 或非确定性 API 的体检只是诊断线索，不把格式提示变成拒绝正常工程的门槛。

截至本次整理的修复记录（2026-10-20），HTML/HyperFrames 原生 MP4 导出仍未完成；能打开播放不能推出能直接导出。需要交付视频时使用工程自己的导出方式，再把成片文件打开批注。文档不承诺未来版本已解决该缺口。

## 兼容边界要照实说

历史修复包括资源 loader、CSS 注入、多音轨池、错误后回拖恢复，以及 monorepo、多入口、paths 和工程自带依赖。但一份修复记录不等于所有第三方工程、渠道、系统都已验证。按当前安装版本体检，并对真实工程检查画面与声音。

新版 Remotion Sequence 的非 1× 播放仍有能力错误记录；先以 1× 核对时间轴。某个 MP3 可在原生浏览器 seek 时失败，不能笼统归因适配器；用独立音频探针区分资源问题和工程问题。详见 [技术坑](rendering-pitfalls.md)。

依据：[来源 S1、S7、S8](SOURCES.md)。本篇未下载第三方工程、未重跑历史候选包或跨系统验证。

English: Open projects in place and use their own dependency tree. Test child compositions, assets, fonts, seeks and audio. The source records still list native HTML export and some non-1× Sequence playback as limitations.
