<script lang="ts">
	let { children } = $props();
</script>

<div class="flex">
	<nav>
		<h3>Marketing</h3>
		<ul>
			<li><a href="/cms/website">CMS Website</a></li>
		</ul>
	</nav>
	<main>
		{@render children()}
	</main>
</div>
