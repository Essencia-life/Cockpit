import type { CmsCollectionFile } from 'decap-cms-core';

export default {
	name: 'social_media',
	file: 'src/lib/content/social-media.json',
	label: '📱 Social Media Platforms',
	fields: [
		{
			name: 'platforms',
			label: 'Platforms',
			label_singular: 'Platform',
			widget: 'list',
			fields: [
				{ name: 'name', label: 'Name', widget: 'hidden' },
				{ name: 'label', label: 'Label' },
				{ name: 'description', label: 'Description' },
				{ name: 'link', label: 'Link' }
			]
		}
	]
} satisfies CmsCollectionFile;
