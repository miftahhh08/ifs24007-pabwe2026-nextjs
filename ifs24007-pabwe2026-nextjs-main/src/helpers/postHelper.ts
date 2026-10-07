import type { Post, User } from "@/types";

type Raw = Record<string, unknown>;

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const firstText = (...values: unknown[]): string => values.map(text).find(Boolean) ?? "";

const shorten = (value: string, max = 60): string => {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};

/**
 * Menyamakan bentuk data post dari API. Nama field di backend bisa berbeda
 * (title/judul, content/description/body, dst.), sehingga UI selalu menerima
 * `title` dan `content` yang terisi. Judul tidak pernah kosong, supaya heading
 * dan link di kartu selalu punya teks (syarat Axe: "headings"/"link-name").
 */
export function normalizePost(raw: unknown): Post {
  const r = (raw && typeof raw === "object" ? raw : {}) as Raw;

  const content = firstText(r.content, r.description, r.body, r.text, r.caption, r.deskripsi, r.isi);
  const title =
    firstText(r.title, r.judul, r.name, r.subject, r.headline) ||
    shorten(content) ||
    `Postingan #${r.id ?? ""}`.trim();

  const user = (r.user ?? r.author ?? r.owner) as User | undefined;
  const cover = firstText(r.cover, r.image, r.image_url, r.thumbnail);

  return {
    ...(r as object),
    id: (r.id ?? "") as Post["id"],
    title,
    content,
    cover: cover || undefined,
    user_id: (r.user_id ?? r.userId ?? r.author_id ?? user?.id ?? "") as Post["user_id"],
    created_at: String(r.created_at ?? r.createdAt ?? ""),
    updated_at: (r.updated_at ?? r.updatedAt) as string | undefined,
    user,
  } as Post;
}

export const normalizePosts = (list: unknown): Post[] =>
  Array.isArray(list) ? list.map(normalizePost) : [];
