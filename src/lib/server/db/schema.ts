import { pgTable, integer, text, timestamp, bigint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').unique(),
	githubId: integer('github_id').unique(),
	telegramId: bigint('telegram_id', { mode: 'number' }).unique()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type Users = typeof users.$inferSelect;
