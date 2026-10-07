import { describe, it, expect, beforeEach } from "vitest";
import userReducer, {
  setUser,
  setUsers,
  logout,
  setTokenState,
} from "@/features/users/states/userSlice";
import { getToken } from "@/helpers/apiHelper";

const u = { id: 1, name: "A", email: "a@x.com" };

describe("userSlice", () => {
  beforeEach(() => localStorage.clear());

  it("state awal kosong", () => {
    const s = userReducer(undefined, { type: "@@INIT" });
    expect(s.user).toBeNull();
    expect(s.users).toEqual([]);
    expect(s.token).toBeNull();
  });

  it("setUser dan setUsers", () => {
    let s = userReducer(undefined, setUser(u));
    expect(s.user).toEqual(u);
    s = userReducer(s, setUsers([u]));
    expect(s.users).toEqual([u]);
  });

  it("setTokenState menyimpan token ke state dan localStorage", () => {
    const s = userReducer(undefined, setTokenState("tok"));
    expect(s.token).toBe("tok");
    expect(getToken()).toBe("tok");
  });

  it("logout menghapus user, token state, dan localStorage", () => {
    let s = userReducer(undefined, setTokenState("tok"));
    s = userReducer(userReducer(s, setUser(u)), logout());
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(getToken()).toBeNull();
  });
});