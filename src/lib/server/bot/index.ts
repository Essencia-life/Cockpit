import { BOT_TOKEN } from '$env/static/private';
import { Bot } from 'grammy';
import { BotGroups } from '$lib/server/bot/groups';
import { UsersBot } from '$lib/server/bot/users';
import { AgendaBot } from '$lib/server/bot/agenda';
import { WeekPlanBot } from '$lib/server/bot/weekPlan';

export const bot = new Bot(BOT_TOKEN);

export const botGroups = new BotGroups(bot);
export const usersBot = new UsersBot(bot, botGroups);
export const agendaBot = new AgendaBot(bot, botGroups);
export const weekPlanBot = new WeekPlanBot(bot, botGroups);
