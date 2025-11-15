"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SessionStatus() {
  const router = useRouter();
  // undefined = todavía cargando, null = no hay usuario, User = hay sesión
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then((r) => setUser(r.data.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    router.refresh();
    router.push("/login");
  };

  // Mientras cargamos, no renderizamos nada para evitar parpadeo
  if (user === undefined) return null;

  return (
    <div className="absolute top-6 right-6 z-30">
      {user ? (
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white shadow"
        >
          Cerrar Sesión
        </button>
      ) : (
        <Link
          href="/login"
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-4 py-2 rounded-lg text-indigo-100 shadow"
        >
          Iniciar Sesión
        </Link>
      )}
    </div>
  );
}
