import { lazy, Suspense, useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import FiberTube from "./components/lusion/FiberTube";
import DeepSea from "./components/DeepSea";
import Home from "./pages/Home";

// páginas internas carregadas sob demanda (o mapa e os medidores não pesam na inicial)
const Internet = lazy(() => import("./pages/Internet"));
const Tv = lazy(() => import("./pages/Tv"));
const Fixo = lazy(() => import("./pages/Fixo"));
const Movel = lazy(() => import("./pages/Movel"));
const Entretenimento = lazy(() => import("./pages/Entretenimento"));
const Velocidade = lazy(() => import("./pages/Velocidade"));
const Cobertura = lazy(() => import("./pages/Cobertura"));
const Suporte = lazy(() => import("./pages/Suporte"));
const FaleConosco = lazy(() => import("./pages/FaleConosco"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Avaliacoes = lazy(() => import("./pages/Avaliacoes"));
const Combo = lazy(() => import("./pages/Combo"));
const NotFound = lazy(() => import("./pages/NotFound"));
// vitrine dos fundos por seção: só existe em desenvolvimento (o build de produção descarta)
const FundosExemplo = import.meta.env.DEV ? lazy(() => import("./components/fundos/Exemplo")) : null;

let lenis: Lenis | null = null;

/** Rolagem suave com inércia; âncoras "#" deslizam com a mesma curva. */
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9 });
    let raf = requestAnimationFrame(function loop(t) {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      lenis?.scrollTo(el as HTMLElement, { duration: 1.8, easing: (x) => 1 - Math.pow(1 - x, 4) });
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

/** Na troca de página volta ao topo; em links com "#seção", vai até a seção. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const go = () => {
      const el = hash ? document.querySelector(hash) : null;
      if (el) lenis ? lenis.scrollTo(el as HTMLElement, { offset: -90 }) : el.scrollIntoView();
      else lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    };
    const t = window.setTimeout(go, hash ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);
  return null;
}

function Layout() {
  useSmoothScroll();
  return (
    // isolate: o fundo do mar (-z-10) fica sobre a cor do site e abaixo de todo o conteúdo
    <div id="top" className="relative isolate min-h-screen bg-navy-ink">
      <DeepSea />
      <ScrollManager />
      <Header />
      {/* luz de fibra global: acima dos fundos das seções, recortada nas letras e cartões */}
      <FiberTube />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="internet" element={<Internet />} />
        <Route path="tv" element={<Tv />} />
        <Route path="telefone-fixo" element={<Fixo />} />
        <Route path="movel" element={<Movel />} />
        <Route path="entretenimento" element={<Entretenimento />} />
        <Route path="teste-de-velocidade" element={<Velocidade />} />
        <Route path="cobertura" element={<Cobertura />} />
        <Route path="suporte" element={<Suporte />} />
        <Route path="fale-conosco" element={<FaleConosco />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="avaliacoes" element={<Avaliacoes />} />
        <Route path="monte-seu-combo" element={<Combo />} />
        {FundosExemplo && <Route path="fundos-exemplo" element={<FundosExemplo />} />}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
