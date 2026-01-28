import { google, type calendar_v3 } from 'googleapis';
import { GOOGLE_API_USER, GOOGLE_API_KEY, COMMUNITY_CALENDAR_ID } from '$env/static/private';

const auth = new google.auth.JWT({
	email: GOOGLE_API_USER,
	key: GOOGLE_API_KEY,
	scopes: ['https://www.googleapis.com/auth/calendar']
});

export type CalendarEvent = calendar_v3.Schema$Event;

const calendar = google.calendar({ version: 'v3', auth });

class Calendar {
	async getEvents(filter: string[], start?: Date, end?: Date): Promise<CalendarEvent[]> {
		const res = await calendar.events.list({
			calendarId: COMMUNITY_CALENDAR_ID,
			singleEvents: true,
			orderBy: 'startTime',
			timeMin: start?.toISOString(),
			timeMax: end?.toISOString(),
			privateExtendedProperty: filter
		});

		return res.data.items ?? [];
	}

	async getEvent(eventId: string) {
		const res = await calendar.events.get({
			calendarId: COMMUNITY_CALENDAR_ID,
			eventId
		});

		return res.data;
	}

	async insertEvent(requestBody: CalendarEvent) {
		return calendar.events.insert({
			calendarId: COMMUNITY_CALENDAR_ID,
			requestBody
		});
	}

	async updateEvent(eventId: string, requestBody: CalendarEvent) {
		return calendar.events.patch({
			calendarId: COMMUNITY_CALENDAR_ID,
			eventId,
			requestBody
		});
	}
}

export default new Calendar();
