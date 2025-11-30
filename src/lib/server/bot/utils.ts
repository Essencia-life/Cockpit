import { env } from "$env/dynamic/private";

export const storageKey = `essencia:orga:botConfig:${env.VERCEL_ENV}`;

export enum ChatType {
    Home,
    Legacy,
    Channel,
}

export type BotConfig = {
    [chatType in keyof typeof ChatType]: number;
};