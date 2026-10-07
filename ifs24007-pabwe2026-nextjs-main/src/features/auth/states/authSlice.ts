import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types";
import { authApi } from "../api/authApi";
import {
  ApiError,
  getToken,
  pickEntity,
  removeToken,
  setToken,
  unwrapData,
} from "@/helpers/apiHelper";

// Token TIDAK dibaca di sini. Server dan klien harus merender HTML yang sama
// pada render pertama; token dibaca lewat aksi `hydrateAuth` setelah mount.
const initialState: AuthState = {
  user: null,
  token: null,
  initialized: false,
  isLoading: false,
  error: null,
};

interface AuthResult {
  token: string;
  user: User | null;
}

const toAuthResult = (res: unknown): AuthResult => {
  const data = unwrapData<{ token?: string; user?: User }>(res);
  if (!data?.token) {
    throw new Error("Token tidak ditemukan pada respons server");
  }
  return { token: data.token, user: data.user ?? null };
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const result = toAuthResult(await authApi.login(credentials));
      setToken(result.token);
      return result;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: Record<string, string>, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      const data = unwrapData<{ token?: string; user?: User }>(res);
      if (data?.token) setToken(data.token);
      return { token: data?.token ?? null, user: data?.user ?? null };
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      let res: unknown;
      try {
        res = await authApi.getMe();
      } catch (err) {
        // Endpoint tidak ada -> coba endpoint alternatif. 401 langsung dilempar.
        if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
          res = await authApi.getMeLegacy();
        } else {
          throw err;
        }
      }
      return pickEntity<User>(res, "user");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        removeToken();
        return rejectWithValue("UNAUTHORIZED");
      }
      return rejectWithValue((err as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (state) => {
      state.token = getToken();
      state.initialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      removeToken();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.token) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        // Hanya keluar otomatis bila token benar-benar ditolak server (401)
        if (action.payload === "UNAUTHORIZED") {
          state.token = null;
          state.user = null;
        }
      });
  },
});

export const { hydrateAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
