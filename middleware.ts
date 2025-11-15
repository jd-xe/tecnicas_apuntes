import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = [
    "/menu",
    "/agenda",
    "/perfil",
    "/fichas",
    "/tecnicas",
  ];

  const isProtected = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // si no hay usuario -> login
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // si hay usuario -> no entrar a login
  if (req.nextUrl.pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/menu", req.url));
  }

  return res;
}
