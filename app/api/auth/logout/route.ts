// app/api/auth/logout/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({
    cookies: () => cookies(),
  });

  await supabase.auth.signOut(); // Esto limpia sesión y cookies SSR

  return new Response(JSON.stringify({ ok: true }));
}
