// MusicButton.tsx
"use client";
import { useMusic } from "../context/MusicContext";

export default function MusicButton() {
  const { toggle, playing } = useMusic();

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full shadow-md transition flex items-center gap-2
        ${playing ? "bg-indigo-600 text-white" : "bg-white/30 text-indigo-900 hover:bg-indigo-500/50"}`}
    >
      <i className={`bx ${playing ? "bx-pause" : "bx-play"} text-xl`}></i>
      <span>{playing ? "Pausar" : "Música"}</span>
    </button>
  );
}
