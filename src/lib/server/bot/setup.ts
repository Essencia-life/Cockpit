import { Keyboard, type Bot } from "grammy";
import { redis } from "../db/redis";
import { ChatType, storageKey, type BotConfig } from "./utils";

export default function (bot: Bot) {
    bot.command('setup', ctx => {
        if (ctx.from!.username === 'bbuhler') {
            const customKeyboard = new Keyboard()
                .oneTime(true)
                .row(Keyboard.requestChat('Essência Home Group', ChatType.Home, {
                    chat_is_forum: true,
                    chat_is_channel: false,
                }))
                .row(Keyboard.requestChat('Essência Legacy Group', ChatType.Legacy, {
                    chat_is_forum: false,
                    chat_is_channel: false,
                }))
                .row(Keyboard.requestChat('Essência Public Channel', ChatType.Channel, {
                    chat_is_channel: true,
                }));

            ctx.reply('Setup', {
                reply_markup: customKeyboard,
            });
        } else {
            console.warn(`User ${ctx.from?.username} is not allowed to setup`);
        }
    });

    bot.on(':chat_shared', async ctx => {
        if (ctx.message?.chat_shared) {
            console.log(ctx.message.chat_shared);

            const { chat_id, request_id } = ctx.message.chat_shared;
            const hasBotConfig = await redis.exists(storageKey);

            if (hasBotConfig) {
                await redis.json.set(storageKey, `\$.${ChatType[request_id]}`, JSON.stringify(chat_id));
            } else {
                await redis.json.set(storageKey, '$', { [ChatType[request_id]]: chat_id }, { nx: true });
            }

            ctx.reply('Saved', {
                reply_markup: { remove_keyboard: true },
            });
        }
    });

    bot.on('my_chat_member', async ctx => {
        const { status } = ctx.myChatMember.new_chat_member;
        const [botConfig] = await redis.json.get<[BotConfig]>(storageKey, '$') ?? [];

        if (status === 'member' && (!botConfig || botConfig.Home !== ctx.chatId && botConfig.Legacy !== ctx.chatId && botConfig.Channel !== ctx.chatId)) {
            await bot.api.leaveChat(ctx.chatId);
        }
    });
}