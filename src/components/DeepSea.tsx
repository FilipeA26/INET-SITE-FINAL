import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fundo do mar com cabos de fibra (notas "adicionar-mais-dinamismo", "stock-adobe" e "referencias-3"):
 * um único canvas 2D fixo atrás de todo o conteúdo. Os cabos correm pelo leito do mar conforme a página rola.
 *
 * - Ancorado em #010818 no topo e na base para não criar salto de cor nem faixas diagonais nas fronteiras.
 * - Some no herói e também suaviza perto do rodapé/ConnectFinale.
 * - Pausa com a aba oculta, quando invisível e quando uma faixa clara cobre a tela.
 */

const INK = "#010818";
const BLUE = "0, 98, 236";
const CYAN = "92, 200, 255";
const LIME = "112, 224, 0";

export default function DeepSea() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let W = 0, H = 0, raf = 0, last = 0, t = 0, opacity = 0, covered = false;
    const snow = Array.from({ length: 32 }, (_, i) => ({
      x: ((i * 0.618) % 1), y: ((i * 0.382 + 0.1) % 1), r: 0.5 + (i % 3) * 0.4, v: 0.004 + (i % 5) * 0.002, a: 0.05 + (i % 4) * 0.03,
    }));

    const resize = () => {
      W = innerWidth;
      H = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const progress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    };

    /** leito do mar suave */
    const floorY = (xw: number) =>
      H * 0.86 + 14 * Math.sin(xw * 0.0042) + 8 * Math.sin(xw * 0.011 + 1.3) + 3 * Math.sin(xw * 0.033 + 0.4);

    const draw = () => {
      const p = progress();
      const travel = W * 2.2;
      const cam = Math.min(1, p / 0.75) * travel;
      ctx.clearRect(0, 0, W, H);

      // água: ancorada em #010818 no topo e na base para zero salto entre seções
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, INK);
      g.addColorStop(0.5, "rgba(2, 14, 42, 0.55)");
      g.addColorStop(1, INK);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // partículas marinhas discretas
      for (const s of snow) {
        const px = ((s.x * W + Math.sin(t * 0.3 + s.y * 9) * 12) % W + W) % W;
        const py = (((s.y - t * s.v) % 1) + 1) % 1 * H;
        ctx.fillStyle = `rgba(${CYAN}, ${s.a})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // leito do mar fundido em #010818 com fio de luz azul na crista
      const step = W < 640 ? 10 : 14;
      ctx.beginPath();
      ctx.moveTo(-10, H);
      for (let x = -10; x <= W + 10; x += step) ctx.lineTo(x, floorY(x + cam));
      ctx.lineTo(W + 10, H);
      ctx.closePath();
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.strokeStyle = `rgba(${BLUE}, 0.14)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // três cabos de fibra óptica pelo leito com pulsos suaves
      const cables = [
        { off: 5, rgb: BLUE, a: 0.36, w: 1.5 },
        { off: 10, rgb: CYAN, a: 0.22, w: 1.0 },
        { off: 15, rgb: LIME, a: 0.20, w: 1.0 },
      ];
      cables.forEach((c, k) => {
        const yAt = (x: number) => floorY(x + cam) - c.off + Math.sin((x + cam) * 0.02 + k) * 1.2;
        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += step) (x === -20 ? ctx.moveTo : ctx.lineTo).call(ctx, x, yAt(x));
        ctx.strokeStyle = `rgba(${c.rgb}, ${c.a * 0.32})`;
        ctx.lineWidth = c.w * 3.5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${c.rgb}, ${c.a})`;
        ctx.lineWidth = c.w;
        ctx.stroke();
        for (let j = 0; j < 2; j++) {
          const u = ((t * (0.035 + k * 0.01) + j * 0.5 + k * 0.21) % 1);
          const px = -20 + u * (W + 40);
          const py = yAt(px);
          const gl = ctx.createRadialGradient(px, py, 0, px, py, 10);
          gl.addColorStop(0, `rgba(${c.rgb}, 0.7)`);
          gl.addColorStop(1, `rgba(${c.rgb}, 0)`);
          ctx.fillStyle = gl;
          ctx.fillRect(px - 10, py - 10, 20, 20);
        }
      });
    };

    /** herói limpo e saída suave antes do ConnectFinale e do rodapé */
    const fade = () => {
      const kIn = (scrollY - innerHeight * 0.55) / (innerHeight * 0.6);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const kOut = maxScroll > innerHeight ? (maxScroll - scrollY - innerHeight * 0.65) / (innerHeight * 0.6) : 1;
      opacity = Math.min(1, Math.max(0, Math.min(kIn, kOut)));
      canvas.style.opacity = String(opacity * 0.85);
    };

    const running = () => !document.hidden && opacity > 0.01 && !covered && !reduce.matches;
    const loop = (now: number) => {
      raf = 0;
      if (!running()) return;
      if (now - last >= 33) {
        t += Math.min(0.1, (now - last) / 1000);
        last = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && running()) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const onScroll = () => {
      fade();
      if (reduce.matches && opacity > 0) draw();
      kick();
    };

    const seen = new Map<Element, number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0);
      covered = [...seen.values()].some((h) => h >= innerHeight - 2);
      kick();
    }, { threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] });
    const watch = () => document.querySelectorAll(".tone-snow, [data-tone=light]").forEach((el) => io.observe(el));
    const t1 = window.setTimeout(watch, 600);

    resize();
    fade();
    draw();
    kick();
    const onResize = () => { resize(); draw(); };
    addEventListener("resize", onResize);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", kick);
    reduce.addEventListener("change", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      io.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", kick);
      reduce.removeEventListener("change", onScroll);
    };
  }, [pathname]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-deep-sea=""
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-700"
      style={{ opacity: 0 }}
    />
  );
}
