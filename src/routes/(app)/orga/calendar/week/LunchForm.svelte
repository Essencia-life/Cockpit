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
	const data = $derived(JSON.parse(event?.extendedProperties!.private!.data ?? 'null'));
</script>

<form {...form.enhance(({ submit }) => submit())}>
	<TelegramUserSelect placeholder="Chef" field={form.fields.chef[0]} value={data?.chef[0]} />
	<TelegramUserSelect placeholder="Co-Chef" field={form.fields.chef[1]} value={data?.chef[1]} />
	<TelegramUserSelect placeholder="Cleaner" field={form.fields.cleaner} value={data?.cleaner} />
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
