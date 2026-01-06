import { error, type RequestHandler } from '@sveltejs/kit';
import { redis } from '$lib/server/db/redis.ts';
import { type BotConfig, storageKey } from '$lib/server/bot/utils.ts';
import { bot } from '$lib/server/bot';
import { COMMUNITY_ICAL, EVENTS_ICAL } from '$env/static/private';
import ical, { type DateWithTimeZone, type VEvent } from 'node-ical';

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

function formatAgenda(date: Date, events: VEvent[]) {
	return `🗓️ <b>Agenda for ${date.toLocaleDateString('en', { weekday: 'long' })}</b>

${events.map(formatEvent).join('\n\n')}`;
}

function byStartDate(a: VEvent, b: VEvent) {
	return a.start.getTime() - b.start.getTime();
}

export const GET: RequestHandler = async () => {
	const [botConfig] = (await redis.json.get<[BotConfig]>(storageKey, '$')) ?? []; // TODO: move into BotConfigService and cache

	if (!botConfig || !botConfig.Home) {
		return error(412, 'Missing configuration');
	}

	const today = new Date();
	const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
	const startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
	const endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);
	const events = await ical.async.fromURL(EVENTS_ICAL);
	const communityEvents = await ical.async.fromURL(COMMUNITY_ICAL);
	const todayEvents = Object.values(communityEvents)
		.concat(Object.values(events))
		.reduce((events, entry) => {
			if (entry.type === 'VEVENT') {
				if (entry.start.toDateString() === tomorrow.toDateString()) {
					events.push(entry);
				} else if (entry.rrule && entry.rrule.between(startOfDay, endOfDay, true).length) {
					events.push({
						...entry,
						start: new Date(
							startOfDay.setHours(entry.start.getHours(), entry.start.getMinutes())
						) as DateWithTimeZone,
						end: new Date(
							startOfDay.setHours(entry.end.getHours(), entry.end.getMinutes())
						) as DateWithTimeZone
					});
				}
			}

			return events;
		}, new Array<VEvent>());

	if (todayEvents.length) {
		await bot.api.sendMessage(
			botConfig.Home,
			formatAgenda(tomorrow, todayEvents.sort(byStartDate)),
			{ parse_mode: 'HTML' }
		);
	} else {
		console.warn('No agenda for today');
	}

	return new Response(null, { status: 201 });
};
