# 立项与出处 / Brief and sources

从用户给的仓库、README、截图或网址出发，提取观众应记住的一个主张和少量证据。截图可用于理解界面；最终用 TSX 重建有代表性的界面，不直接拼截图做整片。先读用户材料，缺失信息用中性文案或明确标注的概念演示，不编造产品能力。

Start with the user's evidence. Choose one central claim and a small set of supporting facts; reconstruct representative UI in code.

## 来源账本 / Evidence ledger

在工程已有产品说明或来源文件中保留：主张、原文位置（仓库文件与章节/提交、文档页或 URL）、支持范围、必要限制、画面表达。对会变化的版本、价格、性能、安装命令打开当前官方来源核对。来源可读且确实支持主张，才写成事实；实现推断、创意口号与用户待确认信息分别标明。

- 数字必须有单位、口径与出处；性能数字还需测试条件。没有实测就不写速度、吞吐量或“节省 N%”。
- 分类计数使用明确列举；真实时序数据才能支撑增长曲线。真实历史节点带日期与来源，选取旧节点不能称“最新”；明确标注的工作流步骤轴可以用 STEP 01/02/03，不编造历史日期。
- 网格中的窗口数只是画面规模；示意负载标“示意 / illustrative”，不能当并发上限或性能成绩。
- 核对品牌资产授权。第三方名称只用于准确归属；独立研究注明非官方，不放客户墙、合作徽章或“官方推荐”暗示背书。原创标记不要冒充官方 Logo。
- 命令必须确实属于产品；片中展示不授权执行安装。来源没有命令时可省略，不按产品名臆造 CLI。

## 写入 brief / Author the brief

先读工程的 `brief.json` 与 `scenes/types.ts`，沿用当前 schema。`demoLabel` 用于明确标注虚构示例；`terminalLines`、`codeCaption`、`gridItemLabel`、`revealCaption`、`timelineCaption` 等可选字段控制画面细节。换产品时逐项核对，避免沿用上一产品的硬编码能力或演示文字。工具包的最小数据形式：

```json
{
  "productName": "Your product",
  "tagline": "A clear next step.",
  "sellingPoints": [
    {"text": "A verified benefit", "source": "docs/product.md#benefit"}
  ],
  "palette": {"background": "#080c14", "foreground": "#f2f5fc", "accent": "#adf58b"},
  "musicStyle": "electronic",
  "seed": 105,
  "durationSeconds": 30
}
```

`metric` 需正有限 `value`、非空 `label`、非空 `source`；`milestones` 每项需 `date`、`label`、`source`。当前 `scale` 接受 2–36 个窗口与示意标签。验证器只验证结构和引用存在，不会判断真假。虚构演示产品要在说明中明确虚构；不要给它套真实品牌的事实。

Read and verify sources yourself: schema validation cannot establish truth, permission, measurement quality or endorsement. 保存后更新计划并立即预览改动秒数；入口中的固定循环同样适用于文案修改。
