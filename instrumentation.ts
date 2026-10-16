export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  try {
    const { verifyDatabaseConnection } = await import("@/db/client");
    await verifyDatabaseConnection();
  } catch (error) {
    console.error("Database connection check failed during startup.", error);
  }
}
