import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  distDir: isStaticExport ? ".next-static" : ".next",
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  images: isStaticExport
    ? {
        unoptimized: true,
      }
    : undefined,
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
  ...(isStaticExport
    ? {}
    : {
        async redirects() {
          return [
            {
              source: "/servicios/canceles",
              destination: "/servicios/canceles-de-bano",
              permanent: true,
            },
            {
              source: "/servicios/fachadas",
              destination: "/servicios/fachadas-de-cristal",
              permanent: true,
            },
          ];
        },
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                {
                  key: "X-Content-Type-Options",
                  value: "nosniff",
                },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value:
                    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
                },
                {
                  key: "X-Frame-Options",
                  value: "SAMEORIGIN",
                },
                {
                  key: "X-DNS-Prefetch-Control",
                  value: "on",
                },
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ],
            },
            {
              source: "/_next/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
            {
              source: "/img/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=604800",
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
