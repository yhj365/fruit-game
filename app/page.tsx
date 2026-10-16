import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-aqua sm:p-9">
        <p className="mb-3 text-sm font-semibold text-sky-600">准备好试试手气了吗？</p>
        <h2 className="text-3xl font-bold tracking-tight text-sky-ink">进入水果跑灯</h2>
        <p className="mt-4 text-sm leading-6 text-sky-800">
          注册即可获得 <span className="font-bold text-sky-600">100 积分</span>，登录后选择喜欢的水果开始下注。
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/register"
            className="mt-8 w-full rounded-xl bg-sky-600 py-3 text-center text-sm font-bold text-white shadow-aqua transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            立即注册
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-xl border border-sky-200 bg-white py-3 text-center text-sm font-semibold text-sky-800 transition hover:border-sky-400 hover:bg-sky-50"
          >
            已有账号？前往登录
          </Link>
        </div>
      </section>
    </div>
  );
}

