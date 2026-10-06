import { describe, it, expect, beforeEach } from "vitest";
import authReducer, { logout, clearError, hydrateAuth } from "@/features/auth/states/authSlice";
import { setToken, removeToken } from "@/helpers/apiHelper";

describe("authSlice Reducer Unit Tests", () => {
  const initialState = {
    user: { id: "1", name: "User Test", email: "test@delcom.org" },
    token: "valid-token",
    initialized: true,
    isLoading: false,
    error: "Terjadi kesalahan",
  };

  beforeEach(() => removeToken());

  it("state awal tidak membaca token (aman untuk SSR/hydration)", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.token).toBeNull();
    expect(state.initialized).toBe(false);
  });

  it("hydrateAuth membaca token dari localStorage", () => {
    setToken("abc123");
    const state = authReducer(undefined, hydrateAuth());
    expect(state.token).toBe("abc123");
    expect(state.initialized).toBe(true);
  });

  it("harus menangani aksi logout secara mereset state", () => {
    const state = authReducer(initialState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("harus membersihkan pesan error dengan clearError", () => {
    const state = authReducer(initialState, clearError());
    expect(state.error).toBeNull();
  });
});
