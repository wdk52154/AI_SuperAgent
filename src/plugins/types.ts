import { ChannelDefinition } from '../channels/types.js';
import type { ToolDefinition } from '../tools/registry.js';

export interface PluginConfig {
  [key: string]: string | number | boolean;
}

export interface PluginApi {
  registerTools(tools: ToolDefinition[]): void;
  registerChannel(channel: ChannelDefinition): void;  // 新增
  registerTelegramChannels(channels: ChannelDefinition[]): void;  // 新增
  getConfig(): PluginConfig;
  log(message: string): void;
}

export interface PluginDefinition {
  name: string;
  version: string;
  description: string;
  config?: PluginConfig;

  activate(api: PluginApi): Promise<void> | void;
  destroy?(): Promise<void> | void;
}