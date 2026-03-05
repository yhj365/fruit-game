import { db, users } from "@/db/client";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

export async function ensureDefaultAdmin() {
  if (!process.env.DATABASE_URL) {
    // 数据库未配置时，不尝试创建管理员
    return;
  }

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.isAdmin, true))
    .limit(1);

  if (existingAdmin) return;

  const [existingAdminUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (existingAdminUser) {
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, existingAdminUser.id));
    return;
  }

  const passwordHash = await hashPassword("123456");

  await db.insert(users).values({
    username: "admin",
    passwordHash,
    isAdmin: true,
    credits: 1000
  });
}

