// NO SE USA
"use client";

import { format } from "date-fns";

export interface EventoCalendario {
  id: string | number;
  title: string;
  descripcion?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

interface ModalDetalleEventoProps {
  evento: EventoCalendario | null;
  onClose: () => void;
}

export default function ModalDetalleEvento({ evento, onClose }: ModalDetalleEventoProps) {
  if (!evento) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-indigo-700 text-center mb-3">
          {evento.title}
        </h3>

        <p className="text-gray-600">{evento.descripcion || "Sin descripción"}</p>

        <p className="text-right text-sm text-gray-500 mt-3">
          {format(evento.start, "dd/MM/yyyy HH:mm")}
        </p>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
