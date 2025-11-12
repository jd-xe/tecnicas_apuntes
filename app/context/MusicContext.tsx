// app/context/MusicContext.tsx
"use client";
import { createContext, useContext, useRef, useState } from "react";

interface MusicContextProps {
  toggle: () => void;
  playing: boolean;
}

const MusicContext = createContext<MusicContextProps | null>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const music = bgMusicRef.current;
    if (!music) return;
    try {
      if (music.paused) {
        await music.play();
        setPlaying(true);
      } else {
        music.pause();
        setPlaying(false);
      }
    } catch {
      alert("El navegador bloqueó la reproducción automática.");
    }
  };

  return (
    <MusicContext.Provider value={{ toggle, playing }}>
      {children}
      {/* Audio global */}
      <audio
        ref={bgMusicRef}
        src="/musica/lofi-study-calm-peaceful-chill-hop-112191.mp3"
        loop
        preload="auto"
      />
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic debe usarse dentro de MusicProvider");
  return context;
};
