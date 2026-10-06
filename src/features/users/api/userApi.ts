import { fetchApi } from "@/helpers/apiHelper";

export const getUserProfile = async (): Promise<unknown> => fetchApi("/users/me");

export const getUsers = async (): Promise<unknown> => fetchApi("/users");

export const updateProfile = async (payload: { name: string; bio: string }): Promise<unknown> =>
  fetchApi("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updatePassword = async (payload: {
  old_password: string;
  new_password: string;
}): Promise<unknown> =>
  fetchApi("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
