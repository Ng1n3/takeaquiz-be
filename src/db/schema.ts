import {
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const timeStamp = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAT: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
};

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  email: text('email').unique().notNull(),
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
