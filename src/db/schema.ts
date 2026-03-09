import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  varchar,
  serial,
  index,
} from "drizzle-orm/pg-core";

/* ── Users ──────────────────────────────────────────── */

export const forumUsers = pgTable(
  "forum_users",
  {
    id: serial("id").primaryKey(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
    displayName: varchar("display_name", { length: 64 }),
    avatarUrl: text("avatar_url"),
    role: varchar("role", { length: 16 }).notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_users_wallet").on(t.walletAddress)]
);

/* ── Categories ─────────────────────────────────────── */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ── Threads ────────────────────────────────────────── */

export const threads = pgTable(
  "threads",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    authorId: integer("author_id")
      .notNull()
      .references(() => forumUsers.id),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    isPinned: boolean("is_pinned").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
    commentCount: integer("comment_count").notNull().default(0),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_threads_category").on(t.categoryId),
    index("idx_threads_author").on(t.authorId),
    index("idx_threads_activity").on(t.lastActivityAt),
  ]
);

/* ── Comments ───────────────────────────────────────── */

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    threadId: integer("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    authorId: integer("author_id")
      .notNull()
      .references(() => forumUsers.id),
    parentId: integer("parent_id"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_comments_thread").on(t.threadId),
    index("idx_comments_author").on(t.authorId),
  ]
);

/* ── Votes ──────────────────────────────────────────── */

export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => forumUsers.id),
    threadId: integer("thread_id").references(() => threads.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    value: integer("value").notNull(), // +1 or -1
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_votes_user").on(t.userId),
    index("idx_votes_thread").on(t.threadId),
    index("idx_votes_comment").on(t.commentId),
  ]
);

/* ── Proposal Discussions ───────────────────────────── */

export const proposalDiscussions = pgTable(
  "proposal_discussions",
  {
    id: serial("id").primaryKey(),
    proposalId: integer("proposal_id").notNull(),
    threadId: integer("thread_id")
      .notNull()
      .references(() => threads.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_proposal_disc_proposal").on(t.proposalId)]
);

/* ── Notifications ──────────────────────────────────── */

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => forumUsers.id),
    type: varchar("type", { length: 32 }).notNull(),
    payload: text("payload"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_notifications_user").on(t.userId)]
);

/* ── Moderation Log ─────────────────────────────────── */

export const moderationLog = pgTable("moderation_log", {
  id: serial("id").primaryKey(),
  moderatorId: integer("moderator_id")
    .notNull()
    .references(() => forumUsers.id),
  action: varchar("action", { length: 32 }).notNull(),
  targetType: varchar("target_type", { length: 16 }).notNull(),
  targetId: integer("target_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
