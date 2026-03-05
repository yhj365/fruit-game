import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./connectionString";

const connectionString = getDatabaseUrl();

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client);
export * from "./schema";
