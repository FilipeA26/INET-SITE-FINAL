import { useEffect, useId, useRef, useState } from "react";
import { Play, X } from "lucide-react";

const VIDEO = "/video/inet-tv-motion-v4.mp4";
const POSTER = "/inet-tv-receptor.webp";

export default function InetTvVideo() {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el || !open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.showModal();
    el.querySelector<HTMLButtonElement>("button")?.focus();
    void player.current?.play().catch(() => {});
    return () => {
      player.current?.pause();
      if (el.open) el.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    document.dispatchEvent(new Event("inet:tv-player"));
  }, [open]);

  return (
    <>
      <style>{`
        .inet-tv-player{position:fixed;inset:0;margin:0;width:100vw;max-width:none;height:100dvh;max-height:none;padding:24px;background:#010818;color:#f7f9fc;border:0}
        .inet-tv-player::backdrop{background:#010818}
        .inet-tv-player video{display:block;width:100%;height:calc(100dvh - 110px);object-fit:contain}
        .inet-tv-player button:focus-visible{outline:3px solid #70E000;outline-offset:4px}
        @media(max-width:767px){.inet-tv-player{padding:16px}}
      `}</style>
          <button ref={trigger} type="button" onClick={() => setOpen(true)} className="btn-ghost gap-3 border-white/60 bg-[#010818]/75 px-7 py-4 text-white" aria-haspopup="dialog">
            <Play size={20} aria-hidden="true" /> Ver o vídeo
          </button>
      <dialog data-lenis-prevent ref={dialog} aria-labelledby={titleId} className="inet-tv-player" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={titleId} className="font-display text-xl">INET TV</h2>
          <button type="button" onClick={() => setOpen(false)} className="btn-ghost"><X size={20} aria-hidden="true" /> Fechar vídeo</button>
        </div>
        {open && <video ref={player} src={VIDEO} controls playsInline preload="metadata" poster={POSTER} aria-label="Vídeo da INET TV" />}
      </dialog>
    </>
  );
}
