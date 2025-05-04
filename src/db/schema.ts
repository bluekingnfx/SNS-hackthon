import { sql } from 'drizzle-orm';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    age: integer('age'),
    email: text('email').unique().notNull(),
    profilePhoto: blob('profilephoto', {
        mode: 'buffer'
    }),
    password: text('password').notNull()
});

export const booksTable = sqliteTable('books', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    fileData: blob('file_data', { mode: 'buffer' }).notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: text('created_at', {mode: 'text'}).notNull().default(sql`CURRENT_TIMESTAMP`),
    price: integer('price').notNull(),
    isSold:integer('is_sold', {
        mode: 'boolean',

    }).notNull().default(false),
    isFeatured: integer('is_featured', {
        mode: 'boolean',
    }).notNull().default(false),
    thumbnail: blob('thumbnail', { mode: 'buffer' }).notNull(),
    count: integer('count').notNull().default(0),
});

export const StationaryTable = sqliteTable('stationary', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: text('created_at', {mode: 'text'}).notNull().default(sql`CURRENT_TIMESTAMP`),
    thumbnail: blob('thumbnail', { mode: 'buffer' }).notNull(),
    price: integer('price').notNull(),
    isSold: integer('is_sold', {
        mode: 'boolean',
    }).notNull().default(false),
    isFeatured: integer('is_featured', {
        mode: 'boolean',
    }).notNull().default(false),
    additionalImgs: blob('additional_imgs').$type<Buffer[] | []>().$default(() => []),
    count: integer('count').notNull().default(0),
})


export const UniformsTable = sqliteTable('uniforms', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: text('created_at', {mode: 'text'}).notNull().default(sql`CURRENT_TIMESTAMP`),
    thumbnail: blob('thumbnail', { mode: 'buffer' }).notNull(),
    price: integer('price').notNull(),
    isSold: integer('is_sold', {
        mode: 'boolean',
    }).notNull().default(false),
    isFeatured: integer('is_featured', {
        mode: 'boolean',
    }).notNull().default(false),
    additionalImgs: blob('additional_imgs').$type<Buffer[] | []>().$default(() => []),
    count: integer('count').notNull().default(0),
    condition: text('condition').$type<'new' | 'used'>().notNull().default('new'),
})


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;


export type InsertBook = typeof booksTable.$inferInsert;
export type SelectBook = typeof booksTable.$inferSelect;

export type InsertStationary = typeof StationaryTable.$inferInsert;
export type SelectStationary = typeof StationaryTable.$inferSelect;

export type InsertUniforms = typeof UniformsTable.$inferInsert;
export type SelectUniforms = typeof UniformsTable.$inferSelect;

