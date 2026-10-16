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
      <div>
        <p className="text-sm font-semibold text-sky-600">账户概览</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-sky-ink">用户管理</h2>
        <p className="mt-2 text-sm text-sky-800">查看已注册用户的角色、积分与创建时间。</p>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-sky-100 bg-white/90 shadow-aqua">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sky-100 bg-sky-50 text-xs font-semibold text-sky-700">
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
                className="border-b border-sky-50 transition hover:bg-sky-50/70"
              >
                <td className="px-4 py-3 text-xs text-sky-600">
                  {user.id}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-sky-950">
                  {user.username}
                </td>
                <td className="px-4 py-2 text-xs">
                  {user.isAdmin ? (
                    <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">
                      管理员
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                      普通用户
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-sky-700">
                  {user.credits}
                </td>
                <td className="px-4 py-3 text-xs text-sky-600">
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

