import { type Bot, Keyboard } from 'grammy';
import { env } from '$env/dynamic/private';
import { redis } from '$lib/server/db/redis.ts';

export const storageKey = `essencia:orga:botConfig:${env.VERCEL_ENV}`;

export enum ChatType {
	Home,
	Legacy,
	Channel,
	CarSharing
}

export type BotConfig = {
	[chatType in keyof typeof ChatType]: number;
};

export class BotGroups {
	private botConfig?: BotConfig;

	constructor(bot: Bot) {
		bot.command('setup', async (ctx) => {
			if (ctx.from!.username === 'bbuhler') {
				const customKeyboard = new Keyboard()
					.oneTime(true)
					.row(
						Keyboard.requestChat('Essência Home Group', ChatType.Home, {
							chat_is_forum: true,
							chat_is_channel: false
						})
					)
					.row(
						Keyboard.requestChat('Essência Legacy Group', ChatType.Legacy, {
							chat_is_forum: false,
							chat_is_channel: false
						})
					)
					.row(
						Keyboard.requestChat('Essência Public Channel', ChatType.Channel, {
							chat_is_channel: true
						})
					)
					.row(
						Keyboard.requestChat('Essência Car-Sharing', ChatType.CarSharing, {
							chat_is_forum: true,
							chat_is_channel: false
						})
					);

				await ctx.reply('Setup', {
					reply_markup: customKeyboard
				});
			} else {
				console.warn(`User ${ctx.from?.username} is not allowed to setup`);
			}
		});

		bot.on(':chat_shared', async (ctx) => {
			if (ctx.message?.chat_shared) {
				console.log(ctx.message.chat_shared);

				const { chat_id, request_id } = ctx.message.chat_shared;
				const hasBotConfig = await redis.exists(storageKey);

				if (hasBotConfig) {
					await redis.json.set(storageKey, `$.${ChatType[request_id]}`, JSON.stringify(chat_id));
				} else {
					await redis.json.set(storageKey, '$', { [ChatType[request_id]]: chat_id }, { nx: true });
				}

				await ctx.reply('Saved', {
					reply_markup: { remove_keyboard: true }
				});
			}
		});

		bot.on('my_chat_member', async (ctx) => {
			const { status } = ctx.myChatMember.new_chat_member;
			const [botConfig] = (await redis.json.get<[BotConfig]>(storageKey, '$')) ?? [];

			if (status === 'member' && (!botConfig || Object.values(botConfig).includes(ctx.chatId))) {
				await bot.api.leaveChat(ctx.chatId);
			}
		});
	}

	async getGroups() {
		if (!this.botConfig) {
			const [botConfig] = (await redis.json.get<[BotConfig]>(storageKey, '$')) ?? [];
			this.botConfig = botConfig;
		}

		return this.botConfig;
	}
}
