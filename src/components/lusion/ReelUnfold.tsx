import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { SPRING } from "../../motion";
import useMotionPreference from "../home/useMotionPreference";

/**
 * ReelUnfold — Puxada 3D do vídeo/painel (inspirado na seção PLAY REEL do lusion.co).
 *
 * Mecânica:
 * 1. Entra pequeno, deslocado na lateral, inclinado e curvado em perspectiva 3D profunda
 *    (rotateX, rotateY, rotateZ, skewY, borderRadius assimétrico simulando folha curvada).
 * 2. Enquanto pequeno, o painel é tingido de azul elétrico (#003F99 / #0062EC) via camada de
 *    tingimento ótico (exatamente como no lusion, onde o thumbnail começa 100% azul monocromático).
 * 3. Com a rolagem, a malha desentorta, o brilho especular viaja pela dobra, o azul dissolve
 *    revelando as cores reais dos produtos, e o painel expande até preencher a tela inteira,
 *    fixo (sticky) durante a transição.
 * 4. Fotos e tela móvel já usadas no site, sem a tipografia monumental da referência.
 * 5. Em prefers-reduced-motion: o painel abre já 100% estendido e nítido, sem distorção 3D.
 */
export default function ReelUnfold() {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, SPRING);

  // Interpolação dimensional: de 0 (pequeno e dobrado) a 0.84 (tela cheia desdobrada)
  const scale = useTransform(progress, [0, 0.84, 1], [0.56, 1, 1]);
  const xOffset = useTransform(progress, [0, 0.84], ["-6%", "0%"]);
  const yOffset = useTransform(progress, [0, 0.84], ["3%", "0%"]);
  const rotateX = useTransform(progress, [0, 0.84], [22, 0]);
  const rotateY = useTransform(progress, [0, 0.84], [-18, 0]);
  const rotateZ = useTransform(progress, [0, 0.84], [3.5, 0]);
  const skewY = useTransform(progress, [0, 0.84], [-6, 0]);
  const skewX = useTransform(progress, [0, 0.84], [2, 0]);

  // Bordas curvadas assimétricas que simulam a curvatura de malha 32x32 do Lusion
  const borderRadius = useTransform(
    progress,
    [0, 0.84],
    ["26% 8% 24% 6% / 14% 10% 22% 8%", "0% 0% 0% 0% / 0% 0% 0% 0%"]
  );

  // Tingimento azul característico do Lusion quando pequeno, dissolvendo até 0
  const blueTintOpacity = useTransform(progress, [0, 0.65], [0.88, 0]);

  // Brilho especular correndo pela curvatura do painel
  const sheenOpacity = useTransform(progress, [0, 0.45, 0.84], [0.45, 0.25, 0]);
  const sheenPos = useTransform(progress, [0, 0.84], ["-20%", "120%"]);

  const sheenBackground = useTransform(sheenPos, pos => `linear-gradient(115deg, transparent ${pos}, rgba(255,255,255,.45) calc(${pos} + 12%), transparent calc(${pos} + 24%))`);

  return (
    <section
      ref={containerRef}
      className="inet-reel relative w-full select-none"
      aria-label="Produtos INET"
    >
      <style>{`
.inet-reel {
  height: 250svh;
}
.inet-reel-stage {
  position: sticky;
  top: 0;
  height: 100svh;
  width: 100%;
  display: grid;
  place-items: center;
  overflow: clip;
  perspective: 1400px;
  perspective-origin: 50% 50%;
}
.inet-reel-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background: #010A1F;
  isolation: isolate;
  overflow: clip;
  transform-origin: 48% 52%;
  box-shadow: 0 45px 95px -35px rgba(0, 16, 44, 0.95), 0 0 60px -20px rgba(0, 98, 236, 0.35);
  will-change: transform, border-radius;
}
.inet-reel-art {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 78% 28%, rgba(0, 98, 236, 0.42), transparent 55%),
    radial-gradient(ellipse at 22% 80%, rgba(56, 176, 0, 0.28), transparent 55%),
    radial-gradient(ellipse at 50% 50%, rgba(3, 37, 108, 0.5), transparent 75%);
}
.inet-reel-products {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.inet-reel-hero-device {
  position: absolute;
  width: clamp(280px, 40vw, 640px);
  max-height: 72svh;
  object-fit: contain;
  filter: drop-shadow(0 28px 50px rgba(0, 10, 30, 0.85));
  z-index: 2;
}
.inet-reel-sub-left {
  position: absolute;
  left: 5%;
  top: 14%;
  bottom: auto;
  width: clamp(100px, 10vw, 160px);
  object-fit: contain;
  transform: rotate(-8deg);
  filter: drop-shadow(0 20px 35px rgba(0, 10, 30, 0.75));
  opacity: 0.88;
  z-index: 1;
}
.inet-reel-sub-right {
  position: absolute;
  right: clamp(4%, 11vw, 16%);
  top: clamp(14%, 20svh, 26%);
  width: clamp(100px, 14vw, 220px);
  object-fit: contain;
  transform: rotate(6deg);
  filter: drop-shadow(0 20px 35px rgba(0, 10, 30, 0.75));
  opacity: 0.88;
  z-index: 1;
}
.inet-reel-smart{position:absolute;left:17%;bottom:9%;width:23%;object-fit:contain;z-index:1;filter:drop-shadow(0 20px 35px rgba(0,10,30,.65))}
.inet-reel-phone{position:absolute;right:5%;bottom:15%;width:19%;border-radius:1rem;object-fit:contain;z-index:1;transform:rotate(5deg)}
.inet-reel-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #003F99 0%, #0062EC 55%, #1A2FFB 100%);
  mix-blend-mode: color;
  pointer-events: none;
  z-index: 4;
}
.inet-reel-sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}
.inet-reel-cross {
  position: absolute;
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.35);
  font-family: monospace;
  font-size: 14px;
  line-height: 1;
  pointer-events: none;
  z-index: 3;
}
.inet-reel-badge {
  position: absolute;
  bottom: clamp(1.5rem, 4vh, 3.5rem);
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 1.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #FFFFFF;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  z-index: 6;
  pointer-events: none;
}
.inet-reel-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #70E000;
  box-shadow: 0 0 8px #70E000;
}
@media (max-width: 639px) {
  .inet-reel {
    height: 190svh;
  }
  .inet-reel-hero-device {
    width: 65%;
    max-height: 50svh;
  }
  .inet-reel-sub-left{display:block;left:4%;top:13%;bottom:auto;width:16%;max-height:42%;object-fit:contain}
  .inet-reel-sub-right{display:block;right:4%;top:12%;width:24%}
  .inet-reel-smart{left:3%;bottom:13%;width:43%}
  .inet-reel-phone{right:3%;bottom:18%;width:34%}

}
@media (prefers-reduced-motion: reduce) {
  .inet-reel {
    height: 100svh;
  }
  .inet-reel-stage {
    position: relative;
  }
  .inet-reel-panel {
    transform: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .inet-reel-tint,
  .inet-reel-sheen {
    display: none !important;
  }
}
`}</style>
      <div className="inet-reel-stage">
        <motion.div
          data-reel-panel=""
          className="inet-reel-panel"
          style={
            reduced
              ? {}
              : {
                  scale,
                  x: xOffset,
                  y: yOffset,
                  rotateX,
                  rotateY,
                  rotateZ,
                  skewY,
                  skewX,
                  borderRadius,
                }
          }
        >
          {/* Fundo radiante volumétrico com paleta INET */}
          <div className="inet-reel-art" aria-hidden="true" />

          {/* Marcadores de cruz ótica (estilo Lusion) nos quatro cantos */}
          <span className="inet-reel-cross top-6 left-6" aria-hidden="true">+</span>
          <span className="inet-reel-cross top-6 right-6" aria-hidden="true">+</span>
          <span className="inet-reel-cross bottom-6 left-6" aria-hidden="true">+</span>
          <span className="inet-reel-cross bottom-6 right-6" aria-hidden="true">+</span>

          {/* Composição de produtos reais da INET (sem nada inventado) */}
          <div className="inet-reel-products">
            {/* Dispositivo móvel 5G à esquerda */}
            <img
              src="/movel/site-mobile.webp"
              alt="Tela do site INET no celular"
              className="inet-reel-sub-left"
              width={240}
              height={480}
              loading="lazy"
            />

            {/* Receptor de TV INET com controle remoto (centro/herói) */}
            <img
              src="/inet-tv-receptor.webp"
              alt="Receptor INET TV Box e controle remoto"
              className="inet-reel-hero-device"
              width={760}
              height={732}
              loading="lazy"
            />

            {/* Câmera residencial inteligente à direita */}
            <img
              src="/casa/mibo.webp"
              alt="Câmera Wi-Fi residencial INET"
              className="inet-reel-sub-right"
              width={220}
              height={280}
              loading="lazy"
            />
            <img src="/casa-inteligente.webp" alt="Câmeras e Alexa" className="inet-reel-smart" width={904} height={616} loading="lazy" />
            <img src="/fixo/telefone-poster.webp" alt="Telefone fixo" className="inet-reel-phone" width={1280} height={720} loading="lazy" />
          </div>

          {/* Badge pílula de autenticidade ótica */}
          <div className="inet-reel-badge" aria-hidden="true">
            <span className="inet-reel-badge-dot" />
            <span>Fibra de ponta a ponta</span>
          </div>

          {/* Especular luminoso que viaja pela curvatura durante o desdobramento */}
          {!reduced && (
            <motion.div
              className="inet-reel-sheen"
              aria-hidden="true"
              style={{
                opacity: sheenOpacity,
                background: sheenBackground,
              }}
            />
          )}

          {/* Tingimento azul original do Lusion que se dissipa com a rolagem */}
          {!reduced && (
            <motion.div
              className="inet-reel-tint"
              aria-hidden="true"
              style={{ opacity: blueTintOpacity }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
