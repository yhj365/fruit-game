import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "欢乐水果机",
  description: "基于 Next.js 的欢乐水果机小游戏",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-sky-100/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-aqua">
                  果
                </span>
                <div>
                  <h1 className="text-base font-bold tracking-wide text-sky-ink">欢乐水果机</h1>
                  <p className="text-xs text-sky-700">轻松下注，等待好运</p>
                </div>
              </Link>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 items-stretch justify-center px-4 py-8 sm:px-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
