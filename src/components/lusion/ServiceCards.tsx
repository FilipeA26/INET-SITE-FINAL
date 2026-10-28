import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent, useSpring, useTransform, useInView, useMotionValue, type MotionValue } from "framer-motion";
import { Wifi, Tv, Phone, Smartphone, Music, Gauge } from "lucide-react";
import { EASE, SPRING } from "../../motion";

import HoverJitter from "../giro/HoverJitter";

const services = [
  { to: "/internet", icon: Wifi, title: "Internet e Wi-Fi", text: "Até 1 Giga e Wi-Fi 6 na casa toda." },
  { to: "/tv", icon: Tv, title: "INET TV", text: "TV ao vivo e filmes com o TV Box." },
  { to: "/telefone-fixo", icon: Phone, title: "Telefone fixo", text: "Ligações ilimitadas para todo o Brasil." },
  { to: "/movel", icon: Smartphone, title: "Chip móvel", text: "5G com WhatsApp e Waze ilimitados." },
  { to: "/entretenimento", icon: Music, title: "Entretenimento", text: "HBO Max, Disney+ e Deezer." },
  { to: "/teste-de-velocidade", icon: Gauge, title: "Teste de velocidade", text: "Meça no servidor oficial INET." },
];

function CardFront({ index }: { index: number }) {
const card=services[index]; const Icon=card.icon; const number=String(index+1).padStart(2,"0");
return (
      <div data-tube-hide className="inet-service-front inet-service-card flex flex-col justify-between rounded-[1.75rem] border border-white/60 bg-[#F4F7FC] text-[#010818] shadow-[0_25px_60px_-15px_rgba(0,18,50,0.45)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lime">
        <HoverJitter className="h-full w-full" mediaClassName="flex flex-col justify-between">
        <div aria-hidden="true" className="inet-service-corner flex items-center justify-between gap-2 border-b border-black/10 pb-3">
          <div className="flex shrink-0 items-center gap-2 text-electric">
            <span className="font-mono text-base font-bold">{number}</span>
            <Icon size={16} aria-hidden="true" />
          </div>
          <span className="inet-service-caption text-right font-mono text-black/50">{card.title}</span>
        </div>
        <div className="inet-service-body my-auto py-4">
          <div className="inet-service-icon mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/10 text-electric">
            <Icon size={24} aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-navy-deep">{card.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-black/70">{card.text}</p>
        </div>
        <div aria-hidden="true" className="inet-service-corner flex rotate-180 items-center justify-between gap-2 border-t border-black/10 pt-3 text-black/50">
          <div className="flex shrink-0 items-center gap-2 text-electric">
            <span className="font-mono text-base font-bold">{number}</span>
            <Icon size={16} aria-hidden="true" />
          </div>
          <span className="inet-service-caption text-right font-mono">{card.title}</span>
        </div>
        </HoverJitter>
      </div>
);
}
function CardBack({ index }: { index: number }) {
 const card = { index: String(index + 1).padStart(2, "0"), id: `service-${index}` };
  return (
    <div
      aria-hidden="true"
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-cyan-400/30 bg-gradient-to-br from-[#003F99] via-[#021B5B] to-[#010D2C] p-6 shadow-[0_20px_50px_-15px_rgba(0,39,153,0.7)]"
    >
      {/* Moldura de linhas finas geométricas */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 265 390" preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#70E000" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0062EC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#94FFFB" stopOpacity="0.6" />
          </linearGradient>
          <pattern id={`dots-${card.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#ffffff" fillOpacity="0.12" />
          </pattern>
        </defs>

        {/* Fundo pontilhado sutil */}
        <rect width="100%" height="100%" fill={`url(#dots-${card.id})`} />

        {/* Moldura externa e interna em traço fino */}
        <rect x="10" y="10" width="245" height="370" rx="20" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="16" y="16" width="233" height="358" rx="16" fill="none" stroke={`url(#grad-${card.id})`} strokeWidth="1" strokeDasharray="6 4" />

        {/* Nós ópticos nos quatro cantos */}
        <circle cx="26" cy="26" r="3" fill="#70E000" />
        <circle cx="239" cy="26" r="3" fill="#70E000" />
        <circle cx="26" cy="364" r="3" fill="#70E000" />
        <circle cx="239" cy="364" r="3" fill="#70E000" />

        {/* Linhas de fibra convergindo para o centro */}
        <path d="M 26 26 L 80 80 M 239 26 L 185 80 M 26 239 L 80 185 M 239 239 L 185 185" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.75" />

        {/* Arco central da logo INET */}
        <g transform="translate(132, 195) scale(0.85)">
          <path d="M -70 20 C -40 -50, 40 -50, 70 20" fill="none" stroke={`url(#grad-${card.id})`} strokeWidth="3" strokeLinecap="round" />
          <path d="M -50 25 C -25 -25, 25 -25, 50 25" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="-22" r="4" fill="#ffffff" />
        </g>
      </svg>

      {/* Topo do verso */}
      <div className="relative z-10 flex items-center justify-between text-white/70">
        <span className="font-mono text-xs font-semibold tracking-wider text-lime">{card.index}</span>
        <span className="font-mono text-[11px] text-white/50">Fibra óptica INET</span>
      </div>

      {/* Centro do verso */}
      <div className="relative z-10 text-center">
        <span className="font-display text-4xl font-black tracking-wider text-white/90 drop-shadow-[0_0_20px_rgba(0,98,236,0.8)]">
          INET
        </span>
        <p className="mt-1 font-mono text-[10px] text-white/40">
          Teófilo Otoni · MG
        </p>
      </div>

      {/* Rodapé invertido do verso */}
      <div className="relative z-10 flex items-center justify-between text-white/70 rotate-180">
        <span className="font-mono text-xs font-semibold tracking-wider text-lime">{card.index}</span>
        <span className="font-mono text-[11px] text-white/50">Fibra óptica INET</span>
      </div>
    </div>
  );
}

function DesktopCard({ index, progress, width, wide, active, reduced }: {
  index: number; progress: MotionValue<number>; width: number; wide: boolean; active: boolean; reduced: boolean;
}) {
  const floatY = useMotionValue(0);
  const [focused, setFocused] = useState(false);
  const [opened, setOpened] = useState(reduced || progress.get() >= 0.78);
  useMotionValueEvent(progress, "change", value => setOpened(value >= 0.78));
  useEffect(() => {
    if (!active || reduced) { floatY.set(0); return; }
    let raf = 0;
    const frame = (time: number) => { floatY.set(Math.cos(time / 1000 * 2.2 + index * 1.6) * 9); raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, index, floatY]);
  const column = wide ? index : index % 3;
  const center = wide ? 2.5 : 1;
  const targetX = (column - center) * (width + (wide ? 12 : 0));
  const angle = wide ? [-12, -7, -2, 3, 7, 12][index] : [-10, 0, 10][column];
  const baseY = wide ? [34, 12, 0, 0, 12, 34][index] : (index < 3 ? -155 : 155);
  const start = 0.12 + index * 0.06;
  const rotateY = useTransform(progress, [0, start, start + 0.22, 1], [180, 180, 0, 0]);
  const x = useTransform(progress, [0, 0.14, 0.48, 1], [0, 0, targetX, targetX]);
  const rotateZ = useTransform(progress, [0, 0.15, 0.45, 0.75, 1], [0, 0, angle, angle * 0.7, angle * 0.7]);
  const y = useTransform([floatY, progress], ([float, p]) => Number(float) + baseY * Math.min(1, Math.max(0, (Number(p) - 0.14) / 0.34)));
  return (
    <motion.div className="inet-service-slot inet-service-desktop-slot" style={{ width, x: reduced || focused ? targetX : x, y: reduced ? baseY : y, rotateY: reduced || focused ? 0 : rotateY, rotateZ: reduced ? angle * 0.7 : rotateZ, transformStyle: "preserve-3d" }}>
      <Link to={services[index].to} className="inet-service-link" tabIndex={reduced || opened ? 0 : -1} aria-disabled={!reduced && !opened} style={{ pointerEvents: reduced || opened ? "auto" : "none" }} onClick={event => { if (!reduced && !opened) event.preventDefault(); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <CardBack index={index} /><CardFront index={index} />
      </Link>
    </motion.div>
  );
}

function MobileCard({ index, rail, visible, reduced }: { index: number; rail: RefObject<HTMLDivElement>; visible: boolean; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inRail = useInView(ref, { root: rail, amount: 0.6 });
  const [focused, setFocused] = useState(false);
  const [opened, setOpened] = useState(reduced);
  useEffect(() => {
    if (reduced) { setOpened(true); return; }
    setOpened(false);
    if (!visible || !inRail) return;
    const timer = window.setTimeout(() => setOpened(true), 850);
    return () => clearTimeout(timer);
  }, [reduced, visible, inRail]);
  return (
    <div ref={ref} className="inet-service-mobile-slot">
      <motion.div className="inet-service-slot" initial={{ rotateY: reduced ? 0 : 180 }} animate={{ rotateY: reduced || focused || (visible && inRail) ? 0 : 180 }} transition={{ duration: reduced ? 0 : 0.85, ease: EASE }} style={{ transformStyle: "preserve-3d" }}>
        <Link to={services[index].to} className="inet-service-link" tabIndex={opened ? 0 : -1} aria-disabled={!opened} style={{ pointerEvents: opened ? "auto" : "none" }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
          <CardBack index={index} /><CardFront index={index} />
        </Link>
      </motion.div>
    </div>
  );
}

export default function ServiceCards() {
  const ref = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const visible = useInView(ref);
  const [viewport, setViewport] = useState(() => typeof window === "undefined" ? 1440 : window.innerWidth);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const resize = () => setViewport(innerWidth);
    const visibility = () => setPageVisible(!document.hidden);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const mobile = viewport < 812;
  const wide = viewport >= 1280;
  const width = wide ? Math.min(265, (viewport - 240) / 6) : Math.min(265, (viewport - 140) / 3);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, SPRING);
  return (
    <div ref={ref} className={`inet-service-fan relative mt-14 ${mobile ? "is-mobile" : "is-desktop"} ${reduced ? "is-reduced" : ""}`}>
      <style>{`
        .inet-service-fan.is-desktop{min-height:300svh;width:calc(100vw - 80px);margin-left:calc(50% - 50vw + 40px)}
        .inet-service-pin{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;justify-content:center;padding-top:72px}
        .inet-service-pin-title{text-align:center;font-size:clamp(2rem,3.5vw,3rem);line-height:1.08;margin-bottom:32px}
        .inet-service-stage{position:relative;display:flex;align-items:center;justify-content:center;height:460px;perspective:1300px}
        .inet-service-slot{position:relative;transform-style:preserve-3d}
        .inet-service-desktop-slot{position:absolute;height:390px}
        .inet-service-link{display:block;position:relative;width:100%;height:100%;transform-style:preserve-3d;border-radius:1.75rem}
        .inet-service-slot:focus-within{z-index:20}
        .inet-service-link:focus-visible{outline:4px solid #70E000!important;outline-offset:4px!important}
        .inet-service-card{position:absolute;inset:0;height:100%;padding:24px;backface-visibility:hidden}
        .inet-service-caption{min-width:0;overflow-wrap:anywhere;font-size:clamp(.56rem,.68vw,.7rem);line-height:1.35}
        .inet-service-body{min-width:0}
        .inet-service-card h3{font-size:clamp(1.05rem,1.35vw,1.5rem);overflow-wrap:anywhere}
        .inet-service-card p{font-size:clamp(.8rem,1.05vw,1rem);overflow-wrap:anywhere;line-height:1.5}
        .inet-service-corner{min-width:0}
        .inet-service-corner span{max-width:100%}
        .inet-service-front:hover{background:#edf2fa}
        .inet-service-fan.is-reduced{min-height:0}
        .is-reduced .inet-service-pin{position:relative;height:auto;padding-block:48px}
        @media(min-width:1280px){
          .inet-service-card{padding:18px}
          .inet-service-caption{font-size:10px}
          .inet-service-card h3{font-size:clamp(1.125rem,1.5vw,1.5rem);overflow-wrap:anywhere}
          .inet-service-corner,.inet-service-corner>div{gap:4px}
        }
        @media(min-width:812px) and (max-width:1279px){
          .inet-service-stage{height:640px}
          .inet-service-desktop-slot{height:300px}
          .inet-service-card{padding:16px}
          .inet-service-card h3{font-size:20px}
          .inet-service-icon{width:36px;height:36px;margin-bottom:10px}
          .inet-service-body{padding-block:8px}
          .inet-service-card p{font-size:14px}
          .inet-service-pin-title{margin-bottom:12px}
        }
        .inet-service-rail{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:8px;padding:8px 8px 16px;max-width:100%;-webkit-overflow-scrolling:touch}
        .inet-service-mobile-slot{flex:0 0 86%;scroll-snap-align:start;perspective:1300px}
        .inet-service-mobile-slot .inet-service-slot{height:350px}
        @media(max-width:811px){
          .inet-service-fan{margin-top:32px}
          .inet-service-card{padding:20px}
          .inet-service-caption{font-size:10px}
          .inet-service-icon{width:40px;height:40px;margin-bottom:12px}
          .inet-service-body{padding-block:12px}
          .inet-service-card p{font-size:15px;line-height:1.5}
        }
        @media(prefers-reduced-motion:reduce){
          .inet-service-fan.is-desktop{min-height:0}
          .inet-service-pin{position:relative;height:auto}
          .inet-service-slot{transition:none!important;animation:none!important}
        }
      `}</style>
      {mobile ? (
        <div ref={rail} className="inet-service-rail" data-lenis-prevent>
          {services.map((card, index) => <MobileCard key={card.to} index={index} rail={rail} visible={visible} reduced={reduced} />)}
        </div>
      ) : (
        <div className="inet-service-pin">
          <div className="inet-service-stage">
            {services.map((card, index) => <DesktopCard key={card.to} index={index} progress={progress} width={width} wide={wide} active={visible && pageVisible} reduced={reduced} />)}
          </div>
        </div>
      )}
    </div>
  );
}
