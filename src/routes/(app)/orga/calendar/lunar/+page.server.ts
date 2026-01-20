import type { PageServerLoad } from './$types';
import { EVENTS_ICAL, RETREATS_ICAL, COMMUNITY_ICAL } from '$env/static/private';
import ical, { type CalendarComponent, type CalendarResponse, type VEvent } from 'node-ical';

/**
 * Calculates the last and next New Moon around a given date,
 * and provides all eight main lunar phases for the current cycle
 * with emojis.
 *
 * Accuracy: ±1 day
 * Timezone: Local
 *
 * @param {Date} [refDate=new Date()] - Reference date (defaults to now)
 * @returns {Object} - last/next New Moon, current cycle phases with emojis
 */
function getMoonPhases(refDate = new Date()) {
	const synodicMonth = 29.530588853; // average lunar cycle in days
	const baseNewMoon = new Date('2000-01-06T18:14:00Z'); // reference New Moon
	const dayMs = 1000 * 60 * 60 * 24;

	const diffDays = (refDate.getTime() - baseNewMoon.getTime()) / dayMs;
	const currentCycle = Math.floor(diffDays / synodicMonth);

	// Phase offsets (fractions of the cycle)
	const phaseOffsets: Record<string, number> = {
		newMoon: 0,
		waxingCrescent: 0.125,
		firstQuarter: 0.25,
		waxingGibbous: 0.375,
		fullMoon: 0.5,
		waningGibbous: 0.625,
		lastQuarter: 0.75,
		waningCrescent: 0.875
	};

	// Emojis
	const phaseEmojis: Record<string, string> = {
		newMoon: '🌑',
		waxingCrescent: '🌒',
		firstQuarter: '🌓',
		waxingGibbous: '🌔',
		fullMoon: '🌕',
		waningGibbous: '🌖',
		lastQuarter: '🌗',
		waningCrescent: '🌘'
	};

	const calcPhaseDate = (cycle: number, fraction: number) =>
		new Date(baseNewMoon.getTime() + (cycle + fraction) * synodicMonth * dayMs);

	// Build current cycle phases
	const cyclePhases = Object.entries(phaseOffsets).map(([phase, fraction]) => {
		return {
			phase,
			date: calcPhaseDate(currentCycle, fraction),
			emoji: phaseEmojis[phase]
		};
	});

	// Last and next New Moon
	const lastNewMoonDate =
		calcPhaseDate(currentCycle, 0).getTime() <= refDate.getTime()
			? calcPhaseDate(currentCycle, 0)
			: calcPhaseDate(currentCycle - 1, 0);

	const nextNewMoonDate = calcPhaseDate(currentCycle + 1, 0);

	cyclePhases.push({
		phase: 'nextNewMoon',
		date: nextNewMoonDate,
		emoji: phaseEmojis.newMoon
	});

	return {
		lastNewMoon: { date: lastNewMoonDate, emoji: phaseEmojis.newMoon },
		nextNewMoon: { date: nextNewMoonDate, emoji: phaseEmojis.newMoon },
		fullMoon: cyclePhases.find(phase => phase.phase === 'fullMoon'),
		cyclePhases
	};
}

interface Event {
	start: Date;
	end: Date;
	title: string;
}

function byEvents(item: CalendarComponent) {
	return item.type === 'VEVENT';
}

async function eventsByView(start: Date, end: Date, icalUrl: string, filterPrivate = false): Promise<Event[]> {
	const calendarResponse = await ical.async.fromURL(icalUrl);
	const icalEvents: VEvent[] = Object.values(calendarResponse).filter(byEvents);

	return icalEvents
		.filter(event => {
			const between = event.start.getTime() >= start.getTime() && event.start.getTime() <= end.getTime();
			const includePrivate = !filterPrivate || event.class !== 'PRIVATE';
			return between && includePrivate;
		})
		.reduce((events, event) => {
			if (event.rrule) {
				event.rrule.between(start, end).forEach(date => {
					events.push({
						title: event.summary,
						start: date,
						end: new Date(date.getTime() + event.end.getTime() - event.start.getTime()),
					});
				});
			} else {
				events.push({
					title: event.summary,
					start: event.start,
					end: event.end,
				});
			}
			return events;
		}, [] as Event[]);
}

export const load: PageServerLoad = async ({ url }) => {
	const refDate = url.searchParams.get('refDate');
	const moonPhases = getMoonPhases(refDate ? new Date(refDate) : new Date());

	const events = await eventsByView(moonPhases.lastNewMoon.date, moonPhases.nextNewMoon.date, EVENTS_ICAL);
	const retreats = await eventsByView(moonPhases.lastNewMoon.date, moonPhases.nextNewMoon.date, RETREATS_ICAL);
	const community = await eventsByView(moonPhases.lastNewMoon.date, moonPhases.nextNewMoon.date, COMMUNITY_ICAL, true);

	return { ...moonPhases, events, retreats, community };
};