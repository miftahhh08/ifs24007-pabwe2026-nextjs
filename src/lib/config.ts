/**
 * Browser memanggil API lewat path same-origin (/api-proxy), lalu Next.js meneruskannya ke server API
 * (lihat `rewrites` di next.config.ts). Keuntungannya:
 *  - tidak ada request CORS/preflight (lebih cepat, dan tidak memicu peringatan Chrome
 *    "Authorization will not be covered by the wildcard symbol (*) in CORS Access-Control-Allow-Headers"
 *    yang menurunkan skor Best Practices pada halaman setelah login)
 *  - tidak perlu koneksi tambahan ke domain lain
 */
export const API_PROXY_PATH = "/api-proxy";

export const API_BASE_URL = API_PROXY_PATH;
