---
name: talker-mcp
description: 连接文影 Galanty 的本机 MCP，读取当前工具与资源、传送工程文件和取回产物；用于制作与修改视频。
---

# 连接文影 MCP

打开已安装的文影 App，在设置的 Agent 连接区复制完整配置。stdio 客户端使用 Node.js 20+ 和 `@galanty/mcp`：

```json
{"command":"npx","args":["-y","@galanty/mcp"]}
```

以上只是启动形状，认证和连接参数以 App 给出的完整配置为准。口令只保存在用户本机配置或环境变量中，不放进工程、提示词记录或公开日志。支持 HTTP MCP 的客户端也可按 App 配置直连。

桥转发 App 的工具、资源和提示，不另创制作接口。连接后先读 `galanty://guide`、`galanty://guide/craft` 和 `galanty://environment`；工具参数以当前会话的输入 schema 为准。制作见 [doc-to-video](../doc-to-video/SKILL.md)。

桥能上传带路径注解的本地 `codeDir`、`filePath` 等文件，下载产物到当前 Agent 目录的 `galanty-out/`，可用 `--out` 或 `GALANTY_OUT_DIR` 改位置。HTTP 直连使用 App 工作区内的文件。内置目录路径是 App 的元数据，先用 `fork_template` 获取可编辑副本；不要直接修改安装包。

```sh
npx -y @galanty/mcp --version
npx -y @galanty/mcp --check
```

`--check` 检查发现 App，不证明认证成功或真实制作可用。不要猜端口；连接失败先打开 App、更新其配置，再根据实际错误处理。

## 交付失败

作品状态和文件下载分别核对。`artifactDelivery.ok:false` 表示本地交付未完成，即使 App 已渲染成功。按返回的重试参数调用 `get_job({jobId,detail:true})` 取回已有文件，不要为下载重新导出。没有 jobId 时，可把返回的交付 JSON 保存到本地后运行：

```sh
npx -y @galanty/mcp --retry-delivery ./delivery.json --out ./galanty-out
```

重试下载不会重新渲染或消耗导出次数。下载不证明 App 已打开、视频已播放或声音已试听；分别报告这些事实。

English: Connect through the running app's configuration. The bridge transfers local files and exposes the app's current tools; retry failed downloads without exporting again.
