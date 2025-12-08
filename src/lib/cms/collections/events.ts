import type { CmsCollectionFile } from 'decap-cms-core';

export default {
	name: 'events',
	label: '🗓️ Events',
	file: 'src/lib/content/events.json',
	media_folder: '/src/lib/assets/media/events',
	public_folder: 'media/events',
	fields: [
		{
			name: 'events',
			label: 'Events',
			widget: 'list',
			fields: [
				{ name: 'slug', label: 'Slug' },
				{ name: 'title', label: 'Title' },
				{
					name: 'type',
					label: 'Type',
					widget: 'select',
					options: ['event', 'retreat']
				},
				{ name: 'cover_image', label: 'Cover Image', widget: 'file', choose_url: false },
				{ name: 'short_description', label: 'Short Description' },
				{
					name: 'description',
					label: 'Description',
					widget: 'markdown',
					buttons: ['bold', 'italic', 'quote', 'link', 'bulleted-list', 'numbered-list'],
					editor_components: []
				},
				{ name: 'start', label: 'Start Date & Time', widget: 'datetime' },
				{ name: 'end', label: 'End Date & Time', widget: 'datetime' }
			]
		}
	]
} satisfies CmsCollectionFile;
