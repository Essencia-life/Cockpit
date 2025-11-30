import { BOT_TOKEN } from "$env/static/private";
import { Bot } from "grammy";
import setup from "./setup";
import channel from "./channel";
import home from "./home";

export const bot = new Bot(BOT_TOKEN);

setup(bot);
// await channel(bot);
// await home(bot);