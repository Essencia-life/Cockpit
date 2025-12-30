import type { PageServerLoad } from './$types';
import { EVENTS_ICAL, RETREATS_ICAL, COMMUNITY_ICAL } from '$env/static/private';
import ical from 'node-ical';

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
	const currentCyclePhases = Object.entries(phaseOffsets).map(([phase, fraction]) => {
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

	currentCyclePhases.push({
		phase: 'nextNewMoon',
		date: nextNewMoonDate,
		emoji: phaseEmojis.newMoon
	});

	return {
		lastNewMoon: { date: lastNewMoonDate, emoji: phaseEmojis.newMoon },
		nextNewMoon: { date: nextNewMoonDate, emoji: phaseEmojis.newMoon },
		currentCyclePhases
	};
}

export const load: PageServerLoad = async () => {
	const moonPhases = getMoonPhases();

	// console.log(await (await fetch(EVENTS_ICAL)).text())

	const events = await ical.async.fromURL(EVENTS_ICAL);
	const retreats = await ical.async.fromURL(RETREATS_ICAL);
	const community = await ical.async.fromURL(COMMUNITY_ICAL);

	return { ...moonPhases, events, retreats, community };
};
