// NO SE USA
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAgendaEventos(user: any) {
  const [eventos, setEventos] = useState<any[]>([]);

  const alumnoId = user?.id;

  useEffect(() => {
    if (!alumnoId) return;

    const fetchEventos = async () => {
      const { data, error } = await supabase
        .from("eventos_agenda")
        .select("*")
        .eq("alumno_id", alumnoId);

      if (error) return console.error(error);

      const eventosFormateados = data.map((e) => {
        const [year, month, day] = e.fecha.split("-").map(Number);
        const [h, m, s] = (e.hora ?? "08:00:00").split(":").map(Number);
        const start = new Date(year, month - 1, day, h, m, s);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        return {
          id: e.id,
          title: e.titulo,
          descripcion: e.descripcion,
          start,
          end,
          allDay: !e.hora,
        };
      });

      setEventos(eventosFormateados);
    };

    fetchEventos();
  }, [alumnoId]);

  const crearEvento = async (slot: any, titulo: string, descripcion: string) => {
    const start = slot.start;
    const fecha = format(start, "yyyy-MM-dd");
    const hora =
      start.getHours() !== 0 || start.getMinutes() !== 0
        ? format(start, "HH:mm:ss")
        : null;

    const nuevoEvento = {
      alumno_id: alumnoId,
      autor_id: user.id,
      fecha,
      hora,
      titulo,
      descripcion,
      tipo: "nota",
    };

    const { data, error } = await supabase
      .from("eventos_agenda")
      .insert([nuevoEvento])
      .select();

    if (error) throw error;

    const nuevo = data[0];
    const [y, m, d] = nuevo.fecha.split("-").map(Number);
    const [h, mi, s] = (nuevo.hora ?? "08:00:00").split(":").map(Number);

    const start2 = new Date(y, m - 1, d, h, mi, s);
    const end2 = new Date(start2.getTime() + 60 * 60 * 1000);

    const finalEvent = {
      id: nuevo.id,
      title: nuevo.titulo,
      descripcion: nuevo.descripcion,
      start: start2,
      end: end2,
      allDay: !nuevo.hora,
    };

    setEventos((prev) => [...prev, finalEvent]);
  };

  return {
    eventos,
    crearEvento,
  };
}
