import { type Bot, Keyboard } from 'grammy';
import { env } from '$env/dynamic/private';
import { redis } from '$lib/server/db/redis.ts';

export const storageKey = `essencia:orga:botConfig:${env.VERCEL_ENV}`;

export enum ChatType {
	Home,
	Legacy,
	Channel,
	CarSharing,
	HomeOrganizationThread
}

export type BotConfig = {
	[chatType in keyof typeof ChatType]: number;
};

const REPLY_ORGA_THREAD = 'Organization Thread ID:';

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

				if (request_id === ChatType.Home) {
					await ctx.reply(REPLY_ORGA_THREAD, {
						reply_markup: { force_reply: true }
					});
				} else {
					await ctx.reply('Saved', {
						reply_markup: { remove_keyboard: true }
					});
				}
			}
		});

		bot.on('my_chat_member', async (ctx) => {
			const { status } = ctx.myChatMember.new_chat_member;
			const groups = await this.getGroups();

			if (status === 'member' && (!groups || !Object.values(groups).includes(ctx.chatId))) {
				console.warn(`Chat Id ${ctx.chatId} is not in the list of ${Object.values(groups!)}`);
				await bot.api.leaveChat(ctx.chatId);
			}
		});

		bot.on('message:text', async (ctx) => {
			if (!ctx.message.reply_to_message) return;

			if (ctx.message.reply_to_message.text === REPLY_ORGA_THREAD) {
				const threadId = Number(ctx.message.text);
				if (Number.isNaN(threadId)) {
					await ctx.reply('Not a valid thread id');
				} else {
					await redis.json.set(
						storageKey,
						`$.${ChatType[ChatType.HomeOrganizationThread]}`,
						JSON.stringify(threadId)
					);
					await ctx.reply(`Saved.`);
				}
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
