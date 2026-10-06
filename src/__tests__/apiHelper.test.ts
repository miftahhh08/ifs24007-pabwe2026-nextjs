import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, removeToken } from "@/helpers/apiHelper";

describe("apiHelper - Cookie & LocalStorage Token Management", () => {
  beforeEach(() => {
    removeToken();
  });

  it("dapat menyimpan dan mengambil token", () => {
    setToken("dummy-token-123");
    expect(getToken()).toBe("dummy-token-123");
  });

  it("dapat menghapus token", () => {
    setToken("dummy-token-123");
    removeToken();
    expect(getToken()).toBeNull();
  });
});
import { unwrapData, pickEntity } from "@/helpers/apiHelper";

describe("apiHelper - unwrap respons API", () => {
  it("mengambil isi data dari respons terbungkus", () => {
    expect(unwrapData({ success: true, data: { token: "t" } })).toEqual({ token: "t" });
  });

  it("mengembalikan respons apa adanya bila tidak ada data", () => {
    expect(unwrapData({ token: "t" })).toEqual({ token: "t" });
  });

  it("pickEntity mendukung { data: { post } } maupun { post }", () => {
    expect(pickEntity({ data: { post: { id: 1 } } }, "post")).toEqual({ id: 1 });
    expect(pickEntity({ post: { id: 2 } }, "post")).toEqual({ id: 2 });
  });
});
