"use client";

import { useState, FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import { postApi } from "../api/postApi";

interface ChangeCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | number;
  onSuccess: () => void;
}

export default function ChangeCoverModal({ isOpen, onClose, postId, onSuccess }: ChangeCoverModalProps) {
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coverUrl) return;

    setLoading(true);
    setError(null);
    try {
      await postApi.updateCover(postId, coverUrl);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Gagal memperbarui gambar sampul");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ubah Gambar Sampul (Cover)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="cover-url" className="block text-sm font-medium text-slate-300 mb-1">URL Gambar</label>
          <input
            id="cover-url"
            type="url"
            required
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Perbarui Cover"}
          </button>
        </div>
      </form>
    </Modal>
  );
}