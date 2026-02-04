import type { Bot } from 'grammy';
import type { BotGroups } from '$lib/server/bot/groups.ts';
import users from '$lib/server/users.ts';

export class UsersBot {
	constructor(bot: Bot, botGroups: BotGroups) {
		bot.on('chat_member', async (ctx) => {
			const groups = await botGroups.getGroups();

			console.log(ctx.chatMember);

			if (ctx.chatMember.chat.id === groups?.Home) {
				const member = ctx.chatMember.new_chat_member;

				if (member.status === 'member' && !member.user.is_bot) {
					await users.addUser(ctx.chatMember.new_chat_member.user);
				} else if (member.status === 'left' || member.status === 'kicked') {
					await users.removeUser(ctx.chatMember.old_chat_member.user);
				}
			}
		});
	}
}
