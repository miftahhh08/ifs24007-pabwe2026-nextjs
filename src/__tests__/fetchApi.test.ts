import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fetchApi,
  apiFetch,
  ApiError,
  getToken,
  setToken,
  removeToken,
  unwrapData,
  pickEntity,
} from "@/helpers/apiHelper";

const mockFetch = (body: unknown, ok = true, status = 200, json = true) => {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: json ? () => Promise.resolve(body) : () => Promise.reject(new Error("not json")),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
};

describe("token helpers", () => {
  beforeEach(() => localStorage.clear());

  it("set, get, dan remove token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    removeToken();
    expect(getToken()).toBeNull();
  });
});

describe("unwrapData & pickEntity", () => {
  it("unwrapData mengambil isi data bila ada", () => {
    expect(unwrapData({ data: { a: 1 } })).toEqual({ a: 1 });
  });

  it("unwrapData mengembalikan respons apa adanya bila data kosong/tidak ada", () => {
    expect(unwrapData({ data: null })).toEqual({ data: null });
    expect(unwrapData({ x: 1 })).toEqual({ x: 1 });
    expect(unwrapData("teks")).toBe("teks");
    expect(unwrapData(null)).toBeNull();
  });

  it("pickEntity mengambil key tertentu atau seluruh data", () => {
    expect(pickEntity({ data: { post: { id: 1 } } }, "post")).toEqual({ id: 1 });
    expect(pickEntity({ post: { id: 2 } }, "post")).toEqual({ id: 2 });
    expect(pickEntity({ data: { id: 3 } }, "post")).toEqual({ id: 3 });
  });
});

describe("ApiError", () => {
  it("menyimpan message, name, dan status", () => {
    const err = new ApiError("gagal", 404);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("gagal");
    expect(err.status).toBe(404);
  });
});

describe("fetchApi", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("mengirim request JSON tanpa Authorization bila tidak ada token", async () => {
    const fn = mockFetch({ ok: true });
    const res = await fetchApi("/posts");
    expect(res).toEqual({ ok: true });
    const [url, opts] = fn.mock.calls[0];
    expect(url).toBe("/api-proxy/posts");
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.headers.Authorization).toBeUndefined();
  });

  it("menyertakan Bearer token bila tersedia", async () => {
    setToken("tok");
    const fn = mockFetch({});
    await apiFetch("/users/me");
    expect(fn.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("tidak mengatur Content-Type untuk FormData", async () => {
    const fn = mockFetch({});
    await fetchApi("/upload", { method: "POST", body: new FormData() });
    expect(fn.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();
  });

  it("melempar ApiError dengan pesan dari server", async () => {
    mockFetch({ message: "Tidak valid" }, false, 422);
    await expect(fetchApi("/x")).rejects.toMatchObject({
      name: "ApiError",
      message: "Tidak valid",
      status: 422,
    });
  });

  it("memakai pesan default bila respons error bukan JSON", async () => {
    mockFetch(null, false, 502, false);
    await expect(fetchApi("/x")).rejects.toMatchObject({
      message: "Terjadi kesalahan pada server",
      status: 502,
    });
  });

  it("mengembalikan objek kosong bila respons sukses bukan JSON", async () => {
    mockFetch(null, true, 204, false);
    await expect(fetchApi("/x")).resolves.toEqual({});
  });
});