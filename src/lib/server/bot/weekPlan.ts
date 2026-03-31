import { type Bot, InlineKeyboard } from 'grammy';
import { type BotConfig, type BotGroups } from '$lib/server/bot/groups.ts';
import calendar, { Calendar, type CalendarEvent } from '$lib/server/calendar';
import weekPlan, {
	formatLunch,
	formatLunchCleaning,
	formatMorningPractise,
	parseTelegramUser,
	type EventPrivateProps,
	type EventPrivatePropsLunch,
	type EventPrivatePropsPractise,
	type WeekPlanDuty,
	type WeekPlanType,
	type EventPrivatePropsMeditation,
	formatMeditation,
	formatTelegramUsers
} from '../week-plan';
import type { TelegramUser } from '$lib/server/users.ts';
import weeklyJobs from '$lib/config/weekly-jobs.json';
import {
	matchesRelationToLunarPhase,
	type LunarRelation,
	type Weekday
} from '$lib/utils/lunar-matching.ts';
import lunarProvider, { type MoonPhase } from '$lib/utils/lunar-provider.ts';
import { TEST_CALENDAR_ID } from '$env/static/private';
import { calendar_v3 } from 'googleapis';

const configs = weeklyJobs.config as WeeklyJobsConfigs;

interface BaseJobConfig {
	calendar: 'community' | 'events';
	name: string;
	title: string;
	description: string;
	location?: string;
	jobs: JobDefinition[];
}

interface JobDefinition {
	name: string;
	title: string;
	persons: 1 | 2;
	askDetails?: boolean; // TODO only for one person
}

interface DailyJobConfig extends BaseJobConfig {
	type: 'daily';
	startTime: [number, number];
	endTime: [number, number];
	weekdays: Weekday[];
}

interface WeeklyJobConfig extends BaseJobConfig {
	type: 'weekly';
}

interface MoonCycleJobConfig extends BaseJobConfig {
	type: 'moon';
	startTime: [number, number];
	endTime: [number, number];
	weekday: Weekday;
	phase: MoonPhase;
	relation: LunarRelation;
}

type WeeklyJobsConfig = DailyJobConfig | WeeklyJobConfig | MoonCycleJobConfig;
type WeeklyJobsConfigs = WeeklyJobsConfig[];

const timeZone = 'Europe/Lisbon';

const locationRoomMapping = new Map<string, calendar_v3.Schema$EventAttendee>([
	[
		'Shala',
		{ email: 'c_1885fldmc9nuqjj3mjkeoq4b608h2@resource.calendar.google.com', resource: true }
	],
	[
		'Hive',
		{ email: 'c_1889c1tchb404ha0ilqe71f97m3ua@resource.calendar.google.com', resource: true }
	]
]);

interface EventProps {
	source: 'week-plan';
	type: string;
	jobs: string;
	planMessageId?: string;
	agendaMessageId?: string;
}

