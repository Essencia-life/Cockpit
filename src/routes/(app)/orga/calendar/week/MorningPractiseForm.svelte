<script lang="ts">
    import TelegramUserSelect from '$lib/components/TelegramUserSelect.svelte';
    import { saveMorningPractise, getEvents } from './calendar.remote.ts';

    interface Props {
        day: Date;
    }

    const { day }: Props = $props();
    const events = await getEvents();

    const dayStr = $derived(day.toLocaleDateString('en'));
    const form = $derived(saveMorningPractise.for(dayStr));
    const event = $derived(
        events?.find(
            (event) =>
                event.extendedProperties!.private!.type === 'morning-practise' &&
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
    <input class="input" placeholder="Practise" {...form.fields.practise.as('text')} />
    <TelegramUserSelect placeholder="Facilitator" {...form.fields.facilitator[0].as('number')} />
    <TelegramUserSelect placeholder="Co-Facilitator" {...form.fields.facilitator[1].as('number')} />
    <input type="hidden" name="day" value={dayStr} />
    <button class="btn w-full preset-filled">Save</button>
</form>