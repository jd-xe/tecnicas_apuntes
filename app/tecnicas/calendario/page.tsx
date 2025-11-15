"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Session } from "inspector/promises";

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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState<any>(null);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [nuevoFirmadoDocente, setNuevoFirmadoDocente] = useState(false);
  const [nuevoFirmadoPadre, setNuevoFirmadoPadre] = useState(false);


  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error al obtener usuario:", error.message);
        return;
      }

      setUser(user);
    };

    fetchUser();

    // Opcional: suscribirse a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);


  //const alumnoId = "8a150e25-2168-40a6-87d0-b1d37b9dcb09";


  // 🎐 Fondo animado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
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


  const alumnoId = user?.id;
  console.log("Id: " + user?.id);


  // 🔄 Cargar eventos
  // dentro de tu componente (usa el user que ya obtienes)
useEffect(() => {
  if (!user) return;

  const fetchEventos = async () => {
    const userId = user.id;

    // 1️⃣ Obtener el rol REAL
    const { data: perfil, error: perfilErr } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", userId)
      .single();

    if (perfilErr || !perfil) {
      console.error("Error obteniendo rol:", perfilErr);
      return;
    }

    const rol = perfil.rol;
    console.log("Rol obtenido:", rol);

    // 2️⃣ ADMIN ve TODO
    if (rol === "admin") {
      const { data, error } = await supabase
        .from("eventos_agenda")
        .select("*");

      if (error) { console.error(error); return; }

      setEventos(formatEventos(data));
      return;
    }

    // 3️⃣ Consultar relaciones (padres/docentes)
    const { data: rels, error: relErr } = await supabase
      .from("relaciones")
      .select("alumno_id")
      .or(`padre_id.eq.${userId},docente_id.eq.${userId}`);

    if (relErr) {
      console.error("Error obteniendo relaciones:", relErr);
      return;
    }

    // IDs de alumnos a los que tengo acceso
    let alumnoIds = rels?.map(r => r.alumno_id).filter(Boolean) ?? [];

    // Alumno debe verse a sí mismo
    if (rol === "alumno") {
      alumnoIds.push(userId);
    }

    // Eliminar duplicados por si acaso
    alumnoIds = [...new Set(alumnoIds)];

    // 4️⃣ Construir filtro
    let orFilter = `autor_id.eq.${userId}`;

    if (alumnoIds.length > 0) {
      orFilter += `,alumno_id.in.(${alumnoIds.join(",")})`;
    }

    console.log("Filtro OR →", orFilter);
    console.log("alumnoIds accesibles:", alumnoIds);

    // 5️⃣ Cargar eventos filtrados
    const { data: eventos, error: evErr } = await supabase
      .from("eventos_agenda")
      .select("*")
      .or(orFilter);

    if (evErr) {
      console.error("Error cargando eventos:", evErr);
      return;
    }

    setEventos(formatEventos(eventos));
  };

  fetchEventos();
}, [user]);


