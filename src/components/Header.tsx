import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Menu, Sparkles } from "lucide-react";
import { DUR, EASE, SPRING } from "../motion";
import { COMPANY, waLink } from "../data/inet";
import MenuHud, { MenuPill } from "./hud/MenuHud";
import PageLoader from "./hud/PageLoader";

// ordem e textos da nota "organizacao-do-hud" (Filipe, 28/10), iguais aos do P6
export const SERVICES = [
  { to: "/internet", label: "Internet e Wi-Fi", text: "Fibra óptica, roteadores e Wi-Fi Mesh" },
  { to: "/movel", label: "Chip móvel", text: "Internet 5G, ligações e benefícios" },
  { to: "/tv", label: "INET TV", text: "Canais, rádio, filmes e entretenimento" },
  { to: "/telefone-fixo", label: "Telefone fixo", text: "Telefonia residencial e empresarial" },
  { to: "/entretenimento", label: "Entretenimento", text: "HBO Max, Disney+ e Deezer" },
];
// ordem da barra: Serviços ▾ · Cobertura · Velocidade · INET Eventos · Avaliações · Atendimento ▾ · Ver planos · Fale conosco
const BEFORE_EVENTS = [
  { to: "/cobertura", label: "Cobertura" },
  { to: "/teste-de-velocidade", label: "Velocidade" },
];
const AFTER_EVENTS = [{ to: "/avaliacoes", label: "Avaliações" }];

type Opt = { label: string; text: string; to?: string; href?: string };

/** Atendimento por setor: financeiro na central do cliente, suporte e comercial. */
export const ATENDIMENTO: Opt[] = [
  { label: "Suporte técnico", text: "Atendimento técnico 24 horas", to: "/suporte" },
  { label: "Financeiro", text: "Faturas, segunda via e pagamentos", href: COMPANY.clientArea },
  { label: "Comercial", text: "Contratar ou mudar de plano", href: waLink("Olá! Quero falar com o comercial da INET.") },
];

/** Tinta dos itens da barra: clara sobre seção escura, escura sobre seção claro-neve (contraste AA nas duas). */
const ink = (snow: boolean, on: boolean) =>
  snow
    ? on ? "bg-navy-ink/[0.07] text-navy-ink" : "text-navy-ink/75 hover:text-navy-ink"
    : on ? "bg-white/10 text-white" : "text-white/65 hover:text-white";

