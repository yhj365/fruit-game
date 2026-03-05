import { NextResponse } from "next/server";
import { db, users } from "@/db/client";
import { eq } from "drizzle-orm";
import { setAuthCookie, verifyPassword } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/admin";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  await ensureDefaultAdmin();

  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json(
      { error: "用户名和密码不能为空" },
      { status: 400 }
    );
  }

  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasDbConfig =
    !!process.env.DB_USER && !!process.env.DB_PASSWORD && !!process.env.DB_NAME;

  if (!hasDbUrl && !hasDbConfig) {
    return NextResponse.json(
      { error: "服务器数据库未配置，请联系管理员" },
      { status: 500 }
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  await setAuthCookie({
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    credits: user.credits,
    isAdmin: user.isAdmin
  });
}

