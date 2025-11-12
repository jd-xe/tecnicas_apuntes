"use client"; // Necesario para usar hooks y efectos
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function ClasicoPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar contenido previo al montar
  useEffect(() => {
    const previo = localStorage.getItem("apunteClasico");
    if (previo && textareaRef.current) {
      textareaRef.current.value = previo;
    }
  }, []);

  const guardarApunte = () => {
    if (!textareaRef.current) return;
    localStorage.setItem("apunteClasico", textareaRef.current.value);
    alert("✅ Apunte guardado correctamente.");
  };

  const limpiarApunte = () => {
    if (!textareaRef.current) return;
    if (confirm("¿Seguro que deseas borrar tus apuntes?")) {
      textareaRef.current.value = "";
      localStorage.removeItem("apunteClasico");
    }
  };

  const imprimirNotas = () => {
  const botones = document.querySelectorAll("button, a") as NodeListOf<HTMLElement>;
  botones.forEach((btn) => (btn.style.display = "none"));
  window.print();
  setTimeout(() => botones.forEach((btn) => (btn.style.display = "")), 1000);
};

  return (
    <div className="min-h-screen p-6 font-handlee bg-gradient-to-br from-pink-100 to-purple-100">
      {/* Botón volver */}
      <Link href="/tecnicas" className="text-purple-700 underline text-lg">
        ← Volver al menú
      </Link>

      <h1 className="text-4xl font-bold text-center text-purple-700 mt-4 mb-6">
        Apunte Clásico
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6">
        <textarea
          ref={textareaRef}
          id="apunteClasico"
          className="w-full h-96 border-2 border-purple-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Escribe tus apuntes aquí..."
        ></textarea>
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-6 flex-wrap gap-3">
        <button
          onClick={guardarApunte}
          className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition"
        >
          💾 Guardar
        </button>
        <button
          onClick={limpiarApunte}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-300 transition"
        >
          🧹 Limpiar
        </button>
        <button
          onClick={imprimirNotas}
          className="bg-pink-500 text-white px-5 py-2 rounded-xl hover:bg-pink-600 transition"
        >
          🖨️ Descargar / Imprimir
        </button>
      </div>
    </div>
  );
}
