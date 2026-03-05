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
        className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-2xl shadow-black/60"
      >
        <h2 className="mb-4 text-center text-2xl font-bold text-fruit-gold">
          登录游戏
        </h2>
        <div className="mb-4">
          <label className="mb-1 block text-xs text-slate-300">用户名</label>
          <input
            className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-fruit-gold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs text-slate-300">密码</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-fruit-gold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && (
          <p className="mb-3 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-fruit-gold py-2 text-sm font-semibold text-slate-950 shadow-glow-gold transition hover:translate-y-0.5 hover:bg-yellow-300 disabled:opacity-70"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}

