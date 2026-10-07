import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/states/authSlice";
import postReducer from "@/features/posts/states/postSlice";
import userReducer from "@/features/users/states/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    users: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;