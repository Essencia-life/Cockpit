<script lang="ts">
	import {
		Combobox,
		Portal,
		type ComboboxRootProps,
		useListCollection
	} from '@skeletonlabs/skeleton-svelte';
	import { getUsers } from '$lib/remote/telegram-user.remote.ts';

	interface Props {
		placeholder: string;
		[key: string]: any;
	}

	let { placeholder, ...restProps }: Props = $props();

	const data = await getUsers();
	let value = $state < number > ();
	let items = $state(data);

	const collection = $derived(
		useListCollection({
			items: items,
			itemToString: (item) => item.first_name,
			itemToValue: (item) => item.id
		})
	);

	const onOpenChange = () => {
		items = data;
	};

	const onInputValueChange: ComboboxRootProps['onInputValueChange'] = (event) => {
		const filtered = data.filter((item) =>
			item.first_name.toLowerCase().includes(event.inputValue.toLowerCase()) ||
			item.last_name?.toLowerCase().includes(event.inputValue.toLowerCase()) ||
			item.username?.toLowerCase().includes(event.inputValue.toLowerCase())
		);
		if (filtered.length > 0) {
			items = filtered;
		} else {
			items = data;
		}
	};

	const onValueChange: ComboboxRootProps['onValueChange'] = (event) => {
		value = parseInt(event.value[0]);
	};

</script>

<Combobox {placeholder} {collection} {onOpenChange} {onInputValueChange} {onValueChange} inputBehavior="autohighlight"
	value={[value]} defaultValue={[value]}>
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

<input hidden bind:value {...restProps} />