<script lang="ts">
	import { resolve } from '$app/paths';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { Moon, Globe, ClipboardList, CalendarRange } from '@lucide/svelte';

	let { children } = $props();
</script>

<div class="flex h-full">
	<Navigation layout="sidebar" class="grid grid-rows-[auto_1fr_auto] gap-4">
		<Navigation.Header>Essência</Navigation.Header>
		<Navigation.Content>
			<!--			<Navigation.Group>-->
			<!--				<Navigation.Menu>-->
			<!--					<a href="/" class={anchorSidebar}>-->
			<!--						<HouseIcon class="size-4" />-->
			<!--						<span>Home</span>-->
			<!--					</a>-->
			<!--				</Navigation.Menu>-->
			<!--			</Navigation.Group>-->
			<Navigation.Group>
				<Navigation.Label class="pl-2 capitalize">Organization</Navigation.Label>
				<Navigation.Menu>
					<a href={resolve('/orga')} class="btn w-full justify-start px-2 hover:preset-tonal">
						<ClipboardList class="size-4" />
						<span>Roles & Tasks</span>
					</a>
				</Navigation.Menu>
				<Navigation.Menu>
					<a
						href={resolve('/orga/calendar/lunar')}
						class="btn w-full justify-start px-2 hover:preset-tonal"
					>
						<Moon class="size-4" />
						<span>Lunar Calendar</span>
					</a>
				</Navigation.Menu>
				<Navigation.Menu>
					<a
						href={resolve('/orga/calendar/week')}
						class="btn w-full justify-start px-2 hover:preset-tonal"
					>
						<CalendarRange class="size-4" />
						<span>Week Planing</span>
					</a>
				</Navigation.Menu>
			</Navigation.Group>
			<Navigation.Group>
				<Navigation.Label class="pl-2 capitalize">Marketing</Navigation.Label>
				<Navigation.Menu>
					<a href={resolve('/marketing')} class="btn w-full justify-start px-2 hover:preset-tonal">
						<ClipboardList class="size-4" />
						<span>Roles & Tasks</span>
					</a>
				</Navigation.Menu>
				<Navigation.Menu>
					<a
						href={resolve('/marketing/website')}
						class="btn w-full justify-start px-2 hover:preset-tonal"
					>
						<Globe class="size-4" />
						<span>Website CMS</span>
					</a>
				</Navigation.Menu>
			</Navigation.Group>
		</Navigation.Content>
		<!--		<Navigation.Footer>-->
		<!--			<a href="/" class={anchorSidebar} title="Settings" aria-label="Settings">-->
		<!--				<SettingsIcon class="size-4" />-->
		<!--				<span>Settings</span>-->
		<!--			</a>-->
		<!--		</Navigation.Footer>-->
	</Navigation>
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
</div>
