import type { ReactNode } from "react";
import CinematicCanvas from "./CinematicCanvas";

export type SectionBackdropVariant =
  | "ink" //       escuro contínuo, transparente: deixa ver o fundo do mar (DeepSea) por trás
  | "mist" //      escuro com uma luz suave localizada (azul INET / ciano)
  | "snow" //      claro-neve #EFF3F9 (com a camada de profundidade da rodada 5 via .tone-snow)
  | "cinematic"; // canvas cinematográfico leve: névoa, filamentos de fibra, plâncton e grão de 35 mm

export interface SectionBackdropProps {
  variant?: SectionBackdropVariant;
  className?: string;
  /** Com filhos, vira a própria <section>; sem filhos, é uma camada absoluta dentro de uma seção `relative isolate`. */
  children?: ReactNode;
  /** Onde fica a luz da variante "mist". */
  glowPosition?: "center" | "top-right" | "top-left" | "bottom" | "top";
  /** Intensidade da luz em "mist" (0,05 a 0,5). */
  glowIntensity?: number;
  /** Degradê de borda com a seção vizinha (corte suave em vez de seco). */
  transition?: "none" | "fade-top" | "fade-bottom" | "fade-both";
  id?: string;
  as?: "section" | "div" | "article";
}

const GLOW: Record<NonNullable<SectionBackdropProps["glowPosition"]>, string> = {
  center: "50% 50%",
  "top-right": "85% 15%",
  "top-left": "15% 15%",
  bottom: "50% 90%",
  top: "50% 10%",
};

/**
 * Fundo cinematográfico por seção (nota "image-c-users-yuzzi-maest": "estética mais premium, cinematográfica,
 * pode cortar em algumas seções"). Portado do P6, sem o tubo de fibra antigo (a luz global é a do App).
 *
 * - A camada fica em -z-10 dentro da seção isolada: atrás do conteúdo, por cima do fundo do mar.
 * - "cinematic" usa CinematicCanvas, que só anima a instância mais visível (no máximo 1 canvas vivo por vez),
 *   pausa fora da tela e com a aba oculta, DPR ≤ 2 e fica parado com prefers-reduced-motion.
 * - Sem overflow-hidden na seção (os títulos revelados não podem ser cortados): quem recorta é a própria camada.
 *
 * Uso como camada:   <section className="relative isolate ..."><SectionBackdrop variant="cinematic" /> ...</section>
 * Uso como wrapper:  <SectionBackdrop variant="mist" glowPosition="top-left" id="planos"> ... </SectionBackdrop>
 */
export default function SectionBackdrop({
  variant = "ink",
  className = "",
  children,
  glowPosition = "top-right",
  glowIntensity = 0.28,
  transition = "none",
  id,
  as: Tag = "section",
}: SectionBackdropProps) {
  const layer = (
    <>
      <div aria-hidden="true" data-backdrop={variant} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {variant === "snow" && <div className="absolute inset-0 bg-[#EFF3F9]" />}
        {variant === "mist" && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle 650px at ${GLOW[glowPosition]}, rgb(0 98 236 / ${glowIntensity}) 0%, rgb(92 200 255 / ${glowIntensity * 0.45}) 35%, rgb(1 8 24 / 0) 70%)`,
            }}
          />
        )}
        {variant === "cinematic" && <CinematicCanvas />}
      </div>
      {transition !== "none" && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {(transition === "fade-top" || transition === "fade-both") && (
            <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${variant === "snow" ? "from-[#EFF3F9]" : "from-navy-ink"} to-transparent`} />
          )}
          {(transition === "fade-bottom" || transition === "fade-both") && (
            <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${variant === "snow" ? "from-[#EFF3F9]" : "from-navy-ink"} to-transparent`} />
          )}
        </div>
      )}
    </>
  );

  if (!children) return layer;

  return (
    <Tag id={id} className={`relative isolate w-full ${variant === "snow" ? "tone-snow" : "text-white"} ${className}`}>
      {layer}
      {children}
    </Tag>
  );
}
