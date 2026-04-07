const DEFAULT_ADMIN_URL = "https://admin.centrodeestudiosaua.com";

function normalizePath(path: string) {
  if (!path) return "/";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

function isLocalOrigin(origin: string) {
  return origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
}

export function buildAdminUrl(path = "/sys-dashboard", currentOrigin?: string) {
  const normalizedPath = normalizePath(path);

  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  if (currentOrigin && isLocalOrigin(currentOrigin)) {
    return normalizedPath;
  }

  const base = process.env.NEXT_PUBLIC_ADMIN_URL || DEFAULT_ADMIN_URL;
  return new URL(normalizedPath, base).toString();
}

export function getAdminUrlForBrowser(path = "/sys-dashboard") {
  if (typeof window === "undefined") {
    return buildAdminUrl(path);
  }

  return buildAdminUrl(path, window.location.origin);
}
