export const AUTH_ROUTES = ["/login"] as const;

export const PUBLIC_ROUTES = ["/login", "/auth/callback", "/auth/signout"] as const;

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/timeline",
  "/garden",
  "/search",
  "/collections",
  "/inbox",
  "/settings",
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isProtectedRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
