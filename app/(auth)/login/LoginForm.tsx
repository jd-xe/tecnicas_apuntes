"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  async function sendSessionToServer(session: any) {
    if (!session) return;
    try {
        const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
        }),
        });

        const json = await res.json();
        console.log("/api/auth/session response:", res.status, json);

        if (!res.ok) {
        // muestra al usuario un mensaje y arroja para detener el flow
        throw new Error(json?.error || "Failed to set session on server");
        }
    } catch (err) {
        console.error("error sending session to server:", err);
        throw err; // relanzamos para que el handleSubmit lo capture
    }
    }


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        // Depende de tu configuración de Supabase: si require confirmación por email,
        // data.session puede ser null. En ese caso el usuario debe verificar correo.
        if (data?.session) {
          await sendSessionToServer(data.session);
          router.push("/menu");
        } else {
          alert(
            "Cuenta creada. Revisa tu correo para confirmar (si tu proyecto requiere verificación)."
          );
        }
        setLoading(false);
        return;
      }

      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // data.session tiene access_token y refresh_token
      if (data?.session) {
        // Enviamos tokens al servidor para que cree las cookies (para SSR/middleware)
        await sendSessionToServer(data.session);

        // Redirigimos al menú (ahora el servidor verá la sesión)
        router.push("/menu");
      } else {
        // Caso raro (sin sesión), fallback
        setError("No se obtuvo sesión. Intenta de nuevo.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="login-title text-3xl font-bold text-center text-indigo-200 drop-shadow login-fadeSlide">
        {isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 login-fadeSlide">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-indigo-200/90">Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input mt-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200/40 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-indigo-200/90">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input mt-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200/40 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition backdrop-blur-sm"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="login-button mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white py-3 rounded-xl font-semibold shadow-lg transition active:scale-95"
        >
          {loading ? "Procesando..." : isRegister ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <button
        onClick={() => setIsRegister(!isRegister)}
        className="text-indigo-200 text-sm mt-1 text-center hover:underline transition animate-[fadeSlide_0.4s_ease-out]"
      >
        {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
      </button>
    </div>
  );
}
