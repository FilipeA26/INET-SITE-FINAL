import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Gauge, Headset, UserRound, Wifi, ArrowUpRight,
} from "lucide-react";
import Hero from "../components/Hero";
import TvBoxStory from "../components/home/TvBoxStory";
import TvMediaRail from "../components/home/TvMediaRail";
import HomeSnowStyles from "../components/home/HomeSnowStyles";
import ServiceCards from "../components/lusion/ServiceCards";
import ConnectFinale from "../components/lusion/ConnectFinale";
import PlanCarousel from "../components/PlanCarousel";
import SlideToSubscribe from "../components/SlideToSubscribe";
import Lines, { Rise, Fit } from "../components/Lines";
import { Faq, LinkCard, usePageMeta } from "../components/ui";
import { COMPANY, PHONES, STORES, type Plan } from "../data/inet";

export default function Home() {
  usePageMeta("", "INET: internet fibra óptica em Teófilo Otoni com planos de até 1 Giga, Wi-Fi grátis, TV, telefone fixo e chip 5G. Atendimento (33) 3536-3939.");
  const [plan, setPlan] = useState<Plan | null>(null);

  return (
    <div className="r4-home relative">
      <HomeSnowStyles />
      <div className="relative z-10">
        <Hero />

        {/* planos */}
        <section id="planos" className="relative py-24 sm:py-32">
          <span data-node="left" className="absolute top-12" />
          <span data-node="left" className="absolute bottom-12" />
          <div className="wrap">
            <Rise><Fit className="tag normal-case">01 — Planos</Fit></Rise>
            <Lines className="h-lg mt-4 max-w-4xl" lines={["Deslize e", <span className="italic text-lime">escolha o seu.</span>]} />
            <Rise delay={0.2}><p className="lead mt-5 max-w-2xl">Fibra com Wi-Fi grátis. Escolha e deslize para assinar.</p></Rise>
            <div className="mt-10"><PlanCarousel selected={plan} onSelect={setPlan} /></div>
            <div id="assinar" className="mt-14"><SlideToSubscribe plan={plan} /></div>
            <div className="mt-5 flex justify-center">
              <Link to="/monte-seu-combo" className="btn-ghost">Monte seu combo</Link>
            </div>
          </div>
        </section>

        {/* propaganda INET TV */}
        <TvBoxStory />
        <TvMediaRail />

        {/* o que a INET oferece */}
        <section className="relative py-24 sm:py-32">
          <span data-node="left" className="absolute top-12" />
          <span data-node="left" className="absolute bottom-12" />
          <div className="wrap">
            <Rise><Fit className="tag normal-case">03 — Serviços</Fit></Rise>
            <Lines className="h-lg mt-4 max-w-4xl" lines={["Tudo o que conecta", "a sua casa."]} />
            <ServiceCards />
          </div>
        </section>

        {/* por que INET — conteúdo do site anterior */}


        {/* autoatendimento */}
        <section id="autoatendimento" className="relative py-24 sm:py-32">
          <span data-node="left" className="absolute top-12" />
          <span data-node="left" className="absolute bottom-12" />
          <div className="wrap">
            <Rise><Fit className="tag normal-case">04 — Autoatendimento</Fit></Rise>
            <Lines className="h-lg mt-4 max-w-4xl" lines={["Resolva rápido,", "sem sair de casa."]} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Rise className="h-full">
                <a href={COMPANY.clientArea} target="_blank" rel="noreferrer" className="card flex h-full flex-col p-7">
                  <span className="card-icon flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-navy-ink"><UserRound size={22} aria-hidden="true" /></span>
                  <h3 className="mt-8 font-display text-xl">Central do Cliente</h3>
                  <p className="mt-2 text-sm text-white/65">Faturas, segunda via e dados do contrato.</p>
                  <span className="card-link mt-auto pt-5">Acessar <ArrowUpRight size={15} aria-hidden="true" /></span>
                </a>
              </Rise>
              <LinkCard to="/suporte" icon={Headset} title="Suporte técnico" text="Atendimento 24h pelo WhatsApp." cta="Ver como" delay={0.06} />
              <LinkCard to="/teste-de-velocidade" icon={Gauge} title="Teste sua velocidade" text="Do jeito certo, em 1 minuto." cta="Entenda" delay={0.12} />
              <LinkCard to="/internet#wifi-mesh" icon={Wifi} title="Melhore o Wi-Fi" text="Sinal na casa toda com Mesh." cta="Entenda" delay={0.18} />
            </div>
          </div>
        </section>

        {/* dúvidas — do site anterior */}
        <section id="duvidas" className="tone-snow relative bg-[#EFF3F9] py-24 text-[#010818] sm:py-32">
          <span data-node="right" className="absolute top-12" />
          <span data-node="center" className="absolute bottom-0 left-1/2" />
          <div className="wrap">
            <Rise><Fit className="tag normal-case">05 — Dúvidas</Fit></Rise>
            <Lines className="h-lg mt-4 max-w-4xl" lines={["Dúvidas sobre", "os serviços INET."]} />
            <div className="mt-10">
              <Faq
                items={[
                  { q: "Qual telefone da INET para contratar ou pedir suporte?", a: <>Todos os serviços estão disponíveis pelo telefone e WhatsApp <a className="text-lime underline" href={`tel:${PHONES[0].tel}`}>{PHONES[0].display}</a> e pelo telefone <a className="text-lime underline" href={`tel:${PHONES[1].tel}`}>{PHONES[1].display}</a>. Ligação gratuita: <a className="text-lime underline" href={`tel:${PHONES[2].tel}`}>{PHONES[2].display}</a>.</> },
                  { q: "Como saber se tem INET na minha rua?", a: <>A INET trabalha para que nenhuma rua ou bairro fique sem cobertura. Para confirmar o seu endereço, fale com a gente pelo <Link className="text-lime underline" to="/fale-conosco">Fale conosco</Link>.</> },
                  { q: "Quais os benefícios de contratar a INET?", a: "Internet com ultravelocidade, estabilidade, apps exclusivos, suporte 24 horas por dia, equipamentos e infraestrutura de ponta e atendimento humanizado." },
                  { q: "A INET possui loja física?", a: <>Sim, {STORES.length} lojas em Teófilo Otoni e Carlos Chagas. <Link className="text-lime underline" to="/cobertura#lojas">Ver no mapa</Link>.</> },
                ]}
              />
            </div>
          </div>
        </section>
        <ConnectFinale />
      </div>
    </div>
  );
}
