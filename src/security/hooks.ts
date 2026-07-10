/*1 角色和 bash 检测解决的是"该不该执行"的问题。
  2 Hook 解决的是另一个问题：执行前后能不能插入自定义逻辑。
eg: 比如你想在每次写文件前记一条审计日志，或者在 bash 执行后自动给输出加个时间戳，
    或者在调用外部 API 前检查一下参数合规性——这些需求各不相同，但模式是一样的：在工具执行的前后插入一个钩子。
*/

export type HookAction = 'allow' | 'block' | 'modify'; //allow（放行）、block（拦截，只在 pre hook 有效）、modify（放行但修改输入/输出）

export interface HookResult {
  action: HookAction;
  reason?: string;
  modifiedInput?: unknown;
  modifiedOutput?: unknown;
}

export type PreToolHook = (toolName: string, input: unknown) => HookResult | Promise<HookResult>;
export type PostToolHook = (toolName: string, input: unknown, output: unknown) => HookResult | Promise<HookResult>;

export class HookPipeline {
  private preHooks: Array<{ name: string; fn: PreToolHook }> = [];
  private postHooks: Array<{ name: string; fn: PostToolHook }> = [];

  registerPre(name: string, fn: PreToolHook): void {
    this.preHooks.push({ name, fn });
  }

  registerPost(name: string, fn: PostToolHook): void {
    this.postHooks.push({ name, fn });
  }

  async runPre(toolName: string, input: unknown): Promise<HookResult> {
    let currentInput = input;

    for (const hook of this.preHooks) {
      try {
        const result = await hook.fn(toolName, currentInput);
        if (result.action === 'block') {
          console.log(`  [hook:${hook.name}] 拦截 ${toolName}: ${result.reason}`);
          return result;
        }
        if (result.action === 'modify' && result.modifiedInput !== undefined) {
          currentInput = result.modifiedInput;
          console.log(`  [hook:${hook.name}] 修改了 ${toolName} 的输入`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  [hook:${hook.name}] pre 异常: ${msg}`);
      }
    }

    return { action: 'allow' };
  }

  async runPost(toolName: string, input: unknown, output: unknown): Promise<HookResult> {
    let currentOutput = output;

    for (const hook of this.postHooks) {
      try {
        const result = await hook.fn(toolName, input, currentOutput);
        if (result.action === 'modify' && result.modifiedOutput !== undefined) {
          currentOutput = result.modifiedOutput;
          console.log(`  [hook:${hook.name}] 修改了 ${toolName} 的输出`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  [hook:${hook.name}] post 异常: ${msg}`);
      }
    }

    //allow（放行）
    return { action: 'allow', modifiedOutput: currentOutput };
  }

  //用于/hooks 命令查看当前注册的 pre/post hook 列表
  list(): { pre: string[]; post: string[] } {
    return {
      pre: this.preHooks.map(h => h.name),
      post: this.postHooks.map(h => h.name),
    };
  }
}