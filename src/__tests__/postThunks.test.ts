import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("@/features/posts/api/postApi", () => ({
  postApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateCover: vi.fn(),
  },
}));

import { postApi } from "@/features/posts/api/postApi";
import postReducer, {
  fetchPosts,
  fetchPostDetail,
  createPost,
  updatePost,
  deletePost,
  clearSelectedPost,
} from "@/features/posts/states/postSlice";

const api = vi.mocked(postApi);
const makeStore = () => configureStore({ reducer: { posts: postReducer } });
const raw = (id: number, title = `Judul ${id}`) => ({
  id,
  title,
  content: "isi",
  created_at: "2026-01-01",
});

describe("post thunks", () => {
  beforeEach(() => vi.resetAllMocks());

  it("state awal isLoading true", () => {
    const s = postReducer(undefined, { type: "@@INIT" });
    expect(s.isLoading).toBe(true);
    expect(s.posts).toEqual([]);
  });

  it("fetchPosts menerima array langsung", async () => {
    api.getAll.mockResolvedValue({ data: [raw(1), raw(2)] });
    const store = makeStore();
    const p = store.dispatch(fetchPosts());
    expect(store.getState().posts.isLoading).toBe(true);
    await p;
    expect(store.getState().posts.posts).toHaveLength(2);
    expect(store.getState().posts.isLoading).toBe(false);
  });

  it("fetchPosts menerima { posts: [] } dan data kosong", async () => {
    api.getAll.mockResolvedValueOnce({ data: { posts: [raw(1)] } });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.posts).toHaveLength(1);

    api.getAll.mockResolvedValueOnce({ data: {} });
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.posts).toEqual([]);
  });

  it("fetchPosts gagal menyimpan error", async () => {
    api.getAll.mockRejectedValue(new Error("down"));
    const store = makeStore();
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.error).toBe("down");
    expect(store.getState().posts.isLoading).toBe(false);
  });

  it("fetchPostDetail berhasil dan gagal", async () => {
    api.getById.mockResolvedValueOnce({ data: { post: raw(7) } });
    const store = makeStore();
    const p = store.dispatch(fetchPostDetail(7));
    expect(store.getState().posts.isLoading).toBe(true);
    await p;
    expect(store.getState().posts.selectedPost?.id).toBe(7);

    api.getById.mockRejectedValueOnce(new Error("hilang"));
    await store.dispatch(fetchPostDetail(8));
    expect(store.getState().posts.error).toBe("hilang");
  });

  it("fetchPostDetail memakai pesan default saat error kosong", async () => {
    api.getById.mockRejectedValue(new Error(""));
    const store = makeStore();
    await store.dispatch(fetchPostDetail(1));
    expect(store.getState().posts.error).toBe("Postingan tidak ditemukan");
  });

  it("createPost menaruh post baru di awal list", async () => {
    api.getAll.mockResolvedValue({ data: [raw(1)] });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    api.create.mockResolvedValue({ data: { post: raw(2) } });
    await store.dispatch(createPost({ title: "t", content: "c" }));
    expect(store.getState().posts.posts.map((p) => p.id)).toEqual([2, 1]);
  });

  it("createPost gagal tidak mengubah list", async () => {
    api.create.mockRejectedValue(new Error("x"));
    const store = makeStore();
    await store.dispatch(createPost({ title: "t", content: "c" }));
    expect(store.getState().posts.posts).toEqual([]);
  });

  it("updatePost memperbarui list dan selectedPost", async () => {
    api.getAll.mockResolvedValue({ data: [raw(1), raw(2)] });
    api.getById.mockResolvedValue({ data: { post: raw(1) } });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    await store.dispatch(fetchPostDetail(1));

    api.update.mockResolvedValue({ data: { post: raw(1, "Baru") } });
    await store.dispatch(updatePost({ id: 1, title: "Baru", content: "isi" }));
    expect(store.getState().posts.posts[0].title).toBe("Baru");
    expect(store.getState().posts.selectedPost?.title).toBe("Baru");
  });

  it("updatePost untuk id yang tidak ada di list tidak mengubah apa pun", async () => {
    api.update.mockResolvedValue({ data: { post: raw(99) } });
    const store = makeStore();
    await store.dispatch(updatePost({ id: 99, title: "x", content: "y" }));
    expect(store.getState().posts.posts).toEqual([]);
    expect(store.getState().posts.selectedPost).toBeNull();
  });

  it("updatePost gagal tidak mengubah state", async () => {
    api.update.mockRejectedValue(new Error("x"));
    const store = makeStore();
    const res = await store.dispatch(updatePost({ id: 1, title: "x", content: "y" }));
    expect(res.type).toBe("posts/update/rejected");
  });

  it("deletePost menghapus dari list", async () => {
    api.getAll.mockResolvedValue({ data: [raw(1), raw(2)] });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    api.delete.mockResolvedValue({});
    await store.dispatch(deletePost(1));
    expect(store.getState().posts.posts.map((p) => p.id)).toEqual([2]);
  });

  it("deletePost gagal mempertahankan list", async () => {
    api.getAll.mockResolvedValue({ data: [raw(1)] });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    api.delete.mockRejectedValue(new Error("x"));
    await store.dispatch(deletePost(1));
    expect(store.getState().posts.posts).toHaveLength(1);
  });

  it("clearSelectedPost mengosongkan selectedPost dan error", async () => {
    api.getById.mockResolvedValue({ data: { post: raw(1) } });
    const store = makeStore();
    await store.dispatch(fetchPostDetail(1));
    store.dispatch(clearSelectedPost());
    expect(store.getState().posts.selectedPost).toBeNull();
    expect(store.getState().posts.error).toBeNull();
  });
});