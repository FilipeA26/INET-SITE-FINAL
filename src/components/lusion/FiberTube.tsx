import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SPRING } from "../../motion";
import { planBranches, type Anchor, type Pt } from "./tube-branches";

/**
 * Luz de fibra no fundo de todas as páginas (referência: a pincelada da home do lusion.co).
 *
 * Um traço fino com brilho suave, desenhado pela rolagem (stroke-dashoffset puxado por uma mola com
 * os valores de SPRING) e terminando numa ponta luminosa. Ele mora ATRÁS do conteúdo: o SVG fica em
 * z -1 dentro do #top isolado, acima do fundo do mar (DeepSea, -z-10) e abaixo de tudo no main.
 * Texto e cartões ficam por cima sem nenhum recorte; onde a seção tem fundo opaco, a luz passa por trás.
 *
 * As faixas claras (neve) são opacas, então ali uma segunda camada (acima do main, mix-blend multiply,
 * limitada às faixas) desenha o mesmo traço em azul #0062EC sólido, sem brilho: sobre letra escura o
 * multiply não muda nada, sobre o #EFF3F9 vira tinta azul. Cartões e mídias da faixa a cobrem.
 *
 * Quando a ponta passa por um título de seção ou uma imagem grande, a luz "encosta" e abre 2–4 fios
 * finos (tube-branches.ts) que correm até cartões e imagens vizinhos e se apagam devagar. Tudo é função
 * da rolagem: rolar para cima desfaz. Na Home a luz só nasce depois do hero.
 *
 * Custo: geometria recalculada só quando a página muda (rota, altura, fontes); por quadro mudam só
 * dashoffsets e opacidades, e o rAF para quando a mola assenta.
 */

type Box = { l: number; t: number; r: number; b: number };
type Wire = { el: SVGPathElement; ink: SVGPathElement; dot: SVGCircleElement; inkDot: SVGCircleElement; len: number; at: number; delay: number };

const SVG_NS = "http://www.w3.org/2000/svg";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const alpha = (color: string) => {
  if (!color || color === "transparent") return 0;
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length > 3 ? parseFloat(parts[3]) : 1;
};

