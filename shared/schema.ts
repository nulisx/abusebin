import { pgTable, text, integer, timestamp, boolean, primaryKey, serial, uuid, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const roleEnum = pgEnum('role', ['User', 'Premium', 'Mod', 'Council', 'Manager', 'Admin'])
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'dislike'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: serial('uid').unique().notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('User').notNull(),
  avatar: text('avatar'),
  bio: text('bio').default(''),
  nameColor: text('name_color'),
  banned: boolean('banned').default(false),
  isOnline: boolean('is_online').default(false),
  lastSeen: timestamp('last_seen').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  joinedAt: timestamp('joined_at').defaultNow(),
})

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

// Pastes table
export const pastes = pgTable('pastes', {
  id: text('id').primaryKey(), // slug-based ID
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  views: integer('views').default(0),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Paste = typeof pastes.$inferSelect
export type InsertPaste = typeof pastes.$inferInsert

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  pasteId: text('paste_id').notNull().references(() => pastes.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Comment = typeof comments.$inferSelect
export type InsertComment = typeof comments.$inferInsert

// Paste reactions (likes/dislikes)
export const pasteReactions = pgTable('paste_reactions', {
  pasteId: text('paste_id').notNull().references(() => pastes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: reactionTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.pasteId, table.userId] })
}))

export type PasteReaction = typeof pasteReactions.$inferSelect
export type InsertPasteReaction = typeof pasteReactions.$inferInsert

// Comment reactions
export const commentReactions = pgTable('comment_reactions', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: reactionTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export type CommentReaction = typeof commentReactions.$inferSelect
export type InsertCommentReaction = typeof commentReactions.$inferInsert

// Follows table
export const follows = pgTable('follows', {
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.followerId, table.followingId] })
}))

export type Follow = typeof follows.$inferSelect
export type InsertFollow = typeof follows.$inferInsert

// Hall of Retards posts
export const hallPosts = pgTable('hall_posts', {
  id: serial('id').primaryKey(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  doxLink: text('dox_link'),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export type HallPost = typeof hallPosts.$inferSelect
export type InsertHallPost = typeof hallPosts.$inferInsert

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pastes: many(pastes),
  comments: many(comments),
  pasteReactions: many(pasteReactions),
  commentReactions: many(commentReactions),
  hallPosts: many(hallPosts),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'followers' }),
}))

export const pastesRelations = relations(pastes, ({ one, many }) => ({
  author: one(users, {
    fields: [pastes.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  reactions: many(pasteReactions),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  paste: one(pastes, {
    fields: [comments.pasteId],
    references: [pastes.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  reactions: many(commentReactions),
}))

export const pasteReactionsRelations = relations(pasteReactions, ({ one }) => ({
  paste: one(pastes, {
    fields: [pasteReactions.pasteId],
    references: [pastes.id],
  }),
  user: one(users, {
    fields: [pasteReactions.userId],
    references: [users.id],
  }),
}))

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'following',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'followers',
  }),
}))

export const hallPostsRelations = relations(hallPosts, ({ one }) => ({
  author: one(users, {
    fields: [hallPosts.authorId],
    references: [users.id],
  }),
}))
