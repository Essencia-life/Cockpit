<script lang="ts">
	import type { PageServerData } from './$types';
	import { onDestroy, onMount, tick } from 'svelte';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteDate } from 'svelte/reactivity';

	interface Props {
		data: PageServerData;
	}

	const { data }: Props = $props();

	let rotation = $state(0);
	let navigating = $state();

	const today = new SvelteDate();
	const oneDay = 24 * 60 * 60 * 1000;

	let todayInterval: number;

	const events = $derived(data.events);
	const retreats = $derived(data.retreats);
	const community = $derived(data.community);
	const todayPercent = $derived.by(() => {
		const percentage = percent(today);
		return percentage < 0 ? 0 : percentage > 1 ? 1 : percentage;
	});

	onMount(() => {
		todayInterval = window.setInterval(() => today.setTime(Date.now()), 60_000);
	});

	onDestroy(() => {
		if (todayInterval) {
			window.clearInterval(todayInterval);
		}
	});

	interface Event {
		start: Date;
		end: Date;
		title: string;
	}

	function markerPosition(date: Date) {
		const angle = toAngle(date);

		const x = (Math.cos(angle) + 1) / 2;
		let y = 1 - Math.sin(angle);

		if (y > 0.99) {
			y = 0.96;
		}

		return { left: x * 100 + '%', top: y * 100 + '%' };
	}

	function percent(date: Date) {
		const start = data.lastNewMoon.date.getTime();
		const end = data.nextNewMoon.date.getTime();
		const total = end - start;

		return (date.getTime() - start) / total;
	}

	function toAngle(date: Date) {
		return (1 - percent(date)) * Math.PI;
	}

	function segement(event: Event) {
		const rangeStart = event.start;
		const rangeEnd = event.end;

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
		rotation += 180;
		navigating = true;
		await goto(url);
		rotation += 180;
		await tick();
		navigating = undefined;
	}

	async function next() {
		const url = new URL(page.url);
		url.searchParams.set(
			'refDate',
			new Date(data.nextNewMoon.date.getTime() + oneDay).toISOString()
		);
		rotation -= 180;
		navigating = true;
		await goto(url);
		rotation -= 180;
		await tick();
		navigating = undefined;
	}
</script>

{#snippet segementText(event: Event)}
	{@const { top, left } = markerPosition(event.start)}
	{@const beforeFullMoon = event.start.getTime() < data.fullMoon!.date.getTime()}
	<g transform="translate({beforeFullMoon ? -1 : 1}, 0)" hidden={navigating}>
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

<div class="calendar" style:--rotation="{rotation}deg">
	<div class="background" style:--value={todayPercent}></div>
	<div class="arc"></div>
	<div class="moon-phases">
		{#each data.cyclePhases as { phase, date, emoji } (phase)}
			{@const { top, left } = markerPosition(date)}
			<div style:top style:left title={`${date.toLocaleDateString()} (${phase})`}>{emoji}</div>
		{/each}
	</div>
	<svg viewBox="0 0 100 50" preserveAspectRatio="none">
		{#each retreats as retreat}
			<g class="segment retreat">
				{@render segementText(retreat)}
				<path d={segement(retreat)} />
			</g>
		{/each}
		{#each events as event}
			<g class="segment event">
				{@render segementText(event)}
				<path d={segement(event)} />
			</g>
		{/each}
		{#each community as communityEvent}
			<g class="segment community">
				{@render segementText(communityEvent)}
				<path d={segement(communityEvent)} />
			</g>
		{/each}
	</svg>
</div>

<nav>
	<button type="button" class="btn preset-filled btn-sm" onclick={prev}>
		<ArrowLeftIcon size={18} />
		<span>Previous</span>
	</button>
	<div>
		{data.lastNewMoon.date.toLocaleDateString('de')}
		&mdash;
		{data.nextNewMoon.date.toLocaleDateString('de')}
	</div>
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
		--rotation: 0deg;
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
		transition: transform 300ms ease-out;
		transform-origin: bottom center;
	}

	.arc,
	.background {
		--space: 14em;
		aspect-ratio: 1;
		border-radius: 100%;
		border: 1px solid #ccc;
	}

	.arc {
		border: 1px solid #ccc;
	}

	.background {
		--space: 14em;
		aspect-ratio: 1;
		border-radius: 100%;
		background: conic-gradient(
			from -90deg,
			rgba(0 0 0 / 2%) calc(var(--value) * 180deg),
			transparent 0
		);
		transform: rotate(var(--rotation));
	}

	.moon-phases {
		--space: 16em;
		transform: rotate(var(--rotation));
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
		transform: rotate(var(--rotation));
	}

	.segment path {
		fill: none;
		transition: stroke-width 100ms ease-in-out;
	}

	.segment:hover path {
		stroke-width: 2;
	}

	.segment:not(:hover) path {
		opacity: 0.5;
	}

	.segment.event path {
		stroke: skyblue;
	}

	.segment.retreat path {
		stroke: orange;
	}

	.segment.community path {
		stroke: green;
	}

	nav {
		display: flex;
		width: 70%;
		margin: auto;
		justify-content: space-between;
	}
</style>
