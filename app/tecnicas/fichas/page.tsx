"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Ficha {
  titulo: string;
  contenido: string;
}

export default function FichasPage() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const tituloRef = useRef<HTMLInputElement>(null);
  const contenidoRef = useRef<HTMLInputElement>(null);

  // Cargar fichas guardadas
  useEffect(() => {
    const saved = localStorage.getItem("fichasData");
    if (saved) setFichas(JSON.parse(saved));
  }, [typeof window !== "undefined"]);

  // Guardar fichas en localStorage al actualizar
  useEffect(() => {
    localStorage.setItem("fichasData", JSON.stringify(fichas));
  }, [fichas]);

  const agregarFicha = () => {
    const titulo = tituloRef.current?.value.trim();
    const contenido = contenidoRef.current?.value.trim();
    if (!titulo || !contenido) return alert("⚠️ Completa ambos campos.");
    setFichas([...fichas, { titulo, contenido }]);
    if (tituloRef.current) tituloRef.current.value = "";
    if (contenidoRef.current) contenidoRef.current.value = "";
  };

  const eliminarFicha = (index: number) => {
    if (!confirm("¿Eliminar esta ficha?")) return;
    setFichas(fichas.filter((_, i) => i !== index));
  };

  const limpiarFichas = () => {
    if (!confirm("¿Seguro que deseas borrar todas las fichas?")) return;
    setFichas([]);
    localStorage.removeItem("fichasData");
  };

  const imprimirFichas = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-200 to-pink-200 font-sans">
      {/* Volver */}
      <a href="/menu" className="text-blue-700 underline text-lg no-print hover:text-blue-900 transition">← Volver al menú</a>

      <h1 className="text-4xl font-extrabold text-center text-blue-800 mt-4 mb-6 drop-shadow-lg">
        Método de Fichas
      </h1>

      {/* Inputs */}
      <div className="max-w-5xl mx-auto flex justify-between mb-6 no-print flex-wrap gap-3">
        <input
          ref={tituloRef}
          type="text"
          placeholder="Título o tema"
          className="border-2 border-blue-300 rounded-2xl p-3 flex-1 focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white text-gray-800 shadow-sm"
        />
        <input
          ref={contenidoRef}
          type="text"
          placeholder="Contenido o definición"
          className="border-2 border-pink-300 rounded-2xl p-3 flex-1 focus:outline-none focus:ring-4 focus:ring-pink-400 bg-white text-gray-800 shadow-sm"
        />
        <button
          onClick={agregarFicha}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          <i className='bx bx-plus'></i> Añadir
        </button>
      </div>

      {/* Fichas */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fichas.map((ficha, index) => (
          <div
            key={index}
            className="bg-white shadow-xl rounded-3xl p-5 text-center relative transition transform hover:scale-105 hover:shadow-2xl"
          >
            <h3 className="text-xl font-bold text-blue-700 mb-3">{ficha.titulo}</h3>
            <p className="text-gray-800 text-base">{ficha.contenido}</p>
            <button
              onClick={() => eliminarFicha(index)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 no-print"
            >
              <i className='bx bx-x text-lg'></i>
            </button>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="max-w-5xl mx-auto flex justify-center mt-8 no-print flex-wrap gap-4">
        <button
          onClick={() => alert("✅ Fichas guardadas correctamente")}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          💾 Guardar
        </button>
        <button
          onClick={limpiarFichas}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl hover:bg-gray-300 transition shadow-md flex items-center gap-2"
        >
          🧹 Limpiar
        </button>
        <button
          onClick={imprimirFichas}
          className="bg-pink-500 text-white px-6 py-3 rounded-2xl hover:bg-pink-600 transition shadow-md flex items-center gap-2"
        >
          🖨️ Descargar / Imprimir
        </button>
      </div>
    </div>
  );
}
