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
  refreshToken: text('refresh_token'),
  ...timeStamp,
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
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('decription'),
  createdBy: varchar('created_by')
    .references(() => users.id)
    .notNull(),
  ...timeStamp,
});

export const questions = pgTable('questions', {
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  testId: varchar('test_id')
    .references(() => tests.id)
    .notNull(),
  content: text('content').notNull(),
  ...timestamp,
});

export const answers = pgTable('answers', {
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  questionId: varchar('question_id')
    .references(() => questions.id)
    .notNull(),
  content: text('content').notNull(),
});

export const userAnswers = pgTable(
  'user_answers',
  {
    id: varchar('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    questionId: varchar('question_id')
      .references(() => questions.id)
      .notNull(),
    answerId: varchar('answer_id')
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
  id: varchar('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  testId: varchar('test_id')
    .references(() => tests.id)
    .notNull(),
  score: numeric('score', { precision: 5, scale: 2 }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