export class WeekPlanBot {
	constructor(
		private readonly bot: Bot,
		private readonly botGroups: BotGroups
	) {
		// TODO
		// const morningPractiseReply =
		// 	'Please let me know what morning practise you want to offer. First line title and second optional details.';
		//
		// bot.callbackQuery(
		// 	/^plan:(?<date>\d{4}-\d{2}-\d{2}):(?<messageId>\d+):(?<task>\w+)$/,
		// 	async (ctx) => {
		// 		if (typeof ctx.match === 'object' && 'groups' in ctx.match) {
		// 			const date = new Date(ctx.match.groups!.date);
		// 			const messageId = parseInt(ctx.match.groups!.messageId);
		// 			const task = ctx.match.groups!.task as WeekPlanDuty;
		// 			const user = ctx.from!;
		//
		// 			console.info('Received week-plan callbackQuery', { messageId, date, task, user });
		//
		// 			let [event] = await weekPlan.getDay(
		// 				task === 'guide' ? 'meditation' : task === 'facilitator' ? 'morning-practise' : 'lunch',
		// 				date
		// 			);
		// 			const previousValue = parseTelegramUser(event?.extendedProperties?.private?.[task]);
		//
		// 			if (previousValue) {
		// 				if (previousValue.id !== user.id) {
		// 					console.info(
		// 						`Can not sign ${user.first_name} as ${task} is already taken by ${previousValue.first_name}`
		// 					);
		//
		// 					await this.updateWeekPlanDay(messageId, event);
		// 					return ctx.answerCallbackQuery({
		// 						show_alert: true,
		// 						text: `This job is already taken by ${previousValue.first_name}. If you want to takeover please ask them to remove themself by tapping this button again.`
		// 					});
		// 				} else {
		// 					console.info(`Remove ${previousValue.first_name} from ${task}`);
		//
		// 					event = await weekPlan.removeFromDuty(event, task);
		//
		// 					await this.updateWeekPlanDay(messageId, event);
		// 					return ctx.answerCallbackQuery({ text: '❎ you removed yourself' });
		// 				}
		// 			}
		//
		// 			if (event) {
		// 				console.info('Update existing event');
		//
		// 				event = await weekPlan.updateDuty(event, {
		// 					[task]: JSON.stringify(user)
		// 				});
		// 			} else if (task === 'guide') {
		// 				console.info('Create new event');
		//
		// 				event = await weekPlan.insetMeditation(date, {
		// 					[task]: JSON.stringify(user)
		// 				});
		// 			} else {
		// 				console.info('Create new event');
		//
		// 				event = await weekPlan.insetLunch(date, {
		// 					[task]: JSON.stringify(user)
		// 				});
		// 			}
		//
		// 			await this.updateWeekPlanDay(messageId, event);
		// 			return ctx.answerCallbackQuery({ text: "✅ you've signed up" });
		// 		}
		// 	}
		// );
		//
		// bot.command('start', async (ctx) => {
		// 	const match = ctx.match.match(/^practise_(?<date>\d{4}-\d{2}-\d{2})_(?<messageId>\d+)$/);
		//
		// 	if (match !== null && 'groups' in match) {
		// 		const date = new Date(match.groups!.date);
		// 		const messageId = parseInt(match.groups!.messageId);
		// 		const user = ctx.from!;
		//
		// 		console.info('Save facilitator', { messageId, date, user });
		//
		// 		let [event] = await weekPlan.getDay('morning-practise', date);
		//
		// 		const previousValue = parseTelegramUser(event?.extendedProperties?.private?.facilitator);
		// 		if (previousValue && previousValue.id !== user.id) {
		// 			console.info(
		// 				`Can not sign ${user.first_name} as facilitator is already taken by ${previousValue.first_name}`
		// 			);
		//
		// 			await this.updateWeekPlanDay(messageId, event);
		// 			return ctx.reply(
		// 				`This job is already taken by ${previousValue.first_name}. If you want to takeover please ask them to remove themself by tapping the button again.`
		// 			);
		// 		}
		//
		// 		if (event) {
		// 			event = await weekPlan.updateDuty(event, {
		// 				facilitator: JSON.stringify(user)
		// 			});
		// 		} else {
		// 			event = await weekPlan.insertPractise(date, {
		// 				facilitator: JSON.stringify(user)
		// 			});
		// 		}
		//
		// 		await ctx.reply(`${morningPractiseReply}\n\n#${event.id}_${messageId}`, {
		// 			reply_markup: { force_reply: true }
		// 		});
		// 	}
		// });
		//
		// bot.on('message:text', async (ctx, next) => {
		// 	if (
		// 		!ctx.message.reply_to_message?.text ||
		// 		!ctx.message.reply_to_message.text.startsWith(morningPractiseReply)
		// 	)
		// 		return next();
		//
		// 	const [, eventId, messageIdStr] =
		// 		ctx.message.reply_to_message.text.match(/#(\w+)_(\d+)/) ?? [];
		// 	const messageId = parseInt(messageIdStr);
		// 	const practise = ctx.message.text;
		//
		// 	let event = await calendar.getEvent(eventId);
		//
		// 	console.info('Save practise', { messageId, eventId, practise });
		//
		// 	event = await weekPlan.updateDuty(event, { practise });
		//
		// 	await this.updateWeekPlanDay(messageId, event);
		// 	await ctx.react('👍');
		// });
	}

