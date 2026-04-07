import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // Raíz → landing de inscripción
      {
        source: "/",
        destination: "/inscribirse",
        permanent: true,
      },
      // Ruta limpia /login en lugar de /auth/login
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true,
      },
      // Ocultar el resto de rutas /auth/* redirigiéndolas a /inscribirse
      {
        source: "/auth/:path*",
        destination: "/inscribirse",
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
    ],
  },
};

export default nextConfig;
