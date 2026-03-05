import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "./types";
import type { UserRole } from "./types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Use getUser() not getSession() — getUser() validates the JWT
  // against the Supabase Auth server. getSession() only reads from cookies
  // and the data can be tampered with.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Authenticated users accessing auth pages -> redirect to dashboard
  if (user && (pathname === "/logga-in" || pathname === "/registrera")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protected routes: /dashboard, /learn, /coach, /progress, /profile
  const protectedPrefixes = [
    "/dashboard",
    "/learn",
    "/coach",
    "/progress",
    "/profile",
  ];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/logga-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes: /admin/*
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/logga-in";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const role = (user.app_metadata?.role as UserRole) ?? "athlete";
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
