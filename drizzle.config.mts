import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./db/connectionString";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl({ forDrizzle: true }),
  },
});
