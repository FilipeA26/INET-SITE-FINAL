import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Abertura e transição curta da marca (≤ 560 ms), sem barra de progresso, sem contador 000→100
 * e sem bloquear cliques ou rolagem (pointer-events-none). A logo INET aparece emoldurada por
 * um traço de fibra óptica que se desenha enquanto o véu se abre suavemente.
 * Com prefers-reduced-motion ativo, não renderiza nada.
 */

const DURATION_MS = 540;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let booted = false;

export default function PageLoader() {
  const { pathname } = useLocation();
  const [active, setActive] = useState<boolean>(() => !booted && !reduced());
  const [cycle, setCycle] = useState(0);

  // Primeira abertura do site
  useEffect(() => {
    if (booted) return;
    booted = true;
    if (reduced()) {
      setActive(false);
      return;
    }
    setActive(true);
    const t = window.setTimeout(() => setActive(false), DURATION_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Troca de rota: véu curto não-bloqueante (≤ 540 ms), página utilizável imediatamente
  useEffect(() => {
    if (!booted || reduced()) return;
    setCycle((c) => c + 1);
    setActive(true);
    const t = window.setTimeout(() => setActive(false), DURATION_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      key={cycle}
      aria-hidden="true"
      data-page-loader="veil"
      className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-[#010818]"
      style={{
        animation: `inet-veil-out ${DURATION_MS}ms ${EASE} forwards`,
      }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          animation: `inet-mark-trace ${DURATION_MS}ms ${EASE} forwards`,
        }}
      >
        <svg
          viewBox="0 0 260 110"
          className="h-auto w-[clamp(10rem,20vw,15rem)] overflow-visible"
          fill="none"
        >
          <defs>
            <linearGradient id="inet-veil-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0062EC" />
              <stop offset="55%" stopColor="#5CC8FF" />
              <stop offset="100%" stopColor="#70E000" />
            </linearGradient>
          </defs>
          <path
            d="M 24 76 C 58 18, 202 18, 236 76"
            stroke="url(#inet-veil-stroke)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="280"
            style={{
              animation: `inet-stroke-draw ${DURATION_MS}ms ${EASE} forwards`,
            }}
          />
        </svg>
        <img
          src="/inet-logo-branca.png"
          alt=""
          width={240}
          height={84}
          className="absolute h-auto w-[clamp(6.5rem,13vw,9.5rem)]"
        />
      </div>
    </div>
  );
}
