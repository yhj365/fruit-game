import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./connectionString";

const connectionString = getDatabaseUrl();

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

export const db = drizzle(client);

/** Verifies that the configured PostgreSQL server can execute a query. */
export async function verifyDatabaseConnection(): Promise<void> {
  await client`select 1`;
}

export * from "./schema";
