# 项目结构说明

> 本文档基于当前 `src/` 目录的实际结构生成，用于快速了解 Super Agent 各模块的职责划分。
>
> 当前版本：v0.19 — 已集成 Sub-Agent 子代理、Cron 定时任务、Channel 多通道、权限与 Hook 管线等能力。

---

## 目录概览

```
.
├── .env                          # 环境变量配置
├── .gitignore                    # Git 忽略规则
├── .memory/                      # 项目记忆/历史文档
│   ├── MEMORY.md
│   ├── project_db-caution.md
│   └── user_typescript-preference.md
├── .sessions/                    # 会话持久化存储（JSONL）
├── .usage/                       # Token 与成本追踪日志
├── app/                          # 浏览器预览应用目录
│   ├── App.tsx
│   ├── Button.tsx
│   ├── index.html
│   └── styles.css
├── docs/                         # 项目文档与知识库素材
│   ├── api_design.md
│   └── deployment-guide.md
├── package.json                  # 项目依赖与脚本
├── pnpm-lock.yaml                # pnpm 锁定文件
├── pnpm-workspace.yaml           # pnpm 工作区配置
├── sample-project/               # 示例项目（用于代码分析 Demo）
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── src/                          # 主源码目录
│   ├── index.ts                  # 应用入口
│   ├── mock-model.ts             # Mock 模型实现
│   ├── agent/                    # Agent Loop 相关
│   ├── agents/                   # Sub-Agent 子代理机制
│   ├── channels/                 # 多通道接入（飞书等）
│   ├── commands/                 # 终端快捷命令
│   ├── context/                  # Prompt 与上下文管理
│   ├── cron/                     # 定时任务系统
│   ├── memory/                   # 记忆持久化与整理
│   ├── plugins/                  # 插件架构
│   ├── rag/                      # RAG 检索增强生成
│   ├── security/                 # 权限、Hook 与风险检测
│   ├── session/                  # 会话持久化
│   ├── skills/                   # 领域知识 Skill
│   ├── tools/                    # 工具系统
│   └── usage/                    # Prompt Cache 与成本追踪
├── knowledge.db                  # SQLite 知识库（本地生成，不提交 Git）
└── tsconfig.json                 # TypeScript 配置
```

---

## `src/` 目录详解

### 入口与模型

| 文件 | 职责 |
|------|------|
| `src/index.ts` | 应用入口。负责初始化模型、注册工具、连接 MCP Server、加载/保存会话、组装 System Prompt、启动 Channel 网关、Cron 服务以及交互式问答循环。 |
| `src/mock-model.ts` | Mock 模型实现。在没有真实 API Key 时模拟模型行为，支持天气、文件操作、网页抓取、Vibe Coding 等 Demo 场景。 |

### `src/agent/` — Agent Loop 相关

| 文件 | 职责 |
|------|------|
| `src/agent/loop.ts` | Agent 主循环。调用 `streamText`、分发文本/工具调用/工具结果事件、管理 Token 预算与最大步数。 |
| `src/agent/loop-detection.ts` | 循环检测。通过滑动窗口记录工具调用历史，检测重复调用、乒乓循环，并提供熔断机制。 |
| `src/agent/retry.ts` | 重试策略。根据错误类型判断是否可重试，并实现指数退避 + 抖动延迟。 |

### `src/agents/` — Sub-Agent 子代理机制

| 文件 | 职责 |
|------|------|
| `src/agents/types.ts` | 子代理类型与默认配置。定义 `SubAgentConfig`、`SpawnRequest`、`SubAgentRun` 等类型，默认最大嵌套深度 1、最大并发 3、超时 60s。 |
| `src/agents/registry.ts` | 子代理注册表。管理所有子代理运行记录，提供 ID 生成、深度与并发检查、状态流转（running/completed/error/timeout）查询。 |
| `src/agents/spawn.ts` | 子代理执行引擎。实现 `spawnAgent` 单任务执行与 `spawnParallel` 并行派发，支持独立上下文、彩色日志标签、最大 30 步、超时熔断及部分结果返回。 |

### `src/channels/` — 多通道接入

| 文件 | 职责 |
|------|------|
| `src/channels/gateway.ts` | Channel 网关。统一管理多个消息通道的生命周期与消息分发。 |
| `src/channels/feishu.ts` | 飞书通道。基于 Hono 提供 Webhook 接入，让 Agent 可以"活在"飞书群里。 |
| `src/channels/types.ts` | Channel 抽象类型定义。 |

