import type { RequestEvent } from '@sveltejs/kit';
import crypto from 'crypto';
import { generateIdFromEntropySize } from 'lucia';
import { lucia } from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { BOT_TOKEN } from '$env/static/private';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema.ts';
import { constants } from 'node:http2';

function verifyTelegramAuth(data: Record<string, string>, botToken: string): boolean {
	const { hash, ...rest } = data;

	const secret = crypto.createHash('sha256').update(botToken).digest();

	const checkString = Object.keys(rest)
		.sort()
		.map((key) => `${key}=${rest[key]}`)
		.join('\n');

	const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

	return hmac === hash;
}

export async function GET(event: RequestEvent): Promise<Response> {
	const params = Object.fromEntries(event.url.searchParams.entries());

	if (!params.id || !params.hash) {
		return new Response('Invalid Telegram callback', { status: constants.HTTP_STATUS_BAD_REQUEST });
	}

	if (!verifyTelegramAuth(params, BOT_TOKEN)) {
		return new Response('Invalid Telegram signature', { status: constants.HTTP_STATUS_FORBIDDEN });
	}

	const telegramId = Number(params.id);

	let [existingUser] = await db.select().from(users).where(eq(users.telegramId, telegramId));

	if (!existingUser) {
		const userId = generateIdFromEntropySize(10);

		await db.insert(users).values({
			id: userId,
			telegramId: telegramId
		});

		existingUser = { id: userId };
	}

	const session = await lucia.createSession(existingUser.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '/',
		...sessionCookie.attributes
	});

	return new Response(null, {
		status: constants.HTTP_STATUS_FOUND,
		headers: {
			Location: '/'
		}
	});
}
