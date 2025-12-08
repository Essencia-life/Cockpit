import type { EditorComponentOptions } from 'decap-cms-core';

export default {
	id: 'event-calendar',
	label: 'Event Calendar',
	summary: 'Event Calendar: {{filter}} {{type}}s',
	collapsed: true,
	fields: [
		{
			name: 'type',
			label: 'Type',
			widget: 'select',
			default: 'event',
			options: [
				{ value: 'event', label: 'Events' },
				{ value: 'retreat', label: 'Retreats' }
			]
		},
		{
			name: 'filter',
			label: 'Filter',
			widget: 'select',
			default: 'upcoming',
			options: [
				{ value: 'upcoming', label: 'Upcoming' },
				{ value: 'past', label: 'Past' }
			]
		}
	],
	pattern: /^<EventCalendar type="(event|retreat)" filter="(upcoming|past)" \/>$/m,
	fromBlock(match) {
		return {
			type: match[1],
			filter: match[2]
		};
	},
	toBlock(data) {
		return `<EventCalendar type="${data.type}" filter="${data.filter}" />`;
	},
	toPreview(data) {
		return `
			<section class="placeholder">
				<i>Event calendar showing ${data.filter} ${data.type}s.</i>
			</section>
		`;
	}
} satisfies EditorComponentOptions;
