import { type Bot, InlineKeyboard } from 'grammy';
import { type BotConfig, type BotGroups } from '$lib/server/bot/groups.ts';
import calendar, { type CalendarEvent } from '$lib/server/calendar';
import weekPlan, {
	formatLunch,
	formatLunchCleaning,
	formatMorningPractise,
	parseTelegramUser,
	type EventPrivateProps,
	type EventPrivatePropsLunch,
	type EventPrivatePropsPractise,
	type WeekPlanDuty,
	type WeekPlanType
} from '../week-plan';
import type { TelegramUser } from '$lib/server/users.ts';

export class WeekPlanBot {
	constructor(
		private readonly bot: Bot,
		private readonly botGroups: BotGroups
	) {
		const morningPractiseReply = 'Please let me know what morning practise you want to offer.';

		bot.callbackQuery(
			/^plan:(?<date>\d{4}-\d{2}-\d{2}):(?<messageId>\d+):(?<task>\w+)$/,
			async (ctx) => {
				if (typeof ctx.match === 'object' && 'groups' in ctx.match) {
					const date = new Date(ctx.match.groups!.date);
					const messageId = parseInt(ctx.match.groups!.messageId);
					const task = ctx.match.groups!.task as WeekPlanDuty;
					const user = ctx.from!;

					console.info('Received week-plan callbackQuery', { messageId, date, task, user });

					let [event] = await weekPlan.getDay(
						task === 'facilitator' ? 'morning-practise' : 'lunch',
						date
					);
					const previousValue = parseTelegramUser(event?.extendedProperties?.private?.[task]);

					if (previousValue) {
						if (previousValue.id !== user.id) {
							console.info(
								`Can not sign ${user.first_name} as ${task} is already taken by ${previousValue.first_name}`
							);

							await this.updateWeekPlanDay(messageId, event);
							return ctx.answerCallbackQuery({
								show_alert: true,
								text: `This job is already taken by ${previousValue.first_name}. If you want to takeover please ask them to remove themself by tapping this button again.`
							});
						} else {
							console.info(`Remove ${previousValue.first_name} from ${task}`);

							event = await weekPlan.removeFromDuty(event, task);

							await this.updateWeekPlanDay(messageId, event);
							return ctx.answerCallbackQuery({ text: '❎ you removed yourself' });
						}
					}

					if (event) {
						console.info('Update existing event');

						event = await weekPlan.updateDuty(event, {
							[task]: JSON.stringify(user)
						});
					} else {
						console.info('Create new event');

						event = await weekPlan.insetLunch(date, {
							[task]: JSON.stringify(user)
						});
					}

					await this.updateWeekPlanDay(messageId, event);
					return ctx.answerCallbackQuery({ text: "✅ you've signed up" });
				}
			}
		);

		bot.command('start', async (ctx) => {
			const match = ctx.match.match(/^practise_(?<date>\d{4}-\d{2}-\d{2})_(?<messageId>\d+)$/);

			if (match !== null && 'groups' in match) {
				const date = new Date(match.groups!.date);
				const messageId = parseInt(match.groups!.messageId);
				const user = ctx.from!;

				console.info('Save facilitator', { messageId, date, user });

				let [event] = await weekPlan.getDay('morning-practise', date);

				const previousValue = parseTelegramUser(event?.extendedProperties?.private?.facilitator);
				if (previousValue && previousValue.id !== user.id) {
					console.info(
						`Can not sign ${user.first_name} as facilitator is already taken by ${previousValue.first_name}`
					);

					await this.updateWeekPlanDay(messageId, event);
					return ctx.reply(
						`This job is already taken by ${previousValue.first_name}. If you want to takeover please ask them to remove themself by tapping the button again.`
					);
				}

				if (event) {
					event = await weekPlan.updateDuty(event, {
						facilitator: JSON.stringify(user)
					});
				} else {
					event = await weekPlan.insertPractise(date, {
						facilitator: JSON.stringify(user)
					});
				}

				await ctx.reply(`${morningPractiseReply}\n\n#${event.id}_${messageId}`, {
					reply_markup: { force_reply: true }
				});
			}
		});

		bot.on('message:text', async (ctx, next) => {
			if (
				!ctx.message.reply_to_message?.text ||
				!ctx.message.reply_to_message.text.startsWith(morningPractiseReply)
			)
				return next();

			const [, eventId, messageIdStr] =
				ctx.message.reply_to_message.text.match(/#(\w+)_(\d+)/) ?? [];
			const messageId = parseInt(messageIdStr);
			const practise = ctx.message.text;

			let event = await calendar.getEvent(eventId);

			console.info('Save practise', { messageId, eventId, practise });

			event = await weekPlan.updateDuty(event, { practise });

			await this.updateWeekPlanDay(messageId, event);
			await ctx.react('👍');
		});
	}

	public async sendWeekPlan() {
		const groups = await this.getGroups();

		const today = new Date();
		const weekDutyStart = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate() - today.getDay() + 1
		);

		console.info('Sending week plan starting from', weekDutyStart);

		let firstMessage;
		for (let i = 0; i < 5; i++) {
			const date = new Date(
				weekDutyStart.getFullYear(),
				weekDutyStart.getMonth(),
				weekDutyStart.getDate() + i
			);

			const message = await this.bot.api.sendMessage(groups.Home, formatDayPlan(date), {
				message_thread_id: groups.HomeWeekPlanningThread,
				parse_mode: 'HTML'
			});
			const dateStr = date.toISOString().substring(0, 10);

			await this.bot.api.editMessageReplyMarkup(groups.Home, message.message_id, {
				reply_markup: buildDayPlanKeyboard(dateStr, message.message_id)
			});

			if (i === 0) {
				firstMessage = message;
			}
		}

		await this.bot.api.sendMessage(
			groups.Home,
			'✍️ Please sign up for the upcoming week before the Monday morning planning meeting by tapping one of the buttons.',
			{
				message_thread_id: groups.HomeWeekPlanningThread,
				reply_parameters: {
					message_id: firstMessage?.message_id
				}
			}
		);
	}

