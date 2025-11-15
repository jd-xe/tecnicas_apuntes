// NO SE USA
"use client";

import React from "react";

interface ModalNuevoEventoProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  titulo: string;
  setTitulo: (value: string) => void;
  descripcion: string;
  setDescripcion: (value: string) => void;
}

export default function ModalNuevoEvento({
  show,
  onClose,
  onSave,
  titulo,
  setTitulo,
  descripcion,
  setDescripcion,
}: ModalNuevoEventoProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-indigo-700 mb-3 text-center">
          ✏️ Nuevo Evento
        </h3>

        <input
          className="w-full border border-indigo-300 rounded-xl p-3 mb-3"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          className="w-full border border-indigo-300 rounded-xl p-3 h-32"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-xl">
            Cancelar
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
