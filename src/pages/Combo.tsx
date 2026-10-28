import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Check, ChevronUp, Info, MessageCircle, Music, Tv, Wifi } from "lucide-react";
import { Faq, PageHero, Section, usePageMeta } from "../components/ui";
import Snow from "../components/paginas/Snow";
import { DUR, EASE } from "../motion";
import {
  CAMERA_OPTIONS,
  COMBO_PLANS,
  MESH_ADDON,
  STREAMING_OPTIONS,
  TV_ADDON,
  comboLines,
  comboWhatsApp,
  formatBrl,
  parseBrl,
  type ComboSelection,
} from "../data/combo";

/** Cabeçalho de cada etapa: número, título e uma linha de explicação. */
function Step({ n, title, note, text, children }: { n: string; title: string; note: string; text: string; children: ReactNode }) {
  return (
    <div className="border-b border-navy-ink/10 pb-12 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-3 font-display text-2xl font-light text-navy-ink sm:text-3xl">
          <span aria-hidden="true" className="font-mono text-sm text-electric">{n}</span>
          {title}
        </h2>
        <span className="text-sm text-navy-ink/60">{note}</span>
      </div>
      <p className="mt-2 text-sm text-navy-ink/65">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** Linha de escolha (rádio, caixa ou interruptor): o cartão inteiro é o botão. */
function Choice({
  role,
  checked,
  onToggle,
  title,
  text,
  price,
  icon,
  badge,
}: {
  role: "radio" | "checkbox" | "switch";
  checked: boolean;
  onToggle: () => void;
  title: string;
  text: string;
  price: string;
  icon?: ReactNode;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onToggle}
      data-tube-hide
      className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-5 ${
        checked
          ? "border-electric bg-[#E6EEFB] shadow-[0_18px_40px_-30px_rgba(0,98,236,0.6)]"
          : "border-navy-ink/10 bg-[#F7F9FC] hover:border-navy-ink/25"
      }`}
    >
      {role === "switch" ? (
        <span aria-hidden="true" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-500 ${checked ? "bg-lime" : "bg-navy-ink/20"}`}>
          <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-navy-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${checked ? "translate-x-5" : ""}`} />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors duration-300 ${role === "radio" ? "rounded-full" : "rounded-md"} ${
            checked ? "border-lime bg-lime text-navy-ink" : "border-navy-ink/30 group-hover:border-navy-ink/60"
          }`}
        >
          {checked && <Check size={14} strokeWidth={3} />}
        </span>
      )}
      {icon && <span aria-hidden="true" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric/10 text-electric sm:flex">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-semibold text-navy-ink">{title}</span>
          {badge && <span className="rounded-full bg-electric/10 px-2.5 py-0.5 text-xs font-semibold text-electric">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-sm text-navy-ink/65">{text}</span>
      </span>
      <span className="shrink-0 whitespace-nowrap text-right font-display text-lg font-semibold tabular-nums text-navy-ink">{price}</span>
    </button>
  );
}

