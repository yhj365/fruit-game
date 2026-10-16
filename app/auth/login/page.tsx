"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登录失败");
        return;
      }
      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/game");
      }
    } catch (err) {
      console.error(err);
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-aqua sm:p-8"
      >
        <p className="mb-2 text-sm font-semibold text-sky-600">欢迎回来</p>
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-sky-ink">登录游戏</h2>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-sky-900">用户名</label>
          <input
            className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2.5 text-sm text-sky-950 outline-none transition placeholder:text-sky-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-sky-900">密码</label>
          <input
            type="password"
            className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2.5 text-sm text-sky-950 outline-none transition placeholder:text-sky-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-aqua transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}

