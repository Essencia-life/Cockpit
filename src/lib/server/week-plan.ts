import calendar, { type CalendarEvent } from '$lib/server/calendar';
import type { TelegramUser } from '$lib/server/users.ts';

export interface EventPrivatePropsLunch {
	source: 'week-plan';
	type: 'lunch';
	chef: string; // JSON string of TelegramUser
	chef2: string; // JSON string of TelegramUser
	cleaner: string; // JSON string of TelegramUser
}

export interface EventPrivatePropsPractise {
	source: 'week-plan';
	type: 'morning-practise';
	practise: string;
	facilitator: string; // JSON string of TelegramUser
}

export type EventPrivateProps = EventPrivatePropsLunch | EventPrivatePropsPractise;

export type WeekPlanType = EventPrivateProps['type'];
export type WeekPlanDuty = 'chef' | 'chef2' | 'cleaner' | 'facilitator';

export type WeekPlanLunchProps = Partial<Omit<EventPrivatePropsLunch, 'source' | 'type'>>;
export type WeekPlanPractiseProps = Partial<Omit<EventPrivatePropsPractise, 'source' | 'type'>>;

const isDefined = <T>(s: T | undefined | null): s is T => s !== undefined && s !== null;

class WeekPlan {
	async getDay(type: WeekPlanType, date: Date) {
		return calendar.getEvents(
			['source=week-plan', `type=${type}`],
			date,
			new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
		);
	}

	async insetLunch(date: Date, props: WeekPlanLunchProps): Promise<CalendarEvent> {
		const newEvent: CalendarEvent = {
			summary: '🥘 Lunch',
			visibility: 'private',
			location: 'Fun Kitchen',
			start: {
				dateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14).toISOString(),
				timeZone: 'Europe/Lisbon'
			},
			end: {
				dateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15).toISOString(),
				timeZone: 'Europe/Lisbon'
			},
			extendedProperties: {
				private: {
					source: 'week-plan',
					type: 'lunch',
					...props
				}
			}
		};

		const response = await calendar.insertEvent({
			...newEvent,
			description: formatEventDescription(
				newEvent.extendedProperties!.private! as unknown as EventPrivateProps
			)
		});

		return response.data;
	}

	async insertPractise(date: Date, props: WeekPlanPractiseProps): Promise<CalendarEvent> {
		const newEvent: CalendarEvent = {
			summary: '🤸 Morning Practise',
			visibility: 'private',
			location: 'Shala',
			start: {
				dateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8).toISOString(),
				timeZone: 'Europe/Lisbon'
			},
			end: {
				dateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9).toISOString(),
				timeZone: 'Europe/Lisbon'
			},
			extendedProperties: {
				private: {
					source: 'week-plan',
					type: 'morning-practise',
					...props
				}
			}
		};

		const response = await calendar.insertEvent({
			...newEvent,
			description: formatEventDescription(
				newEvent.extendedProperties!.private! as unknown as EventPrivateProps
			)
		});

		return response.data;
	}

	async updateDuty(
		event: CalendarEvent,
		props: Partial<Omit<EventPrivateProps, 'source' | 'type'>>
	): Promise<CalendarEvent> {
		const privateProps = event.extendedProperties!.private!;
		Object.assign(privateProps, props);

		const response = await calendar.updateEvent(event.id!, {
			description: formatEventDescription(privateProps as unknown as EventPrivateProps),
			extendedProperties: {
				private: {
					...props
				}
			}
		});

		return response.data;
	}

	async removeFromDuty(event: CalendarEvent, task: WeekPlanDuty): Promise<CalendarEvent> {
		const privateProps = event.extendedProperties!.private!;
		privateProps[task] = JSON.stringify(null);

		const eventUpdates = {
			description: formatEventDescription(privateProps as unknown as EventPrivateProps),
			extendedProperties: {
				private: {
					[task]: JSON.stringify(null)
				}
			}
		};

		if (task === 'facilitator') {
			privateProps.practise = '';
			eventUpdates.extendedProperties.private.practise = '';
		}

		const response = await calendar.updateEvent(event.id!, eventUpdates);

		return response.data;
	}
}

function formatEventDescription(props: EventPrivateProps) {
	if (props.type === 'lunch') {
		return `🧑‍🍳 ${formatLunch(props)} 🧽 ${formatLunchCleaning(props)}

<b>Lunch preparation begins at 12:00.</b>
From this time until 14:00, you lovingly prepare the meal, tend to the dish-washing station and bring the kitchen back into a state of calm and cleanliness.

<b>Lunch cleaning</b> means guiding the leftovers to their next resting place in the fridge and washing the pods and bowls in which the meal was shared.

⚠️ Plates and cutlery find their way back to clarity through the hands of those who enjoyed the meal at the dish-washing station!

<b>A meal costs 8€ per person per day</b>, unless you are volunteering or have offered 2 hours of service for Essência on that day.
Please write your name into the lunch book and make your contribution at the end of the week (or on the day of your departure, if you leave earlier) to our Lakshmi fairy, ${formatTelegramUser(
			{
				id: 5713837236,
				first_name: 'Birdy'
			}
		)}.`;
	} else if (props.type === 'morning-practise') {
		return formatMorningPractise(props);
	}
}

export function formatMorningPractise(props?: EventPrivatePropsPractise) {
	if (props) {
		const facilitator = parseTelegramUser(props.facilitator);

		if (facilitator) {
			if (props.practise) {
				const [title, description] = props.practise.split('\n', 2);
				return `${title} with ${formatTelegramUser(facilitator)}\n${description ?? ''}`;
			} else {
				return formatTelegramUser(facilitator);
			}
		}
	}

	return '❓';
}

export function formatLunch(props?: EventPrivatePropsLunch) {
	if (props) {
		const chef = parseTelegramUser(props.chef);
		const chef2 = parseTelegramUser(props.chef2);
		const chefs = [chef, chef2].filter(isDefined);

		if (chefs.length) {
			return chefs.map(formatTelegramUser).join(' & ');
		}
	}

	return '❓';
}

export function formatLunchCleaning(props?: EventPrivatePropsLunch) {
	if (props) {
		const cleaner = parseTelegramUser(props.cleaner);

		if (cleaner) {
			return formatTelegramUser(cleaner);
		}
	}

	return '❓';
}

export function parseTelegramUser(str?: string): TelegramUser | undefined {
	return JSON.parse(str || 'null') ?? undefined;
}

function formatTelegramUser(user: TelegramUser) {
	if (user.id) {
		return `<a href="tg://user?id=${user.id}">${user.first_name}</a>`;
	}

	return user.first_name;
}

export default new WeekPlan();
