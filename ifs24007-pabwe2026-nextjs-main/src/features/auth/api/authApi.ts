import { fetchApi } from "@/helpers/apiHelper";

export const authApi = {
  login: (credentials: Record<string, string>) =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (payload: Record<string, string>) =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => fetchApi("/users/me"),

  /** Cadangan bila backend menyediakan endpoint /auth/me */
  getMeLegacy: () => fetchApi("/auth/me"),
};
