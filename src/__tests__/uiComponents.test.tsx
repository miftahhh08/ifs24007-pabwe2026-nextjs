import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: { login: vi.fn(), register: vi.fn(), getMe: vi.fn(), getMeLegacy: vi.fn() },
}));

const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import Providers from "@/components/Providers";
import { authApi } from "@/features/auth/api/authApi";
import { renderWithStore, loggedIn } from "@/test-utils";
import { store } from "@/store";

describe("LoadingSkeleton", () => {
  it("menampilkan jumlah placeholder sesuai count", () => {
    const { container, rerender } = render(<LoadingSkeleton />);
    expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(3);
    expect(screen.getByText("Memuat konten...")).toBeTruthy();
    rerender(<LoadingSkeleton count={5} />);
    expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(5);
  });
});

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("tidak menampilkan apa pun bila message null", () => {
    const { container } = render(<Toast message={null} onClose={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("menampilkan pesan sukses dan menutup otomatis setelah 3 detik", () => {
    const onClose = vi.fn();
    render(<Toast message="Berhasil" onClose={onClose} />);
    expect(screen.getByText("Berhasil").className).toContain("bg-green-600");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memakai warna merah untuk tipe error", () => {
    render(<Toast message="Gagal" type="error" onClose={() => {}} />);
    expect(screen.getByText("Gagal").className).toContain("bg-red-600");
  });
});

describe("Modal", () => {
  it("tidak merender apa pun saat tertutup", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Judul">isi</Modal>
    );
    expect(container.innerHTML).toBe("");
  });

  it("menampilkan judul dan isi, serta menutup lewat tombol dan Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Judul Modal">
        <p>Isi modal</p>
      </Modal>
    );
    expect(screen.getByRole("dialog").getAttribute("aria-labelledby")).toBeTruthy();
    expect(screen.getByText("Judul Modal")).toBeTruthy();
    expect(screen.getByText("Isi modal")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Tutup dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("Navbar", () => {
  it("menampilkan nama user dan melakukan logout", () => {
    localStorage.setItem("token", "tok");
    const { store: s } = renderWithStore(<Navbar />, loggedIn);
    expect(screen.getByLabelText("Profil Budi")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Keluar"));
    expect(s.getState().auth.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("memakai label Profil bila user belum ada", () => {
    renderWithStore(<Navbar />);
    expect(screen.getByLabelText("Profil")).toBeTruthy();
  });
});

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("menampilkan children apa adanya sebelum initialized", () => {
    renderWithStore(<AuthGuard><p>konten</p></AuthGuard>, {
      auth: { initialized: false },
    });
    expect(screen.getByText("konten")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("mengalihkan ke login bila tidak ada token", () => {
    renderWithStore(<AuthGuard><p>konten</p></AuthGuard>);
    expect(screen.getByText("Memuat...")).toBeTruthy();
    expect(screen.queryByText("konten")).toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/auth/login");
  });

  it("memuat data user bila token ada tetapi user belum ada", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({ data: { user: { id: 1, name: "B", email: "b@x" } } });
    const { store: s } = renderWithStore(<AuthGuard><p>konten</p></AuthGuard>, {
      auth: { token: "tok" },
    });
    expect(screen.getByText("konten")).toBeTruthy();
    await vi.waitFor(() => expect(s.getState().auth.user?.name).toBe("B"));
  });

  it("tidak memuat ulang user bila sudah ada", () => {
    renderWithStore(<AuthGuard><p>konten</p></AuthGuard>, loggedIn);
    expect(screen.getByText("konten")).toBeTruthy();
    expect(authApi.getMe).not.toHaveBeenCalled();
  });
});

describe("Providers", () => {
  it("menjalankan hydrateAuth setelah mount", () => {
    localStorage.setItem("token", "dari-storage");
    render(<Providers><p>anak</p></Providers>);
    expect(screen.getByText("anak")).toBeTruthy();
    expect(store.getState().auth.initialized).toBe(true);
    expect(store.getState().auth.token).toBe("dari-storage");
  });
});