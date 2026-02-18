import { COMMUNITY_CALENDAR_ID, EVENTS_CALENDAR_ID } from '$env/static/private';
import { type Bot, InlineKeyboard } from 'grammy';
import type { BotConfig, BotGroups } from '$lib/server/bot/groups.ts';
import { Calendar, type CalendarEvent } from '$lib/server/calendar.ts';

const eventsCalendar = new Calendar(EVENTS_CALENDAR_ID);
const communityCalendar = new Calendar(COMMUNITY_CALENDAR_ID);

export class AgendaBot {
	constructor(
		private readonly bot: Bot,
		private readonly botGroups: BotGroups
	) {
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
				{
					parse_mode: 'HTML',
					message_thread_id: groups.HomeDailyInfoThread,
					link_preview_options: {
						is_disabled: true
					}
				}
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
				),
				link_preview_options: {
					is_disabled: true
				}
			});
		} catch (err) {
			console.error(err);
		}
	}

	private async getGroups(): Promise<MakeRequired<BotConfig, 'Home' | 'HomeDailyInfoThread'>> {
		const groups = await this.botGroups.getGroups();

		if (!groups || !groups.Home || !groups.HomeDailyInfoThread) {
			throw new Error('Missing configuration');
		}

		return groups;
	}

	private async getEventsByDate(date: Date) {
		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

		const events = await eventsCalendar.getEvents([], startOfDay, endOfDay);
		const communityEvents = await communityCalendar.getEvents([], startOfDay, endOfDay);

		return communityEvents.concat(events).sort(byStartDate);
	}
}

function transformDescription(description: string): string {
	return description
		.replaceAll(/<(br|\/li|\/ul)>/g, '\n')
		.replaceAll('<li>', '• ')
		.replaceAll('<ul>', '');
}

function formatLocation(location?: string | null) {
	return location ? `<i>\uFE6B${location.replace(/^(\w+)-\d+-\1 \(\d+\)$/, '$1')}</i>` : '';
}

function formatDuration(event: CalendarEvent) {
	const ms = Math.abs(Date.parse(event.end!.dateTime!) - Date.parse(event.start!.dateTime!));

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

function formatEvent(event: CalendarEvent): string {
	const time = new Date(event.start!.dateTime!).toLocaleTimeString('en', {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit'
	});
	return `<blockquote expandable><b>${time}</b> ${event.summary} ${formatDuration(event)}
${formatLocation(event.location)}
${transformDescription(event.description ?? '…')}</blockquote>`;
}

function byStartDate(a: CalendarEvent, b: CalendarEvent) {
	return Date.parse(a.start!.dateTime!) - Date.parse(b.start!.dateTime!);
}

function formatAgenda(date: Date, events: CalendarEvent[]) {
	return `🗓️ <b>Agenda for ${date.toLocaleDateString('en', { weekday: 'long' })}</b>

${events.map(formatEvent).join('\n\n')}`;
}
