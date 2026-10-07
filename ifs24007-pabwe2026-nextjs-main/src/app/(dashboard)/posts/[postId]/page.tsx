"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchPostDetail, clearSelectedPost } from "@/features/posts/states/postSlice";
import { getImageUrl } from "@/helpers/imageUrl";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePhoto } from "react-icons/hi2";

// Modal baru dimuat saat pertama kali dibuka
const ChangeCoverModal = dynamic(
  () => import("@/features/posts/components/ChangeCoverModal"),
  { ssr: false }
);

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.postId;
  const dispatch = useAppDispatch();
  const { selectedPost, isLoading, error } = useAppSelector((state) => state.posts);
  const token = useAppSelector((state) => state.auth.token);
  const { user } = useAppSelector((state) => state.auth);

  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchPostDetail(postId));
    return () => {
      dispatch(clearSelectedPost());
    };
  }, [dispatch, postId, token]);

  // Reset status gagal-muat saat cover berubah (misalnya setelah ganti cover)
  const coverUrl = getImageUrl(selectedPost?.cover);
  useEffect(() => {
    setImgFailed(false);
  }, [coverUrl]);

  if (!selectedPost && error && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Postingan tidak dapat dimuat</h1>
        <p role="alert" className="text-slate-400 mb-4">{error}</p>
        <Link href="/" className="text-indigo-300 underline underline-offset-4">Kembali ke Feed</Link>
      </div>
    );
  }

  if (isLoading || !selectedPost) {
    return <LoadingSkeleton count={1} />;
  }

  const isOwner = String(selectedPost.user_id) === String(user?.id);
  const showCover = Boolean(coverUrl) && !imgFailed;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm mb-6"
      >
        <HiOutlineArrowLeft aria-hidden="true" />
        <span>Kembali ke Feed</span>
      </Link>

      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
        {showCover ? (
          <div className="relative mb-6 overflow-hidden rounded-xl h-64 sm:h-80 bg-slate-900">
            <img
              src={coverUrl}
              alt={selectedPost.title}
              width={768}
              height={320}
              decoding="async"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition"
              >
                <HiOutlinePhoto aria-hidden="true" className="text-base" />
                <span>Ubah Cover</span>
              </button>
            )}
          </div>
        ) : (
          isOwner && (
            <div className="mb-6 p-4 border border-dashed border-slate-700 rounded-xl text-center">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="text-indigo-300 hover:underline text-sm font-medium inline-flex items-center gap-2"
              >
                <HiOutlinePhoto aria-hidden="true" className="text-base" />
                <span>{imgFailed ? "Cover gagal dimuat, ganti gambar" : "Tambah Gambar Sampul (Cover)"}</span>
              </button>
            </div>
          )
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span>Penulis: <strong className="text-slate-200">{selectedPost.user?.name || "Anonim"}</strong></span>
          <span>•</span>
          <span>
            {Number.isNaN(new Date(selectedPost.created_at).getTime())
              ? ""
              : new Date(selectedPost.created_at).toLocaleString("id-ID")}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-100 mb-6 leading-tight">
          {selectedPost.title}
        </h1>

        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
          {selectedPost.content}
        </div>
      </div>

      {isCoverModalOpen && (
        <ChangeCoverModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          postId={selectedPost.id}
          onSuccess={() => dispatch(fetchPostDetail(postId))}
        />
      )}
    </div>
  );
}