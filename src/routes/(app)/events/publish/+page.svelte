<script lang="ts">
	import type { PageProps } from './$types';
	import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';
	import { slide } from 'svelte/transition';

	const { form }: PageProps = $props();
	const toaster = createToaster({
		placement: 'top'
	});

	let telegramChannel = $state(true);
	let telegramCarSharingGroup = $state(true);
	let telegramTicketLinkButton = $state(false);

	$effect(() => {
		if (form.success) {
			toaster.success({
				title: 'Success',
				duration: 10_000,
				description: 'Event was published'
			});
		}
	});
</script>

<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast {toast}>
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
				<Toast.Description>{toast.description}</Toast.Description>
			</Toast.Message>
			<Toast.CloseTrigger />
		</Toast>
	{/snippet}
</Toast.Group>

<form method="post" enctype="multipart/form-data" class="w-full max-w-md space-y-4 p-4">
	<fieldset class="space-y-4">
		<label class="label">
			<span class="label-text">Date</span>
			<input required name="date" class="input" type="date" />
		</label>

		<label class="label">
			<span class="label-text">Title</span>
			<input required name="title" class="input" type="text" />
		</label>

		<label class="label">
			<span class="label-text">Cover image</span>
			<input required name="cover" class="input" type="file" accept="image/*" />
		</label>

		<label class="label">
			<span class="label-text">Description</span>
			<textarea
				required
				name="description"
				class="textarea rounded-container"
				rows="10"
				maxlength="1024"
				placeholder="Event description"
			></textarea>
		</label>

		<div>
			<label class="flex space-x-2">
				<input
					name="telegram_channel"
					class="checkbox"
					type="checkbox"
					bind:checked={telegramChannel}
				/>
				<p class="leading-[20px]">Post in Telegram channel</p>
			</label>

			<fieldset class="ml-7" disabled={!telegramChannel}>
				<label class="mt-2 flex space-x-2">
					<input
						name="telegram_car_sharing"
						class="checkbox"
						type="checkbox"
						bind:checked={telegramCarSharingGroup}
					/>
					<p class="leading-[20px]">Create topic in car sharing group</p>
				</label>
				<fieldset class="ml-7" disabled={!telegramCarSharingGroup}>
					<label class="mt-2 flex space-x-2">
						<input
							name="telegram_car_sharing_forward_channel_post"
							class="checkbox"
							type="checkbox"
						/>
						<p class="leading-[20px]">Forward channel post to topic in car sharing group</p>
					</label>
					<label class="mt-2 flex space-x-2">
						<input name="telegram_channel_car_sharing_button" class="checkbox" type="checkbox" />
						<p class="leading-[20px]">
							Add button in channel post linked to topic in car sharing group
						</p>
					</label>
				</fieldset>
				<label class="mt-2 flex space-x-2">
					<input
						name="telegram_channel_ticket_button"
						class="checkbox"
						type="checkbox"
						bind:checked={telegramTicketLinkButton}
					/>
					<p class="leading-[20px]">Add button linked to ticket website</p>
				</label>
				{#if telegramTicketLinkButton}
					<fieldset class="mt-2 ml-7" transition:slide>
						<label class="label">
							<span class="label-text">Ticket link</span>
							<input
								name="ticket_link"
								class="input"
								type="url"
								required
								placeholder="Paste ticket link"
							/>
						</label>
					</fieldset>
				{/if}
			</fieldset>
		</div>
	</fieldset>

	<fieldset class="flex justify-end">
		<!-- TODO loading spinner & button disable -->
		<button class="btn preset-outlined-surface-300-700">Submit</button>
	</fieldset>
</form>
