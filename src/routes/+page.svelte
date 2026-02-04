<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<form method="post" use:enhance>
	<button class="btn">Sign out</button>
</form>
