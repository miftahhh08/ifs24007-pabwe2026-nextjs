"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logout } from "@/features/auth/states/authSlice";
import { HiOutlineDocumentText, HiOutlineUserGroup, HiOutlineUser, HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";

const linkClass =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-300">
          <span aria-hidden="true" className="p-2 bg-indigo-600 text-white rounded-lg">P4</span>
          <span>DelcomFeed</span>
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1 sm:gap-4">
          <Link href="/" aria-label="Feed" className={linkClass}>
            <HiOutlineDocumentText aria-hidden="true" className="text-xl" />
            <span className="hidden sm:inline">Feed</span>
          </Link>
          <Link href="/users" aria-label="Anggota" className={linkClass}>
            <HiOutlineUserGroup aria-hidden="true" className="text-xl" />
            <span className="hidden sm:inline">Anggota</span>
          </Link>
          <Link href="/profile" aria-label={user?.name ? `Profil ${user.name}` : "Profil"} className={linkClass}>
            <HiOutlineUser aria-hidden="true" className="text-xl" />
            <span className="hidden sm:inline">{user?.name || "Profil"}</span>
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => dispatch(logout())}
          aria-label="Keluar"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition text-sm font-medium"
        >
          <HiOutlineArrowLeftOnRectangle aria-hidden="true" className="text-lg" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
