import { NextResponse } from "next/server";
import { db, users } from "@/db/client";
import { eq } from "drizzle-orm";
import { hashPassword, setAuthCookie } from "@/lib/auth";

type RegisterBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json(
      { error: "用户名和密码不能为空" },
      { status: 400 },
    );
  }

  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasDbConfig =
    !!process.env.DB_USER && !!process.env.DB_PASSWORD && !!process.env.DB_NAME;

  if (!hasDbUrl && !hasDbConfig) {
    return NextResponse.json(
      { error: "服务器数据库未配置，请联系管理员" },
      { status: 500 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "密码长度至少为 6 位" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const [created] = await db
    .insert(users)
    .values({
      username,
      passwordHash,
      credits: 100, // 注册赠送 100 积分
    })
    .returning();

  await setAuthCookie({
    userId: created.id,
    username: created.username,
    isAdmin: created.isAdmin,
  });

  return NextResponse.json({
    id: created.id,
    username: created.username,
    credits: created.credits,
  });
}
