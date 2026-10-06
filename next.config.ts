import type { NextConfig } from "next";

// Alamat server API yang sebenarnya (hanya dipakai di sisi server untuk meneruskan request)
const API_TARGET_URL =
  process.env.NEXT_PUBLIC_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Sisipkan CSS langsung di HTML agar tidak ada request CSS yang memblokir render
    inlineCss: true,
  },
  turbopack: {
    resolveAlias: {
      // Hilangkan polyfill bawaan Next.js (Object.hasOwn, Array.prototype.at, dst.)
      // yang ditandai Lighthouse sebagai "legacy JavaScript". Target kita browser modern.
      "../build/polyfills/polyfill-module": "./src/lib/noop.js",
    },
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${API_TARGET_URL}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // Izinkan indeks mesin pencari untuk semua halaman (kecuali proxy API)
        source: "/((?!api-proxy).*)",
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
