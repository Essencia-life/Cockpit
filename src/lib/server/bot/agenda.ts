import { COMMUNITY_ICAL, EVENTS_ICAL } from '$env/static/private';
import ical, { type VEvent } from 'node-ical';
import { type Bot, InlineKeyboard } from 'grammy';
import type { BotGroups } from '$lib/server/bot/groups.ts';

export class AgendaBot {
	constructor(
		private readonly bot: Bot,
		private readonly botGroups: BotGroups
	) {
		const morningPractiseReply = 'Please let me know what morning practise you want to offer';

		bot.callbackQuery(/^agenda:(?<date>\d{4}-\d{2}-\d{2}):(?<messageId>\d+)$/, async (ctx) => {
			if (typeof ctx.match === 'object' && 'groups' in ctx.match) {
				const date = new Date(ctx.match.groups!.date);
				const messageId = parseInt(ctx.match.groups!.messageId);

				try {
					await this.updateAgenda(date, messageId);
					await this.bot.api.answerCallbackQuery(ctx.callbackQuery.id);
				} catch (err) {
					console.error(err);
				}

				await ctx.answerCallbackQuery();
			}
		});

		bot.callbackQuery(/^plan:(?<date>\d{4}-\d{2}-\d{2}):(?<messageId>\d+):(?<task>\w+)$/, async (ctx) => {
			if (typeof ctx.match === 'object' && 'groups' in ctx.match) {
				const date = new Date(ctx.match.groups!.date);
				const messageId = parseInt(ctx.match.groups!.messageId);
				const task = ctx.match.groups!.task;
				const userId = ctx.from!.id;

				console.log('Save task', { messageId, date, task, userId });

				// TODO check if task is free, if not alert, remove if same user
				// TODO save task

				await ctx.answerCallbackQuery();
			}
		});

		bot.command('start', async ctx => {
			console.log(ctx.match);

			const match = ctx.match.match(/^practise_(?<date>\d{4}-\d{2}-\d{2})_(?<messageId>\d+)$/);

			if (match !== null && 'groups' in match) {
				const date = new Date(match.groups!.date);
				const messageId = parseInt(match.groups!.messageId);
				const userId = ctx.from!.id;

				console.log('Save facilitator', { messageId, date, userId });
				// TODO save facilitator

				await ctx.reply(`${morningPractiseReply}: \`${date.toISOString().substring(0, 10)}-${messageId}\``, {
					parse_mode: 'MarkdownV2',
					reply_markup: { force_reply: true }
				});
			}
		});

		bot.on('message:text', async (ctx, next) => {
			if (!ctx.message.reply_to_message?.text || !ctx.message.reply_to_message.text.startsWith(morningPractiseReply)) return next();

			const [, dateStr, messageIdStr] = ctx.message.reply_to_message.text.match(/(\d{4}-\d{2}-\d{2})-(\d+)/) ?? [];
			const date = new Date(dateStr);
			const messageId = parseInt(messageIdStr);
			const practise = ctx.message.text;

			console.log('Save practise', { messageId, date, practise });
			// TODO save practise

			await ctx.react('👍');
		});
	}

	public async sendAgenda() {
		const groups = await this.getGroups();
		const today = new Date();
		const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
		const tomorrowEvents = await this.getEventsByDate(tomorrow);

		// TODO: remove reply markup of yesterdays message?

		if (tomorrowEvents.length) {
			const message = await this.bot.api.sendMessage(
				groups.Home,
				formatAgenda(tomorrow, tomorrowEvents),
				{ parse_mode: 'HTML', message_thread_id: groups.HomeOrganizationThread }
			);

			await this.bot.api.editMessageReplyMarkup(groups.Home, message.message_id, {
				reply_markup: new InlineKeyboard().text(
					'🔁️ Refresh',
					`agenda:${tomorrow.toISOString().substring(0, 10)}:${message.message_id}`
				)
			});
		} else {
			console.info('No agenda for today');
		}
	}

	public async updateAgenda(date: Date, messageId: number) {
		const groups = await this.getGroups();

		console.info(`Update agenda for date=${date} messageId=${messageId}`);

		const events = await this.getEventsByDate(date);
		const text = formatAgenda(date, events);

		try {
			await this.bot.api.editMessageText(groups.Home, messageId, text, {
				parse_mode: 'HTML',
				reply_markup: new InlineKeyboard().text(
					'🔁️ Refresh',
					`agenda:${date.toISOString().substring(0, 10)}:${messageId}`
				)
			});
		} catch (err) {
			console.error(err);
		}
	}

