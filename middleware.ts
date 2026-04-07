import { type NextRequest, NextResponse } from "next/server";

const ADMIN_HOST = "admin.centrodeestudiosaua.com";

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  const isAdminDomain =
    hostname === ADMIN_HOST ||
    hostname.startsWith("admin.") ; // cubre localhost:3001/admin preview si se necesita

  // ── Dominio admin ──────────────────────────────────────────────────
  if (isAdminDomain) {
    // Raíz del dominio admin → panel admin
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Bloquear rutas de alumnos desde el dominio admin
    const studentRoutes = ["/inscribirse", "/courses", "/payments", "/certificates", "/calendar", "/messages", "/checkout"];
    if (studentRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Todo lo demás (incluyendo /admin/*, /login) pasa normalmente
    return NextResponse.next();
  }

  // ── Dominio alumnos / cualquier otro ──────────────────────────────
  // Bloquear acceso al panel admin desde dominio de alumnos
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static  (archivos estáticos)
     * - _next/image   (optimización de imágenes)
     * - favicon.ico
     * - archivos con extensión (imágenes, fuentes, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
