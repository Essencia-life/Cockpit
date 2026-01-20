<script lang="ts">
	import TelegramUserSelect from '$lib/components/TelegramUserSelect.svelte';
	import { saveWeekTasks } from './calendar.remote.ts';

	interface Props {
		events: any[];
	}

	const { events }: Props = $props();

	const event = $derived(
		events?.find((event) => event.extendedProperties!.private!.type === 'week-tasks')
	);
	const data = $derived(JSON.parse(event?.extendedProperties!.private!.data ?? 'null'));
</script>

<form {...saveWeekTasks.enhance(({ submit }) => submit())}>
	<TelegramUserSelect placeholder="Fairy" field={saveWeekTasks.fields.fairy} value={data?.fairy} />
	<TelegramUserSelect
		placeholder="Fairy Trainee"
		field={saveWeekTasks.fields.fairyTrainee}
		value={data?.fairyTrainee}
	/>
	<TelegramUserSelect
		placeholder="Feeding the cat"
		field={saveWeekTasks.fields.catFeeding}
		value={data?.catFeeding}
	/>
	<TelegramUserSelect
		placeholder="Garden"
		field={saveWeekTasks.fields.garden}
		value={data?.garden}
	/>
	<button class="btn w-full preset-filled">Save</button>
</form>

<style>
	form {
		display: flex;
		gap: 8px;
	}
</style>
