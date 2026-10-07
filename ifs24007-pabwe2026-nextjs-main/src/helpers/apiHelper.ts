import { API_BASE_URL } from "@/lib/config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

/**
 * Respons API biasanya dibungkus { success, message, data: {...} }.
 * Fungsi ini mengambil isi `data` bila ada, dan jika tidak ada mengembalikan respons apa adanya.
 */
export const unwrapData = <T>(res: unknown): T => {
  if (res && typeof res === "object" && "data" in res) {
    const inner = (res as { data?: unknown }).data;
    if (inner !== undefined && inner !== null) return inner as T;
  }
  return res as T;
};

/** Mengambil entitas dari respons, mis. pickEntity(res, "post") untuk { data: { post } } atau { post }. */
export const pickEntity = <T>(res: unknown, key: string): T => {
  const data = unwrapData<Record<string, unknown>>(res);
  if (data && typeof data === "object" && key in data) {
    return data[key] as T;
  }
  return data as unknown as T;
};

export const fetchApi = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Respons bisa kosong / bukan JSON (mis. 204 atau error gateway)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string }).message || "Terjadi kesalahan pada server",
      response.status
    );
  }

  return data as T;
};

export const apiFetch = fetchApi;
