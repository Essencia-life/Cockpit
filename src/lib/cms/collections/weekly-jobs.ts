import type { CmsCollectionFile, CmsField } from 'decap-cms-core';

const metaFields: CmsField[] = [
	{ name: 'calendar', label: 'Calendar', widget: 'select', options: ['community', 'events'] },
	{ name: 'name', label: 'Name' },
	{ name: 'title', label: 'title' },
	{
		name: 'description',
		label: 'Description',
		widget: 'markdown',
		buttons: ['bold', 'italic'],
		editor_components: []
	}
];

const jobsField: CmsField = {
	name: 'jobs',
	label: 'Jobs',
	label_singular: 'Job',
	widget: 'list',
	min: 1,
	summary: '{{title}}',
	fields: [
		{ name: 'name', label: 'Name' },
		{ name: 'title', label: 'title' },
		{ name: 'persons', label: 'Persons', widget: 'number', min: 1, max: 2 },
		{ name: 'askDetails', label: 'Ask for details', widget: 'boolean' }
	]
};

export default {
	name: 'config',
	file: 'src/lib/config/weekly-jobs.json',
	label: 'Weekly Jobs',
	fields: [
		{
			name: 'config',
			label: 'Weekly Jobs',
			label_singular: 'Job',
			widget: 'list',
			types: [
				{
					name: 'daily',
					label: 'Daily Job',
					summary: '{{title}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'daily' },
						...metaFields,
						{ name: 'startHour', label: 'Start Hour', widget: 'number' },
						{ name: 'endHour', label: 'End Hour', widget: 'number' },
						{
							name: 'days',
							label: 'Days',
							widget: 'select',
							multiple: true,
							options: [
								{ label: 'Monday', value: 1 },
								{ label: 'Tuesday', value: 2 },
								{ label: 'Wednesday', value: 3 },
								{ label: 'Thursday', value: 4 },
								{ label: 'Friday', value: 5 }
							]
						},
						jobsField
					]
				},
				{
					name: 'weekly',
					label: 'Week Job',
					summary: '{{title}}',
					widget: 'object',
					fields: [{ name: 'type', widget: 'hidden', default: 'weekly' }, ...metaFields, jobsField]
				}
			]
		}
	]
} satisfies CmsCollectionFile;
