"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchPosts, deletePost } from "@/features/posts/states/postSlice";
import PostCard from "@/features/posts/components/PostCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Post } from "@/types";
import { HiPlus } from "react-icons/hi2";

// Modal baru dimuat saat pertama kali dibutuhkan
const CreatePostModal = dynamic(
  () => import("@/features/posts/components/CreatePostModal"),
  { ssr: false }
);
const EditPostModal = dynamic(
  () => import("@/features/posts/components/EditPostModal"),
  { ssr: false }
);

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { posts, isLoading, error } = useAppSelector((state) => state.posts);
  const { user, token } = useAppSelector((state) => state.auth);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (token) dispatch(fetchPosts());
  }, [dispatch, token]);

  const handleDelete = (id: string | number) => {
    if (confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      dispatch(deletePost(id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Utama & Feed</h1>
          <p className="text-slate-400 text-sm">Lihat aktivitas dan postingan terbaru</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <HiPlus aria-hidden="true" className="text-lg" />
          <span>Buat Post</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : error && posts.length === 0 ? (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/40 border border-slate-800 rounded-2xl">
          <p className="text-slate-400">Belum ada postingan. Jadilah yang pertama membuat!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              priority={index < 2}
              currentUserId={user?.id}
              onEdit={(p) => setEditingPost(p)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isCreateOpen && (
        <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}
      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
        />
      )}
    </div>
  );
}