import type { CmsCollectionFile } from 'decap-cms-core';

export default {
	name: 'footer',
	file: 'src/lib/content/footer.json',
	label: '🦶️ Footer',
	fields: [
		{
			name: 'cta',
			label: 'CTA Button',
			widget: 'object',
			fields: [
				{ name: 'label', label: 'Label' },
				{
					name: 'page',
					label: 'Page',
					widget: 'relation',
					collection: 'pages',
					search_fields: ['title'],
					value_field: '/{{slug}}',
					display_fields: ['title']
				}
			]
		},
		{
			name: 'social_media',
			label: 'Social Media Platforms',
			label_singular: 'Platform',
			widget: 'list',
			field: {
				name: 'platform',
				label: 'Platform',
				widget: 'relation',
				collection: 'social_media',
				search_fields: ['label'],
				value_field: 'name',
				display_fields: ['label']
			}
		},
		{
			name: 'links',
			label: 'Footer Links',
			label_singular: 'Group',
			widget: 'list',
			collapsed: false,
			min: 3,
			max: 3,
			fields: [
				{
					name: 'group',
					label: 'Group',
					widget: 'list',
					collapsed: false,
					fields: [
						{ name: 'label', label: 'Label' },
						{
							name: 'page',
							label: 'Page',
							widget: 'relation',
							collection: 'pages',
							search_fields: ['title'],
							value_field: '/{{slug}}',
							display_fields: ['title']
						}
					]
				}
			]
		}
	]
} satisfies CmsCollectionFile;