	public async updateWeekPlanDay(messageId: number, event: CalendarEvent) {
		const groups = await this.getGroups();
		const date = new Date(event.start!.dateTime!);
		date.setHours(0, 0, 0, 0);

		const dateStr = date.toISOString().substring(0, 10);
		const { lunchProps, practiseProps } = await getDayPlanProps(date, event);

		try {
			await this.bot.api.editMessageText(
				groups.Home,
				messageId,
				formatDayPlan(date, lunchProps, practiseProps),
				{
					parse_mode: 'HTML',
					reply_markup: buildDayPlanKeyboard(dateStr, messageId, lunchProps, practiseProps)
				}
			);
		} catch (err) {
			console.warn(err);
		}
	}

	private async getGroups(): Promise<MakeRequired<BotConfig, 'Home' | 'HomeWeekPlanningThread'>> {
		const groups = await this.botGroups.getGroups();

		if (!groups || !groups.Home || !groups.HomeWeekPlanningThread) {
			throw new Error('Missing configuration');
		}

		return groups;
	}
}

async function fetchEventProps<T extends EventPrivateProps>(type: WeekPlanType, date: Date) {
	const [event] = await weekPlan.getDay(type, date);
	return event?.extendedProperties?.private as T | undefined;
}

async function getDayPlanProps(date: Date, event?: CalendarEvent) {
	let lunchProps: EventPrivatePropsLunch | undefined;
	let practiseProps: EventPrivatePropsPractise | undefined;

	const privateProps = event?.extendedProperties?.private as EventPrivateProps | undefined;

	if (privateProps?.type === 'lunch') {
		lunchProps = privateProps;
	} else if (privateProps?.type === 'morning-practise') {
		practiseProps = privateProps;
	}

	lunchProps ||= await fetchEventProps('lunch', date);
	practiseProps ||= await fetchEventProps('morning-practise', date);

	return { lunchProps, practiseProps };
}

function formatDayPlan(
	date: Date,
	lunchProps?: EventPrivatePropsLunch,
	practiseProps?: EventPrivatePropsPractise
) {
	return `<b>${date.toLocaleDateString('en', { weekday: 'long' })}</b> / ${date.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'numeric' })}

<u>Morning Practise</u>
🤸 ${formatMorningPractise(practiseProps)}

<u>Lunch</u>
🧑‍🍳 ${formatLunch(lunchProps)}

<u>Lunch Cleaning</u>
🧽 ${formatLunchCleaning(lunchProps)}`;
}

function buildDayPlanKeyboard(
	dateStr: string,
	messageId: number,
	lunchProps?: EventPrivatePropsLunch,
	practiseProps?: EventPrivatePropsPractise
) {
	const key = (task: string) => `plan:${dateStr}:${messageId}:${task}`;
	const check = (user?: TelegramUser) => (user ? '✅ ' : '');

	const chef = lunchProps && parseTelegramUser(lunchProps.chef);
	const chef2 = lunchProps && parseTelegramUser(lunchProps.chef2);
	const cleaner = lunchProps && parseTelegramUser(lunchProps.cleaner);
	const facilitator = practiseProps && parseTelegramUser(practiseProps.facilitator);

	return new InlineKeyboard()
		.row(
			facilitator
				? InlineKeyboard.text('✅ Morning Practise', key('facilitator'))
				: InlineKeyboard.url(
						'Morning Practise',
						`https://t.me/EssenciaOrgaBot?start=practise_${dateStr}_${messageId}`
					)
		)
		.row(InlineKeyboard.text(check(chef) + 'Lunch Chef', key('chef')))
		.row(InlineKeyboard.text(check(chef2) + 'Lunch Co-Chef', key('chef2')))
		.row(InlineKeyboard.text(check(cleaner) + 'Lunch Cleaning', key('cleaner')));
}