// helper para transformar fechas (usa tu lógica existente)
function formatEventos(data: any[] = []) {
  return (data || []).map((e) => {
    const [year, month, day] = e.fecha.split("-").map(Number);
    const [h, m, s] = (e.hora || "08:00:00").split(":").map(Number);
    const inicio = new Date(year, month - 1, day, h, m, s);
    const duracion = e.hora ? 60 * 60 * 1000 : 30 * 60 * 1000;
    const fin = new Date(inicio.getTime() + duracion);

    return {
      id: e.id,
      title: e.titulo,
      descripcion: e.descripcion,
      start: inicio,
      end: fin,
      allDay: !e.hora,
      raw: e,
    };
  });
}




  // ➕ Abrir modal para crear evento
  const handleSelectSlot = (slotInfo: any) => {
    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  // 💾 Guardar evento nuevo
  const guardarEvento = async () => {
    if (!nuevoTitulo.trim()) return;

    const start = selectedSlot.start;
    const tieneHora = start.getHours() !== 0 || start.getMinutes() !== 0;
    const fecha = format(start, "yyyy-MM-dd");
    const hora = tieneHora ? format(start, "HH:mm:ss") : null;

    if (!alumnoId) {
      alert("Usuario no autenticado.");
      return;
    }

    const nuevoEvento = {
      alumno_id: alumnoId,
      autor_id: user.id,
      fecha,
      hora,
      titulo: nuevoTitulo.trim(),
      descripcion: nuevaDescripcion.trim(),
      tipo: "nota",
      firmado_por_docente: nuevoFirmadoDocente,
      firmado_por_padre: nuevoFirmadoPadre,
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
        descripcion: nuevo.descripcion,
        start: inicio,
        end: fin,
        allDay: !nuevo.hora,
      },
    ]);

    setShowModal(false);
    setNuevoTitulo("");
    setNuevaDescripcion("");
    setNuevoFirmadoDocente(false);
    setNuevoFirmadoPadre(false);
    setSelectedSlot(null);
  };

  // 📘 Ver detalles del evento
  const handleSelectEvent = (event: any) => {
  setShowDetalle({
    ...event,
    firmado_por_docente: event.raw?.firmado_por_docente ?? false,
    firmado_por_padre: event.raw?.firmado_por_padre ?? false,
  });
};

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white font-[Handlee]">
      <link
        href="https://fonts.googleapis.com/css2?family=Handlee&display=swap"
        rel="stylesheet"
      />

      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f2040] via-[#2d2975] to-[#463c91] z-0" />
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Brillo */}
      <div className="glow absolute top-[-100px] left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-gradient-radial from-white/15 to-transparent blur-[90px] animate-pulse-slow pointer-events-none z-0" />

      {/* Volver */}
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
            style={{ height: 550, borderRadius: "0.75rem", color: "#111" }}
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

      {/* 🪶 Modal crear evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3 text-center">
              ✏️ Nuevo Evento
            </h3>
            <input
              type="text"
              className="w-full border border-indigo-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none mb-3"
              placeholder="Título (visible en el calendario)"
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
            />
            <textarea
              className="w-full border border-indigo-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none h-32"
              placeholder="Descripción o detalles..."
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEvento}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📘 Modal detalle evento */}
      {/* 📘 Modal detalle evento */}
{showDetalle && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative text-black">
      <h3 className="text-2xl font-bold text-indigo-700 mb-2 text-center">
        {showDetalle.title}
      </h3>

      <p className="text-black whitespace-pre-wrap">
        {showDetalle.descripcion || "Sin descripción"}
      </p>

      <p className="text-sm text-black mt-3 text-right">
        {format(showDetalle.start, "dd/MM/yyyy HH:mm")}
      </p>

      {/* Casillas editables */}
      <div className="flex flex-col gap-3 mt-5 text-black">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!showDetalle.firmado_por_docente}
            onChange={(e) =>
              setShowDetalle({
                ...showDetalle,
                firmado_por_docente: e.target.checked,
              })
            }
            className="w-5 h-5 rounded border-2 cursor-pointer"
          />
          Firmado por docente
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!showDetalle.firmado_por_padre}
            onChange={(e) =>
              setShowDetalle({
                ...showDetalle,
                firmado_por_padre: e.target.checked,
              })
            }
            className="w-5 h-5 rounded border-2 cursor-pointer"
          />
          Firmado por padre
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={async () => {
            // Guardar cambios en la BD
            const { error } = await supabase
              .from("eventos_agenda")
              .update({
                firmado_por_docente: showDetalle.firmado_por_docente,
                firmado_por_padre: showDetalle.firmado_por_padre,
              })
              .eq("id", showDetalle.id);

            if (error) {
              alert("❌ Error guardando cambios");
              console.error(error);
              return;
            }

            // Actualizar estado de eventos en el calendario
            setEventos(eventos.map(ev =>
              ev.id === showDetalle.id
                ? {
                    ...ev,
                    raw: {
                      ...ev.raw,
                      firmado_por_docente: showDetalle.firmado_por_docente,
                      firmado_por_padre: showDetalle.firmado_por_padre,
                    },
                  }
                : ev
            ));

            // Cerrar modal
            setShowDetalle(null);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
        >
          Guardar
        </button>

        <button
          onClick={() => setShowDetalle(null)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}




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
