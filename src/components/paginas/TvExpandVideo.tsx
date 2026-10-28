import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Vídeo da INET TV para o ExpandMedia do /tv: mudo, em laço, só carrega perto da tela e só toca
 * enquanto aparece. Com movimento reduzido fica parado na imagem do receptor.
 */
export default function TvExpandVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const preload = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px 0px" });
    const play = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    preload.observe(video);
    play.observe(video);
    return () => {
      preload.disconnect();
      play.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const sync = () => {
      if (reduced) { video.pause(); video.load(); return; }
      if (near && visible && !reduced && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      video.pause();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [near, visible, reduced]);

  return (
    <video
      ref={ref}
      src={near && !reduced ? "/video/inet-tv-motion-final.mp4" : undefined}
      poster="/inet-tv-receptor.webp"
      muted
      loop
      playsInline
      preload="none"
      aria-label="Vídeo da INET TV"
      className="h-full w-full object-cover"
    />
  );
}
