# Frame-based work builder

从已确定的整数帧切点生成可编辑的 v3-lite 分镜、settings 与素材清单。改编自 lab 宣传片的共享 helper，不依赖私有引擎或第三方包；运行需要支持 ESM 的 Node.js。它只写制作输入，不编稿、不配音、不导入素材、不渲染或导出。

```js
import {buildWork} from './work-lib.mjs';
const result = buildWork('./generated-work',
  {title:'My film', module:'promo'},
  [{id:'intro', title:'Intro', from:0, to:120},
   {id:'close', title:'Close', from:120, to:180, props:{title:'Thank you'}}],
  {width:1920, height:1080}, {fps:30});
console.log(result.totalFrames); // 180
```

从可找到 work-lib.mjs 的脚本导入，调整相对路径。输出目录单独放在用户工作目录中，不覆盖已有作品；重复调用会更新其中 `storyboard.json`、`settings.json`、`assets.json`。本工具不生成 `promo.tsx`，幕代码须由作者自己提供。

素材可放 `<work>/assets/`，每幕用 `assets:{slot:'relative-file.png'}`。此时 meta 必须提供真实 license 和 credit；工具只要求非空，不证明权利已核实。所有素材目前共用该声明；多来源作品先分别登记或扩展清单，不能用一个许可覆盖全部。文件必须真实存在且不通过符号链接逃逸该目录。

`assets.json` 的 id 是内容哈希占位值，重复内容只登记一次。先经 App MCP `import_asset` 取得真实 assetId，再替换分镜中对应 id，才可提交制作；不能把占位 id 当作已导入。可用 `@galanty/mcp` 传送文件，见 [MCP 技能](../../skills/talker-mcp/SKILL.md)。

`secondsFor(frames,fps)` 针对 `ceil(seconds*fps)` 的固定幕舍入，保留微小余量避免多一帧，不做四位小数截断。若使用其他渲染器，先核对其时长规则。生成 v3-lite settings 时支持 24/25/30 fps；通用 secondsFor 换算可单独用于其他正整数帧率。幕范围须从 0 连续覆盖，帧切点由作者决定，工具不设审美节奏门禁。

```sh
node --test tools/work-builder/work-lib.test.mjs
```

测试覆盖实际帧数、重复输入、素材去重、缺许可与越界。完整成片仍需在实际 App 中校验、播放和按需导出；这些单测不证明画面和声音已经审看。

English: Generate reproducible storyboard inputs from contiguous integer-frame ranges. Bring your own scene code, register media through MCP, replace placeholder IDs, and validate playback before exporting.
