import { query } from '$app/server';
import users from '$lib/server/users.ts';

export const getUsers = query(() => {
	return users.getAll();
});
