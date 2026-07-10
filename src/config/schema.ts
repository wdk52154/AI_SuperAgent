import { z } from 'zod';


/*  */
export const ModelConfigSchema = z.object({
  provider: z.enum(['dashscope', 'openai', 'custom']).default('dashscope'),
  name: z.string().default('qwen-plus-latest'),
  baseURL: z.string().default('https://dashscope.aliyuncs.com/compatible-mode/v1'),
  apiKey: z.string().default(''),
});

export const PluginConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.string()).default({}),
});

export const FeishuChannelConfigSchema = z.object({
  enabled: z.boolean().default(false),
  appId: z.string().default(''),
  appSecret: z.string().default(''),
  port: z.number().default(3000),
});

export const ChannelConfigSchema = z.object({
  feishu: FeishuChannelConfigSchema.default({
    enabled: false,
    appId: '',
    appSecret: '',
    port: 3000,
  }),
});

export const AgentConfigSchema = z.object({
  maxSpawnDepth: z.number().min(0).max(5).default(1),
  maxConcurrent: z.number().min(1).max(10).default(3),
  defaultTimeout: z.number().default(60000),
});

export const SecurityConfigSchema = z.object({
  defaultRole: z.string().default('developer'),
  auditLog: z.boolean().default(true),
  bashTimestamp: z.boolean().default(true),
});

export const MemoryConfigSchema = z.object({
  dataDir: z.string().default('.'),
});

export const RagConfigSchema = z.object({
  enabled: z.boolean().default(true),
  docsDir: z.string().default('docs'),
});

export const CronConfigSchema = z.object({
  enabled: z.boolean().default(true),
  dataDir: z.string().default('.'),
});

export const SessionConfigSchema = z.object({
  id: z.string().default('default'),
});

export const UsageConfigSchema = z.object({
  trackingFile: z.string().default('.usage/today.jsonl'),
});

export const SuperAgentConfigSchema = z.object({
  version: z.string().default('1.0'),
  model: ModelConfigSchema.default({
    provider: 'dashscope',
    name: 'qwen-plus-latest',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
  }),
  plugins: z.array(PluginConfigSchema).default([]),
  channels: ChannelConfigSchema.default({
    feishu: {
      enabled: false,
      appId: '',
      appSecret: '',
      port: 3000,
    },
  }),
  agents: AgentConfigSchema.default({
    maxSpawnDepth: 1,
    maxConcurrent: 3,
    defaultTimeout: 60000,
  }),
  security: SecurityConfigSchema.default({
    defaultRole: 'developer',
    auditLog: true,
    bashTimestamp: true,
  }),
  memory: MemoryConfigSchema.default({
    dataDir: '.',
  }),
  rag: RagConfigSchema.default({
    enabled: true,
    docsDir: 'docs',
  }),
  cron: CronConfigSchema.default({
    enabled: true,
    dataDir: '.',
  }),
  session: SessionConfigSchema.default({
    id: 'default',
  }),
  usage: UsageConfigSchema.default({
    trackingFile: '.usage/today.jsonl',
  }),
});

export type SuperAgentConfig = z.infer<typeof SuperAgentConfigSchema>;


/*
==========ai修复的=====
已修复 src/config/schema.ts 的 TypeScript 报错。

报错原因：

Zod v4 中，对象 Schema 调用 .default({}) 时，必须传入完整的默认对象，不能传空对象靠内部字段各自的 .default() 推断。
z.record(z.string()) 在 Zod v4 需要两个参数，应写成 z.record(z.string(), z.string())。
修复内容：

z.record(z.string()).default({}) → z.record(z.string(), z.string()).default({})
所有对象级 .default({}) 补全为对应的完整默认值
现在 src/config/schema.ts 已没有 TypeScript 报错。
*/