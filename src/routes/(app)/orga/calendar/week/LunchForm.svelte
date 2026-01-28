<script lang="ts">
	import TelegramUserSelect from '$lib/components/TelegramUserSelect.svelte';
	import { saveLunch } from './calendar.remote.ts';

	interface Props {
		day: Date;
		events: any[];
	}

	const { day, events }: Props = $props();

	const dayStr = $derived(day.toLocaleDateString('en'));
	const form = $derived(saveLunch.for(dayStr));
	const event = $derived(
		events?.find(
			(event) =>
				event.extendedProperties!.private!.type === 'lunch' &&
				new Date(event.start!.dateTime ?? '').toLocaleDateString('en') === dayStr
		)
	);
	const eventProps = $derived(event?.extendedProperties?.private);
</script>

<form {...form.enhance(({ submit }) => submit())}>
	<TelegramUserSelect placeholder="Chef" field={form.fields.chef} value={eventProps?.chef} />
	<TelegramUserSelect placeholder="Co-Chef" field={form.fields.chef2} value={eventProps?.chef2} />
	<TelegramUserSelect
		placeholder="Cleaner"
		field={form.fields.cleaner}
		value={eventProps?.cleaner}
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
