import { BOT_TOKEN } from '$env/static/private';
import { Bot } from 'grammy';
import { BotGroups } from '$lib/server/bot/groups.ts';
import { AgendaBot } from '$lib/server/bot/agenda.ts';

export const bot = new Bot(BOT_TOKEN);

export const botGroups = new BotGroups(bot);
export const agendaBot = new AgendaBot(bot, botGroups);
