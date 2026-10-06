"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/hooks/redux";
import { loginUser } from "@/features/auth/states/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const result = await dispatch(
      loginUser({
        username: identifier.trim(),
        email: identifier.trim(),
        password,
        kata_sandi: password,
      })
    );
    setLoading(false);

    if (loginUser.fulfilled.match(result)) {
      router.replace("/");
    } else {
      setErrorMessage(
        (result.payload as string) || "Gagal melakukan login. Periksa kembali kredensial Anda."
      );
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-100 text-center mb-2">Masuk ke Akun</h1>
      <p className="text-sm text-slate-400 text-center mb-6">
        Masukkan kredensial Anda untuk melanjutkan
      </p>

      {errorMessage && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email-input" className="block text-sm font-medium text-slate-300 mb-1">
            Username / Email
          </label>
          <input
            id="login-email-input"
            name="identifier"
            type="text"
            required
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
            placeholder="Username atau Email"
          />
        </div>

        <div>
          <label htmlFor="login-password-input" className="block text-sm font-medium text-slate-300 mb-1">
            Kata Sandi
          </label>
          <input
            id="login-password-input"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition mt-2"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Belum punya akun?{" "}
        <Link
          href="/auth/register"
          className="text-indigo-300 hover:text-indigo-200 font-medium underline underline-offset-4 transition"
        >
          Buat akun
        </Link>
      </p>
    </>
  );
}
