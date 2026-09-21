import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Backend lokal untuk testing. `port` sengaja tidak diisi supaya port
      // berapa pun diizinkan (dev server Adonis bisa jalan di port acak).
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/uploads/**",
      },
      {
        protocol: "https", // atau http kalau backend belum pakai SSL
        hostname: "backend.ptdahliaglobalindo.id",
        port: "", // kosongin kalau pakai default port (80/443)
        pathname: "/uploads/**",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