	public async sendWeekPlan() {
		const groups = await this.getGroups();

		const today = new Date();
		const weekDutyStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 9);

		for (let i = 0; i < 7; i++) {
			if (i === 4 || i == 5) {
				continue;
			}

			const date = new Date(weekDutyStart.getFullYear(), weekDutyStart.getMonth(), weekDutyStart.getDate() + i);

			const message = await this.bot.api.sendMessage(groups.Home, formatDayPlan(date, []), { parse_mode: 'HTML' });
			const dateStr = date.toISOString().substring(0, 10);
			const key = (task: string) => `plan:${dateStr}:${message.message_id}:${task}`;

			console.log(`https://t.me/EssenciaOrgaBot?start=practise_${dateStr}_${message.message_id}`);

			await this.bot.api.editMessageReplyMarkup(groups.Home, message.message_id, {
				reply_markup: new InlineKeyboard()
					.row(InlineKeyboard.url('Morning Practise', `https://t.me/EssenciaOrgaBot?start=practise_${dateStr}_${message.message_id}`))
					.row(InlineKeyboard.text('Lunch Chef', key('chef')))
					.row(InlineKeyboard.text('Lunch Co-Chef', key('chef2')))
					.row(InlineKeyboard.text('Lunch Cleaning', key('cleaner')))
			});
		}

		await this.bot.api.sendMessage(groups.Home, '✍️ Please sign in for upcomming duties above before Monday morning planning meeting.');
	}

	private async getGroups() {
		const groups = await this.botGroups.getGroups();

		if (!groups || !groups.Home) {
			throw new Error('Missing configuration');
		}

		return groups;
	}

	private async getEventsByDate(date: Date) {
		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

		const events = await ical.async.fromURL(EVENTS_ICAL);
		const communityEvents = await ical.async.fromURL(COMMUNITY_ICAL);

		return Object.values(communityEvents)
			.concat(Object.values(events))
			.reduce((events, entry) => {
				if (entry.type === 'VEVENT') {
					if (entry.start.toDateString() === date.toDateString()) {
						events.push(entry);
					} else if (entry.rrule?.between(new Date(startOfDay), new Date(endOfDay)).length) {
						const { tz } = entry.start;

						const start = Object.assign(new Date(startOfDay), { tz });
						start.setHours(entry.start.getHours(), entry.start.getMinutes());

						const end = Object.assign(new Date(startOfDay), { tz });
						end.setHours(entry.end.getHours(), entry.end.getMinutes());

						events.push({
							...entry,
							start,
							end
						});
					}
				}

				return events;
			}, new Array<VEvent>())
			.sort(byStartDate);
	}
}

function transformDescription(description: string): string {
	return description
		.replaceAll(/<(br|\/li|\/ul)>/g, '\n')
		.replaceAll('<li>', '• ')
		.replaceAll('<ul>', '');
}

function formatLocation(location: string) {
	return location ? `<i>\uFE6B${location.replace(/^(\w+)-\d+-\1 \(\d+\)$/, '$1')}</i>` : '';
}

function formatDuration(event: VEvent) {
	const ms = Math.abs(event.end.getTime() - event.start.getTime());

	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	const h = Math.floor(m / 60);

	const duration = [];

	if (h) {
		duration.push(h + 'h');
	}

	if (m % 60) {
		duration.push((m % 60) + 'm');
	}

	if (duration.length) {
		return `(${duration.join(' ')})`;
	}

	return '';
}

function formatEvent(event: VEvent): string {
	const time = event.start.toLocaleTimeString('en', {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit'
	});
	return `<blockquote expandable><b>${time}</b> ${event.summary} ${formatDuration(event)}
${formatLocation(event.location)}
${transformDescription(event.description ?? '…')}</blockquote>`;
}

function byStartDate(a: VEvent, b: VEvent) {
	return a.start.getTime() - b.start.getTime();
}

function formatAgenda(date: Date, events: VEvent[]) {
	return `🗓️ <b>Agenda for ${date.toLocaleDateString('en', { weekday: 'long' })}</b>

${events.map(formatEvent).join('\n\n')}`;
}

function formatDayPlan(date: Date, events: VEvent[]) {
	// TODO filter events by date and adapt message accordingly
	return `<b>${date.toLocaleDateString('en', { weekday: 'long' })} / ${date.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'numeric' })}</b>

<u>Morning Practise</u>
🤸 ❓

<u>Lunch</u>
🧑‍🍳 ❓

<u>Lunch Cleaning</u>
🧽 ❓`
}