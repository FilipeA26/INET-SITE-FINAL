import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { SPRING } from "../../motion";

/**
 * Abertura com o nome gigante (lusion.co/about; mesma peça do 8087): "INET" em verde-limão e a
 * palavra da página em branco começam enormes no centro da tela e, com a rolagem, encolhem até o
 * lugar delas no texto de apresentação, que aparece em seguida. Os textos vêm de quem usa o
 * componente — nada é escrito aqui.
 *
 * No celular o nome fica em duas linhas (INET / palavra) para caber; a escala inicial é limitada
 * pela largura da tela, então nunca há rolagem horizontal.
 */
export default function NameHero({
  word,
  lines,
  lead,
  label,
  children,
}: {
  word: string;
  lines: ReactNode[];
  lead: string;
  label: string;
  children?: ReactNode;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [start, setStart] = useState({ x: 0, y: 0, scale: 3 });

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current?.getBoundingClientRect();
      const slot = slotRef.current?.getBoundingClientRect();
      if (!stage || !slot || !slot.width) return;
      const mobile = stage.width < 768;
      // escala do 8087 (2,4 no celular, 3,4 no computador), limitada para o nome caber na tela
      const scale = Math.max(1, Math.min(mobile ? 2.4 : 3.4, (stage.width * 0.88) / slot.width));
      setStart({
        x: stage.width / 2 - (slot.left - stage.left + slot.width / 2),
        y: stage.height / 2 - (slot.top - stage.top + slot.height / 2),
        scale,
      });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, SPRING);

  const nameX = useTransform(p, [0, 0.65], [start.x, 0]);
  const nameY = useTransform(p, [0, 0.65], [start.y, 0]);
  const nameScale = useTransform(p, [0, 0.65], [start.scale, 1]);
  const hintOpacity = useTransform(p, [0, 0.18], [1, 0]);
  const textOpacity = useTransform(p, [0.42, 0.7], [0, 1]);
  const textY = useTransform(p, [0.42, 0.7], [24, 0]);
  const asideOpacity = useTransform(p, [0.48, 0.76], [0, 1]);
  const asideX = useTransform(p, [0.48, 0.76], [28, 0]);

  return (
    <section ref={containerRef} aria-label={label} className="pg-namehero relative bg-navy-ink text-white">
      <style>{`
        .pg-namehero{min-height:220svh}
        .pg-namehero-stage{position:sticky;top:0;height:100svh}
        @media (prefers-reduced-motion:reduce){
          .pg-namehero{min-height:0}
          .pg-namehero-stage{position:relative;height:auto;min-height:100svh;padding-top:8rem;padding-bottom:4rem}
          .pg-namehero-hint{display:none}
        }
      `}</style>
      <div
        ref={stageRef}
        className={`pg-namehero-stage flex w-full items-center justify-center overflow-clip ${reduced ? "!relative !h-auto min-h-[100svh] pb-16 pt-32" : ""}`}
      >
        {/* luz de fibra discreta ao fundo, como no 8087 */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,98,236,0.16),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(56,176,0,0.08),transparent_55%)]" />
        </div>

        {!reduced && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: hintOpacity }}
            className="pg-namehero-hint pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-sm text-white/60 sm:bottom-12"
          >
            Role para conhecer
            <ArrowDown size={14} className="text-lime" />
          </motion.div>
        )}

        <div className="wrap relative z-10 grid w-full items-center gap-8 md:grid-cols-12 md:gap-8 lg:gap-14">
          <div className="md:col-span-7">
            <div className="font-display font-light tracking-[-0.03em]">
              {/* o lugar exato onde o nome pousa */}
              <div ref={slotRef} className="relative inline-flex py-1 sm:py-2">
                <motion.h1
                  style={reduced ? undefined : { x: nameX, y: nameY, scale: nameScale, transformOrigin: "center center" }}
                  className="flex select-none flex-col font-display text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:flex-row sm:gap-[0.22em] sm:text-6xl lg:text-7xl"
                >
                  <span className="text-lime drop-shadow-[0_0_35px_rgba(112,224,0,0.4)]">INET</span>
                  <span className="text-white">{word}</span>
                </motion.h1>
              </div>
              {lines.map((line, i) => (
                <div key={i} className="overflow-clip py-0.5">
                  <motion.p
                    style={reduced ? undefined : { opacity: textOpacity, y: textY }}
                    className="text-3xl font-light text-white sm:text-4xl lg:text-5xl"
                  >
                    {line}
                  </motion.p>
                </div>
              ))}
            </div>
          </div>

          <motion.div style={reduced ? undefined : { opacity: asideOpacity, x: asideX }} className="md:col-span-5">
            <p className="lead">{lead}</p>
            {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
