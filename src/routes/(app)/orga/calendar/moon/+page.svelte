<script lang="ts">
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	interface Props {
		data: PageServerData;
	}

	const { data }: Props = $props();

	onMount(() => {
		console.log('Last New Moon:', data.lastNewMoon);
		console.log('Next New Moon:', data.nextNewMoon);
		console.log('Current Cycle Phases:');
		console.table(
			Object.entries(data.currentCyclePhases).map(([phase, { date, emoji }]) => ({
				phase,
				date,
				emoji
			}))
		);
		console.log(data.calendar);
	});

	function markerPosition(date: Date) {
		const start = data.nextNewMoon.date.getTime();
		const end = data.lastNewMoon.date.getTime();
		const total = end - start;
		const progress = (date.getTime() - start) / total; // 0…1

		const angle = progress * Math.PI; // 0…π (Halbkreis)

		// Normierter Kreis mit Radius 1
		const x = (Math.cos(angle) + 1) / 2; // 0…1
		const y = 1 - Math.sin(angle); // 0…1 (oben=0, unten=1)

		// Prozentuale Position
		return { left: x * 100 + '%', top: y * 100 + '%' };
	}
</script>

<div class="calendar">
	<div class="background"></div>
	<div class="moon-phases">
		{#each Object.entries(data.currentCyclePhases) as [phase, { date, emoji }] (phase)}
			{@const { top, left } = markerPosition(date)}
			<div style:top style:left title={`${date.toLocaleDateString()} (${phase})`}>{emoji}</div>
		{/each}
	</div>
</div>

<style>
	.calendar {
		position: relative;
		width: 90%;
		aspect-ratio: 2 / 1; /* Halbkreis */
		overflow: hidden;
		margin: auto auto 0;
	}

	.calendar :global(> *) {
		position: absolute;
		inset: 0;
	}

	.background {
		aspect-ratio: 1;
		background: rgba(255 255 255 / 50%);
		border-radius: 100%;
	}

	.moon-phases {
		inset: 1em;
	}

	.moon-phases > div {
		position: absolute;
		transform: translate(-50%, -50%);
		font-family: 'Noto Color Emoji', sans-serif;
		cursor: default;
	}
</style>
