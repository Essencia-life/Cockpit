import { Lucia } from 'lucia';
import { dev } from '$app/environment';

import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';

import { GitHub } from 'arctic';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URL } from '$env/static/private';
import { session, users } from '$lib/server/db/schema.ts';
import { db } from '$lib/server/db';

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URL);

const adapter = new DrizzlePostgreSQLAdapter(db, session, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			githubId: attributes.github_id
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	github_id: number;
	telegram_id: number;
}
