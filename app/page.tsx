import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <section className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-2xl shadow-black/60">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-wide text-fruit-gold">
          欢乐水果机
        </h2>
        <p className="mb-6 text-center text-sm text-slate-300">
          注册即可获得{" "}
          <span className="font-semibold text-fruit-gold">100 积分</span>，
          登录后即可进入游戏大厅。
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/register"
            className="w-full rounded-lg bg-fruit-gold py-2 text-center text-sm font-semibold text-slate-950 shadow-glow-gold transition hover:translate-y-0.5 hover:bg-yellow-300"
          >
            立即注册
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2 text-center text-sm font-semibold text-slate-50 transition hover:translate-y-0.5 hover:border-fruit-gold hover:text-fruit-gold"
          >
            已有账号？前往登录
          </Link>
        </div>
      </section>
    </div>
  );
}

