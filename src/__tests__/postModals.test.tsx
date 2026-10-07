import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/features/posts/api/postApi", () => ({
  postApi: {
    getAll: vi.fn(), getById: vi.fn(), create: vi.fn(),
    update: vi.fn(), delete: vi.fn(), updateCover: vi.fn(),
  },
}));

import { postApi } from "@/features/posts/api/postApi";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import EditPostModal from "@/features/posts/components/EditPostModal";
import ChangeCoverModal from "@/features/posts/components/ChangeCoverModal";
import PostCard from "@/features/posts/components/PostCard";
import { renderWithStore } from "@/test-utils";
import type { Post } from "@/types";

const api = vi.mocked(postApi);
const submit = () => fireEvent.submit(document.querySelector("form") as HTMLFormElement);
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const post: Post = {
  id: 5,
  title: "Judul Lama",
  content: "Isi lama",
  user_id: 1,
  created_at: "2026-01-02T00:00:00Z",
};

beforeEach(() => vi.resetAllMocks());

describe("CreatePostModal", () => {
  it("tidak tampil saat tertutup", () => {
    renderWithStore(<CreatePostModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("tidak mengirim bila judul/konten kosong", () => {
    const onClose = vi.fn();
    renderWithStore(<CreatePostModal isOpen onClose={onClose} />);
    submit();
    expect(api.create).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("membuat post lalu menutup modal", async () => {
    api.create.mockResolvedValue({ data: { post: { id: 9, title: "Baru", content: "Isi" } } });
    const onClose = vi.fn();
    const { store } = renderWithStore(<CreatePostModal isOpen onClose={onClose} />);
    type("Judul", "Baru");
    type("Konten", "Isi");
    submit();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.create).toHaveBeenCalledWith({ title: "Baru", content: "Isi" });
    expect(store.getState().posts.posts[0].title).toBe("Baru");
  });

  it("tombol Batal memanggil onClose", () => {
    const onClose = vi.fn();
    renderWithStore(<CreatePostModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("EditPostModal", () => {
  it("mengisi form dari post dan menyimpan perubahan", async () => {
    api.update.mockResolvedValue({ data: { post: { ...post, title: "Judul Baru" } } });
    const onClose = vi.fn();
    renderWithStore(<EditPostModal isOpen onClose={onClose} post={post} />, {
      posts: { posts: [post] },
    });
    expect((screen.getByLabelText("Judul") as HTMLInputElement).value).toBe("Judul Lama");
    expect((screen.getByLabelText("Konten") as HTMLTextAreaElement).value).toBe("Isi lama");
    type("Judul", "Judul Baru");
    submit();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.update).toHaveBeenCalledWith(5, { title: "Judul Baru", content: "Isi lama" });
  });

  it("tidak mengirim bila post null atau field kosong", () => {
    const onClose = vi.fn();
    renderWithStore(<EditPostModal isOpen onClose={onClose} post={null} />);
    submit();
    expect(api.update).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol Batal memanggil onClose", () => {
    const onClose = vi.fn();
    renderWithStore(<EditPostModal isOpen onClose={onClose} post={post} />);
    fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ChangeCoverModal", () => {
  it("tidak mengirim bila URL kosong", () => {
    renderWithStore(
      <ChangeCoverModal isOpen onClose={() => {}} postId={5} onSuccess={() => {}} />
    );
    submit();
    expect(api.updateCover).not.toHaveBeenCalled();
  });

  it("memperbarui cover lalu memanggil onSuccess dan onClose", async () => {
    api.updateCover.mockResolvedValue({});
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    renderWithStore(
      <ChangeCoverModal isOpen onClose={onClose} postId={5} onSuccess={onSuccess} />
    );
    type("URL Gambar", "https://img.test/a.png");
    submit();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.updateCover).toHaveBeenCalledWith(5, "https://img.test/a.png");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("menampilkan pesan error saat gagal", async () => {
    api.updateCover.mockRejectedValue(new Error("Server error"));
    renderWithStore(
      <ChangeCoverModal isOpen onClose={() => {}} postId={5} onSuccess={() => {}} />
    );
    type("URL Gambar", "https://img.test/a.png");
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe("Server error");
  });

  it("memakai pesan default bila error tanpa message", async () => {
    api.updateCover.mockRejectedValue(new Error(""));
    renderWithStore(
      <ChangeCoverModal isOpen onClose={() => {}} postId={5} onSuccess={() => {}} />
    );
    type("URL Gambar", "https://img.test/a.png");
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Gagal memperbarui gambar sampul"
    );
  });

  it("tombol Batal memanggil onClose", () => {
    const onClose = vi.fn();
    renderWithStore(
      <ChangeCoverModal isOpen onClose={onClose} postId={5} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByText("Batal"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("PostCard (tambahan)", () => {
  it("pemilik bisa edit dan hapus", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderWithStore(
      <PostCard post={post} currentUserId={1} onEdit={onEdit} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByLabelText("Edit postingan Judul Lama"));
    fireEvent.click(screen.getByLabelText("Hapus postingan Judul Lama"));
    expect(onEdit).toHaveBeenCalledWith(post);
    expect(onDelete).toHaveBeenCalledWith(5);
  });

  it("bukan pemilik tidak melihat tombol aksi", () => {
    renderWithStore(<PostCard post={post} currentUserId={2} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.queryByLabelText("Edit postingan Judul Lama")).toBeNull();
  });

  it("pemilik tanpa handler tidak melihat tombol", () => {
    renderWithStore(<PostCard post={post} currentUserId={1} />);
    expect(screen.queryByLabelText("Edit postingan Judul Lama")).toBeNull();
    expect(screen.queryByLabelText("Hapus postingan Judul Lama")).toBeNull();
  });

  it("menampilkan cover, lalu menyembunyikannya bila gagal dimuat", () => {
    const { container } = renderWithStore(
      <PostCard post={{ ...post, cover: "https://img.test/c.png" }} priority />
    );
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.getAttribute("loading")).toBe("eager");
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
  });

  it("memakai judul cadangan dan tanggal kosong untuk data tidak valid", () => {
    renderWithStore(<PostCard post={{ ...post, title: " ", created_at: "bukan-tanggal" }} />);
    expect(screen.getAllByText("Postingan #5").length).toBeGreaterThan(0);
  });
});