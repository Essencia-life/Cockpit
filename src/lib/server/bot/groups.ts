import { type Bot, Context, Keyboard } from 'grammy';
import { VERCEL_ENV } from '$env/static/private';
import { redis } from '$lib/server/db/redis.ts';

export const storageKey = `essencia:${VERCEL_ENV}:orgaBotConfig`;

export enum ChatType {
	Home,
	Channel,
	CarSharing,
	HomeDailyInfoThread,
	HomeWeekPlanningThread
}

export type BotConfig = {
	[chatType in keyof typeof ChatType]: number | undefined;
};

const REPLY_DAILY_INFO_THREAD = 'Daily Info Thread ID:';
const REPLY_WEEK_PLANNING_THREAD = 'Week Planning Thread ID:';

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

				await ctx.reply(`Setup for \`${VERCEL_ENV}\` environment`, {
					parse_mode: 'MarkdownV2',
					reply_markup: customKeyboard
				});
			} else {
				console.warn(`User ${ctx.from?.username} is not allowed to setup`);
			}
		});

		bot.on(':chat_shared', async (ctx) => {
			if (ctx.message?.chat_shared) {
				const { chat_id, request_id } = ctx.message.chat_shared;
				const hasBotConfig = await redis.exists(storageKey);

				if (hasBotConfig) {
					await redis.json.set(storageKey, `$.${ChatType[request_id]}`, JSON.stringify(chat_id));
				} else {
					await redis.json.set(storageKey, '$', { [ChatType[request_id]]: chat_id }, { nx: true });
				}

				if (request_id === ChatType.Home) {
					await ctx.reply(REPLY_DAILY_INFO_THREAD, {
						reply_markup: { force_reply: true }
					});
				} else {
					await ctx.reply('Saved', {
						reply_markup: { remove_keyboard: true }
					});
				}

				delete this.botConfig;
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

		bot.on('message:text', async (ctx, next) => {
			switch (ctx.message.reply_to_message?.text) {
				case REPLY_DAILY_INFO_THREAD:
					await this.storeThreadIdFromReply(ctx, ChatType.HomeDailyInfoThread);
					await ctx.reply(REPLY_WEEK_PLANNING_THREAD, {
						reply_markup: { force_reply: true }
					});
					break;
				case REPLY_WEEK_PLANNING_THREAD:
					await this.storeThreadIdFromReply(ctx, ChatType.HomeWeekPlanningThread);
					await ctx.reply(`Saved.`);
					break;
				default:
					return next();
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

	private async storeThreadIdFromReply(ctx: Context, target: ChatType) {
		const threadId = Number(ctx.message!.text);

		if (Number.isNaN(threadId)) {
			throw new Error('Not a valid thread id');
		} else {
			await redis.json.set(storageKey, `$.${ChatType[target]}`, JSON.stringify(threadId));
			delete this.botConfig;
		}
	}
}
