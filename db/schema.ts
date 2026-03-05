import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const fruitSymbolEnum = pgEnum("fruit_symbol", [
  "apple",
  "watermelon",
  "papaya",
  "orange",
  "bell",
  "sevens",
  "double_star",
  "bar",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  credits: integer("credits").notNull().default(0),
  pendingWin: integer("pending_win").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const gameRounds = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resultIndex: integer("result_index").notNull(),
  resultSymbol: fruitSymbolEnum("result_symbol").notNull(),
  totalBet: integer("total_bet").notNull(),
  winAmount: integer("win_amount").notNull().default(0),
  guessType: varchar("guess_type", { length: 10 }),
  guessNumber: integer("guess_number"),
  guessWinAmount: integer("guess_win_amount").default(0),
  detailJson: text("detail_json"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
