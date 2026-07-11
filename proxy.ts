import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/invite",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/onboarding",
  "/",
];

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-url", request.url);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate the request cookies so request.cookies.getAll() reflects the new tokens
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Rebuild request headers from the NOW-UPDATED request.cookies,
          // then re-apply our custom x-pathname / x-url headers.
          // This is critical: if we reuse the original `requestHeaders` snapshot
          // downstream server components still see the OLD expired token.
          const updatedHeaders = new Headers(request.headers);
          updatedHeaders.set(
            "cookie",
            request.cookies
              .getAll()
              .map((c) => `${c.name}=${c.value}`)
              .join("; ")
          );
          updatedHeaders.set("x-pathname", request.nextUrl.pathname);
          updatedHeaders.set("x-url", request.url);

          supabaseResponse = NextResponse.next({
            request: { headers: updatedHeaders },
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Inject strict security headers
  const securityHeaders = [
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
  ];

  securityHeaders.forEach(({ key, value }) => {
    supabaseResponse.headers.set(key, value);
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
