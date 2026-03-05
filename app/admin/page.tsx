import { redirect } from "next/navigation";
import { db, users } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (!currentUser.isAdmin) {
    redirect("/");
  }

  const allUsers = await db.select().from(users);

  return (
    <div className="flex w-full flex-col gap-6">
      <h2 className="text-2xl font-bold text-fruit-gold">用户管理后台</h2>
      <p className="text-sm text-slate-300">
        默认管理员账号：<span className="font-mono font-semibold">admin</span>{" "}
        / <span className="font-mono font-semibold">123456</span>
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/70">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-700 bg-slate-900/90 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">用户名</th>
              <th className="px-4 py-2">是否管理员</th>
              <th className="px-4 py-2">积分</th>
              <th className="px-4 py-2">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-800/60 hover:bg-slate-800/60"
              >
                <td className="px-4 py-2 text-xs text-slate-300">
                  {user.id}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-slate-50">
                  {user.username}
                </td>
                <td className="px-4 py-2 text-xs">
                  {user.isAdmin ? (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                      管理员
                    </span>
                  ) : (
                    <span className="rounded bg-slate-600/40 px-2 py-0.5 text-slate-200">
                      普通用户
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-fruit-gold">
                  {user.credits}
                </td>
                <td className="px-4 py-2 text-xs text-slate-400">
                  {user.createdAt?.toLocaleString?.("zh-CN") ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