### `src/commands/` — 终端快捷命令

| 文件 | 职责 |
|------|------|
| `src/commands/index.ts` | 命令调度器。集中注册并分发所有 `/` 开头的快捷命令。 |
| `src/commands/channel.ts` | `/channel` 相关命令：查看、启动、停止通道。 |
| `src/commands/context.ts` | `/context` 相关命令：查看上下文视图、压缩状态。 |
| `src/commands/cron.ts` | `/cron` 相关命令：查看定时任务与执行日志。 |
| `src/commands/debug.ts` | `/debug` 调试命令。 |
| `src/commands/dream.ts` | `/dream` 命令：触发记忆自动整理。 |
| `src/commands/memory.ts` | `/memory` 相关命令：终端里管理记忆。 |
| `src/commands/plugin.ts` | `/plugin` 相关命令：加载、卸载、查看插件。 |
| `src/commands/rag.ts` | `/rag` 相关命令：管理知识库。 |
| `src/commands/security.ts` | `/role`、`/hooks` 等安全与 Hook 相关命令。 |
| `src/commands/skill.ts` | `/skill` 相关命令：查看与激活 Skill。 |
| `src/commands/agents.ts` | `/agents` 命令：查看子 Agent 运行记录、活跃数、最大深度与并发配置。 |

### `src/context/` — Prompt 与上下文管理

| 文件 | 职责 |
|------|------|
| `src/context/prompt-builder.ts` | Prompt 构建器。使用 Pipe 模式按需组装 System Prompt，包括核心规则、工具说明、延迟工具列表、会话上下文等。 |
| `src/context/prompt-pipes.ts` | Prompt Pipe 具体实现。定义 `memoryContext`、`ragContext` 等动静分界线 Pipe。 |
| `src/context/compressor.ts` | 上下文压缩。提供 `estimateTokens`、`microcompact`、`summarize` 等三层即时防线能力。 |
| `src/context/defense.ts` | 上下文防御。Token 估算、工具截断与 TTL 修剪等防线实现。 |
| `src/context/view.ts` | 上下文视图。构建并渲染上下文快照、用量视图。 |

### `src/cron/` — 定时任务系统

| 文件 | 职责 |
|------|------|
| `src/cron/service.ts` | Cron 服务。加载、调度、执行定时任务，支持让 Agent 自动运行。 |
| `src/cron/parser.ts` | Cron 表达式解析。 |
| `src/cron/store.ts` | 定时任务持久化存储。 |
| `src/cron/type.ts` | 定时任务类型定义。 |

### `src/memory/` — 记忆持久化与整理

| 文件 | 职责 |
|------|------|
| `src/memory/store.ts` | 记忆存储。基于本地文件系统的记忆读写与 TTL 管理。 |
| `src/memory/search.ts` | 记忆检索。 |
| `src/memory/validator.ts` | 记忆校验（lint 体检）。 |

### `src/plugins/` — 插件架构

| 文件 | 职责 |
|------|------|
| `src/plugins/manager.ts` | 插件管理器。负责插件的加载、卸载与工具注册。 |
| `src/plugins/types.ts` | 插件类型定义。 |
| `src/plugins/supabase-plugin.ts` | Supabase 插件示例。 |
| `src/plugins/telegram-plugin.ts` | Telegram 插件示例（预留扩展）。 |

### `src/rag/` — 检索增强生成

| 文件 | 职责 |
|------|------|
| `src/rag/store.ts` | 向量存储抽象。 |
| `src/rag/sqlite-store.ts` | SQLite + `sqlite-vec` 向量存储实现。 |
| `src/rag/embedder.ts` | Embedding 生成（DashScope / Mock）。 |
| `src/rag/chunker.ts` | 文档分块。 |
| `src/rag/search.ts` | sqlite-vec + BM25 混合检索。 |

### `src/security/` — 权限、Hook 与风险检测

| 文件 | 职责 |
|------|------|
| `src/security/roles.ts` | 三级角色权限：admin / editor / viewer。 |
| `src/security/bash-classifier.ts` | Bash 命令风险检测。 |
| `src/security/hooks.ts` | Hook 管线。支持 pre/post 工具调用钩子，用于审计、改写、拦截等。 |

### `src/session/` — 会话持久化

| 文件 | 职责 |
|------|------|
| `src/session/store.ts` | 会话存储。以 JSONL 形式保存和恢复对话消息，支持 `--continue` 参数恢复上次会话。 |

