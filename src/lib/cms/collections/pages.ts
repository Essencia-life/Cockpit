import type { CmsCollection } from 'decap-cms-core';

export default {
	name: 'pages',
	label: '📙️ Pages',
	label_singular: 'Page',
	folder: 'src/routes/(pages)',
	create: true,
	preview_path: '{{slug}}',
	nested: {
		// summary: '{{path}}',
		depth: 3,
		subfolders: false
	},
	// TODO: summary
	meta: {
		path: {
			label: 'Path',
			widget: 'string',
			index_file: '+page'
		}
	},
	fields: [
		{ name: 'title', label: 'Page Title' },
		{
			name: 'description',
			label: 'Page description',
			required: false,
			hint: 'Relevant SEO & social media shares'
		},
		{
			name: 'cover',
			label: 'Page cover',
			required: false,
			hint: 'Relevant for social media shares'
		},
		{
			name: 'body',
			label: 'Content',
			widget: 'markdown',
			buttons: [
				'bold',
				'italic',
				'code',
				'link',
				'heading-two',
				'heading-three',
				'heading-four',
				'heading-five',
				'heading-six',
				'quote',
				'bulleted-list',
				'numbered-list'
			]
		}
	]
} satisfies CmsCollection;
