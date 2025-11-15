"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <button
      onClick={logout}
      className="p-2 bg-gray-800 text-white rounded-lg mt-4"
    >
      Cerrar sesión
    </button>
  );
}
