import { BOT_ADMIN_CHAT_ID, BOT_TOKEN } from '$env/static/private';
import { Bot, GrammyError, HttpError } from 'grammy';
import { BotGroups } from '$lib/server/bot/groups';
import { UsersBot } from '$lib/server/bot/users';
import { AgendaBot } from '$lib/server/bot/agenda';
import { WeekPlanBot } from '$lib/server/bot/weekPlan';

export const bot = new Bot(BOT_TOKEN);

export const botGroups = new BotGroups(bot);
export const usersBot = new UsersBot(bot, botGroups);
export const agendaBot = new AgendaBot(bot, botGroups);
export const weekPlanBot = new WeekPlanBot(bot, botGroups);

bot.catch(async (err) => {
    const ctx = err.ctx;
    const e = err.error;

    let message = `🚨 *Bot Error*\n`;

    if (ctx) {
        message += `\n• Update ID: \`${ctx.update.update_id}\``;
        if (ctx.chat) message += `\n• Chat ID: \`${ctx.chat.id}\``;
        if (ctx.from) message += `\n• User ID: \`${ctx.from.id}\``;
    }

    if (e instanceof GrammyError) {
        message += `\n\n*GrammyError*\n\`${e.description}\``;
    } else if (e instanceof HttpError) {
        message += `\n\n*HttpError*\n\`${String(e.error)}\``;
    } else {
        message += `\n\n*Unknown Error*\n\`${String(e)}\``;
    }

    const stack =
        e instanceof Error && e.stack
            ? e.stack.slice(0, 3500) // Telegram Limit-Schutz
            : 'no stacktrace';

    message += `\n\n*Stacktrace*\n\`\`\`\n${stack}\n\`\`\``;

    try {
        await bot.api.sendMessage(BOT_ADMIN_CHAT_ID, message, {
            parse_mode: 'Markdown',
            link_preview_options: {
                is_disabled: true
            }
        });
    } catch (err) {
        console.error(err);
    }
});
