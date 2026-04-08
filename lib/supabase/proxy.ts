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
  "/api/checkout", "/api/webhooks", "/api/leads"
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const hostWithoutPort = hostname.split(":")[0] ?? "";
  const isLocalhost =
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1";
  const isAdminDomain =
    hostWithoutPort === ADMIN_HOST || hostWithoutPort.startsWith("admin.");
  const isLocalAdminPath =
    isLocalhost &&
    (pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname.startsWith("/sys-"));
  const isAdminContext = isAdminDomain || isLocalAdminPath;
  const adminPath = isAdminDomain
    ? pathname
    : isLocalAdminPath
      ? pathname === "/admin"
        ? "/"
        : pathname.startsWith("/admin/")
          ? pathname.slice("/admin".length)
          : pathname
      : pathname;

  // 1. REWRITE/REDIRECT LOGIC POR DOMINIO
  if (isAdminContext) {
    if (adminPath === "/") {
      const target = isAdminDomain ? "/dashboard" : "/admin/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    const baseSegment = adminPath.split("/")[1];

    if (ADMIN_TABS.includes(baseSegment)) {
      return NextResponse.rewrite(new URL(`/sys-${adminPath.substring(1)}`, request.url));
    }

    const isAllowedSys = adminPath.startsWith("/sys-");
    const isAllowedPublic = ["/login", "/auth", "/api", "/_next"].some((route) =>
      adminPath.startsWith(route),
    );

    if (!isAllowedPublic && !isAllowedSys) {
      const target = isAdminDomain ? "/dashboard" : "/admin/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (!isAdminDomain && adminPath !== pathname) {
      if (adminPath === "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (adminPath.startsWith("/auth/")) {
        return NextResponse.redirect(new URL(adminPath, request.url));
      }
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
    url.pathname = isAdminContext ? "/sys-dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rutas que SI pueden verse sin login
  const isPublic = 
    pathname === "/" || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/auth") || 
    PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));

  // Rutas sys- y dashboard de estudiantes requieren auth
  const isProtectedTab =
    isLocalAdminPath ||
    ADMIN_TABS.some((tab) => pathname.startsWith("/" + tab)) ||
    pathname.startsWith("/sys-") ||
    pathname.startsWith("/dashboard");

  if (!user && !isPublic && isProtectedTab) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
