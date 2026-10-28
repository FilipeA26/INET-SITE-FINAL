import SectionBackdrop from "./SectionBackdrop";

/**
 * Vitrine dos fundos por seção (só em desenvolvimento: rota /fundos-exemplo, montada no App com import.meta.env.DEV).
 * Serve de exemplo de uso para quem monta as páginas. Os textos aqui são rótulos técnicos, não vão para o site.
 */
export default function Exemplo() {
  const box = "wrap py-28 sm:py-36";
  return (
    <>
      <section className="relative isolate">
        <SectionBackdrop variant="cinematic" />
        <div className={box}>
          <h2 className="h-lg max-w-3xl">variant="cinematic"</h2>
          <p className="lead mt-5">Canvas leve: névoa, filamentos de fibra, plâncton e grão. Só a instância mais visível anima.</p>
        </div>
      </section>
      <SectionBackdrop variant="mist" glowPosition="top-left" transition="fade-both">
        <div className={box}>
          <h2 className="h-lg max-w-3xl">variant="mist"</h2>
          <p className="lead mt-5">Escuro com luz suave localizada, sem canvas.</p>
        </div>
      </SectionBackdrop>
      <SectionBackdrop variant="ink">
        <div className={box}>
          <h2 className="h-lg max-w-3xl">variant="ink"</h2>
          <p className="lead mt-5">Transparente: deixa ver o fundo do mar com os cabos por trás.</p>
        </div>
      </SectionBackdrop>
      <section className="relative isolate">
        <SectionBackdrop variant="cinematic" />
        <div className={box}>
          <h2 className="h-lg max-w-3xl">segundo "cinematic"</h2>
          <p className="lead mt-5">Quando os dois aparecem juntos, só um anima.</p>
        </div>
      </section>
    </>
  );
}
