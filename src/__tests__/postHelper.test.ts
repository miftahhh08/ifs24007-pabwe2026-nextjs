import { describe, it, expect } from "vitest";
import { normalizePost, normalizePosts } from "@/helpers/postHelper";

describe("normalizePost", () => {
  it("memakai title bila tersedia", () => {
    const p = normalizePost({ id: 1, title: "Halo", content: "Isi" });
    expect(p.title).toBe("Halo");
    expect(p.content).toBe("Isi");
  });

  it("membuat judul dari description bila title tidak ada", () => {
    const p = normalizePost({ id: 2, description: "Ini deskripsi postingan" });
    expect(p.title).toBe("Ini deskripsi postingan");
    expect(p.content).toBe("Ini deskripsi postingan");
  });

  it("judul tidak pernah kosong", () => {
    expect(normalizePost({ id: 3 }).title).toBe("Postingan #3");
    expect(normalizePost({ id: 4, title: "   " }).title).toBe("Postingan #4");
  });

  it("memotong judul yang panjang", () => {
    const p = normalizePost({ id: 5, description: "a".repeat(200) });
    expect(p.title.length).toBeLessThanOrEqual(60);
  });

  it("memetakan alias field umum", () => {
    const p = normalizePost({ id: 6, userId: 9, createdAt: "2026-01-01", author: { id: 9, name: "A" } });
    expect(p.user_id).toBe(9);
    expect(p.created_at).toBe("2026-01-01");
    expect(p.user?.name).toBe("A");
  });

  it("normalizePosts aman untuk input bukan array", () => {
    expect(normalizePosts(undefined)).toEqual([]);
  });
});
