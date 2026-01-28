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
	const eventProps = $derived(event?.extendedProperties?.private);
</script>

<form {...form.enhance(({ submit }) => submit())}>
	<input
		class="input"
		placeholder="Practise"
		{...form.fields.practise.as('text')}
		value={eventProps?.practise}
	/>
	<TelegramUserSelect
		placeholder="Facilitator"
		field={form.fields.facilitator}
		value={eventProps?.facilitator}
	/>
	<input type="hidden" name="day" value={dayStr} />
	<input type="hidden" name="eventId" value={event?.id ?? ''} />
	<button class="btn w-full preset-filled">Save</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