### `src/skills/` — 领域知识 Skill

| 文件 | 职责 |
|------|------|
| `src/skills/loader.ts` | Skill 加载器。读取本地 Skill 目录，为 Agent 注入领域知识。 |

### `src/tools/` — 工具系统

| 文件 | 职责 |
|------|------|
| `src/tools/registry.ts` | 工具注册表。定义 `ToolDefinition` 类型，管理内置工具与 MCP 工具，负责延迟工具发现、并发锁、Token 估算、结果截断及角色权限。 |
| `src/tools/mcp-client.ts` | MCP 客户端。实现基于 stdio 的 MCP 协议通信，包括真实子进程客户端和 Mock 客户端。 |
| `src/tools/index.ts` | 工具汇总导出。集中导入并导出所有内置工具，供入口文件统一注册。 |
| `src/tools/file-tools.ts` | 文件类工具。包括 `read_file`、`write_file`、`edit_file`、`list_directory`。 |
| `src/tools/search-tools.ts` | 本地搜索工具。包括 `glob`、`grep`，用于在本地文件系统中搜索文件和文本。 |
| `src/tools/web-search.ts` | 网络搜索工具。包括 `web_search`（Tavily / Serper）、`web_fetch`，用于联网检索和抓取网页。 |
| `src/tools/shell-tools.ts` | Shell 类工具。包括 `bash`，用于执行本地 shell 命令。 |
| `src/tools/utility-tools.ts` | 通用工具。包括 `get_weather`、`calculator` 等辅助工具。 |
| `src/tools/tool-search.ts` | 工具搜索。解决"工具太多模型选不准"的问题。 |
| `src/tools/memory-tools.ts` | 记忆类工具。供 Agent 读取、写入、搜索记忆。 |
| `src/tools/rag-tools.ts` | RAG 类工具。供 Agent 检索知识库。 |
| `src/tools/cron-tools.ts` | Cron 类工具。供 Agent 创建、删除、查看定时任务。 |
| `src/tools/spawn-tools.ts` | 子代理工具。提供 `spawn_agent`，支持派发单个子 Agent 或并行派发多个子 Agent 执行任务。 |

### `src/usage/` — Prompt Cache 与成本追踪

| 文件 | 职责 |
|------|------|
| `src/usage/tracker.ts` | 用量追踪。记录 Token 消耗、Prompt Cache 命中与成本估算。 |

---

## 模块依赖关系

```
┌─────────────────┐
│   src/index.ts  │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬───────────────┬──────────────┬─────────────┐
    ▼         ▼              ▼               ▼              ▼             ▼
┌────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────┐ ┌──────────┐
│ agent/ │ │  tools/  │ │  session/   │ │   context/   │ │ cron/  │ │ channels/│
└────────┘ └──────────┘ └─────────────┘ └──────────────┘ └────────┘ └──────────┘
    │            │              │              │                │
    ▼            ▼              ▼              ▼                ▼
┌────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐  ┌──────────────┐
│ mock-  │  │ MCPClient│  │ memory/   │  │  security/  │  │   plugins/   │
│ model  │  │ Registry │  │ rag/      │  │  skills/    │  │   usage/     │
└────────┘  └──────────┘  └───────────┘  └─────────────┘  └──────────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │   agents/     │
                          │  Sub-Agent    │
                          └───────────────┘
```

---

## 常用脚本

```bash
# 直接运行
pnpm start

# 恢复上次会话继续对话
pnpm run continue
```

---

## 快捷命令

运行 `pnpm start` 后，在终端中可使用以下 `/` 命令：

| 命令 | 说明 |
|------|------|
| `/role [admin\|editor\|viewer]` | 查看或切换当前角色 |
| `/hooks` | 查看 Hook 管线状态 |
| `/memory ...` | 管理记忆 |
| `/rag ...` | 管理知识库 |
| `/dream` | 触发记忆自动整理 |
| `/skill ...` | 查看与激活 Skill |
| `/plugin ...` | 加载、卸载、查看插件 |
| `/channel ...` | 管理消息通道 |
| `/cron` / `/cron logs` | 查看定时任务与执行日志 |
| `/agents` | 查看子 Agent 运行记录与并发/深度配置 |
| `/context` | 查看上下文视图 |
| `/debug` | 调试信息 |

---

> 注：本结构文档根据当前代码目录生成。新增模块或命令时，建议同步更新此文档。
