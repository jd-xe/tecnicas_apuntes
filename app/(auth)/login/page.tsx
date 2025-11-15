"use client";

import "./login.css"; // ← IMPORTANTE
import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-800 relative overflow-hidden px-4">

      {/* Glow superior */}
      <div className="absolute top-[-120px] left-1/2 w-[450px] h-[450px] -translate-x-1/2 rounded-full bg-gradient-radial from-white/10 to-transparent blur-[120px]" />

      {/* Glow inferior */}
      <div className="absolute bottom-[-120px] right-1/2 w-[350px] h-[350px] translate-x-1/2 rounded-full bg-gradient-radial from-indigo-400/10 to-transparent blur-[100px]" />

      {/* Botón volver */}
      <Link
        href="/"
        className="absolute top-6 left-6 bg-white/10 border border-white/20 backdrop-blur-xl
        text-indigo-200 px-4 py-2 rounded-xl shadow-lg hover:bg-white/20 transition flex items-center gap-2 z-20"
      >
        <i className="bx bx-arrow-back text-xl"></i>
        <span>Volver</span>
      </Link>

      {/* Tarjeta principal */}
      <div
        className="login-card relative z-20 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 login-fadeIn"
      >
        <LoginForm />
      </div>

    </div>
  );
}