export default function FiberTube() {
  const back = useRef<SVGSVGElement>(null);
  const snow = useRef<SVGSVGElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const svg = back.current;
    const ink = snow.current;
    const host = svg?.parentElement;
    const root = document.getElementById("top");
    if (!svg || !ink || !host || !root) return;
    // uma luz só: a instância global é a do layout; qualquer outra fica desligada
    if (host !== root) {
      svg.style.display = ink.style.display = "none";
      return;
    }
    const main = document.getElementById("conteudo");
    if (!main) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const cables = [...svg.querySelectorAll<SVGPathElement>("[data-cable]"), ...ink.querySelectorAll<SVGPathElement>("[data-cable]")];
    const probe = cables[0];
    const head = svg.querySelector<SVGGElement>("[data-head]")!;
    const inkHead = ink.querySelector<SVGCircleElement>("[data-head]")!;
    const wiresG = svg.querySelector<SVGGElement>("[data-wires]")!;
    const inkWiresG = ink.querySelector<SVGGElement>("[data-wires]")!;
    const bands = ink.querySelector<SVGGElement>("[data-bands]")!;
    const covers = ink.querySelector<SVGGElement>("[data-covers]")!;
    const frosted = svg.querySelector<SVGGElement>("[data-frost]")!;
    const backBase = svg.querySelector<SVGRectElement>("[data-base]")!;

    let total = 0;
    let drawn = 0;
    let velocity = 0;
    let raf = 0;
    let last = 0;
    let geomDirty = true;
    let mobile = false;
    let vh = innerHeight;
    let geomTimer = 0;
    let coverTimer = 0;
    let coverTimer2 = 0;
    let coverTimer3 = 0;
    let snowBoxes: Box[] = [];
    let wires: Wire[] = [];
    // tabela comprimento → ponto (amostrada a cada ~6 px) para não chamar getPointAtLength por quadro
    let table: Pt[] = [];
    let step = 6;

    const pointAt = (len: number): Pt => {
      if (!table.length) return { x: 0, y: 0 };
      const f = Math.max(0, Math.min(table.length - 1, len / step));
      const i = Math.floor(f), j = Math.min(table.length - 1, i + 1), t = f - i;
      return { x: table[i].x + (table[j].x - table[i].x) * t, y: table[i].y + (table[j].y - table[i].y) * t };
    };
    /** As curvas têm tangente vertical nas viradas, então o y nunca volta: dá para buscar o comprimento por y. */
    const lengthAtY = (y: number) => {
      let lo = 0, hi = table.length - 1;
      if (hi < 1) return 0;
      if (y <= table[0].y) return 0;
      if (y >= table[hi].y) return total;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (table[mid].y < y) lo = mid; else hi = mid;
      }
      const a = table[lo], b = table[hi];
      const t = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y);
      return Math.min(total, (lo + t) * step);
    };
    const inSnow = (p: Pt) => snowBoxes.some((b) => p.y >= b.t && p.y <= b.b);

    const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>) => {
      const n = document.createElementNS(SVG_NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };

    /**
     * Cartões, mídias e [data-tube-hide] dentro das faixas claras escondem o traço de tinta (ele passa por trás);
     * no escuro, cartões de vidro deixam a luz fosca.
     */
    const buildCovers = () => {
      const top = svg.getBoundingClientRect().top;
      const w = document.documentElement.clientWidth;
      const parts: string[] = [];
      for (const band of main.querySelectorAll<HTMLElement>(".tone-snow, [data-tone=light]")) {
        for (const c of band.querySelectorAll<HTMLElement>("*")) {
          const cs = getComputedStyle(c);
          // mídias, [data-tube-hide] e tudo que tem fundo próprio (cartões, chips, botões)
          const solid = alpha(cs.backgroundColor) >= 0.25 || cs.backgroundImage !== "none";
          if (!solid && !/^(IMG|VIDEO|PICTURE|IFRAME)$/.test(c.tagName) && !c.hasAttribute("data-tube-hide")) continue;
          if (cs.pointerEvents === "none" && !solid) continue;
          const r = c.getBoundingClientRect();
          // sem filtro de opacidade: um cartão ainda na revelação (opacidade 0 subindo) já cobre o traço
          if (r.width < 2 || r.height < 2 || r.width >= w - 8 || cs.visibility === "hidden") continue;
          const rx = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.height / 2, r.width / 2);
          parts.push(`<rect x="${r.left.toFixed(1)}" y="${(r.top - top).toFixed(1)}" width="${r.width.toFixed(1)}" height="${r.height.toFixed(1)}" rx="${rx.toFixed(1)}"/>`);
        }
      }
      covers.innerHTML = parts.join("");

      // cartões de vidro (fundo translúcido ou desfoque) no escuro: a luz atrás deles fica fosca,
      // o cartão inteiro de uma vez (nunca por palavra). Os presos (sticky) se movem: ficam de fora.
      const frost: string[] = [];
      const hide: string[] = [];
      for (const c of main.querySelectorAll<HTMLElement>("*")) {
        const cs = getComputedStyle(c);
        // mídias com borda esfumada (máscara, vinheta) deixariam a luz aparecer através delas: a caixa inteira tampa
        if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(c.tagName)) {
          if (c.closest(".tone-snow, [data-tone=light]") || c.closest("[class*='sticky']")) continue;
          const r = c.getBoundingClientRect();
          if (r.width < 24 || r.height < 24 || r.width >= w - 8 || cs.visibility === "hidden") continue;
          const rx = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.height / 2, r.width / 2);
          hide.push(`<rect x="${r.left.toFixed(1)}" y="${(r.top - top).toFixed(1)}" width="${r.width.toFixed(1)}" height="${r.height.toFixed(1)}" rx="${rx.toFixed(1)}"/>`);
          continue;
        }
        const rad = parseFloat(cs.borderTopLeftRadius) || 0;
        if (rad < 8) continue;
        const a = alpha(cs.backgroundColor);
        const blur = cs.backdropFilter && cs.backdropFilter !== "none";
        if (!(a > 0.01 && a < 0.95) && !blur) continue;
        // manchas de brilho decorativas (sem ponteiro, desfocadas) não são cartões
        if (cs.pointerEvents === "none" || (cs.filter !== "none" && cs.filter.includes("blur"))) continue;
        if (c.closest(".tone-snow, [data-tone=light]") || c.closest("[class*='sticky']")) continue;
        const r = c.getBoundingClientRect();
        if (r.width < 24 || r.height < 24 || r.width >= w - 8 || parseFloat(cs.opacity) < 0.15) continue;
        const rx = Math.min(rad, r.height / 2, r.width / 2);
        frost.push(`<rect x="${r.left.toFixed(1)}" y="${(r.top - top).toFixed(1)}" width="${r.width.toFixed(1)}" height="${r.height.toFixed(1)}" rx="${rx.toFixed(1)}"/>`);
      }
      frosted.innerHTML = `<g>${frost.join("")}</g><g fill="#000000">${hide.join("")}</g>`;
    };

    const buildGeometry = () => {
      geomDirty = false;
      const w = document.documentElement.clientWidth;
      vh = innerHeight;
      // zera a própria altura antes de medir: o SVG absoluto não pode segurar a página alta
      svg.style.height = ink.style.height = "0px";
      const top = svg.getBoundingClientRect().top;
      const footer = document.querySelector("footer");
      const h = Math.max(1, footer ? footer.getBoundingClientRect().top - top : main.getBoundingClientRect().bottom - top);
      for (const s of [svg, ink]) {
        s.style.height = `${h}px`;
        s.setAttribute("viewBox", `0 0 ${w} ${h}`);
      }
      backBase.setAttribute("width", String(w));
      backBase.setAttribute("height", String(h));
      mobile = w < 640;

      // termina antes do contato final da Home (quando existe) e sempre antes do rodapé
      const finale = main.querySelector<HTMLElement>(".inet-connect-finale");
      let end = Math.max(vh, Math.min(h - 40, finale ? finale.getBoundingClientRect().top - top - 40 : h - 40));

      // seções de nível superior: cada uma ganha uma virada do traço
      const all = [...main.querySelectorAll<HTMLElement>("section")];
      const tops = all
        .filter((s) => !all.some((o) => o !== s && o.contains(s)) && !s.classList.contains("inet-connect-finale"))
        .map((s) => ({ el: s, r: s.getBoundingClientRect() }))
        .sort((a, b) => a.r.top - b.r.top);
      // na Home o hero fica limpo (só as fibras caindo): a luz nasce logo depois dele
      const hero = pathname === "/" && tops[0]?.el.querySelector("h1") ? tops[0].r : null;
      const start = hero ? Math.max(0, hero.bottom - top) : 0;
      end = Math.max(end, start + vh);
      const sections = tops
        .map(({ r }) => r)
        .filter((r) => r.height > 120 && r.top - top >= start - 1)
        .map((r) => ({ top: r.top - top, bottom: r.bottom - top }));

      // viradas alternadas perto das bordas; entre elas o traço cruza a tela num arco largo
      const L = w * (mobile ? 0.1 : 0.12), R = w * (mobile ? 0.9 : 0.88);
      const firstY = start + Math.min(vh * 0.45, (end - start) * 0.5);
      const maxGap = vh * (mobile ? 0.85 : 1.25);
      const ys = [firstY];
      sections.forEach((s, i) => {
        const y = s.top + (s.bottom - s.top) * (i % 2 ? 0.62 : 0.4);
        const prev = ys[ys.length - 1];
        if (y <= prev + 260 || y >= end - 160) return;
        const n = Math.ceil((y - prev) / maxGap);
        for (let k = 1; k <= n; k++) ys.push(prev + ((y - prev) * k) / n);
      });
      const lastY = ys[ys.length - 1];
      const n = Math.max(0, Math.ceil((end - lastY) / maxGap) - 1);
      for (let k = 1; k <= n; k++) ys.push(lastY + ((end - lastY) * k) / (n + 1));
      const turns: Pt[] = ys.map((y, i) => ({ x: i % 2 ? R : L, y }));
      if (end > turns[turns.length - 1].y + 120) turns.push({ x: w * 0.5, y: end });

      // entra pela direita, fora da tela, e varre até a primeira virada
      const t0 = turns[0];
      const lead = Math.min(vh * 0.4, t0.y - start - 20);
      let d = `M ${w + 40} ${t0.y - lead} C ${w * 0.55} ${t0.y - lead * 0.9}, ${t0.x} ${t0.y - lead * 0.55}, ${t0.x} ${t0.y}`;
      for (let i = 1; i < turns.length; i++) {
        const a = turns[i - 1], b = turns[i];
        const k = (b.y - a.y) * 0.55;
        // tangentes verticais nas viradas: curvas em C, y sempre descendo
        d += ` C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`;
      }

      for (const c of cables) c.setAttribute("d", d);
      total = probe.getTotalLength();
      step = Math.max(4, total / 6000);
      table = [];
      for (let s = 0; s <= total; s += step) {
        const p = probe.getPointAtLength(s);
        table.push({ x: p.x, y: p.y });
      }
      for (const c of cables) c.style.strokeDasharray = `${total} ${total}`;

      // faixas claras: onde a camada de tinta aparece
      snowBoxes = [...main.querySelectorAll<HTMLElement>(".tone-snow, [data-tone=light]")]
        .filter((b) => !b.parentElement?.closest(".tone-snow, [data-tone=light]"))
        .map((b) => {
          const r = b.getBoundingClientRect();
          return { l: 0, t: r.top - top, r: w, b: r.bottom - top };
        });
      bands.innerHTML = snowBoxes.map((b) => `<rect x="0" y="${b.t.toFixed(1)}" width="${w}" height="${(b.b - b.t).toFixed(1)}"/>`).join("");
      buildCovers();

      // fios: planejados a partir do DOM e recriados nas duas camadas
      const anchors: Anchor[] = planBranches({ main, top, start, end, w, vh, mobile, pointAt, lengthAtY });
      wiresG.innerHTML = "";
      inkWiresG.innerHTML = "";
      wires = [];
      for (const a of anchors)
        a.branches.forEach((b, i) => {
          const glow = el("path", { d: b.d, class: "ft-wire" });
          const line = el("path", { d: b.d, class: "ft-wire-ink" });
          const dot = el("circle", { cx: b.end.x.toFixed(1), cy: b.end.y.toFixed(1), r: mobile ? "2.2" : "2.8", class: "ft-wire-dot" });
          const inkDot = el("circle", { cx: b.end.x.toFixed(1), cy: b.end.y.toFixed(1), r: "2.4", class: "ft-wire-ink-dot" });
          wiresG.append(glow, dot);
          inkWiresG.append(line, inkDot);
          const len = glow.getTotalLength();
          for (const p of [glow, line]) p.style.strokeDasharray = `${len} ${len}`;
          wires.push({ el: glow, ink: line, dot, inkDot, len, at: a.at, delay: i * (mobile ? 40 : 56) });
        });
      if (reduced.matches) drawn = total;
      else drawn = Math.min(drawn, total);
    };

    const targetLength = () => {
      const max = root.scrollHeight - innerHeight;
      if (scrollY >= max - 4) return total;
      const top = svg.getBoundingClientRect().top + scrollY;
      return lengthAtY(scrollY - top + innerHeight * (mobile ? 0.68 : 0.75));
    };

    const paint = () => {
      const still = reduced.matches;
      for (const c of cables) c.style.strokeDashoffset = `${total - drawn}`;
      // fios: crescem na velocidade do traço, ficam um trecho e se apagam ao longo de ~meia tela de rolagem
      for (const w of wires) {
        const local = drawn - w.at - w.delay;
        const grow = w.len * 1.15;
        const prog = still ? 1 : clamp(local / grow);
        const fade = still ? 0.55 : local <= 0 ? 0 : 1 - clamp((local - grow - vh * 0.3) / (vh * 0.7));
        const off = `${w.len * (1 - prog)}`;
        w.el.style.strokeDashoffset = w.ink.style.strokeDashoffset = off;
        w.el.style.opacity = w.ink.style.opacity = `${fade}`;
        const dotOp = `${prog >= 1 ? fade : 0}`;
        w.dot.style.opacity = w.inkDot.style.opacity = dotOp;
      }
      if (still) {
        head.style.opacity = "0";
        inkHead.style.opacity = "0";
        return;
      }
      const tip = pointAt(drawn);
      const on = drawn > 4 && drawn < total - 2;
      const light = inSnow(tip);
      head.setAttribute("transform", `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) scale(${mobile ? 0.7 : 1})`);
      head.style.opacity = on && !light ? "1" : "0";
      inkHead.setAttribute("cx", tip.x.toFixed(1));
      inkHead.setAttribute("cy", tip.y.toFixed(1));
      inkHead.style.opacity = on && light ? "1" : "0";
    };

    const frame = (now: number) => {
      raf = 0;
      if (document.hidden) return;
      if (geomDirty) buildGeometry();
      const dt = Math.min(0.064, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const target = reduced.matches ? total : targetLength();
      if (reduced.matches) {
        drawn = target;
        velocity = 0;
      } else {
        // mola com a mesma rigidez/amortecimento do resto do site (SPRING), em subpassos estáveis
        const n = Math.ceil(dt / 0.008);
        for (let i = 0; i < n; i++) {
          const h = dt / n;
          const acc = (-SPRING.stiffness * (drawn - target) - SPRING.damping * velocity) / SPRING.mass;
          velocity += acc * h;
          drawn += velocity * h;
        }
      }
      const settled = Math.abs(target - drawn) < 0.5 && Math.abs(velocity) < 0.5;
      if (settled) {
        drawn = target;
        velocity = 0;
      }
      paint();
      // rAF só enquanto a luz ainda se move (fora da tela ou parada, nada roda)
      if (!settled) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    // mudanças de altura chegam em rajadas (imagens, acordeões, páginas sob demanda): espera assentar
    const rebuild = () => {
      clearTimeout(geomTimer);
      geomTimer = window.setTimeout(() => {
        geomDirty = true;
        wake();
      }, 120);
    };
    // cartões sobem com as revelações: refaz coberturas e fosco quando a rolagem para
    const recover = () => {
      // três passadas: logo que a rolagem para, no meio e quando as revelações (atraso + DUR) já pousaram
      clearTimeout(coverTimer);
      clearTimeout(coverTimer2);
      clearTimeout(coverTimer3);
      coverTimer = window.setTimeout(buildCovers, 300);
      coverTimer2 = window.setTimeout(buildCovers, 1500);
      coverTimer3 = window.setTimeout(buildCovers, 3200);
    };
    const onVisibility = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : wake());
    const onScroll = () => {
      recover();
      if (!reduced.matches) wake();
    };
    const onFonts = () => rebuild();

    const ro = new ResizeObserver(rebuild);
    ro.observe(root);
    ro.observe(main);
    window.addEventListener("resize", rebuild);
    window.addEventListener("load", rebuild);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", rebuild);
    document.fonts?.ready.then(onFonts);
    drawn = 0;
    velocity = 0;
    svg.style.display = ink.style.display = "";
    wake();
    recover();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(geomTimer);
      clearTimeout(coverTimer);
      clearTimeout(coverTimer2);
      clearTimeout(coverTimer3);
      ro.disconnect();
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("load", rebuild);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", rebuild);
    };
  }, [pathname]);

  return (
    <>
      <style>{`
:is(.inet-fiber,.inet-fiber-ink) path{fill:none;stroke-linecap:round;stroke-linejoin:round}
.inet-fiber .ft-glow{stroke:#0062EC;stroke-width:9px;opacity:.16}
.inet-fiber .ft-core{stroke:#3B8BFF;stroke-width:2px}
.inet-fiber .ft-wire{stroke:#3B8BFF;stroke-width:1.1px}
.inet-fiber .ft-wire-dot{fill:#CFE3FF}
.inet-fiber-ink{mix-blend-mode:multiply}
.inet-fiber-ink .ft-ink{stroke:#0062EC;stroke-width:1.6px}
.inet-fiber-ink .ft-wire-ink{stroke:#0062EC;stroke-width:1px}
.inet-fiber-ink .ft-wire-ink-dot,.inet-fiber-ink [data-head]{fill:#0062EC}
@media (max-width:639px){.inet-fiber .ft-core{stroke-width:1.6px}.inet-fiber .ft-glow{stroke-width:7px}}
#top:has([aria-modal="true"]) :is(.inet-fiber,.inet-fiber-ink){visibility:hidden}
@media (prefers-reduced-motion:reduce){
  :is(.inet-fiber,.inet-fiber-ink) [data-cable]{stroke-dasharray:none!important;stroke-dashoffset:0!important}
  :is(.inet-fiber,.inet-fiber-ink) [data-head]{display:none}
}`}</style>
      {/* camada principal: atrás do main (z -1 no #top isolado), acima do fundo do mar */}
      <svg
        ref={back}
        aria-hidden="true"
        focusable="false"
        className="inet-fiber pointer-events-none absolute left-0 top-0 -z-[1] w-full overflow-hidden"
        xmlns={SVG_NS}
      >
        <defs>
          <radialGradient id="inet-fiber-head">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset=".25" stopColor="#CFE3FF" stopOpacity=".9" />
            <stop offset=".6" stopColor="#0062EC" stopOpacity=".3" />
            <stop offset="1" stopColor="#0062EC" stopOpacity="0" />
          </radialGradient>
          {/* fosco: sob cada cartão de vidro a luz cai para ~25% */}
          <mask id="inet-fiber-frost" maskUnits="userSpaceOnUse">
            <rect data-base="" x="0" y="0" fill="#FFFFFF" />
            <g data-frost="" fill="#404040" />
          </mask>
        </defs>
        <g mask="url(#inet-fiber-frost)">
          <path data-cable="" className="ft-glow" />
          <path data-cable="" className="ft-core" />
          <g data-wires="" />
          <g data-head="" style={{ opacity: 0 }}>
            <circle r="22" fill="url(#inet-fiber-head)" />
            <circle r="3" fill="#FFFFFF" />
          </g>
        </g>
      </svg>
      {/* tinta nas faixas claras: acima do main em multiply, só dentro das faixas, coberta por cartões e mídias */}
      <svg
        ref={snow}
        aria-hidden="true"
        focusable="false"
        className="inet-fiber-ink pointer-events-none absolute left-0 top-0 z-20 w-full overflow-hidden"
        xmlns={SVG_NS}
      >
        <defs>
          <mask id="inet-fiber-bands" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <g data-bands="" fill="#FFFFFF" />
            <g data-covers="" fill="#000000" />
          </mask>
        </defs>
        <g mask="url(#inet-fiber-bands)">
          <path data-cable="" className="ft-ink" />
          <g data-wires="" />
          <circle data-head="" r="3.2" style={{ opacity: 0 }} />
        </g>
      </svg>
    </>
  );
}
