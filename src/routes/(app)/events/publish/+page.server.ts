import type { Actions } from './$types';
import { bot, botGroups } from '$lib/server/bot';
import { InlineKeyboard, InputFile } from 'grammy';

export const actions: Actions = {
	async default({ request }) {
		const data = await request.formData();
		const groups = await botGroups.getGroups();
		const carSharingGroup = groups?.CarSharing;
		const channel = groups?.Channel;

		console.log(data);

		let forumTopic;
		if (carSharingGroup && data.get('telegram_car_sharing') === 'on') {
			const date = new Date(data.get('date') as string).toLocaleDateString('de', {
				day: 'numeric',
				month: 'numeric'
			});
			const name = date + ' ' + data.get('title');
			forumTopic = await bot.api.createForumTopic(carSharingGroup, name, {
				icon_custom_emoji_id: '5433614043006903194' // 📆️
			});
		}

		let channelMessage;
		if (channel && data.get('telegram_channel') == 'on') {
			const caption = data.get('description') as string;
			const cover = data.get('cover') as File;
			console.log(typeof cover);
			const inputFile = new InputFile(Buffer.from(await cover.arrayBuffer()), cover.name);
			let inlineKeyboard = new InlineKeyboard();

			if (forumTopic && data.get('telegram_channel_car_sharing_button') === 'on') {
				inlineKeyboard = inlineKeyboard.row(
					InlineKeyboard.url(
						'🚙 Car Sharing Group',
						'https://t.me/essencia_car_test/' + forumTopic.message_thread_id
					)
				);
			}

			if (data.get('telegram_channel_ticket_button') === 'on') {
				const ticketLink = data.get('ticket_link') as string;
				inlineKeyboard = inlineKeyboard.row(InlineKeyboard.url('🎫️ Get your ticket', ticketLink));
			}

			channelMessage = await bot.api.sendPhoto(channel, inputFile, {
				caption,
				reply_markup: inlineKeyboard
			});
		}

		if (
			carSharingGroup &&
			forumTopic &&
			channel &&
			channelMessage &&
			data.get('telegram_car_sharing_forward_channel_post') === 'on'
		) {
			const message = await bot.api.forwardMessage(
				carSharingGroup,
				channel,
				channelMessage.message_id,
				{
					message_thread_id: forumTopic.message_thread_id
				}
			);
			await bot.api.pinChatMessage(carSharingGroup, message.message_id);
		}

		return { success: true };
	}
};
