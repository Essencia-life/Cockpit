<script module>
	window.CMS_MANUAL_INIT = true;
</script>

<script>
	import { resolve } from '$app/paths';
	import weeklyJobs from '$lib/cms/collections/weekly-jobs.js';

	function ready() {
		window.CMS.init({
			config: {
				backend: {
					name: 'github',
					repo: 'Essencia-life/Cockpit',
					branch: 'main',
					base_url: 'https://essencia-cockpit.vercel.app',
					auth_endpoint: resolve('/api/cms/auth'),
					commit_messages: {
						create: 'feat({{collection}}): created “{{slug}}”',
						update: 'feat({{collection}}): updated “{{slug}}”',
						delete: 'feat({{collection}}): deleted “{{slug}}”',
						uploadMedia: 'feat({{collection}}): uploaded “{{path}}”',
						deleteMedia: 'feat({{collection}}): deleted “{{path}}”'
					}
				},
				load_config_file: false,
				media_folder: 'src/lib/assets',
				public_folder: '',
				collections: [
					{
						name: 'configuration',
						label: 'Configuration',
						format: 'json',
						editor: {
							preview: false
						},
						files: [weeklyJobs]
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