	public async sendWeekPlan() {
		const today = new Date();
		const weekDutyStart = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate() - today.getDay() + 8
		);

		console.info('Sending week plan starting from', weekDutyStart);

		const events = await this.createCalendarEvents(weekDutyStart);
		await this.buildAndSendMessages(events);
	}

	public async updateWeekPlanDay(messageId: number, event: CalendarEvent) {
		// TODO
		// const groups = await this.getGroups();
		// const date = new Date(event.start!.dateTime!);
		// date.setHours(0, 0, 0, 0);
		//
		// const { lunchProps, practiseProps, meditationProps } = await getDayPlanProps(date, event);
		//
		// try {
		// 	await this.bot.api.editMessageText(
		// 		groups.Home,
		// 		messageId,
		// 		formatDayPlan(date, lunchProps, practiseProps, meditationProps),
		// 		{
		// 			parse_mode: 'HTML',
		// 			reply_markup: buildDayPlanKeyboard(
		// 				date,
		// 				messageId,
		// 				lunchProps,
		// 				practiseProps,
		// 				meditationProps
		// 			)
		// 		}
		// 	);
		// } catch (err) {
		// 	console.warn(err);
		// }
	}

	private async getGroups(): Promise<MakeRequired<BotConfig, 'Home' | 'HomeWeekPlanningThread'>> {
		const groups = await this.botGroups.getGroups();

		if (!groups || !groups.Home || !groups.HomeWeekPlanningThread) {
			throw new Error('Missing configuration');
		}

		return groups;
	}

	private async createCalendarEvents(weekDutyStart: Date) {
		console.info('Create events', weekDutyStart);

		const groupedEvents = new Map<string, CalendarEvent[]>();

		for (const config of configs) {
			if (config.type === 'weekly') {
				const weekDutyEnd = new Date(
					weekDutyStart.getFullYear(),
					weekDutyStart.getMonth(),
					weekDutyStart.getDate() + 5
				);

				const label = `<b>Week</b> ${weekDutyStart.toLocaleDateString('pt', { day: 'numeric', month: 'numeric' })} - ${weekDutyEnd.toLocaleDateString('pt', { day: 'numeric', month: 'numeric' })}`;

				if (!groupedEvents.has(label)) {
					groupedEvents.set(label, []);
				}

				groupedEvents.get(label)!.push({
					summary: config.title,
					description: config.description,
					// FIXME week begin + end
					start: { date: weekDutyStart.toISOString().substring(0, 10), timeZone },
					end: { date: weekDutyEnd.toISOString().substring(0, 10), timeZone },
					extendedProperties: {
						private: {
							source: 'week-plan',
							type: config.name,
							jobs: JSON.stringify(
								Object.fromEntries(config.jobs.map((jobDef) => [jobDef.name, []]))
							)
						} satisfies EventProps
					}
				});
			} else {
				for (let i = 0; i < 5; i++) {
					const date = new Date(
						weekDutyStart.getFullYear(),
						weekDutyStart.getMonth(),
						weekDutyStart.getDate() + i
					);

					const dailyCondition = config.type === 'daily' && isWeekdays(config, date);
					const moonCondition = config.type === 'moon' && isWeekdayInMoon(config, date);

					if (dailyCondition || moonCondition) {
						const startDateTime = new Date(date);
						const endDateTime = new Date(date);

						startDateTime.setHours(...config.startTime);
						endDateTime.setHours(...config.endTime);

						const event: CalendarEvent = {
							summary: config.title,
							description: config.description,
							start: { dateTime: startDateTime.toISOString(), timeZone },
							end: { dateTime: endDateTime.toISOString(), timeZone },
							extendedProperties: {
								private: {
									source: 'week-plan',
									type: config.name,
									jobs: JSON.stringify(
										Object.fromEntries(config.jobs.map((jobDef) => [jobDef.name, []]))
									)
								}
							}
						};

						if (config.location) {
							// TODO enable
							// if (locationRoomMapping.has(config.location)) {
							// 	event.attendees = [locationRoomMapping.get(config.location)!];
							// } else {
							event.location = config.location;
							// }
						}

						const title = `<b>${date.toLocaleDateString('en', { weekday: 'long' })}</b> / ${date.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'numeric' })}`;

						if (!groupedEvents.has(title)) {
							groupedEvents.set(title, []);
						}

						groupedEvents.get(title)!.push(event);
					}
				}
			}
		}

		// TODO get existing events of calendars with source=week-plan filter
		// TODO update events in calendars

		// TODO enable
		// const calendar = new Calendar(TEST_CALENDAR_ID);
		// for (const event of events) {
		// 	const response = await calendar.insertEvent(event);
		// 	Object.assign(event, response.data);
		// }

		return groupedEvents;
	}

	private async buildAndSendMessages(eventsGrouped: Map<string, CalendarEvent[]>) {
		const groups = await this.getGroups();

		let firstMessage;

		for (const [title, events] of eventsGrouped.entries()) {
			const plan = [title]; // TODO use tg date tag
			let keyboard = new InlineKeyboard();

			for (const event of events) {
				const props = event.extendedProperties!.private! as unknown as EventProps;
				const config = configs.find((config) => config.name === props.type);

				if (config) {
					const block = [`<u>${event.summary}</u>`];
					const assignedJobs: Record<string, TelegramUser[]> = JSON.parse(
						event.extendedProperties!.private!.jobs
					);

					for (const job of config.jobs) {
						block.push(`↳ ${job.title}: ${formatTelegramUsers(assignedJobs[job.name])}`);

						if (job.askDetails) {
							const [assignee] = assignedJobs[job.name];
							// TODO add details to block
							keyboard = keyboard
								.row()
								.add(
									assignee
										? InlineKeyboard.text(
												buttonStatus(job.title, true),
												`${event.id}:${config.name}:${job.name}`
											)
										: InlineKeyboard.url(
												buttonStatus(job.title, false),
												`https://t.me/EssenciaOrgaBot?start=${event.id}_${config.name}_${job.name}`
											)
								);
						} else {
							keyboard = keyboard
								.row()
								.add(
									...Array.from(Array(job.persons), (_, i) =>
										InlineKeyboard.text(
											buttonStatus(job.title, !!assignedJobs[job.name][i]),
											`${event.id}:${config.name}:${job.name}`
										)
									)
								);
						}
					}

					plan.push(block.join('\n'));
				}
			}

			const message = await this.bot.api.sendMessage(groups.Home, plan.join('\n\n'), {
				message_thread_id: groups.HomeWeekPlanningThread,
				parse_mode: 'HTML',
				reply_markup: keyboard
			});

			if (!firstMessage) {
				firstMessage = message;
			}

			// TODO save message ID in events
		}

		await this.bot.api.sendMessage(
			groups.Home,
			'✍️ Please sign up for the upcoming week before the Monday morning planning meeting by tapping one of the buttons.',
			{
				message_thread_id: groups.HomeWeekPlanningThread,
				reply_parameters: firstMessage && {
					message_id: firstMessage.message_id
				}
			}
		);
	}
}

function isWeekdays(config: DailyJobConfig, date: Date) {
	return config.weekdays.includes(date.getDay() as Weekday);
}

function isWeekdayInMoon(config: MoonCycleJobConfig, date: Date) {
	return matchesRelationToLunarPhase(date, config, lunarProvider);
}

function buttonStatus(title: string, assigned: boolean) {
	return `${assigned ? '✅' : '⭕️'} ${title}`;
}
