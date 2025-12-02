<script module>
	window.CMS_MANUAL_INIT = true;
</script>

<script>
	import { resolve } from '$app/paths';

	function ready() {
		window.CMS.init({
			config: {
				backend: {
					name: 'github',
					repo: 'Essencia-life/Website',
					branch: 'main',
					base_url: 'https://essencia-cockpit.vercel.app',
					auth_endpoint: resolve('/cms/auth')
				},
				load_config_file: false,
				site_url: 'https://www.essencia.life',
				publish_mode: 'editorial_workflow',
				media_folder: '/static/media',
				public_folder: '/media',
				collections: [
					{
						name: 'pages',
						label: '📙️ Pages',
						label_singular: 'Page',
						folder: 'src/lib/content/pages',
						create: true,
						preview_path: '{{slug}}',
						nested: {
							depth: 3,
							subfolders: false
						},
						meta: {
							path: {
								label: 'Path',
								widget: 'string',
								index_file: ''
							}
						},
						fields: [
							{ name: 'title', label: 'Page Title' },
							{ name: 'body', label: 'Content', widget: 'markdown' }
						]
					},
					{
						name: 'entities',
						label: '📄️ Entities',
						label_singular: 'Entity',
						format: 'json',
						editor: {
							preview: false
						},
						files: [
							{
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
													{ name: 'landscape', label: 'Landscape', widget: 'file' },
													{ name: 'portrait', label: 'Portrait', widget: 'file' }
												]
											},
											{
												name: 'fallback_image',
												label: 'Fallback Image',
												widget: 'object',
												fields: [
													{ name: 'landscape', label: 'Landscape', widget: 'file' },
													{ name: 'portrait', label: 'Portrait', widget: 'file' }
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
													{ name: 'photo', label: 'Photo', widget: 'file' },
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
														fields: [{ name: 'photo', label: 'Photo', widget: 'file' }]
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
							},
							{
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
							},
							{
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
							},
							{
								name: 'events',
								label: '🗓️ Events',
								file: 'src/lib/content/events.json',
								media_folder: '/static/media/events',
								public_folder: '/media/events',
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
											{ name: 'cover_image', label: 'Cover Image', widget: 'file' },
											{ name: 'short_description', label: 'Short Description' },
											{
												name: 'description',
												label: 'Description',
												widget: 'markdown',
												buttons: [
													'bold',
													'italic',
													'quote',
													'link',
													'bulleted-list',
													'numbered-list'
												],
												editor_components: []
											},
											{ name: 'start', label: 'Start Date & Time', widget: 'datetime' },
											{ name: 'end', label: 'End Date & Time', widget: 'datetime' }
										]
									}
								]
							},
							{
								name: 'accommodations',
								label: '🛖️ Accommodations',
								file: 'src/lib/content/accommodations.json',
								media_folder: '/static/media/accommodations',
								public_folder: '/media/accommodations',
								fields: [
									{
										name: 'accommodations',
										label: 'Accommodations',
										widget: 'list',
										fields: [
											{ name: 'name', label: 'Name', widget: 'hidden' },
											{ name: 'headline', label: 'Headline' },
											{ name: 'short_description', label: 'Short Description' },
											{ name: 'photo', label: 'Photo', widget: 'file' },
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
															{ name: 'photo', label: 'Photo', widget: 'file' }
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
							},
							{
								name: 'petals',
								label: '🌸️ Petals & Roles',
								file: 'src/lib/content/petals.json',
								fields: [{ name: 'title', label: 'Title' }]
							}
						]
					}
				]
			}
		});
	}
</script>

<svelte:head>
	<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js" onload={ready}></script>
</svelte:head>

<div id="nc-root"></div>
