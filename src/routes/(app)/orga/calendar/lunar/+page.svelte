<script lang="ts">
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	interface Props {
		data: PageServerData;
	}

	const { data }: Props = $props();

	const today = new Date();
	const oneDay = 24 * 60 * 60 * 1000;

	const events = $derived(data.events);
	const retreats = $derived(data.retreats);
	const community = $derived(data.community);
	const todayPercent = $derived.by(() => {
		const percentage = percent(today);
		return percentage < 0 ? 1 : percentage > 1 ? 0 : percentage;
	});

	onMount(() => {
		// console.log('Last New Moon:', data.lastNewMoon);
		// console.log('Next New Moon:', data.nextNewMoon);
		// console.log('Current Cycle Phases:');
		// console.table(data.currentCyclePhases);
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

	interface Event {
		start: Date;
		end: Date;
		title: string;
	}

	function percent(date: Date) {
		const start = data.nextNewMoon.date.getTime();
		const end = data.lastNewMoon.date.getTime();
		const total = end - start;

		return (date.getTime() - start) / total;
	}

	function segement(event: Event) {
		const rangeStart = event.start;
		const rangeEnd = event.end;

		const toAngle = (date: Date) => percent(date) * Math.PI;

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

	function formatDate(date: Date) {
		return date.toLocaleDateString('de', {
			day: 'numeric',
			month: 'numeric'
		});
	}

	async function prev() {
		const url = new URL(page.url);
		url.searchParams.set('refDate', data.lastNewMoon.date.toISOString());
		goto(url);
	}

	async function next() {
		const url = new URL(page.url);
		url.searchParams.set(
			'refDate',
			new Date(data.nextNewMoon.date.getTime() + oneDay).toISOString()
		);
		goto(url);
	}
</script>

{#snippet segementText(event: Event)}
	{@const { top, left } = markerPosition(event.start)}
	{@const beforeFullMoon = event.start.getTime() < data.fullMoon!.date.getTime()}
	<g transform="translate({beforeFullMoon ? -1 : 1}, 0)">
		<text x={left} y={top} font-size="2" text-anchor={beforeFullMoon ? 'end' : 'start'}>
			{#if !beforeFullMoon}
				{formatDate(event.start)}
			{/if}
			{event.title}
			{#if beforeFullMoon}
				{formatDate(event.start)}
			{/if}
		</text>
	</g>
{/snippet}

<h1 class="h3">Lunar Calendar</h1>

<div class="calendar">
	<div class="arc" style:--value={todayPercent}></div>
	<div class="moon-phases">
		{#each data.cyclePhases as { phase, date, emoji } (phase)}
			{@const { top, left } = markerPosition(date)}
			<div style:top style:left title={`${date.toLocaleDateString()} (${phase})`}>{emoji}</div>
		{/each}
	</div>
	<svg viewBox="0 0 100 50" preserveAspectRatio="none">
		{#each retreats as retreat}
			{@render segementText(retreat)}
			<path class="retreat" d={segement(retreat)} />
		{/each}
		{#each events as event}
			{@render segementText(event)}
			<path class="event" d={segement(event)} />
		{/each}
		{#each community as communityEvent}
			{@render segementText(communityEvent)}
			<path class="community" d={segement(communityEvent)} />
		{/each}
	</svg>
</div>

<nav>
	<button type="button" class="btn preset-filled btn-sm" onclick={prev}>
		<ArrowLeftIcon size={18} />
		<span>Previous</span>
	</button>
	<button type="button" class="btn preset-filled btn-sm" onclick={next}>
		<span>Next</span>
		<ArrowRightIcon size={18} />
	</button>
</nav>

<style>
	h1 {
		margin: auto;
	}

	.calendar {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 1;
		overflow-x: visible;
		overflow-y: hidden;
		margin: auto auto 0;
	}

	.calendar :global(> *) {
		--space: 0;
		position: absolute;
		inset: var(--space) var(--space) 0;
	}

	.arc {
		--space: 14em;
		aspect-ratio: 1;
		border-radius: 100%;
		border: 1px solid #ccc;
		background: conic-gradient(
			from -90deg,
			rgba(0 0 0 / 2%) calc(var(--value) * 360deg),
			transparent 0
		);
	}

	.moon-phases {
		--space: 16em;
	}

	.moon-phases > div {
		position: absolute;
		transform: translate(-50%, -50%);
		font-family: 'Noto Color Emoji', sans-serif;
		cursor: default;
	}

	.calendar > svg {
		--space: 13em;
		overflow: visible;
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

	path.event {
		stroke: skyblue;
	}

	path.retreat {
		stroke: orange;
	}

	path.community {
		stroke: green;
	}

	nav {
		display: flex;
		width: 70%;
		margin: auto;
		justify-content: space-between;
	}
</style>
