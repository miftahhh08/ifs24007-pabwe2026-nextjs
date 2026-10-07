import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    getMeLegacy: vi.fn(),
  },
}));

import { authApi } from "@/features/auth/api/authApi";
import authReducer, {
  loginUser,
  registerUser,
  fetchMe,
} from "@/features/auth/states/authSlice";
import { ApiError, getToken, setToken } from "@/helpers/apiHelper";

const api = vi.mocked(authApi);
const makeStore = () => configureStore({ reducer: { auth: authReducer } });
const user = { id: 1, name: "Budi", email: "b@x.com" };

describe("auth thunks", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it("loginUser berhasil menyimpan token dan user", async () => {
    api.login.mockResolvedValue({ data: { token: "T", user } });
    const store = makeStore();
    const p = store.dispatch(loginUser({ email: "a", password: "b" }));
    expect(store.getState().auth.isLoading).toBe(true);
    await p;
    const s = store.getState().auth;
    expect(s.isLoading).toBe(false);
    expect(s.token).toBe("T");
    expect(s.user).toEqual(user);
    expect(getToken()).toBe("T");
  });

  it("loginUser tanpa user pada respons memakai null", async () => {
    api.login.mockResolvedValue({ data: { token: "T" } });
    const store = makeStore();
    await store.dispatch(loginUser({}));
    expect(store.getState().auth.user).toBeNull();
  });

  it("loginUser gagal bila token tidak ada pada respons", async () => {
    api.login.mockResolvedValue({ data: {} });
    const store = makeStore();
    await store.dispatch(loginUser({}));
    expect(store.getState().auth.error).toBe("Token tidak ditemukan pada respons server");
    expect(store.getState().auth.isLoading).toBe(false);
  });

  it("loginUser gagal saat API melempar error", async () => {
    api.login.mockRejectedValue(new Error("Password salah"));
    const store = makeStore();
    await store.dispatch(loginUser({}));
    expect(store.getState().auth.error).toBe("Password salah");
  });

  it("registerUser dengan token langsung login", async () => {
    api.register.mockResolvedValue({ data: { token: "R", user } });
    const store = makeStore();
    await store.dispatch(registerUser({}));
    const s = store.getState().auth;
    expect(s.token).toBe("R");
    expect(s.user).toEqual(user);
    expect(getToken()).toBe("R");
  });

  it("registerUser tanpa token tidak mengisi state login", async () => {
    api.register.mockResolvedValue({ message: "ok" });
    const store = makeStore();
    await store.dispatch(registerUser({}));
    const s = store.getState().auth;
    expect(s.token).toBeNull();
    expect(s.isLoading).toBe(false);
  });

  it("registerUser gagal menyimpan pesan error", async () => {
    api.register.mockRejectedValue(new Error("Email dipakai"));
    const store = makeStore();
    await store.dispatch(registerUser({}));
    expect(store.getState().auth.error).toBe("Email dipakai");
  });

  it("fetchMe berhasil mengisi user", async () => {
    api.getMe.mockResolvedValue({ data: { user } });
    const store = makeStore();
    await store.dispatch(fetchMe());
    expect(store.getState().auth.user).toEqual(user);
  });

  it("fetchMe memakai endpoint cadangan saat 404/405", async () => {
    api.getMe.mockRejectedValue(new ApiError("nf", 404));
    api.getMeLegacy.mockResolvedValue({ data: user });
    const store = makeStore();
    await store.dispatch(fetchMe());
    expect(api.getMeLegacy).toHaveBeenCalled();
    expect(store.getState().auth.user).toEqual(user);
  });

  it("fetchMe 401 menghapus token dan mengosongkan state", async () => {
    setToken("old");
    api.getMe.mockRejectedValue(new ApiError("unauthorized", 401));
    const store = makeStore();
    await store.dispatch(fetchMe());
    expect(getToken()).toBeNull();
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.user).toBeNull();
  });

  it("fetchMe error lain tidak mengeluarkan user", async () => {
    api.getMe.mockRejectedValue(new Error("network"));
    const store = makeStore();
    await store.dispatch(fetchMe());
    expect(store.getState().auth.user).toBeNull();
  });
});