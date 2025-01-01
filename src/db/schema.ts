import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

const timeStamp = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
};

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar('user_id').references(() => users.id),
  valid: boolean('valid').default(true).notNull(),
  userAgent: text('user_agent'),
  refreshToken: text('refresh_token').notNull(),
  ...timestamp,
});

export const users = pgTable('users', {
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  ...timeStamp,
});

export const tests = pgTable('tests', {
  id: uuid('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('decription'),
  createdBy: uuid('created_by')
    .references(() => users.id)
    .notNull(),
  ...timeStamp,
});

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().notNull(),
  testId: uuid('test_id')
    .references(() => tests.id)
    .notNull(),
  content: text('content').notNull(),
  ...timestamp,
});

export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().notNull(),
  questionId: uuid('question_id')
    .references(() => questions.id)
    .notNull(),
  content: text('content').notNull(),
});

export const userAnswers = pgTable(
  'user_answers',
  {
    id: uuid('id').primaryKey().notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    questionId: uuid('question_id')
      .references(() => questions.id)
      .notNull(),
    answerId: uuid('answer_id')
      .references(() => answers.id)
      .notNull(),
    ...timestamp,
  },
  (table) => {
    return {
      userAnswerUnique: uniqueIndex('user_answer_unique').on(
        table.userId,
        table.questionId
      ),
    };
  }
);

// index('user_answer_unique', ['userId', 'questionId'], { unique: true });

export const testResults = pgTable('test_results', {
  id: uuid('id').primaryKey().notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  testId: uuid('test_id')
    .references(() => tests.id)
    .notNull(),
  score: numeric('score', { precision: 5, scale: 2 }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
