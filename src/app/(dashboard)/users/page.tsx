"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { getUsers } from "@/features/users/api/userApi";
import { setUsers, User } from "@/features/users/states/userSlice";
import { unwrapData } from "@/helpers/apiHelper";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const token = useAppSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;

    (async () => {
      try {
        const res = await getUsers();
        const data = unwrapData<User[] | { users?: User[] }>(res);
        const list = Array.isArray(data) ? data : data?.users ?? [];
        if (active) dispatch(setUsers(list));
      } catch (err: unknown) {
        if (active) setError((err as Error).message || "Gagal memuat daftar anggota");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [dispatch, token]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Anggota</h1>
        <p className="text-slate-400 text-sm">Daftar pengguna yang tergabung di DelcomFeed</p>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/40 border border-slate-800 rounded-2xl">
          <p className="text-slate-400">Belum ada anggota terdaftar.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold"
              >
                {(u.name || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate">{u.name}</p>
                <p className="text-sm text-slate-400 truncate">{u.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
