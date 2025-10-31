"use client";
import { useRef, useEffect } from "react";

export default function MenuPage() {
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const musicIconRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let reproduciendo = false;

  // 🎐 Fondo animado con partículas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
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

  // 🎵 Control de música
  const toggleMusica = async () => {
    const musica = bgMusicRef.current;
    const icono = musicIconRef.current;
    if (!musica || !icono) return;

    try {
      if (reproduciendo) {
        musica.pause();
        icono.classList.replace("bx-pause", "bx-play");
      } else {
        await musica.play();
        icono.classList.replace("bx-play", "bx-pause");
      }
      reproduciendo = !reproduciendo;
    } catch (err) {
      alert(
        "El navegador bloqueó la reproducción automática. Usa el botón para activarla manualmente."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center relative font-handlee bg-gradient-to-br from-[#1f2040] via-[#2d2975] to-[#463c91] text-white overflow-x-hidden font-[Handlee]">
      <link
        href="https://fonts.googleapis.com/css2?family=Handlee&display=swap"
        rel="stylesheet"
      />
      {/* 🎐 Fondo animado */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* 🌟 Luz ambiental animada */}
      <div className="glow absolute top-[-100px] left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-gradient-radial from-white/15 to-transparent blur-[90px] animate-pulse-slow pointer-events-none z-0" />

      {/* Botón de regresar */}
      <a
        href="/"
        className="btn-regresar fixed top-5 left-5 bg-white/15 text-indigo-200 px-4 py-2 rounded-full font-semibold flex items-center gap-1 backdrop-blur-md shadow-md z-10 hover:bg-indigo-300/30 hover:scale-105 transition"
      >
        <i className="bx bx-left-arrow-alt text-2xl"></i>
        <span>Volver</span>
      </a>

      <h1 className="text-5xl font-bold text-indigo-100 mb-10 drop-shadow-lg animate-fade-in z-10">
        🌤️ Técnicas de Apunte
      </h1>

      {/* Grid de tarjetas animadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl w-full relative z-10 px-4">
        {[
          {
            href: "/tecnicas/cornell",
            icon: "bx bx-layout text-indigo-300",
            title: "Método Cornell",
            text: "Organiza tus notas en columnas: ideas clave, detalles y resumen.",
            delay: "0s",
          },
          {
            href: "/tecnicas/fichas",
            icon: "bx bxs-collection text-rose-300",
            title: "Fichas",
            text: "Crea tarjetas rápidas para estudiar y repasar conceptos clave.",
            delay: "0.1s",
          },
          {
            href: "/tecnicas/mapa",
            icon: "bx bxs-brain text-emerald-300",
            title: "Mapa Mental",
            text: "Visualiza ideas conectadas y crea esquemas coloridos.",
            delay: "0.2s",
          },
          {
            href: "/tecnicas/resumen",
            icon: "bx bxs-book-content text-amber-200",
            title: "Resumen",
            text: "Condensa la información más importante en textos claros.",
            delay: "0.3s",
          },
        ].map(({ href, icon, title, text, delay }, i) => (
          <a
            key={i}
            href={href}
            style={{ animationDelay: delay }}
            className="tarjeta p-6 hover:shadow-lg hover:scale-105 bg-white/10 border border-white/20 backdrop-blur-md rounded-xl transition-all shadow-md opacity-0 animate-slide-up"
          >
            <i className={`${icon} text-5xl mb-3`}></i>
            <h2 className="text-2xl font-semibold text-indigo-50 mb-2">
              {title}
            </h2>
            <p className="text-indigo-100 text-sm">{text}</p>
          </a>
        ))}
      </div>

      {/* Control de música */}
      <div
        onClick={toggleMusica}
        className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full shadow-md flex items-center gap-2 cursor-pointer hover:bg-indigo-500/30 transition z-10"
      >
        <i ref={musicIconRef} className="bx bx-play text-2xl text-indigo-100"></i>
        <span className="text-indigo-100 font-medium hidden sm:inline">Música</span>
      </div>

      <audio ref={bgMusicRef} loop>
        <source
          src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_7f5b59d47b.mp3?filename=soft-piano-melody-ambient-11051.mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* 💫 Animaciones personalizadas */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
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

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.7s ease-out forwards;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
