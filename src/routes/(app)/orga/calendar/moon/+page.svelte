<script lang="ts">
	import type { VEvent } from 'node-ical';
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';

	interface Props {
		data: PageServerData;
	}

	const { data }: Props = $props();

	const events = $derived(Object.values(data.events).filter((it) => it.type === 'VEVENT'));
	const retreats = $derived(Object.values(data.retreats).filter((it) => it.type === 'VEVENT'));
	const community = $derived(Object.values(data.community).filter((it) => it.type === 'VEVENT'));

	onMount(() => {
		console.log('Last New Moon:', data.lastNewMoon);
		console.log('Next New Moon:', data.nextNewMoon);
		console.log('Current Cycle Phases:');
		console.table(data.currentCyclePhases);
		console.log(data.events, data.retreats, data.community);
	});

	function markerPosition(date: Date) {
		const start = data.nextNewMoon.date.getTime();
		const end = data.lastNewMoon.date.getTime();
		const total = end - start;
		const progress = (date.getTime() - start) / total;

		const angle = progress * Math.PI;

		const x = (Math.cos(angle) + 1) / 2;
		let y = 1 - Math.sin(angle);

		if (y > 0.99) {
			y = 0.96;
		}

		return { left: x * 100 + '%', top: y * 100 + '%' };
	}

	function segement(event: VEvent) {
		const start = data.nextNewMoon.date.getTime();
		const end = data.lastNewMoon.date.getTime();
		const total = end - start;

		const rangeStart = new Date(event.start);
		const rangeEnd = new Date(event.end);

		const toAngle = (date: Date) => ((date.getTime() - start) / total) * Math.PI;

		const a1 = toAngle(rangeStart);
		const a2 = toAngle(rangeEnd);

		const cx = 50,
			cy = 50,
			r = 50;

		const x1 = cx + r * Math.cos(a1);
		const y1 = cy - r * Math.sin(a1);

		const x2 = cx + r * Math.cos(a2);
		const y2 = cy - r * Math.sin(a2);

		const largeArc = a2 - a2 > Math.PI ? 1 : 0;

		return `
			M ${x1} ${y1}
			A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
		`;
	}
</script>

<div class="calendar">
	<div class="background"></div>
	<div class="moon-phases">
		{#each data.currentCyclePhases as { phase, date, emoji } (phase)}
			{@const { top, left } = markerPosition(date)}
			<div style:top style:left title={`${date.toLocaleDateString()} (${phase})`}>{emoji}</div>
		{/each}
	</div>
	<svg viewBox="0 -1 100 51" class="events" preserveAspectRatio="none">
		{#each events as event}
			<path d={segement(event)} />
		{/each}
	</svg>
	<svg viewBox="0 -1 100 51" class="retreats" preserveAspectRatio="none">
		{#each retreats as retreat}
			<path d={segement(retreat)} />
		{/each}
	</svg>
	<svg viewBox="0 -1 100 51" class="community" preserveAspectRatio="none">
		{#each community as communityEvent}
			<path d={segement(communityEvent)} />
		{/each}
	</svg>
</div>

<style>
	.calendar {
		position: relative;
		width: 90%;
		aspect-ratio: 2 / 1;
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
		inset: 1em 1em 0;
	}

	.moon-phases > div {
		position: absolute;
		transform: translate(-50%, -50%);
		font-family: 'Noto Color Emoji', sans-serif;
		cursor: default;
	}

	.events,
	.retreats,
	.community {
		inset: 3em 3em 0;
	}

	.events > path {
		stroke: skyblue;
	}

	.retreats > path {
		stroke: orange;
	}

	.community > path {
		stroke: green;
	}

	svg > path {
		fill: none;
		transition: stroke-width 100ms ease-in-out;
	}

	svg > path:hover {
		stroke-width: 2;
	}

	svg > path:not(:hover) {
		opacity: 0.5;
	}
</style>
