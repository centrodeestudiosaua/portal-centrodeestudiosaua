import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const ADMIN_HOST = "admin.centrodeestudiosaua.com";

const ADMIN_TABS = [
  "dashboard", "leads", "alumnos", "pagos", 
  "sesiones", "cursos", "reportes", "ajustes"
];

const PUBLIC_ROUTES = [
  "/inscribirse", "/recuperar-acceso", "/admision", 
  "/api/checkout", "/api/webhooks"
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const isAdminDomain = hostname === ADMIN_HOST || hostname.startsWith("admin.");

  // 1. REWRITE/REDIRECT LOGIC POR DOMINIO
  if (isAdminDomain) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const baseSegment = pathname.split("/")[1];

    if (ADMIN_TABS.includes(baseSegment)) {
      // Rewrite interno: /dashboard -> /sys-dashboard
      // Esto engaña a NextJS para usar nuestros folders sys- y evitar colisión
      return NextResponse.rewrite(new URL(`/sys-${pathname.substring(1)}`, request.url));
    }

    // Permitir pasar libremente a archivos de auth, api, next internals, etc.
    const isAllowedSys = pathname.startsWith("/sys-"); // Por si acaso nextjs hace fetch directo (RSC)
    const isAllowedPublic = ["/login", "/auth", "/api", "/_next"].some(r => pathname.startsWith(r));

    if (!isAllowedPublic && !isAllowedSys) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // Dominio normal: bloquear rutas de admin transparentes y las prefijadas sys-
    const baseSegment = pathname.split("/")[1];
    if (pathname.startsWith("/sys-") || pathname === "/admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url)); // dash de estudiantes
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/inscribirse", request.url));
    }
  }

  // 2. SUPABASE AUTH SESSION LOGIC
  let supabaseResponse = NextResponse.next({ request });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const authPagesForGuestsOnly = new Set([
    "/auth/login", "/auth/sign-up", "/auth/forgot-password",
    "/auth/sign-up-success", "/inscribirse", "/recuperar-acceso",
  ]);

  // Si ya tiene sesión e intenta ver sign-up/login
  if (user && authPagesForGuestsOnly.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminDomain ? "/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rutas que SI pueden verse sin login
  const isPublic = 
    pathname === "/" || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/auth") || 
    PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));

  // Rutas sys- y dashboard de estudiantes requieren auth
  const isProtectedTab = ADMIN_TABS.some(t => pathname.startsWith("/" + t)) || pathname.startsWith("/sys-") || pathname.startsWith("/dashboard");

  if (!user && !isPublic && isProtectedTab) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
