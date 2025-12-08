<script module>
	window.CMS_MANUAL_INIT = true;
</script>

<script>
	import { resolve } from '$app/paths';
	import pages from '$lib/cms/collections/pages.js';
	import homepage from '$lib/cms/collections/homepage.js';
	import socialMedia from '$lib/cms/collections/social-media.js';
	import header from '$lib/cms/collections/header.js';
	import footer from '$lib/cms/collections/footer.js';
	import events from '$lib/cms/collections/events.js';
	import accommodations from '$lib/cms/collections/accommodations.js';
	import eventCalendar from '$lib/cms/editor-components/event-calendar.js';

	function ready() {
		window.CMS.init({
			config: {
				backend: {
					name: 'github',
					repo: 'Essencia-life/Website',
					branch: 'main',
					base_url: 'https://essencia-cockpit.vercel.app',
					auth_endpoint: resolve('/api/cms/auth')
				},
				load_config_file: false,
				site_url: 'https://www.essencia.life',
				publish_mode: 'editorial_workflow',
				media_folder: 'src/lib/assets/media',
				public_folder: 'media',
				collections: [
					pages,
					{
						name: 'entities',
						label: '📄️ Entities',
						label_singular: 'Entity',
						format: 'json',
						editor: {
							// preview: false
						},
						files: [
							homepage,
							socialMedia,
							header,
							footer,
							events,
							accommodations,
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

		window.CMS.registerEditorComponent(eventCalendar);
	}
</script>

<svelte:head>
	<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js" onload={ready}></script>
</svelte:head>

<div id="nc-root"></div>
