import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Suspense } from "react";
import { screen, fireEvent, waitFor, render, act } from "@testing-library/react";
import { Provider } from "react-redux";

const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock("next/dynamic", async () => {
  const React = await import("react");
  return {
    default: (loader: () => Promise<{ default: React.ComponentType<any> }>) => {
      const Lazy = React.lazy(loader);
      const Wrapped = (props: Record<string, unknown>) =>
        React.createElement(
          React.Suspense,
          { fallback: null },
          React.createElement(Lazy as React.ComponentType<Record<string, unknown>>, props)
        );
      return Wrapped;
    },
  };
});

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: { login: vi.fn(), register: vi.fn(), getMe: vi.fn(), getMeLegacy: vi.fn() },
}));
vi.mock("@/features/posts/api/postApi", () => ({
  postApi: {
    getAll: vi.fn(), getById: vi.fn(), create: vi.fn(),
    update: vi.fn(), delete: vi.fn(), updateCover: vi.fn(),
  },
}));
vi.mock("@/features/users/api/userApi", () => ({
  getUserProfile: vi.fn(),
  getUsers: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
}));
vi.mock("@/helpers/apiHelper", async (orig) => ({
  ...(await orig<typeof import("@/helpers/apiHelper")>()),
  fetchApi: vi.fn(),
}));
vi.mock("next/font/google", () => ({ Inter: () => ({ className: "inter" }) }));

import { authApi } from "@/features/auth/api/authApi";
import { postApi } from "@/features/posts/api/postApi";
import { getUsers, updateProfile, updatePassword } from "@/features/users/api/userApi";
import { fetchApi } from "@/helpers/apiHelper";
import { renderWithStore, makeStore, loggedIn, testUser } from "@/test-utils";
import FeedPage from "@/app/(dashboard)/page";
import PostsAlias from "@/app/(dashboard)/posts/page";
import PostDetailPage from "@/app/(dashboard)/posts/[postId]/page";
import UsersPage from "@/app/(dashboard)/users/page";
import ProfilePage from "@/app/(dashboard)/profile/page";
import LoginPage from "@/app/auth/login/page";
import RegisterPage from "@/app/auth/register/page";
import DashboardLayout from "@/app/(dashboard)/layout";
import AuthLayout from "@/app/auth/layout";
import RootLayout, { metadata } from "@/app/layout";

