"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateProfile, updatePassword } from "@/features/users/api/userApi";
import { fetchMe } from "@/features/auth/states/authSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Sinkronkan form saat data user selesai dimuat dari server
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, bio });
      dispatch(fetchMe());
      setProfileMsg("Profil berhasil diperbarui!");
    } catch (err: unknown) {
      const errorObj = err as Error;
      setProfileMsg(errorObj.message || "Gagal memperbarui profil");
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updatePassword({ old_password: oldPassword, new_password: newPassword });
      setPwdMsg("Kata sandi berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      const errorObj = err as Error;
      setPwdMsg(errorObj.message || "Gagal memperbarui kata sandi");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Pengaturan Profil</h1>
        <p className="text-slate-400 text-sm">Kelola informasi pribadi dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Profil */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Informasi Pengguna</h2>
          {profileMsg && <p role="status" className="mb-4 text-sm text-indigo-300">{profileMsg}</p>}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="prof-name" className="block text-sm font-medium text-slate-300 mb-1">Nama</label>
              <input
                id="prof-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prof-bio" className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
              <textarea
                id="prof-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm resize-none"
                placeholder="Ceritakan sedikit tentang Anda..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition"
            >
              Simpan Profil
            </button>
          </form>
        </div>

        {/* Form Password */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Ubah Kata Sandi</h2>
          {pwdMsg && <p role="status" className="mb-4 text-sm text-indigo-300">{pwdMsg}</p>}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="prof-old" className="block text-sm font-medium text-slate-300 mb-1">Kata Sandi Lama</label>
              <input
                id="prof-old"
                type="password"
                required
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prof-new" className="block text-sm font-medium text-slate-300 mb-1">Kata Sandi Baru</label>
              <input
                id="prof-new"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-xl text-sm transition"
            >
              Ubah Sandi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}