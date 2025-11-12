"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const alumnoId = "8a150e25-2168-40a6-87d0-b1d37b9dcb09";

  // 🎐 Fondo animado con partículas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return; // <- agregas esto
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const dots = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      s: Math.random() * 0.3 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      dots.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.s;
        if (p.y > canvas.height) p.y = 0;
      });
      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // 🔄 Cargar eventos desde Supabase
  // 🔄 Cargar eventos desde Supabase
  useEffect(() => {
    const fetchEventos = async () => {
      const { data, error } = await supabase
        .from("eventos_agenda")
        .select("*")
        .eq("alumno_id", alumnoId);

      if (error) {
        console.error(error);
        return;
      }

      const eventosFormateados = data.map((e) => {
        const [year, month, day] = e.fecha.split("-").map(Number);
        const [h, m, s] = (e.hora || "08:00:00").split(":").map(Number); // 🕗 por defecto 8:00
        const inicio = new Date(year, month - 1, day, h, m, s);

        // si no tiene hora, solo dura 30 min
        const duracion = e.hora ? 60 * 60 * 1000 : 30 * 60 * 1000;
        const fin = new Date(inicio.getTime() + duracion);

        return {
          id: e.id,
          title: e.titulo,
          start: inicio,
          end: fin,
          allDay: !e.hora, // 👈 marca si es de todo el día
        };
      });

      setEventos(eventosFormateados);
    };
    fetchEventos();
  }, []);

  // ➕ Crear evento según vista actual
  const handleSelectSlot = async ({ start, end }: any) => {
    const titulo = prompt("📅 Escribe una nota o título para este evento:");
    if (!titulo) return;

    const tieneHora = start.getHours() !== 0 || start.getMinutes() !== 0;
    const fecha = format(start, "yyyy-MM-dd");
    const hora = tieneHora ? format(start, "HH:mm:ss") : null;

    const nuevoEvento = {
      alumno_id: alumnoId,
      fecha,
      hora,
      titulo,
      tipo: "nota",
    };

    const { data, error } = await supabase
      .from("eventos_agenda")
      .insert([nuevoEvento])
      .select();

    if (error) {
      alert("❌ Error al guardar el evento");
      console.error(error);
      return;
    }

    const nuevo = data[0];
    const [year, month, day] = nuevo.fecha.split("-").map(Number);
    const [h, m, s] = (nuevo.hora || "08:00:00").split(":").map(Number);
    const inicio = new Date(year, month - 1, day, h, m, s);
    const fin = nuevo.hora
      ? new Date(inicio.getTime() + 60 * 60 * 1000)
      : new Date(inicio.getTime() + 30 * 60 * 1000);

    setEventos([
      ...eventos,
      {
        id: nuevo.id,
        title: nuevo.titulo,
        start: inicio,
        end: fin,
        allDay: !nuevo.hora,
      },
    ]);
  };




  const handleSelectEvent = (event: any) => {
    alert(`📘 Evento: ${event.title}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white font-[Handlee]">
      <link
        href="https://fonts.googleapis.com/css2?family=Handlee&display=swap"
        rel="stylesheet"
      />

      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f2040] via-[#2d2975] to-[#463c91] z-0" />
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Luz ambiental */}
      <div className="glow absolute top-[-100px] left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-gradient-radial from-white/15 to-transparent blur-[90px] animate-pulse-slow pointer-events-none z-0" />

      {/* Botón de regreso */}
      <Link
        href="/menu"
        className="fixed top-5 left-5 bg-white/15 text-indigo-200 px-4 py-2 rounded-full font-semibold flex items-center gap-1 backdrop-blur-md shadow-md hover:bg-indigo-300/30 hover:scale-105 transition z-10"
      >
        <i className="bx bx-left-arrow-alt text-2xl"></i>
        <span>Volver</span>
      </Link>

      {/* Calendario */}
      <div className="relative z-10 bg-white/90 text-black rounded-2xl shadow-2xl p-6 max-w-5xl w-[90%] border border-indigo-200 backdrop-blur-md">
        <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center drop-shadow">
          🗓️ Calendario Escolar
        </h2>
        <div className="rounded-xl overflow-hidden bg-white border border-indigo-100 p-2 shadow-inner">
          <Calendar
            selectable
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            style={{
              height: 550,
              borderRadius: "0.75rem",
              color: "#111",
            }}
            messages={{
              next: "Sig.",
              previous: "Ant.",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
            }}
          />
        </div>
      </div>

      {/* Animaciones */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
