<script lang="ts">
	import {
		Combobox,
		Portal,
		type ComboboxRootProps,
		useListCollection
	} from '@skeletonlabs/skeleton-svelte';
	import { getUsers } from '$lib/remote/telegram-user.remote.ts';
	import type { RemoteFormField } from '@sveltejs/kit';

	interface Props {
		field: RemoteFormField<number>;
		placeholder: string;
		value: number;
	}

	let { placeholder, field, value }: Props = $props();

	const data = await getUsers();
	let inputValue = $state('');
	let items = $state(data);

	const collection = $derived(
		useListCollection({
			items: items,
			itemToString: (item) => item.first_name,
			itemToValue: (item) => String(item.id)
		})
	);

	const onOpenChange = () => {
		items = data;
	};

	const onInputValueChange: ComboboxRootProps['onInputValueChange'] = (event) => {
		inputValue = event.inputValue;

		const filtered = data.filter((item) => {
			const v = event.inputValue.toLowerCase();
			return (
				item.first_name.toLowerCase().includes(v) ||
				item.last_name?.toLowerCase().includes(v) ||
				item.username?.toLowerCase().includes(v)
			);
		});

		items = filtered.length > 0 ? filtered : data;
	};

	const onValueChange: ComboboxRootProps['onValueChange'] = (event) => {
		value = event.value[0] ?? null;
	};

	$effect(() => {
		if (!value) {
			inputValue = '';
			return;
		}

		const item = collection.find(value.toString());
		inputValue = item ? item.first_name : '';
	});
</script>

<Combobox
	{placeholder}
	{collection}
	{onOpenChange}
	{onInputValueChange}
	{onValueChange}
	inputBehavior="autohighlight"
	value={value ? [value] : []}
	{inputValue}
>
	<Combobox.Control>
		<Combobox.Input />
	</Combobox.Control>
	<Portal>
		<Combobox.Positioner>
			<Combobox.Content>
				{#each items as item (item.id)}
					<Combobox.Item {item}>
						<Combobox.ItemText>
							{item.first_name}
							{item.last_name ?? ''}
							{#if item.username}
								<i>@{item.username}</i>
							{/if}
						</Combobox.ItemText>
						<Combobox.ItemIndicator />
					</Combobox.Item>
				{/each}
			</Combobox.Content>
		</Combobox.Positioner>
	</Portal>
</Combobox>

<input hidden bind:value {...field.as('number')} />
