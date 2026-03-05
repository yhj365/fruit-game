export function getDatabaseUrl(options?: { forDrizzle?: boolean }): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST ?? "localhost";
  const port = process.env.DB_PORT ?? "5432";
  const dbName = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!dbName || !user || !password) {
    const base =
      "Please set DATABASE_URL or DB_USER, DB_PASSWORD, DB_NAME.";
    if (options?.forDrizzle) {
      throw new Error(
        "Database is not configured for drizzle-kit. " + base,
      );
    }
    throw new Error("Database is not configured. " + base);
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${host}:${port}/${dbName}`;
}

