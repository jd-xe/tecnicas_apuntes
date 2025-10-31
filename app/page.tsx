// app/page.tsx
"use client"; // necesario para usar hooks y efectos en Next.js 13+ app directory
import { useEffect, useRef } from "react";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgMusicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Partículas flotantes
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number; y: number; r: number; d: number }[] = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function initParticles() {
      particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        d: Math.random() * 0.5 + 0.2,
      }));
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.d;
        if (p.y > canvas.height) p.y = 0;
      });
      requestAnimationFrame(drawParticles);
    }

    initParticles();
    drawParticles();
  }, []);

  const toggleMusic = async () => {
    const music = bgMusicRef.current;
    if (!music) return;
    try {
      if (music.paused) {
        await music.play();
      } else {
        music.pause();
      }
    } catch (err) {
      alert(
        "El navegador bloqueó la reproducción automática. Usa el botón para activarla manualmente."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center relative overflow-hidden font-handlee bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-800 text-white">
      {/* Suave iluminación */}
      <div className="lamp-glow absolute top-[-100px] left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-gradient-radial from-white/8 to-transparent blur-[80px] pointer-events-none z-0" />

      {/* Partículas flotantes */}
      <canvas ref={canvasRef} className="absolute inset-0 z-1" />

      {/* Íconos decorativos */}
      <div className="absolute top-10 left-10 opacity-20 text-6xl text-indigo-300 animate__animated animate__fadeInLeft z-10">
        <i className="bx bxs-book"></i>
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 text-6xl text-purple-300 animate__animated animate__fadeInRight z-10">
        <i className="bx bx-pencil"></i>
      </div>

      {/* Contenido principal */}
      <main className="relative z-20">
        <h1 className="text-5xl font-bold text-indigo-200 animate__animated animate__fadeInDown mb-6 drop-shadow-lg">
          📘 LGN Notes
        </h1>
        <p className="text-lg text-indigo-100 max-w-md mb-8 animate__animated animate__fadeInUp">
          Mientras más apuntes, más construyes...
        </p>

        <a
          href="/menu"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xl transition animate__animated animate__pulse animate__infinite shadow-lg"
        >
          Comenzar ✨
        </a>

        {/* Control de música */}
        <div className="mt-10 animate__animated animate__fadeInUp flex justify-center">
          <button
            onClick={toggleMusic}
            className="bg-white/20 backdrop-blur-md shadow-md rounded-full px-6 py-3 hover:bg-indigo-500/30 transition flex items-center gap-3"
          >
            <i className="bx bx-play text-2xl text-indigo-200"></i>
            <span className="text-indigo-100 font-medium">Música</span>
          </button>
          <audio
            ref={bgMusicRef}
            src="/musica/lofi-study-calm-peaceful-chill-hop-112191.mp3"
            loop
            preload="auto"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-indigo-300 text-sm z-20">
        Proyecto escolar – <span className="font-semibold text-indigo-200">LGN Notes 2025</span>
      </footer>
    </div>
  );
}
