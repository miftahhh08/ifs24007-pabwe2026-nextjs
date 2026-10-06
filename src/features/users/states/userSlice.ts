import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { setToken, removeToken } from "@/helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string | null; // Ditambahkan di sini
  email_verified_at?: string | null;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserState {
  user: User | null;
  users: User[];
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  users: [],
  token: null,
  loading: false,
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      removeToken();
    },
    setTokenState: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      setToken(action.payload);
    },
  },
});

export const { setUser, setUsers, logout, setTokenState } = userSlice.actions;
export default userSlice.reducer;