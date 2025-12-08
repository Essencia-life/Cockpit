import type { CmsCollectionFile } from 'decap-cms-core';

export default {
	name: 'header',
	file: 'src/lib/content/header.json',
	label: '🗣️ Header',
	fields: [
		{
			name: 'navigation',
			label: 'Navigation Items',
			label_singular: 'Item',
			widget: 'list',
			fields: [
				{ name: 'label', label: 'Label' },
				{
					name: 'link',
					label: 'Link',
					widget: 'relation',
					collection: 'pages',
					search_fields: ['title'],
					value_field: '/{{slug}}',
					display_fields: ['title']
				},
				{
					name: 'children',
					label: 'Submenu Items',
					label_singular: 'Item',
					widget: 'list',
					required: false,
					fields: [
						{ name: 'label', label: 'Label' },
						{
							name: 'link',
							label: 'Link',
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
