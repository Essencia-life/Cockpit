import type { CmsCollectionFile } from 'decap-cms-core';

export default {
	name: 'home',
	file: 'src/lib/content/home.json',
	label: '🌐️ Homepage',
	fields: [
		{
			label: 'Hero',
			name: 'hero',
			widget: 'object',
			fields: [
				{
					name: 'video',
					label: 'Video',
					widget: 'object',
					fields: [
						{
							name: 'landscape',
							label: 'Landscape',
							widget: 'file',
							media_folder: '/static/media',
							choose_url: false
						},
						{
							name: 'portrait',
							label: 'Portrait',
							widget: 'file',
							media_folder: '/static/media',
							choose_url: false
						}
					]
				},
				{
					name: 'fallback_image',
					label: 'Fallback Image',
					widget: 'object',
					fields: [
						{ name: 'landscape', label: 'Landscape', widget: 'file', choose_url: false },
						{ name: 'portrait', label: 'Portrait', widget: 'file', choose_url: false }
					]
				},
				{ name: 'slogan', label: 'Slogan' },
				{ name: 'watchButton', label: 'Watch Button' }
			]
		},
		{
			name: 'sections',
			label: 'Sections',
			widget: 'list',
			types: [
				{
					name: 'text',
					label: 'Text Section',
					summary: '{{headline}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'text' },
						{ name: 'id', label: 'ID' },
						{ name: 'headline', label: 'Headline' },
						{
							name: 'content',
							label: 'Content',
							widget: 'markdown',
							buttons: ['bold', 'italic', 'link', 'quote'],
							editor_components: []
						},
						{ name: 'photo', label: 'Photo', widget: 'file', choose_url: false },
						{
							name: 'button',
							label: 'Button',
							widget: 'object',
							fields: [
								{ name: 'label', label: 'Label' },
								{ name: 'link', label: 'Link' }
							]
						}
					]
				},
				{
					name: 'events',
					label: 'Events Section',
					summary: '{{headline}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'events' },
						{ name: 'id', label: 'ID' },
						{ name: 'headline', label: 'Headline' },
						{
							name: 'buttons',
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
								}
							]
						}
					]
				},
				{
					name: 'community-day',
					label: 'Community Day Section',
					summary: '{{headline}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'community-day' },
						{ name: 'id', label: 'ID' },
						{ name: 'headline', label: 'Headline' },
						{
							name: 'content',
							label: 'Content',
							widget: 'markdown',
							buttons: ['bold', 'italic'],
							editor_components: []
						},
						{
							name: 'photos',
							label: 'Photos',
							widget: 'list',
							min: 2,
							max: 2,
							fields: [{ name: 'photo', label: 'Photo', widget: 'file', choose_url: false }]
						},
						{
							name: 'button',
							label: 'Button',
							widget: 'object',
							fields: [
								{ name: 'label', label: 'Label' },
								{ name: 'link', label: 'Link' }
							]
						}
					]
				},
				{
					name: 'accommodations',
					label: 'Visit Section',
					summary: '{{headline}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'accommodations' },
						{ name: 'id', label: 'ID' },
						{ name: 'headline', label: 'Headline' },
						{
							name: 'content',
							label: 'Content',
							widget: 'markdown',
							buttons: ['bold', 'italic'],
							editor_components: []
						}
					]
				},
				{
					name: 'map',
					label: 'Map Section',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'map' },
						{ name: 'id', label: 'ID' }
					]
				},
				{
					// TODO: can be the same type as visit (maybe "text" and rename "text" to "text_photo" ?
					name: 'social-media',
					label: 'Social Media Section',
					summary: '{{headline}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'social-media' },
						{ name: 'id', label: 'ID' },
						{ name: 'headline', label: 'Headline' },
						{
							name: 'content',
							label: 'Content',
							widget: 'markdown',
							buttons: ['bold', 'italic'],
							editor_components: []
						},
						{
							name: 'platforms',
							label: 'Social Media Platforms',
							label_singular: 'Platform',
							widget: 'list',
							min: 4,
							max: 4,
							field: {
								name: 'platform',
								label: 'Platform',
								widget: 'relation',
								collection: 'social_media',
								search_fields: ['label'],
								value_field: 'name',
								display_fields: ['label']
							}
						}
					]
				},
				{
					name: 'testimonials',
					label: 'Testimonials Section',
					summary: '{{headline}}',
					widget: 'object',
					fields: [
						{ name: 'type', widget: 'hidden', default: 'testimonials' },
						{ name: 'id', label: 'ID' },
						{ name: 'headline', label: 'Headline' },
						{
							name: 'items',
							label: 'Items',
							widget: 'list',
							min: 2,
							max: 2,
							fields: [
								{ name: 'cite', label: 'Cite' },
								{ name: 'quote', label: 'Quote' },
								{ name: 'link', label: 'Link' },
								{
									name: 'platform',
									label: 'Platform',
									widget: 'select',
									options: ['Airbnb']
								}
							]
						}
					]
				}
			]
		}
	]
} satisfies CmsCollectionFile;
