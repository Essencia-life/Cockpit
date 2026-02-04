import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { INSTAGRAM_TOKEN } from '$env/static/private';

interface InstagramWebhookResponse {
	object: string;
	entry: object[];
	id: string;
	changed_fields: string[];
	changes: object[];
	time: number;
}

export const GET: RequestHandler = ({ url }) => {
	if (
		url.searchParams.get('hub.mode') === 'subscribe' &&
		url.searchParams.get('hub.verify_token') === INSTAGRAM_TOKEN
	) {
		return new Response(url.searchParams.get('hub.challenge'));
	}

	error(400);
};

export const POST: RequestHandler = async ({ request }) => {
	const body: InstagramWebhookResponse = await request.json();

	console.log(body);

	return new Response(null, { status: 202 });
};
