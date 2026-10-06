"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchMe } from "@/features/auth/states/authSlice";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      router.replace("/auth/login");
    } else if (!user) {
      dispatch(fetchMe());
    }
  }, [initialized, token, user, router, dispatch]);

  // Sebelum token dibaca (render server & render klien pertama) tampilkan konten halaman apa adanya.
  // Isinya hanya kerangka/skeleton karena data baru diambil setelah token tersedia, sehingga
  // FCP/LCP tidak menunggu JavaScript. Server dan klien merender hal yang sama -> tidak ada mismatch.
  if (!initialized) {
    return <>{children}</>;
  }

  // Sudah dicek tetapi tidak ada token -> sedang dialihkan ke halaman login
  if (!token) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p role="status" aria-busy="true" className="text-slate-400 text-sm">
          Memuat...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
