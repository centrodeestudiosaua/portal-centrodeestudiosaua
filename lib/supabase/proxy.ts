import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const ADMIN_HOST = "admin.centrodeestudiosaua.com";

// Rutas permitidas desde el dominio admin (todo lo demás → /dashboard)
const ADMIN_DOMAIN_WHITELIST = [
  "/dashboard", "/leads", "/alumnos", "/pagos",
  "/sesiones", "/cursos", "/reportes", "/ajustes",
  "/login", "/auth", "/api", "/_next",
];

// Rutas públicas del dominio de alumnos (no requieren auth)
const PUBLIC_ROUTES = [
  "/inscribirse",
  "/recuperar-acceso",
  "/admision",
  "/api/checkout",
  "/api/webhooks",
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const isAdminDomain = hostname === ADMIN_HOST || hostname.startsWith("admin.");

  // ── Routing por dominio ─────────────────────────────────────────────
  if (isAdminDomain) {
    // Raíz → panel admin
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Whitelist: solo permitir /admin/*, /login, /auth/*, /api/*, /_next/*
    const isAllowed = ADMIN_DOMAIN_WHITELIST.some(
      (r) => pathname === r || pathname.startsWith(r + "/"),
    );
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // Dominio alumnos: bloquear acceso al panel admin
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Raíz → /inscribirse
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/inscribirse", request.url));
    }
  }

  // ── Auth session (Supabase) ─────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const authPagesForGuestsOnly = new Set([
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/sign-up-success",
    "/inscribirse",
    "/recuperar-acceso",
  ]);

  if (user && authPagesForGuestsOnly.has(pathname)) {
    const url = request.nextUrl.clone();
    // En dominio admin, redirigir al panel admin
    url.pathname = isAdminDomain ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rutas protegidas: requieren auth
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
