"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, SlotInfo } from "react-big-calendar";
import { localizer } from "@/utils/calendarLocalizer";
import AnimatedBackground from "@/components/agenda/AnimatedBackground";
import ModalNuevoEvento from "@/components/agenda/ModalNuevoEvento";
import ModalDetalleEvento from "@/components/agenda/ModalDetalleEvento";
import { useAgendaEventos } from "@/hooks/useAgendaEventos";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarioPage() {
  const [user, setUser] = useState<any>(null);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [detalle, setDetalle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🎫 usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const { eventos, crearEvento } = useAgendaEventos(user);

  return (
    <div className="relative min-h-screen text-white">
      <AnimatedBackground />

      <Link
        href="/menu"
        className="fixed top-5 left-5 bg-white/15 px-4 py-2 rounded-full z-10"
      >
        Volver
      </Link>

      <div className="z-10 relative p-6">
        <Calendar
          selectable
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={(s) => {
            setSelectedSlot(s);
            setShowModal(true);
          }}
          onSelectEvent={(e) => setDetalle(e)}
          style={{ height: 550 }}
        />
      </div>

      <ModalNuevoEvento
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={async () => {
          await crearEvento(selectedSlot, nuevoTitulo, nuevaDescripcion);
          setShowModal(false);
        }}
        titulo={nuevoTitulo}
        setTitulo={setNuevoTitulo}
        descripcion={nuevaDescripcion}
        setDescripcion={setNuevaDescripcion}
      />

      <ModalDetalleEvento evento={detalle} onClose={() => setDetalle(null)} />
    </div>
  );
}
