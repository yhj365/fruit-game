import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "欢乐水果机",
  description: "基于 Next.js 的欢乐水果机小游戏",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-fruit-bg text-white">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-3 shadow-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-fruit-red px-2 py-1 text-xs font-bold shadow-glow-gold">
                  HOT
                </span>
                <h1 className="text-lg font-semibold tracking-wide">
                  欢乐水果机
                </h1>
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 items-stretch justify-center px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
