---
name: create-scene-template
description: 复制或编写 TSX 幕，验证真实内容、帧状态和确定性后登记为可复用的文影用户模板。
---

# 新建幕模板

模板是参考代码。内容改已有 props，布局与动画改 TSX；一次性幕放作品 scenes，反复用才登记。完整创作见 [doc-to-video](../doc-to-video/SKILL.md)。

1. 用 `list_templates` 找近似起点，`fork_template({id:"T07",name:"my-lantern"})` 取得副本；返回目录是本次编辑对象。新写幕先读 `get_scene_runtime`，以当前接口与 import 白名单为准。
2. 默认导出接收 SceneInput 的组件。每帧只依赖 frame/fps、句时序及确定性函数；不用真实时钟、Math.random、网络或计时器驱动导出。其他依赖由作品管理，不假定宿主已经提供。
3. 主体留在 `layout.content`，字幕带交给宿主；需要换色时读 theme，素材读 props.assets。句子动作使用 progress；纯视觉幕按固定时长驱动。共享模块只改一幕时复制为新模块并改引用。
4. meta 仅声明代码实际读取的内容参数，布局/节奏写在说明里，不靠堆控件限制创作。
5. `preview_scene` 检查开头、句中、完成态、切前；实际看 PNG，并用目标横/竖/方尺寸核对。再用真实示例内容 `make_video({storyboard,codeDir,compileOnly:true})`，等待后打开播放试听。
6. 从零创建的模板可按当前工具 schema 调用 `fork_template({register:"templates/my-lantern"})` 登记。用户 U 号按 App 分配，T 号仍指随包原件；使用本地副本显式传其 codeDir，不覆盖安装原件。
7. 记录模板与各项素材的作者、来源和许可。公开贡献按 [CONTRIBUTING](../../CONTRIBUTING.md)；源码 MIT 不会重授第三方字体、音乐或商标。

编译成功不代表画面合格；权限拒绝、超时占位或重复渲染不一致先诊断修复。停留、配色与切换频率是推荐，按作者选择制作。不要把模板约定当成已有外部视频工程的打开门槛。

English: Templates are editable reference code. Validate actual content and rendered frames, register only reusable work, and preserve the original installed templates.
