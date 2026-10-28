import { useEffect, useRef, useState, type RefObject } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Phone, X } from "lucide-react";
import { EASE, STAGGER } from "../../motion";
import { COMPANY, PHONES, SOCIAL, STORES } from "../../data/inet";
import { SERVICES } from "../Header";

/** Navegação institucional: só rotas que existem no App. */
// mesma ordem da barra (nota "organizacao-do-hud"): Cobertura, Velocidade, INET Eventos, Avaliações, atendimento, Ver planos, Fale conosco
const NAV = [
  { to: "/", label: "Início" },
  { to: "/cobertura", label: "Cobertura e lojas" },
  { to: "/teste-de-velocidade", label: "Teste de velocidade" },
  { to: "/eventos", label: "INET Eventos" },
  { to: "/avaliacoes", label: "Avaliações" },
  { to: "/suporte", label: "Suporte técnico" },
];
const NAV_END = [
  { to: "/internet#planos", label: "Ver planos" },
  { to: "/fale-conosco", label: "Fale conosco" },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * HUD secundário (referência: o menu do Teste 3, localhost:8088).
 * A barra de vidro do topo continua sendo o menu principal; este painel claro-neve em tela cheia
 * abre pela pílula "Menu" no canto inferior esquerdo (desktop) e pelo botão de menu da barra (celular).
 * Foco preso no painel, Esc fecha e devolve o foco a quem abriu, rolagem do fundo travada.
 */
export default function MenuHud({ open, onClose, returnFocus }: {
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // trava a rolagem do fundo; o painel leva data-lenis-prevent, então a roda não chega ao Lenis
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, [open]);

  // foco: entra no painel ao abrir, fica preso nele, volta a quem abriu ao fechar
  useEffect(() => {
    if (!open) return;
    const back = returnFocus.current;
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-hud-first]")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const inside = panel.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      back?.focus({ preventScroll: true });
    };
  }, [open, onClose, returnFocus]);

  const item = {
    h: { opacity: 0, y: reduced ? 0 : 18 },
    s: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };
  const linkTone = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-500 hover:text-electric focus-visible:outline-electric ${isActive ? "text-electric" : "text-navy-ink"}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="menu-hud"
          role="dialog"
          aria-modal="true"
          aria-label="Menu do site"
          data-lenis-prevent
          initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE }}
          className="hud-panel fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-[#EFF3F9] text-navy-ink"
        >
          <div className="mx-auto flex min-h-full w-full max-w-[100rem] flex-col px-5 pb-8 pt-5 sm:px-10 lg:px-20 lg:pt-8">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={onClose} aria-label="INET – página inicial" className="flex min-h-[44px] items-center rounded-md focus-visible:outline-electric">
                <img src="/inet-logo.png" alt="INET" width={124} height={44} className="h-7 w-auto sm:h-8" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-navy-ink/15 bg-[#F7F9FC] px-5 text-[13px] font-medium text-navy-ink transition-colors duration-500 hover:border-electric hover:text-electric focus-visible:outline-electric"
              >
                Fechar <X size={15} aria-hidden="true" />
              </button>
            </div>

            <motion.div
              initial="h"
              animate="s"
              transition={{ staggerChildren: reduced ? 0 : STAGGER * 0.6, delayChildren: reduced ? 0 : 0.25 }}
              className="mt-10 grid flex-1 gap-12 lg:mt-16 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16"
            >
              <nav aria-label="Serviços INET">
                <motion.h2 variants={item} className="text-sm font-medium text-electric">Serviços INET</motion.h2>
                <ul className="mt-5 space-y-4 sm:space-y-5">
                  {SERVICES.map((s, i) => (
                    <motion.li key={s.to} variants={item}>
                      <NavLink to={s.to} onClick={onClose} data-hud-first={i === 0 ? "" : undefined} className={(st) => `group block rounded-md ${linkTone(st)}`}>
                        <span className="block font-display text-[2rem] font-light leading-none tracking-[-0.02em] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-5xl lg:text-[3.4rem]">
                          {s.label}
                        </span>
                        <span className="mt-1.5 block text-sm text-[rgb(1_8_24/0.65)]">{s.text}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Navegação">
                <motion.h2 variants={item} className="text-sm font-medium text-electric">Navegação</motion.h2>
                <ul className="mt-5 space-y-3">
                  {NAV.map((n) => (
                    <motion.li key={n.to} variants={item}>
                      <NavLink end to={n.to} onClick={onClose} className={(st) => `rounded-md font-display text-xl font-light sm:text-2xl ${linkTone(st)}`}>
                        {n.label}
                      </NavLink>
                    </motion.li>
                  ))}
                  <motion.li variants={item}>
                    <a href={COMPANY.clientArea} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md font-display text-xl font-light text-navy-ink transition-colors duration-500 hover:text-electric focus-visible:outline-electric sm:text-2xl">
                      Central do Cliente <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </motion.li>
                  {NAV_END.map((n) => (
                    <motion.li key={n.to} variants={item}>
                      <NavLink end to={n.to} onClick={onClose} className={(st) => `rounded-md font-display text-xl font-light sm:text-2xl ${linkTone(st)}`}>
                        {n.label}
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div variants={item} className="flex flex-col">
                <h2 className="text-sm font-medium text-electric">Central de atendimento</h2>
                <ul className="mt-5 space-y-4">
                  {PHONES.map((p) => (
                    <li key={p.tel}>
                      <a href={`tel:${p.tel}`} className="group inline-flex items-start gap-3 rounded-md focus-visible:outline-electric">
                        <Phone size={16} aria-hidden="true" className="mt-1 text-electric" />
                        <span>
                          <span className="block text-lg font-medium text-navy-ink transition-colors duration-500 group-hover:text-electric">{p.display}</span>
                          <span className="block text-xs text-[rgb(1_8_24/0.65)]">{p.label}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-10 border-t border-[rgb(1_8_24/0.08)] pt-6 text-sm leading-relaxed text-[rgb(1_8_24/0.65)]">
                  {STORES.length} lojas em Teófilo Otoni e Carlos Chagas. Suporte técnico pelo WhatsApp 24 horas por dia.
                </p>
              </motion.div>
            </motion.div>

            <div className="mt-14 flex flex-col gap-4 border-t border-[rgb(1_8_24/0.08)] pt-6 text-xs text-[rgb(1_8_24/0.65)] sm:flex-row sm:items-center sm:justify-between">
              <span>{COMPANY.legalName} · Teófilo Otoni – MG</span>
              <ul className="flex gap-5">
                {SOCIAL.map((s) => (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="rounded-md transition-colors duration-500 hover:text-electric focus-visible:outline-electric">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Pílula "Menu ••" fixa no canto inferior esquerdo (o WhatsApp mora no direito).
 * Só no desktop e só depois que o herói passa: no celular o botão de menu da barra abre o mesmo painel.
 */
export function MenuPill({ open, onOpen, pillRef }: { open: boolean; onOpen: () => void; pillRef: RefObject<HTMLButtonElement> }) {
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setShown(window.scrollY > window.innerHeight * 0.5);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const visible = shown || open;
  return (
    <motion.button
      ref={pillRef}
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      aria-controls="menu-hud"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 24 }}
      transition={{ duration: 0.9, ease: EASE }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed bottom-6 left-6 z-50 hidden min-h-[48px] items-center gap-2.5 rounded-full border border-navy-ink/10 bg-[#EFF3F9]/90 px-5 text-[13px] font-medium text-navy-ink shadow-[0_16px_40px_-18px_rgba(0,0,0,0.75)] backdrop-blur-md transition-colors duration-500 hover:bg-[#E2E8F2] focus-visible:outline-lime lg:inline-flex"
    >
      Menu
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-navy-ink" />
        <span className="h-1.5 w-1.5 rounded-full bg-electric" />
      </span>
    </motion.button>
  );
}
