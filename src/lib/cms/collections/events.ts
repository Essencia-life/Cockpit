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
			label_singular: 'Event',
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
				{ name: 'start', label: 'Start Date & Time', widget: 'datetime', picker_utc: true },
				{ name: 'end', label: 'End Date & Time', widget: 'datetime', picker_utc: true },
				{
					name: 'cover_image',
					label: 'Cover Image',
					widget: 'image',
					choose_url: false,
					allow_multiple: false
				},
				{
					name: 'short_description',
					label: 'Short Description',
					pattern: ['^.{0,300}$', 'Maximum 300 characters']
				},
				{
					name: 'description',
					label: 'Description',
					widget: 'markdown',
					buttons: ['bold', 'italic', 'quote', 'link', 'bulleted-list', 'numbered-list'],
					editor_components: []
				},
				{
					name: 'booking_link',
					label: 'Booking Link',
					required: false,
					pattern: [
						'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
						'Invalid URL'
					]
				},
				{
					name: 'info_link',
					label: 'More Information Link',
					required: false,
					pattern: [
						'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
						'Invalid URL'
					]
				},
				{
					name: 'car_sharing_link',
					label: 'Car-Sharing Group Link',
					required: false,
					pattern: [
						'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
						'Invalid URL'
					]
				},
				{
					name: 'organizers',
					label: 'Organizers',
					label_singular: 'Organizer',
					widget: 'list',
					required: false,
					fields: [
						{ name: 'name', label: 'Name' },
						{ name: 'description', label: 'Description' },
						{
							name: 'photo',
							label: 'Photo',
							widget: 'image',
							choose_url: false,
							allow_multiple: false,
							media_folder: '/src/lib/assets/media/events/organizer',
							public_folder: 'media/events/organizer'
						}
					]
				}
			]
		}
	]
} satisfies CmsCollectionFile;
