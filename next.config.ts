import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // Ruta limpia /login en lugar de /auth/login
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true,
      },
      // Ocultar el resto de rutas /auth/*
      {
        source: "/auth/:path*",
        destination: "/login",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cixfitucqskplvfbavzq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "portal-centrodeestudiosaua.vercel.app",
      },
      {
        protocol: "https",
        hostname: "alumnos.centrodeestudiosaua.com",
      },
    ],
  },
};

export default nextConfig;
