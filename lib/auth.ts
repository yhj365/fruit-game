import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db, users, type User } from "@/db/client";
import { eq } from "drizzle-orm";

const JWT_COOKIE_NAME = "fruit_auth_token";
const JWT_EXPIRES_IN = "7d";

type JwtPayload = {
  userId: number;
  username: string;
  isAdmin: boolean;
};

function getJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV !== "production") {
    // 开发环境提供一个默认的密钥，避免因为没配置环境变量而直接报错
    return "dev-secret-change-me";
  }

  throw new Error("JWT_SECRET is not configured");
}

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createJwtToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: JwtPayload) {
  const token = createJwtToken(payload);
  (await cookies()).set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete(JWT_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyJwtToken(token);
  if (!payload) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return user ?? null;
}

