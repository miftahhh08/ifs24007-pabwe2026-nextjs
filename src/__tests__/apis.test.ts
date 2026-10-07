import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/helpers/apiHelper", () => ({ fetchApi: vi.fn().mockResolvedValue({}) }));

import { fetchApi } from "@/helpers/apiHelper";
import { authApi } from "@/features/auth/api/authApi";
import { postApi } from "@/features/posts/api/postApi";
import {
  getUserProfile,
  getUsers,
  updateProfile,
  updatePassword,
} from "@/features/users/api/userApi";

const mocked = vi.mocked(fetchApi);

describe("API modules", () => {
  beforeEach(() => mocked.mockClear());

  it("authApi", async () => {
    await authApi.login({ email: "a", password: "b" });
    expect(mocked).toHaveBeenLastCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a", password: "b" }),
    });
    await authApi.register({ name: "n" });
    expect(mocked).toHaveBeenLastCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "n" }),
    });
    await authApi.getMe();
    expect(mocked).toHaveBeenLastCalledWith("/users/me");
    await authApi.getMeLegacy();
    expect(mocked).toHaveBeenLastCalledWith("/auth/me");
  });

  it("postApi", async () => {
    await postApi.getAll();
    expect(mocked).toHaveBeenLastCalledWith("/posts");
    await postApi.getById(5);
    expect(mocked).toHaveBeenLastCalledWith("/posts/5");
    await postApi.create({ title: "t", content: "c" });
    expect(mocked).toHaveBeenLastCalledWith("/posts", {
      method: "POST",
      body: JSON.stringify({ title: "t", content: "c" }),
    });
    await postApi.update(5, { title: "t", content: "c" });
    expect(mocked).toHaveBeenLastCalledWith("/posts/5", {
      method: "PUT",
      body: JSON.stringify({ title: "t", content: "c" }),
    });
    await postApi.delete(5);
    expect(mocked).toHaveBeenLastCalledWith("/posts/5", { method: "DELETE" });
    await postApi.updateCover(5, "url");
    expect(mocked).toHaveBeenLastCalledWith("/posts/5/cover", {
      method: "PATCH",
      body: JSON.stringify({ cover: "url" }),
    });
  });

  it("userApi", async () => {
    await getUserProfile();
    expect(mocked).toHaveBeenLastCalledWith("/users/me");
    await getUsers();
    expect(mocked).toHaveBeenLastCalledWith("/users");
    await updateProfile({ name: "n", bio: "b" });
    expect(mocked).toHaveBeenLastCalledWith("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "n", bio: "b" }),
    });
    await updatePassword({ old_password: "a", new_password: "b" });
    expect(mocked).toHaveBeenLastCalledWith("/users/password", {
      method: "PATCH",
      body: JSON.stringify({ old_password: "a", new_password: "b" }),
    });
  });
});