/** Lista do resumo (painel lateral e gaveta do celular). */
function SummaryList({ lines }: { lines: ReturnType<typeof comboLines>["lines"] }) {
  return (
    <ul className="divide-y divide-white/10 text-sm">
      {lines.map((l) => (
        <li key={l.title} className="flex items-start justify-between gap-4 py-3">
          <span>
            <span className="block font-medium text-white">{l.title}</span>
            {l.detail && <span className="block text-xs text-white/60">{l.detail}</span>}
          </span>
          <span className={`shrink-0 whitespace-nowrap tabular-nums ${l.included ? "text-lime" : "text-white"}`}>{l.included ? "Incluso" : formatBrl(l.price)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Combo() {
  usePageMeta("Monte seu combo", "Monte seu combo da INET: internet fibra de até 1 Giga, Wi-Fi Mesh, câmeras, INET TV e streamings. Simule o valor e fale com o setor comercial.");
  const reduce = useReducedMotion();
  const [sel, setSel] = useState<ComboSelection>({ planId: "800", mesh: false, camera: "none", tv: false, streamings: [] });
  const [open, setOpen] = useState(false);
  const { plan, lines, total } = useMemo(() => comboLines(sel), [sel]);
  const whatsapp = useMemo(() => comboWhatsApp(sel), [sel]);
  const toggleStreaming = (id: string) =>
    setSel((s) => ({ ...s, streamings: s.streamings.includes(id) ? s.streamings.filter((x) => x !== id) : [...s.streamings, id] }));

  const totalText = (
    <motion.span key={total} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR * 0.5, ease: EASE }} className="inline-block" data-combo-total>
      {formatBrl(total)}
    </motion.span>
  );

  return (
    <>
      {/* no celular a barra fixa do total ocupa o pé da tela: o botão do WhatsApp e o rodapé abrem espaço */}
      <style>{`
        @media (max-width: 1023px) {
          a[aria-label="Falar com a INET pelo WhatsApp"] { bottom: 5.5rem !important; }
          footer { padding-bottom: 6rem !important; }
        }
      `}</style>

      <PageHero
        tag=""
        title={["Monte seu combo,", <span className="italic text-lime">do seu jeito.</span>]}
        lead="Escolha a velocidade da sua fibra, amplie o Wi-Fi, adicione câmera, INET TV e seus streamings. O valor aparece na hora e você envia o combo direto para o setor comercial."
      >
        <a href="#etapas-combo" className="btn-lime">Começar a simulação</a>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-ghost"><MessageCircle size={16} aria-hidden="true" /> Falar com o comercial</a>
      </PageHero>

      <Snow>
        <section id="etapas-combo" className="py-20 sm:py-28">
          <div className="wrap lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="space-y-12 lg:col-span-7">
              <Step n="01" title="Internet fibra" note="Obrigatório" text="Escolha a velocidade. Os planos publicados não têm custo de instalação.">
                <div role="radiogroup" aria-label="Plano de internet" className="space-y-3">
                  {COMBO_PLANS.map((p) => (
                    <Choice
                      key={p.id}
                      role="radio"
                      checked={sel.planId === p.id}
                      onToggle={() => setSel((s) => ({ ...s, planId: p.id }))}
                      title={p.name}
                      text={p.includes.join(" · ")}
                      price={`${formatBrl(parseBrl(p.price))}/mês`}
                    />
                  ))}
                </div>
              </Step>

              <Step n="02" title="Rede Wi-Fi Mesh" note="Opcional" text="Amplia o sinal de Wi-Fi para mais cômodos.">
                <Choice role="switch" checked={sel.mesh} onToggle={() => setSel((s) => ({ ...s, mesh: !s.mesh }))} title={MESH_ADDON.name} text={`${MESH_ADDON.text} Valor provisório, a confirmar com a INET.`} price={`+ ${formatBrl(MESH_ADDON.price)}`} icon={<Wifi size={20} />} />
              </Step>

              <Step n="03" title="Câmera de segurança" note="Opcional" text="Escolha uma câmera ou siga sem.">
                <div role="radiogroup" aria-label="Câmera de segurança" className="space-y-3">
                  {CAMERA_OPTIONS.map((c) => (
                    <Choice key={c.id} role="radio" checked={sel.camera === c.id} onToggle={() => setSel((s) => ({ ...s, camera: c.id }))} title={c.name} text={c.text} price={c.price ? `+ ${formatBrl(c.price)}` : "R$ 0,00"} icon={<Camera size={20} />} />
                  ))}
                </div>
              </Step>

              <Step n="04" title="INET TV" note="Opcional" text="Canais ao vivo, rádio e filmes na sua TV.">
                <Choice role="switch" checked={sel.tv} onToggle={() => setSel((s) => ({ ...s, tv: !s.tv }))} title={TV_ADDON.name} text={TV_ADDON.text} price={`+ ${formatBrl(TV_ADDON.price)}`} icon={<Tv size={20} />} />
              </Step>

              <Step n="05" title="Streaming" note="Escolha quantos quiser" text="Se o serviço já vem no plano escolhido, ele entra sem custo.">
                <div role="group" aria-label="Streamings" className="space-y-3">
                  {STREAMING_OPTIONS.map((s) => {
                    const included = s.includedIn.includes(sel.planId);
                    return (
                      <Choice
                        key={s.id}
                        role="checkbox"
                        checked={sel.streamings.includes(s.id)}
                        onToggle={() => toggleStreaming(s.id)}
                        title={s.name}
                        text={s.text}
                        badge={included ? `Incluso no ${plan?.name.replace("INET ", "")}` : undefined}
                        price={included ? "R$ 0,00" : `+ ${formatBrl(s.price)}`}
                        icon={<Music size={20} />}
                      />
                    );
                  })}
                </div>
              </Step>
            </div>

            {/* resumo fixo ao lado no computador */}
            <aside aria-label="Resumo do combo" className="hidden lg:col-span-5 lg:block">
              <div data-tube-hide className="pg-dark sticky top-28 rounded-[1.75rem] bg-navy-ink p-7 text-white shadow-[0_40px_80px_-40px_rgba(1,8,24,0.7)]">
                <h2 className="font-display text-2xl font-light">Seu combo</h2>
                <div className="mt-4"><SummaryList lines={lines} /></div>
                <div className="mt-5 border-t border-white/15 pt-5">
                  <p className="text-sm text-white/65">Total mensal estimado</p>
                  <p className="font-display text-4xl font-semibold tabular-nums text-lime">{totalText}<span className="text-sm font-normal text-white/60">/mês</span></p>
                  <p className="mt-4 flex gap-2 text-xs leading-relaxed text-white/60">
                    <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-lime" />
                    Simulação com os preços publicados no site. Disponibilidade no endereço e condições são confirmadas pelo comercial.
                  </p>
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-lime mt-6 w-full"><MessageCircle size={17} aria-hidden="true" /> Enviar combo ao comercial</a>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </Snow>

      <Section tag="" title={["Dúvidas sobre", <span className="italic text-lime">o seu combo.</span>]}>
        <Faq
          items={[
            { q: "O que acontece ao enviar o combo?", a: "Abre uma conversa no WhatsApp da INET com o resumo das suas escolhas e o total estimado. A equipe comercial confirma a disponibilidade no seu endereço e as condições de contratação." },
            { q: "O valor mostrado é definitivo?", a: "É uma simulação com os preços publicados no site. O valor da rede Wi-Fi Mesh ainda é provisório. O valor final é confirmado pelo comercial." },
            { q: "Os planos têm custo de instalação?", a: "Os planos de internet publicados no site são sem custo de instalação." },
          ]}
        />
      </Section>

      {/* barra do total no celular e no tablet */}
      <div className="pg-dark fixed inset-x-0 bottom-0 z-[55] border-t border-white/10 bg-navy-ink/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div data-tube-hide className="mx-auto max-w-lg">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduce ? 0 : DUR * 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mb-3 max-h-60 overflow-y-auto border-b border-white/15 pb-2"><SummaryList lines={lines} /></div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between gap-3">
            <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="min-w-0 text-left">
              <span className="flex items-center gap-1 text-xs text-white/65">
                {lines.length} {lines.length === 1 ? "item" : "itens"} no combo
                <ChevronUp size={13} aria-hidden="true" className={`transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
              </span>
              <span className="font-display text-xl font-semibold tabular-nums text-lime">{totalText}<span className="text-xs font-normal text-white/60">/mês</span></span>
            </button>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-lime shrink-0 px-4 text-sm"><MessageCircle size={15} aria-hidden="true" /> Enviar ao comercial</a>
          </div>
        </div>
      </div>
    </>
  );
}
