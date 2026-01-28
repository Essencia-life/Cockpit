import { form, query } from '$app/server';
import * as v from 'valibot';
import calendar from '$lib/server/calendar';
import weekPlan, {
	type EventPrivatePropsPractise,
	type WeekPlanLunchProps,
	type WeekPlanPractiseProps
} from '$lib/server/week-plan';

export const getEvents = query(async () => {
	const today = new Date();

	return calendar.getEvents(
		['source=week-plan'],
		new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1),
		new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 9)
	);
});

export const saveMorningPractise = form(
	v.object({
		day: v.pipe(v.string(), v.nonEmpty()),
		eventId: v.string(),
		practise: v.string(),
		facilitator: v.string()
	}),
	async ({ day, eventId, facilitator, practise }) => {
		const date = new Date(day);
		const props: WeekPlanPractiseProps = {
			facilitator,
			practise
		};

		if (eventId) {
			const event = await calendar.getEvent(eventId);
			await weekPlan.updateDuty(event, props);
		} else {
			await weekPlan.insertPractise(date, props);
		}

		await getEvents().refresh();

		return { success: true };
	}
);

export const saveLunch = form(
	v.object({
		day: v.pipe(v.string(), v.nonEmpty()),
		eventId: v.string(),
		chef: v.string(),
		chef2: v.string(),
		cleaner: v.string()
	}),
	async ({ day, eventId, chef, chef2, cleaner }) => {
		const date = new Date(day);
		const props: WeekPlanLunchProps = {
			chef,
			chef2,
			cleaner
		};

		if (eventId) {
			const event = await calendar.getEvent(eventId);
			await weekPlan.updateDuty(event, props);
		} else {
			await weekPlan.insetLunch(date, props);
		}

		await getEvents().refresh();

		return { success: true };
	}
);

// TODO refactor form fields
export const saveWeekTasks = form(
	v.object({
		fairy: v.string(),
		fairyTrainee: v.string(),
		catFeeding: v.string(),
		garden: v.string()
	}),
	async (data) => {
		console.log(data);

		return { success: true };
	}
);
