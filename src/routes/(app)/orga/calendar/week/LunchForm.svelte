<script lang="ts">
    import TelegramUserSelect from '$lib/components/TelegramUserSelect.svelte';
    import { saveLunch, getEvents } from './calendar.remote.ts';

    interface Props {
        day: Date;
    }

    const { day }: Props = $props();
    const events = await getEvents();

    const dayStr = $derived(day.toLocaleDateString('en'));
    const form = $derived(saveLunch.for(dayStr));
    const event = $derived(
        events?.find(
            (event) =>
                event.extendedProperties!.private!.type === 'lunch' &&
                new Date(event.start!.dateTime ?? '').toLocaleDateString('en') === dayStr
        )
    );
    const data = $derived(JSON.parse(event?.extendedProperties!.private!.data ?? '{}'));

    $effect(() => {
        console.log(data);
        form.fields.set(data)
    });
</script>

<form {...form.enhance(({ submit })=> submit())}>
    <TelegramUserSelect placeholder="Chef" {...form.fields.chef[0].as('number')} />
    <TelegramUserSelect placeholder="Co-Chef" {...form.fields.chef[1].as('number')} />
    <TelegramUserSelect placeholder="Cleaner" {...form.fields.cleaner.as('number')} />
    <input type="hidden" name="day" value={dayStr} />
    <button class="btn w-full preset-filled">Save</button>
</form>