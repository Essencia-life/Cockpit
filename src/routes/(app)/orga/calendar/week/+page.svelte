<script lang="ts">
	import LunchForm from './LunchForm.svelte';
	import MorningPractiseForm from './MorningPractiseForm.svelte';

	const today = new Date();
	const days = $derived(
		Array.from(
			{ length: 6 },
			(_, index) =>
				new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate() - today.getDay() + 1 + (index === 5 ? 7 : index)
				)
		)
	);
</script>

<div class="week">
	<div></div>
	{#each days as day (day)}
	<div class="headline">{day.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'numeric' })}</div>
	{/each}

	<div class="title">Morning Practise</div>
	{#each days as day (day)}
	<div>
		<MorningPractiseForm {day} />
	</div>
	{/each}

	<div class="title">Lunch</div>
	{#each days as day (day)}
	<div>
		<LunchForm {day} />
	</div>
	{/each}
</div>

<style>
	.week {
		display: grid;
		grid-template-columns: auto repeat(6, 1fr);
		gap: 32px 8px;
		padding: 8px;
	}

	.week div> :global(* + *) {
		margin-top: 8px;
	}

	.headline {
		text-transform: capitalize;
		font-weight: 500;
		text-align: center;
	}

	.title {
		padding: 4px 12px 0 4px;
		border-right: 2px solid #efefef;
	}
</style>