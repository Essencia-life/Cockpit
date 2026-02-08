import { COMMUNITY_ICAL, EVENTS_ICAL } from '$env/static/private';
import ical, { type VEvent } from 'node-ical';
import { type Bot, InlineKeyboard } from 'grammy';
import type { BotConfig, BotGroups } from '$lib/server/bot/groups.ts';

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
