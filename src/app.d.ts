import type { CMS } from 'decap-cms-core';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		CMS: CMS;
		CMS_MANUAL_INIT: boolean;
	}

	type MakeRequired<T, K extends keyof T> = Omit<Partial<T>, K> & Required<Pick<T, K>>;
}

export {};
