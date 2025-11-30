import type { Bot } from "grammy";
import { redis } from "../db/redis";
import { storageKey, type BotConfig } from "./utils";

export default async function (bot: Bot) {
    const [botConfig] = await redis.json.get<[BotConfig]>(storageKey, '$') ?? []; // TODO: move into BotConfigService and cache


}