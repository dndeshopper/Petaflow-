import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedRoute, isPublicRoute } from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/middleware";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.toLowerCase() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.toLowerCase() ?? "";
  return (
    !!url &&
    !!key &&
    !url.includes("your-project") &&
    !key.includes("your-anon-key")
  );
}

function applyApiCors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return applyApiCors(new NextResponse(null, { status: 200 }));
    }
    return applyApiCors(NextResponse.next());
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (user && isPublicRoute(pathname) && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