/** Menu suspenso de vidro usado por "Serviços" e "Atendimento". */
function Dropdown({ id, label, options, active, open, onToggle, align = "left", snow }: {
  id: string; label: string; options: Opt[]; active: boolean; open: boolean; onToggle: () => void; align?: "left" | "right"; snow: boolean;
}) {
  return (
    <div className="relative hidden lg:block" data-dropdown>
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-[13px] transition-colors duration-500 ${ink(snow, active || open)}`}
      >
        {label} <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            id={id}
            initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute top-[calc(100%+12px)] w-72 rounded-3xl border border-white/10 bg-navy-ink/90 p-2 backdrop-blur-xl ${align === "right" ? "right-0" : "left-0"}`}
          >
            {options.map((o) => {
              const body = (
                <>
                  <span className="block text-sm font-semibold">{o.label}</span>
                  <span className="block text-xs text-white/55">{o.text}</span>
                </>
              );
              return (
                <li key={o.label}>
                  {o.to ? (
                    <NavLink to={o.to} className={({ isActive }) => `block rounded-2xl px-4 py-3 transition-colors duration-500 hover:bg-white/5 ${isActive ? "bg-white/10" : ""}`}>{body}</NavLink>
                  ) : (
                    <a href={o.href} target="_blank" rel="noreferrer" className="block rounded-2xl px-4 py-3 transition-colors duration-500 hover:bg-white/5">{body}</a>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Menu flutuante: pílula de vidro quase transparente que acompanha a tela inteira
 * sem cobrir o site. O HUD secundário (painel claro-neve em tela cheia) abre pela pílula
 * "Menu" no canto inferior esquerdo e, no celular, pelo botão de menu desta barra.
 */
export default function Header() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SPRING);
  const { pathname, hash } = useLocation();
  const [drop, setDrop] = useState<"servicos" | "atendimento" | null>(null);
  const [hud, setHud] = useState(false);
  const pill = useRef<HTMLButtonElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const servicesActive = SERVICES.some((s) => pathname.startsWith(s.to));
  const toggle = (d: "servicos" | "atendimento") => setDrop((cur) => (cur === d ? null : d));
  const openHud = (from: HTMLElement | null) => {
    opener.current = from;
    setDrop(null);
    setHud(true);
  };
  const closeHud = useCallback(() => setHud(false), []);
  const bar = useRef<HTMLElement>(null);
  const [snow, setSnow] = useState(false);

  // a barra troca de tinta quando passa sobre uma seção clara (.tone-snow na Home, [data-tone=light] nas internas)
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const nav = bar.current?.getBoundingClientRect();
      if (!nav) return;
      const mid = nav.top + nav.height / 2;
      setSnow([...document.querySelectorAll(".tone-snow, [data-tone=light]")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const t = window.setTimeout(check, 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    setDrop(null);
    setHud(false);
  }, [pathname, hash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrop(null);
    const onClick = (e: MouseEvent) => !(e.target as HTMLElement).closest("[data-dropdown]") && setDrop(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const item = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-4 py-2 text-[13px] transition-colors duration-500 ${ink(snow, isActive)}`;

  return (
    <>
      <a href="#conteudo" className="sr-only z-[100] rounded-full bg-lime px-4 py-2 font-semibold text-navy-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-electric via-[#5CC8FF] to-lime" />

      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DUR, ease: EASE, delay: 0.2 }}
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4"
      >
        <nav
          ref={bar}
          aria-label="Menu principal"
          data-tone={snow ? "snow" : "dark"}
          className={`flex w-full max-w-fit items-center gap-1 rounded-full border p-1.5 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${snow ? "border-navy-ink/10 bg-[#EFF3F9]/90 shadow-[0_10px_30px_-16px_rgba(1,8,24,0.35)]" : "border-white/10 bg-white/[0.04] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"}`}
        >
          <Link to="/" aria-label="INET – página inicial" className="flex min-h-[40px] items-center px-3">
            <img src={snow ? "/inet-logo.png" : "/inet-logo-branca.png"} alt="INET" width={68} height={24} className="h-6 w-auto" />
          </Link>

          <Dropdown id="menu-servicos" label="Serviços" options={SERVICES.map((x) => ({ ...x }))} active={servicesActive} open={drop === "servicos"} onToggle={() => toggle("servicos")} snow={snow} />
          {BEFORE_EVENTS.map((m) => (
            <NavLink key={m.to} to={m.to} className={(s) => `${item(s)} hidden lg:block`}>
              {m.label}
            </NavLink>
          ))}
          <NavLink to="/eventos" className={({ isActive }) => `group relative hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13px] transition-colors duration-500 lg:flex ${ink(snow, isActive)}`}>
            <Sparkles size={13} aria-hidden="true" className={`${snow ? "text-electric" : "text-lime"} transition-transform duration-700 group-hover:rotate-12`} /> INET Eventos
          </NavLink>
          {AFTER_EVENTS.map((m) => (
            <NavLink key={m.to} to={m.to} className={(s) => `${item(s)} hidden lg:block`}>
              {m.label}
            </NavLink>
          ))}
          <Dropdown id="menu-atendimento" label="Atendimento" options={ATENDIMENTO} active={pathname.startsWith("/suporte")} open={drop === "atendimento"} onToggle={() => toggle("atendimento")} align="right" snow={snow} />
          <Link to="/internet#planos" className={`hidden rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors duration-500 sm:block ${snow ? "border-electric/50 text-electric hover:bg-electric/10" : "border-lime/45 text-lime hover:bg-lime/10"}`}>
            Ver planos
          </Link>
          <Link to="/fale-conosco" className="rounded-full bg-lime/90 px-4 py-2 text-[13px] font-semibold text-navy-ink transition-colors duration-500 hover:bg-lime">
            Fale conosco
          </Link>
          <button
            ref={burger}
            onClick={() => openHud(burger.current)}
            aria-label="Abrir menu"
            aria-expanded={hud}
            aria-controls="menu-hud"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 lg:hidden ${snow ? "text-navy-ink" : "text-white/80"}`}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </nav>
      </motion.header>

      <MenuPill open={hud} onOpen={() => openHud(pill.current)} pillRef={pill} />
      <MenuHud open={hud} onClose={closeHud} returnFocus={opener} />
      <PageLoader />
    </>
  );
}
