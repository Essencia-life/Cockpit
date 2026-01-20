<script lang="ts">
	import TelegramUserSelect from '$lib/components/TelegramUserSelect.svelte';
	import { saveMorningPractise } from './calendar.remote.ts';

	interface Props {
		day: Date;
		events: any[];
	}

	const { day, events }: Props = $props();

	const dayStr = $derived(day.toLocaleDateString('en'));
	const form = $derived(saveMorningPractise.for(dayStr));
	const event = $derived(
		events?.find(
			(event) =>
				event.extendedProperties!.private!.type === 'morning-practise' &&
				new Date(event.start!.dateTime ?? '').toLocaleDateString('en') === dayStr
		)
	);
	const data = $derived(JSON.parse(event?.extendedProperties!.private!.data ?? 'null'));
</script>

<form {...form.enhance(({ submit }) => submit())}>
	<input
		class="input"
		placeholder="Practise"
		{...form.fields.practise.as('text')}
		value={data?.practise}
	/>
	<TelegramUserSelect
		placeholder="Facilitator"
		field={form.fields.facilitator[0]}
		value={data?.facilitator[0]}
	/>
	<TelegramUserSelect
		placeholder="Co-Facilitator"
		field={form.fields.facilitator[1]}
		value={data?.facilitator[1]}
	/>
	<input type="hidden" name="day" value={dayStr} />
	<button class="btn w-full preset-filled">Save</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
