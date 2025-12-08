import type { CmsCollectionFile } from 'decap-cms-core';

export default {
	name: 'accommodations',
	label: '🛖️ Accommodations',
	file: 'src/lib/content/accommodations.json',
	media_folder: '/static/media/accommodations',
	public_folder: 'media/accommodations',
	fields: [
		{
			name: 'accommodations',
			label: 'Accommodations',
			widget: 'list',
			fields: [
				{ name: 'name', label: 'Name', widget: 'hidden' },
				{ name: 'headline', label: 'Headline' },
				{ name: 'short_description', label: 'Short Description' },
				{ name: 'photo', label: 'Photo', widget: 'file', choose_url: false },
				{
					label: 'Detail',
					name: 'detail',
					widget: 'object',
					fields: [
						{
							name: 'photos',
							label: 'Photos',
							widget: 'list',
							fields: [
								{ name: 'caption', label: 'Caption' },
								{ name: 'photo', label: 'Photo', widget: 'file', choose_url: false }
							]
						},
						{
							name: 'description',
							label: 'Description',
							widget: 'markdown',
							buttons: ['bold', 'italic', 'link', 'numbered-list', 'bulleted-list'],
							editor_components: []
						}
					]
				}
			]
		}
	]
} satisfies CmsCollectionFile;
