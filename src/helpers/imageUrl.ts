/**
 * Mengubah nilai cover dari API menjadi URL gambar yang bisa dimuat browser.
 * - Jika sudah URL lengkap (http/https/data), dipakai apa adanya.
 * - Jika hanya nama file / path relatif, digabung dengan ASSET_BASE.
 */
const ASSET_BASE = (
  process.env.NEXT_PUBLIC_DELCOM_ASSET_BASEURL || "https://open-api.delcom.org"
).replace(/\/$/, "");

export function getImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${ASSET_BASE}/${path.replace(/^\//, "")}`;
}