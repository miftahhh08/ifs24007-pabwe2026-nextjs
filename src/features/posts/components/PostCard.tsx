"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { getImageUrl } from "@/helpers/imageUrl";
import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";

const dateFormatter = new Intl.DateTimeFormat("id-ID");

interface PostCardProps {
  priority?: boolean;
  post: Post;
  currentUserId?: string | number;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string | number) => void;
}

export default function PostCard({ post, currentUserId, onEdit, onDelete, priority = false }: PostCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const isOwner = currentUserId !== undefined && String(post.user_id) === String(currentUserId);
  const title = post.title?.trim() || `Postingan #${post.id}`;
  const created = post.created_at ? new Date(post.created_at) : null;
  const dateLabel = created && !Number.isNaN(created.getTime()) ? dateFormatter.format(created) : "";
  const coverUrl = getImageUrl(post.cover);

  return (
    <article className="bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-lg">
      <div>
        {coverUrl && !imgFailed && (
          <div className="mb-4 overflow-hidden rounded-xl h-48 bg-slate-900">
            <img
              src={coverUrl}
              alt={title}
              width={400}
              height={192}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Oleh: {post.user?.name || "Pengguna Anonim"}</span>
          <span>{dateLabel}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2 line-clamp-2">
          <Link href={`/posts/${post.id}`} className="hover:text-indigo-300 transition">
            {title}
          </Link>
        </h2>
        <p className="text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed">
          {post.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/40 text-xs">
        <Link
          href={`/posts/${post.id}`}
          className="text-indigo-300 font-medium hover:underline"
        >
          Lihat detail<span className="sr-only"> postingan {title}</span> &rarr;
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(post)}
                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-700 rounded-lg transition"
                title="Edit Post"
                aria-label={`Edit postingan ${title}`}
              >
                <HiOutlinePencilSquare aria-hidden="true" className="text-base" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                title="Hapus Post"
                aria-label={`Hapus postingan ${title}`}
              >
                <HiOutlineTrash aria-hidden="true" className="text-base" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}