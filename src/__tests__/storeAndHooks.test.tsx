import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode, type ChangeEvent } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useFormInput } from "@/hooks/useFormInput";
import { clearError } from "@/features/auth/states/authSlice";

describe("store", () => {
  it("memiliki reducer auth, posts, dan users", () => {
    expect(Object.keys(store.getState()).sort()).toEqual(["auth", "posts", "users"]);
  });
});

describe("redux hooks", () => {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children });

  it("useAppSelector dan useAppDispatch bekerja", () => {
    const { result } = renderHook(
      () => ({ dispatch: useAppDispatch(), initialized: useAppSelector((s) => s.auth.initialized) }),
      { wrapper }
    );
    expect(result.current.initialized).toBe(false);
    act(() => {
      result.current.dispatch(clearError());
    });
    expect(store.getState().auth.error).toBeNull();
  });
});

describe("useFormInput", () => {
  it("mengubah, mengatur, dan mereset nilai", () => {
    const { result } = renderHook(() => useFormInput({ name: "", bio: "" }));

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Budi" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.values).toEqual({ name: "Budi", bio: "" });

    act(() => result.current.setValues({ name: "X", bio: "Y" }));
    expect(result.current.values).toEqual({ name: "X", bio: "Y" });

    act(() => result.current.reset());
    expect(result.current.values).toEqual({ name: "", bio: "" });
  });
});