import { type ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/states/authSlice";
import postReducer from "@/features/posts/states/postSlice";
import userReducer from "@/features/users/states/userSlice";
import type { AuthState, PostState, User } from "@/types";

export const testUser: User = { id: 1, name: "Budi", email: "budi@delcom.org", bio: "halo" };

export interface PreloadedState {
  auth?: Partial<AuthState>;
  posts?: Partial<PostState>;
}

export const makeStore = (preloaded: PreloadedState = {}) =>
  configureStore({
    reducer: { auth: authReducer, posts: postReducer, users: userReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        initialized: true,
        isLoading: false,
        error: null,
        ...preloaded.auth,
      },
      posts: {
        posts: [],
        selectedPost: null,
        isLoading: false,
        error: null,
        ...preloaded.posts,
      },
    },
  });

export const loggedIn: PreloadedState = {
  auth: { token: "tok", user: testUser, initialized: true },
};

export function renderWithStore(ui: ReactElement, preloaded: PreloadedState = {}) {
  const store = makeStore(preloaded);
  const utils = render(<Provider store={store}>{ui}</Provider>);
  return { store, ...utils };
}