import { PluginDefinition,PluginApi } from "./types";


//Telegram 就是一个国外的即时聊天工具，跟微信、飞书是同类的东西
export const telegramPlugin: PluginDefinition = {
  name: 'telegram',
  version: '1.0.0',
  description: 'Telegram Bot 通道',

  activate(api: PluginApi) {
    // const channel = new TelegramChannel({
    //   botToken: api.getConfig().botToken as string,
    // });
    // api.registerChannel(channel);
    // api.log('Telegram 通道已注册');
  },
};