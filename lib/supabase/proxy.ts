import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

const ADMIN_HOST = "admin.centrodeestudiosaua.com";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const isAdminDomain = hostname === ADMIN_HOST || hostname.startsWith("admin.");

  // ── Routing por dominio ─────────────────────────────────────────────
  if (isAdminDomain) {
    // Raíz del dominio admin → /admin
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Bloquear rutas de alumnos desde dominio admin
    const studentRoutes = ["/inscribirse", "/courses", "/payments", "/certificates", "/calendar", "/messages", "/checkout"];
    if (studentRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // Dominio alumnos: bloquear /admin/*
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
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    pathname !== "/" &&
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/inscribirse") &&
    !pathname.startsWith("/recuperar-acceso") &&
    !pathname.startsWith("/admision") &&
    !pathname.startsWith("/api/checkout") &&
    !pathname.startsWith("/api/webhooks")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
