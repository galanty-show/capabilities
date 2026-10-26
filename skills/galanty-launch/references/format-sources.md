# 官方格式依据 / Official format sources

核对日期：2026-10-21。这里只记录技能格式依据，不把兼容格式当成已上架或跨 Agent 实测。

- [Agent Skills specification](https://agentskills.io/specification)：`SKILL.md` 使用 YAML frontmatter 与 Markdown 正文，`name`、`description` 必填；`name` 与目录匹配、最长 64 字符，description 最长 1024 字符。`references/` 用于按需材料。本技能采用这两个必填字段，未添加自定义顶层字段。
- [OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills)（[Codex skills 原入口](https://developers.openai.com/codex/skills/) 当前重定向到此）：确认必填 name/description 与渐进加载；`agents/openai.yaml` 是可选 UI/策略元数据，不是本技能的必需依赖。重复名称不会自动合并，因此工具路径保留兼容路由，不增加独立子技能目录。
- [skills.sh：Documentation](https://skills.sh/docs) 与 [CLI reference](https://skills.sh/docs/cli)：说明通过 `npx skills add <owner/repo>` 分发仓库技能。CLI 文档不是本仓库已被收录、安装成功或工具包自动复制的证据；实际安装与发布需另行验证。

The canonical entrypoint is `skills/galanty-launch/SKILL.md`. Workflow references are ordinary Markdown files without skill frontmatter, so they do not become independently discoverable skills. The toolkit entrypoint delegates to the canonical workflow for repository users.

## 维护验证 / Maintenance checks

运行 skill-creator 随附 `scripts/quick_validate.py` 检查两个入口，并检查相对链接目标存在。格式通过不证明制作行为、App 预览或交付影片已通过；三家 Agent 的真实制作走查另计。
