import type { ReactNode } from "react";

/**
 * Faixa clara (claro-neve) das páginas internas, com costuras suaves de entrada e saída
 * definidas em src/index.css (sem salto de cor nas fronteiras com as seções escuras).
 *
 * Os componentes do site (Section, Faq, FeatureCard, .card, .lead, .tag) nasceram para fundo escuro.
 * Em vez de mexer neles (são de outros donos), esta faixa remapeia as cores só aqui dentro:
 * texto #010818, secundário rgb(1 8 24 / .65), destaque azul #0062EC (o verde-limão nunca vira
 * texto sobre claro, só fica como fundo de botão). Cartões: #F7F9FC com borda rgb(1 8 24 / .08).
 * Quem precisa continuar escuro dentro da faixa (cartão com foto) leva a classe `pg-dark`.
 */
const K = ":not(.pg-dark, .pg-dark *)";
const CSS = `
.pg-snow{color:#010818}
.pg-snow .pg-dark{color:#fff}
.pg-snow .text-white${K}{color:#010818}
.pg-snow [class*="text-white/"]${K},.pg-snow .lead${K}{color:rgb(1 8 24 / .65)}
.pg-snow .text-lime${K},.pg-snow .tag${K},.pg-snow .card-link${K}{color:#0062EC}
.pg-snow [class*="hover:text-lime"]${K}:hover{color:#0062EC}
.pg-snow [class*="border-white/"]${K}{border-color:rgb(1 8 24 / .1)}
.pg-snow [class*="divide-white/"]${K}>*+*{border-color:rgb(1 8 24 / .1)}
.pg-snow [class*="bg-white/"]${K}{background-color:rgb(1 8 24 / .04)}
.pg-snow .card${K}{background:#F7F9FC;border-color:rgb(1 8 24 / .08);box-shadow:0 20px 44px -36px rgb(3 37 108 / .35)}
.pg-snow .card${K}:hover,.pg-snow .card${K}:focus-within{border-color:rgb(1 8 24 / .16);box-shadow:0 30px 60px -38px rgb(3 37 108 / .45)}
.pg-snow .card-media${K}{opacity:.35}
.pg-snow .btn-ghost${K}{color:#010818;border-color:rgb(1 8 24 / .25)}
.pg-snow .btn-ghost${K}:hover{color:#0062EC;border-color:#0062EC}
.pg-snow .btn-lime{color:#010818}
.pg-snow :focus-visible${K}{outline-color:#0062EC}
`;

export default function Snow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-tone="light" className={`pg-snow relative isolate ${className}`}>
      <style>{CSS}</style>
      {children}
    </div>
  );
}