const posts = vi.mocked(postApi);
const submit = () => fireEvent.submit(document.querySelector("form") as HTMLFormElement);
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const rawPost = (id: number, userId = 1, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Judul ${id}`,
  content: `Isi ${id}`,
  user_id: userId,
  created_at: "2026-01-02T00:00:00Z",
  ...extra,
});

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("FeedPage", () => {
  it("menampilkan skeleton lalu daftar post", async () => {
    posts.getAll.mockResolvedValue({ data: [rawPost(1), rawPost(2, 2), rawPost(3)] });
    renderWithStore(<FeedPage />, { ...loggedIn, posts: { isLoading: true } });
    expect(screen.getByText("Memuat konten...")).toBeTruthy();
    expect(await screen.findByText("Judul 1")).toBeTruthy();
    expect(screen.getByText("Judul 3")).toBeTruthy();
  });

  it("menampilkan pesan kosong", async () => {
    posts.getAll.mockResolvedValue({ data: [] });
    renderWithStore(<FeedPage />, loggedIn);
    expect(await screen.findByText(/Belum ada postingan/)).toBeTruthy();
  });

  it("menampilkan error bila gagal dan tidak ada post", async () => {
    posts.getAll.mockRejectedValue(new Error("Server mati"));
    renderWithStore(<FeedPage />, loggedIn);
    expect((await screen.findByRole("alert")).textContent).toBe("Server mati");
  });

  it("tidak memuat post bila belum ada token", () => {
    renderWithStore(<FeedPage />);
    expect(posts.getAll).not.toHaveBeenCalled();
  });

  it("membuka modal buat post", async () => {
    posts.getAll.mockResolvedValue({ data: [] });
    renderWithStore(<FeedPage />, loggedIn);
    fireEvent.click(await screen.findByText("Buat Post"));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Tutup dialog"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("membuka modal edit untuk post milik sendiri", async () => {
    posts.getAll.mockResolvedValue({ data: [rawPost(1)] });
    renderWithStore(<FeedPage />, loggedIn);
    fireEvent.click(await screen.findByLabelText("Edit postingan Judul 1"));
    expect(await screen.findByText("Edit Postingan")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Tutup dialog"));
    await waitFor(() => expect(screen.queryByText("Edit Postingan")).toBeNull());
  });

  it("menghapus post bila dikonfirmasi, dan tidak bila dibatalkan", async () => {
    posts.getAll.mockResolvedValue({ data: [rawPost(1)] });
    posts.delete.mockResolvedValue({});
    const confirmFn = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    vi.stubGlobal("confirm", confirmFn);
    renderWithStore(<FeedPage />, loggedIn);
    const del = await screen.findByLabelText("Hapus postingan Judul 1");
    fireEvent.click(del);
    expect(posts.delete).not.toHaveBeenCalled();
    fireEvent.click(del);
    await waitFor(() => expect(posts.delete).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByText("Judul 1")).toBeNull());
  });

  it("route /posts memakai halaman feed yang sama", () => {
    expect(PostsAlias).toBe(FeedPage);
  });
});

describe("PostDetailPage", () => {
  const renderDetail = async (preloaded = loggedIn) => {
    const store = makeStore(preloaded);
    await act(async () => {
      render(
        <Provider store={store}>
          <Suspense fallback={<p>suspended</p>}>
            <PostDetailPage params={Promise.resolve({ postId: "7" })} />
          </Suspense>
        </Provider>
      );
    });
    return store;
  };

  it("menampilkan skeleton selama memuat", async () => {
    posts.getById.mockReturnValue(new Promise(() => {}));
    await renderDetail({ ...loggedIn, posts: { isLoading: true } });
    expect(screen.getByText("Memuat konten...")).toBeTruthy();
  });

  it("menampilkan error bila post tidak ditemukan", async () => {
    posts.getById.mockRejectedValue(new Error("Tidak ada"));
    await renderDetail();
    expect(await screen.findByText("Postingan tidak dapat dimuat")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Tidak ada");
  });

  it("pemilik tanpa cover bisa menambah cover, dan memuat ulang setelah berhasil", async () => {
    posts.getById.mockResolvedValue({ data: { post: rawPost(7, 1, { user: { id: 1, name: "Budi" } }) } });
    posts.updateCover.mockResolvedValue({});
    await renderDetail();
    expect(await screen.findByText("Judul 7")).toBeTruthy();
    expect(screen.getByText("Budi")).toBeTruthy();
    fireEvent.click(screen.getByText("Tambah Gambar Sampul (Cover)"));
    await screen.findByRole("dialog");
    type("URL Gambar", "https://img.test/x.png");
    submit();
    await waitFor(() => expect(posts.updateCover).toHaveBeenCalledWith(7, "https://img.test/x.png"));
    await waitFor(() => expect(posts.getById.mock.calls.length).toBeGreaterThan(1));
  });

  it("pemilik dengan cover melihat tombol Ubah Cover; cover rusak diganti pesan", async () => {
    posts.getById.mockResolvedValue({
      data: { post: rawPost(7, 1, { cover: "https://img.test/c.png" }) },
    });
    const { container } = { container: document.body };
    await renderDetail();
    expect(await screen.findByText("Ubah Cover")).toBeTruthy();
    fireEvent.click(screen.getByText("Ubah Cover"));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Tutup dialog"));
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(await screen.findByText("Cover gagal dimuat, ganti gambar")).toBeTruthy();
  });

  it("bukan pemilik tidak melihat tombol cover", async () => {
    posts.getById.mockResolvedValue({
      data: { post: rawPost(7, 99, { cover: "https://img.test/c.png", created_at: "x" }) },
    });
    await renderDetail();
    expect(await screen.findByText("Judul 7")).toBeTruthy();
    expect(screen.queryByText("Ubah Cover")).toBeNull();
    expect(screen.getByText("Anonim")).toBeTruthy();
  });

  it("bukan pemilik tanpa cover tidak melihat tombol tambah", async () => {
    posts.getById.mockResolvedValue({ data: { post: rawPost(7, 99) } });
    await renderDetail();
    expect(await screen.findByText("Judul 7")).toBeTruthy();
    expect(screen.queryByText("Tambah Gambar Sampul (Cover)")).toBeNull();
  });

  it("tidak memuat apa pun tanpa token", async () => {
    await renderDetail({});
    expect(posts.getById).not.toHaveBeenCalled();
  });
});

describe("UsersPage", () => {
  const list = [
    { id: 1, name: "Ani", email: "ani@x.com" },
    { id: 2, name: "", email: "kosong@x.com" },
  ];

  it("menampilkan daftar anggota (array langsung)", async () => {
    vi.mocked(getUsers).mockResolvedValue({ data: list });
    renderWithStore(<UsersPage />, loggedIn);
    expect(screen.getByText("Memuat konten...")).toBeTruthy();
    expect(await screen.findByText("Ani")).toBeTruthy();
    expect(screen.getByText("kosong@x.com")).toBeTruthy();
  });

  it("menerima bentuk { users: [] }", async () => {
    vi.mocked(getUsers).mockResolvedValue({ data: { users: list } });
    renderWithStore(<UsersPage />, loggedIn);
    expect(await screen.findByText("Ani")).toBeTruthy();
  });

  it("menampilkan pesan kosong", async () => {
    vi.mocked(getUsers).mockResolvedValue({ data: {} });
    renderWithStore(<UsersPage />, loggedIn);
    expect(await screen.findByText("Belum ada anggota terdaftar.")).toBeTruthy();
  });

  it("menampilkan error", async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error("Gagal total"));
    renderWithStore(<UsersPage />, loggedIn);
    expect((await screen.findByRole("alert")).textContent).toBe("Gagal total");
  });

  it("memakai pesan error default", async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error(""));
    renderWithStore(<UsersPage />, loggedIn);
    expect((await screen.findByRole("alert")).textContent).toBe("Gagal memuat daftar anggota");
  });

  it("tidak memuat tanpa token", () => {
    renderWithStore(<UsersPage />);
    expect(getUsers).not.toHaveBeenCalled();
  });

  it("tidak memperbarui state setelah unmount", async () => {
    let resolve: (v: unknown) => void = () => {};
    vi.mocked(getUsers).mockReturnValue(new Promise((r) => (resolve = r)));
    const { unmount } = renderWithStore(<UsersPage />, loggedIn);
    unmount();
    await act(async () => resolve({ data: list }));
    expect(getUsers).toHaveBeenCalledTimes(1);
  });
});

describe("ProfilePage", () => {
  it("menyimpan profil dan memuat ulang data user", async () => {
    vi.mocked(updateProfile).mockResolvedValue({});
    vi.mocked(authApi.getMe).mockResolvedValue({ data: { user: testUser } });
    renderWithStore(<ProfilePage />, loggedIn);
    expect((screen.getByLabelText("Nama") as HTMLInputElement).value).toBe("Budi");
    expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe("halo");
    type("Nama", "Budi Baru");
    type("Bio", "bio baru");
    fireEvent.submit(screen.getByText("Simpan Profil").closest("form") as HTMLFormElement);
    expect(await screen.findByText("Profil berhasil diperbarui!")).toBeTruthy();
    expect(updateProfile).toHaveBeenCalledWith({ name: "Budi Baru", bio: "bio baru" });
  });

  it("menampilkan error saat gagal menyimpan profil", async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error("Nama terlarang"));
    renderWithStore(<ProfilePage />, loggedIn);
    fireEvent.submit(screen.getByText("Simpan Profil").closest("form") as HTMLFormElement);
    expect(await screen.findByText("Nama terlarang")).toBeTruthy();
  });

  it("memakai pesan default saat gagal tanpa message", async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error(""));
    vi.mocked(updatePassword).mockRejectedValue(new Error(""));
    renderWithStore(<ProfilePage />, loggedIn);
    fireEvent.submit(screen.getByText("Simpan Profil").closest("form") as HTMLFormElement);
    expect(await screen.findByText("Gagal memperbarui profil")).toBeTruthy();
    fireEvent.submit(screen.getByText("Ubah Sandi").closest("form") as HTMLFormElement);
    expect(await screen.findByText("Gagal memperbarui kata sandi")).toBeTruthy();
  });

  it("mengubah kata sandi dan mengosongkan form", async () => {
    vi.mocked(updatePassword).mockResolvedValue({});
    renderWithStore(<ProfilePage />, loggedIn);
    type("Kata Sandi Lama", "lama12345");
    type("Kata Sandi Baru", "baru12345");
    fireEvent.submit(screen.getByText("Ubah Sandi").closest("form") as HTMLFormElement);
    expect(await screen.findByText("Kata sandi berhasil diperbarui!")).toBeTruthy();
    expect(updatePassword).toHaveBeenCalledWith({
      old_password: "lama12345",
      new_password: "baru12345",
    });
    expect((screen.getByLabelText("Kata Sandi Lama") as HTMLInputElement).value).toBe("");
  });

  it("menampilkan error saat gagal mengubah sandi", async () => {
    vi.mocked(updatePassword).mockRejectedValue(new Error("Sandi lama salah"));
    renderWithStore(<ProfilePage />, loggedIn);
    fireEvent.submit(screen.getByText("Ubah Sandi").closest("form") as HTMLFormElement);
    expect(await screen.findByText("Sandi lama salah")).toBeTruthy();
  });

  it("form kosong bila user belum ada", () => {
    renderWithStore(<ProfilePage />);
    expect((screen.getByLabelText("Nama") as HTMLInputElement).value).toBe("");
  });
});

describe("LoginPage", () => {
  it("login berhasil mengalihkan ke beranda", async () => {
    vi.mocked(authApi.login).mockResolvedValue({ data: { token: "T", user: testUser } });
    renderWithStore(<LoginPage />);
    type("Username / Email", "  budi@delcom.org ");
    type("Kata Sandi", "rahasia123");
    submit();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(authApi.login).toHaveBeenCalledWith({
      username: "budi@delcom.org",
      email: "budi@delcom.org",
      password: "rahasia123",
      kata_sandi: "rahasia123",
    });
  });

  it("menampilkan pesan error dari server", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Kredensial salah"));
    renderWithStore(<LoginPage />);
    type("Username / Email", "a");
    type("Kata Sandi", "b");
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe("Kredensial salah");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("memakai pesan default bila server tidak memberi pesan", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error(""));
    renderWithStore(<LoginPage />);
    submit();
    expect((await screen.findByRole("alert")).textContent).toContain("Gagal melakukan login");
  });
});

describe("RegisterPage", () => {
  const fill = (password: string) => {
    type("Nama Lengkap", " Budi ");
    type("Username", "budi1");
    type("Email", "budi@x.com");
    type("Kata Sandi", password);
  };

  it("menolak kata sandi kurang dari 8 karakter", () => {
    render(<RegisterPage />);
    fill("123");
    submit();
    expect(screen.getByRole("alert").textContent).toBe("Kata sandi minimal 8 karakter.");
    expect(fetchApi).not.toHaveBeenCalled();
  });

  it("mendaftar lalu menuju halaman login", async () => {
    vi.mocked(fetchApi).mockResolvedValue({});
    render(<RegisterPage />);
    fill("password123");
    submit();
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/auth/login"));
    const [endpoint, opts] = vi.mocked(fetchApi).mock.calls[0];
    expect(endpoint).toBe("/auth/register");
    expect(JSON.parse(String(opts?.body))).toMatchObject({ name: "Budi", username: "budi1" });
  });

  it("menampilkan pesan error dari server", async () => {
    vi.mocked(fetchApi).mockRejectedValue(new Error("Email dipakai"));
    render(<RegisterPage />);
    fill("password123");
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe("Email dipakai");
  });

  it("memakai pesan default saat error tanpa message", async () => {
    vi.mocked(fetchApi).mockRejectedValue(new Error(""));
    render(<RegisterPage />);
    fill("password123");
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe("Gagal melakukan pendaftaran.");
  });
});

describe("Layouts", () => {
  it("AuthLayout membungkus children", () => {
    render(<AuthLayout><p>form</p></AuthLayout>);
    expect(screen.getByText("form")).toBeTruthy();
  });

  it("DashboardLayout menampilkan navbar dan children saat login", () => {
    renderWithStore(<DashboardLayout><p>isi</p></DashboardLayout>, loggedIn);
    expect(screen.getByText("DelcomFeed")).toBeTruthy();
    expect(screen.getByText("isi")).toBeTruthy();
  });

  it("RootLayout memakai bahasa Indonesia dan metadata", () => {
    const el = RootLayout({ children: <p>x</p> }) as { props: { lang: string } };
    expect(el.props.lang).toBe("id");
    expect(metadata.title).toContain("DelcomFeed");
  });
});