import { useEffect, useRef } from "react";
import { ArrowUpRight, MessageCircle, Phone, MapPin } from "lucide-react";
import { COMPANY, PHONES, STORES, waLink } from "../../data/inet";

// Estrelas finas determinísticas (sequência R2 bidimensional, sem alinhamento diagonal) para o céu/espaço em SVG
const SPACE_STARS = Array.from({ length: 68 }, (_, i) => {
  const x = +(((i * 0.7548776662 + 0.13) % 1) * 96 + 2).toFixed(2);
  // Concentra as estrelas a partir da transição atmosférica (30% → 98% da altura)
  const y = +(30 + ((i * 0.569840291 + 0.29) % 1) * 68).toFixed(2);
  const r = i % 7 === 0 ? 1.2 : i % 3 === 0 ? 0.85 : 0.55;
  const fill = i % 5 === 0 ? "#70E000" : i % 2 === 0 ? "#5CC8FF" : "#EFF3F9";
  const opacity = +((0.16 + (i % 5) * 0.08) * Math.min(1, (y - 28) / 28)).toFixed(2);
  return { x, y, r, fill, opacity };
});

export default function ConnectFinale() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;
    let visible = false;
    const draw = () => {
      if (!visible) return;
      const bounds = section.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * dpr);
      canvas.height = Math.round(bounds.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, bounds.width, bounds.height);
      // Reserve a clear rectangle around every piece of copy, including the legal line.
      const protectedAreas = [...section.querySelectorAll<HTMLElement>("h2,p,a,span,[data-legal]")].map(el => el.getBoundingClientRect());
      const count = bounds.width < 640 ? 28 : 56;
      for (let i = 0; i < count; i++) {
        const x = ((i * 0.7548776662 + 0.19) % 1) * bounds.width;
        const y = (0.34 + ((i * 0.569840291 + 0.37) % 1) * 0.64) * bounds.height;
        if (protectedAreas.some(r => x > r.left - bounds.left - 14 && x < r.right - bounds.left + 14 && y > r.top - bounds.top - 14 && y < r.bottom - bounds.top + 14)) continue;
        ctx.fillStyle = i % 3 === 0 ? "rgba(112,224,0,.22)" : i % 2 === 0 ? "rgba(92,200,255,.26)" : "rgba(239,243,249,.22)";
        ctx.beginPath();
        ctx.arc(x, y, i % 3 ? 0.6 : 1.05, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const resize = new ResizeObserver(draw);
    resize.observe(section);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; draw(); });
    observer.observe(section);
    return () => { resize.disconnect(); observer.disconnect(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="inet-connect-title"
      className="inet-connect-finale relative w-full overflow-clip text-white flex flex-col pb-8"
      // Céu/espaço contínuo único: rampa horizontal uniforme de #EFF3F9 (neve) até #010818 (espaço profundo do rodapé)
      style={{
        paddingTop: "calc(var(--seam) + 3.5rem)",
        background:
          "linear-gradient(180deg, #EFF3F9 0%, #E7EEF9 4%, #D9E5F6 9%, #C4D6F1 14%, #A8C3EA 20%, #86ABE0 26%, #618FD3 32%, #3D71C4 38%, #2056B2 44%, #0E3F9B 50%, #062E7E 56%, #032162 63%, #021749 70%, #011034 77%, #010B23 85%, #010818 93%, #010818 100%)",
      }}
    >
      {/* Poeira de luz e estrelas finas em SVG que continuam no Footer */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        {SPACE_STARS.map((s, idx) => (
          <circle key={idx} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.fill} opacity={s.opacity} />
        ))}
      </svg>
      <style>{`@media(prefers-reduced-motion:reduce){.inet-connect-finale canvas{display:none}.inet-connect-finale .btn-lime{transform:none!important;transition:none!important}}`}</style>
      <canvas aria-hidden="true" ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" />

      {/* Conteúdo principal sobreposto */}
      <div className="wrap relative z-10 flex flex-col items-center text-center">
        <h2 id="inet-connect-title" className="font-display font-light text-[clamp(2.5rem,6vw,5rem)] tracking-[-0.03em] text-white max-w-4xl leading-[1.04]">
          Vamos nos <span className="italic text-lime font-normal">conectar?</span>
        </h2>

        <p className="lead mt-6 max-w-2xl text-white/80">
          Planos de até 1 Giga com Wi-Fi grátis, TV, telefone fixo e chip 5G. Suporte técnico 24 horas pelo WhatsApp.
        </p>

        {/* Botão de WhatsApp comercial (atua como obstáculo para as partículas) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href={waLink("Olá! Quero contratar a internet fibra da INET.")}
            target="_blank"
            rel="noreferrer"
            className="btn-lime text-base font-bold px-8 py-4 shadow-[0_20px_50px_-10px_rgba(112,224,0,0.55)] flex items-center gap-2.5 hover:scale-105"
          >
            <MessageCircle size={20} className="shrink-0" />
            <span>Conversar pelo WhatsApp</span>
            <ArrowUpRight size={17} className="shrink-0" />
          </a>
        </div>

        {/* Telefones reais e atendimento */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/80">
          {PHONES.map((phone) => (
            <a key={phone.tel} href={`tel:${phone.tel}`} className="flex items-center gap-2 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
              <Phone size={14} className="text-lime" aria-hidden="true" />
              <span>{phone.label}: <strong>{phone.display}</strong></span>
            </a>
          ))}
        </div>

        {/* Lojas físicas */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/75">
          <MapPin size={13} className="shrink-0 text-lime" aria-hidden="true" />
          <span>{STORES.length} lojas: {STORES.map((store) => store.name).join(" · ")}</span>
        </div>
      </div>

      <div data-legal="" className="relative z-10 text-center mt-8 text-xs text-white/70">
        {COMPANY.legalName} · {COMPANY.city} - {COMPANY.state}
      </div>
    </section>
  );
}
