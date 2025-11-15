// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { access_token, refresh_token } = body ?? {};

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Missing access_token or refresh_token" }, { status: 400 });
    }

    // Aquí desempaquetamos las cookies "síncronas" para Supabase
    const cookieStore = await nextCookies(); // ⚠️ await
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as any, // ya es un objeto con .get/.set
    });

    // setSession puede devolver error: lo devolvemos para depuración
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error("supabase.auth.setSession error:", error);
      return NextResponse.json({ error: error.message ?? error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("POST /api/auth/session error:", err);
    // Devuelve detalle mínimo para debug en el cliente
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
