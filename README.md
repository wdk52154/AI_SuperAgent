# 项目结构说明

> 本文档基于当前 `src/` 目录的实际结构生成，用于快速了解 Super Agent 各模块的职责划分。

---

## 目录概览

```
.
├── .env                          # 环境变量配置
├── .gitignore                    # Git 忽略规则
├── .memory/                      # 项目记忆/历史文档
│   ├── MEMORY.md
│   ├── project_deploy_process.md
│   ├── project_legacy_auth_module.md
│   ├── project_old_build_config.md
│   └── user_typescript-preference.md
├── app/                          # 浏览器预览应用目录
│   ├── App.tsx
│   ├── Button.tsx
│   ├── index.html
│   └── styles.css
├── package.json                  # 项目依赖与脚本
├── pnpm-lock.yaml                # pnpm 锁定文件
├── sample-project/               # 示例项目（用于代码分析 Demo）
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── src/                          # 主源码目录
│   ├── index.ts                  # 应用入口
│   ├── mock-model.ts             # Mock 模型实现
│   ├── agent/                    # Agent Loop 相关
│   │   ├── loop.ts
│   │   ├── loop-detection.ts
│   │   └── retry.ts
│   ├── context/                  # Prompt 与上下文管理
│   │   └── prompt-builder.ts
│   ├── session/                  # 会话持久化
│   │   └── store.ts
│   └── tools/                    # 工具系统
│       ├── file-tools.ts
│       ├── index.ts
│       ├── mcp-client.ts
│       ├── registry.ts
│       ├── search-tools.ts
│       ├── shell-tools.ts
│       ├── utility-tools.ts
│       └── web-search.ts
└── tsconfig.json                 # TypeScript 配置
```

---

## `src/` 目录详解

### 入口与模型

| 文件 | 职责 |
|------|------|
| `src/index.ts` | 应用入口。负责初始化模型、注册工具、连接 MCP Server、加载/保存会话、组装 System Prompt 并启动交互式问答循环。 |
| `src/mock-model.ts` | Mock 模型实现。在没有真实 API Key 时模拟模型行为，支持天气、文件操作、网页抓取、Vibe Coding 等 Demo 场景。 |

### `src/agent/` — Agent Loop 相关

| 文件 | 职责 |
|------|------|
| `src/agent/loop.ts` | Agent 主循环。调用 `streamText`、分发文本/工具调用/工具结果事件、管理 Token 预算与最大步数。 |
| `src/agent/loop-detection.ts` | 循环检测。通过滑动窗口记录工具调用历史，检测重复调用、乒乓循环，并提供熔断机制。 |
| `src/agent/retry.ts` | 重试策略。根据错误类型判断是否可重试，并实现指数退避 + 抖动延迟。 |

### `src/context/` — Prompt 与上下文管理

| 文件 | 职责 |
|------|------|
| `src/context/prompt-builder.ts` | Prompt 构建器。使用 Pipe 模式按需组装 System Prompt，包括核心规则、工具说明、延迟工具列表、会话上下文等。 |

### `src/session/` — 会话持久化

| 文件 | 职责 |
|------|------|
| `src/session/store.ts` | 会话存储。以 JSONL 形式保存和恢复对话消息，支持 `--continue` 参数恢复上次会话。 |

### `src/tools/` — 工具系统

| 文件 | 职责 |
|------|------|
| `src/tools/registry.ts` | 工具注册表。定义 `ToolDefinition` 类型，管理内置工具与 MCP 工具，负责延迟工具发现、并发锁、Token 估算和结果截断。 |
| `src/tools/mcp-client.ts` | MCP 客户端。实现基于 stdio 的 MCP 协议通信，包括真实子进程客户端和 Mock 客户端。 |
| `src/tools/index.ts` | 工具汇总导出。集中导入并导出所有内置工具，供入口文件统一注册。 |
| `src/tools/file-tools.ts` | 文件类工具。包括 `read_file`、`write_file`、`edit_file`、`list_directory`。 |
| `src/tools/search-tools.ts` | 本地搜索工具。包括 `glob`、`grep`，用于在本地文件系统中搜索文件和文本。 |
| `src/tools/web-search.ts` | 网络搜索工具。包括 `web_search`（Tavily / Serper）、`web_fetch`，用于联网检索和抓取网页。 |
| `src/tools/shell-tools.ts` | Shell 类工具。包括 `bash`，用于执行本地 shell 命令。 |
| `src/tools/utility-tools.ts` | 通用工具。包括 `get_weather`、`calculator` 等辅助工具。 |

---

## 模块依赖关系

```
┌─────────────────┐
│   src/index.ts  │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬───────────────┐
    ▼         ▼              ▼               ▼
┌────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐
│ agent/ │ │  tools/  │ │  session/   │ │   context/   │
└────────┘ └──────────┘ └─────────────┘ └──────────────┘
    │            │
    ▼            ▼
┌────────┐  ┌──────────┐
│ mock-  │  │ MCPClient │
│ model  │  │ Registry  │
└────────┘  └──────────┘
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

> 注：本结构文档根据当前代码目录自动生成，后续新增 `memory/`、`rag/` 或 `context/` 下的压缩/防御模块时，建议同步更新此文档。
