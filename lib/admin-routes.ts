export const ADMIN_ROUTE_MAP = {
  dashboard: "/dashboard",
  leads: "/leads",
  alumnos: "/alumnos",
  pagos: "/pagos",
  sesiones: "/sesiones",
  cursos: "/cursos",
  reportes: "/reportes",
  ajustes: "/ajustes",
} as const;

type AdminRouteKey = keyof typeof ADMIN_ROUTE_MAP;

function normalizePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getAdminPublicPath(key: AdminRouteKey) {
  return ADMIN_ROUTE_MAP[key];
}

export function getAdminLocalPath(key: AdminRouteKey) {
  return `/admin${ADMIN_ROUTE_MAP[key]}`;
}

export function getAdminBrowserPath(key: AdminRouteKey) {
  if (typeof window === "undefined") {
    return getAdminPublicPath(key);
  }

  const origin = window.location.origin;
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    return getAdminLocalPath(key);
  }

  return getAdminPublicPath(key);
}

export function getAdminBrowserCustomPath(path: string) {
  const normalized = normalizePath(path);

  if (typeof window === "undefined") {
    return normalized;
  }

  const origin = window.location.origin;
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    return normalized.startsWith("/admin") ? normalized : `/admin${normalized}`;
  }

  return normalized;
}
