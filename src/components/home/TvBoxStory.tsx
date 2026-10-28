import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion, useInView, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { EASE, SPRING } from "../../motion";
import { waLink } from "../../data/inet";
import useMotionPreference from "./useMotionPreference";

// Roteiro literal do material INET inet-tv-motion-v4.mp4.
const steps = [
  { value: "INET TV", label: "" },
  { value: "120", label: "canais abertos e fechados" },
  { value: "1.500", label: "filmes e séries atualizadas" },
  { value: "YouTube", label: "incluso" },
  { value: "Canal", label: "da cidade" },
];

function ScrollStep({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const start = index === 0 ? 0 : 0.26 + (index - 1) * 0.18;
  const end = index === 4 ? 1.1 : 0.25 + index * 0.18;
  const opacity = useTransform(progress, p => Math.max(0, Math.min(1, index === 0 ? 1 : (p - start) / 0.04, index === 4 ? 1 : (end - p) / 0.04)));
  const y = useTransform(progress, [start, start + 0.06, end], [24, 0, -12]);
  return <motion.div data-tv-step={index} className="tv-story-step" style={{ opacity, y }}>
    <span className="tv-story-value font-display">{steps[index].value}</span>
    {steps[index].label && <span className="tv-story-caption">{steps[index].label}</span>}
  </motion.div>;
}

function ListStep({ index, reduced }: { index: number; reduced: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.2 });
  return <motion.li ref={ref} className="tv-story-list-step" initial={false} animate={{ y: reduced || visible ? 0 : 16 }} transition={{ duration: reduced ? 0 : 1.2, ease: EASE }}>
    <span className="tv-story-value font-display">{steps[index].value}</span>
    {steps[index].label && <span className="tv-story-caption">{steps[index].label}</span>}
  </motion.li>;
}

export default function TvBoxStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const list = reduced;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, SPRING);


  return <section ref={ref} id="inet-tv" className={`tv-story relative ${list ? "tv-story-static" : "tv-story-scroll"}`} aria-labelledby="tv-story-title">
    <style>{`
      .tv-story-scroll{height:420svh}
      .tv-story-pin{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;justify-content:center;padding-block:100px 48px}
      .tv-story-heading{font-size:clamp(2rem,3.9vw,4rem);line-height:1.04;font-weight:300;letter-spacing:-.025em;margin:0 0 28px}
      .tv-story-layout{display:grid;grid-template-columns:1.15fr 1fr;align-items:center;gap:clamp(32px,6vw,100px)}
      .tv-story-visual{overflow:clip;padding:20px 10px}
      .tv-story-card{position:relative;display:grid;place-items:center;padding:0}
      .tv-story-card img{display:block;width:auto;max-width:100%;height:auto;max-height:clamp(230px,39svh,420px);object-fit:contain;clip-path:inset(0 0 1.8% 0)}
      .tv-story-text{position:relative;min-height:240px}
      .tv-story-step{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;pointer-events:none}
      .tv-story-value{display:block;font-size:clamp(3rem,6.2vw,6rem);font-weight:500;line-height:1.04;letter-spacing:-.035em;color:#F7F9FC;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
      .tv-story-caption{display:block;margin-top:14px;font-size:clamp(1.125rem,2.1vw,1.75rem);line-height:1.3;color:rgb(247 249 252 / .8);max-width:24ch}
      .tv-story-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
      .tv-story-static{padding-block:72px}
      .tv-story-static .tv-story-pin{position:relative;height:auto;padding-block:0}
      .tv-story-list{list-style:none;padding:0;margin:0}
      .tv-story-list-step{padding:28px 0;border-bottom:1px solid rgb(247 249 252 / .15)}
      .tv-story-static .tv-story-text{min-height:0}
      @media(max-width:767px){
        .tv-story-layout{grid-template-columns:1fr 1fr;gap:12px}
        .tv-story-pin{padding-block:90px 48px}
        .tv-story-text{min-height:180px}
        .tv-story-static .tv-story-layout{grid-template-columns:1fr}
        .tv-story-heading{font-size:clamp(2rem,8.5vw,3rem);margin-bottom:18px}
        .tv-story-card{padding:0}
        .tv-story-card img{max-height:230px}
        .tv-story-visual{padding:12px 0}
        .tv-story-value{font-size:clamp(1.5rem,7vw,2.5rem)}
        .tv-story-caption{font-size:1.125rem}
        .tv-story-actions{gap:10px}
      }
      @media(prefers-reduced-motion:reduce){
        .tv-story{height:auto;padding-block:72px}
        .tv-story-pin{position:relative;height:auto;padding-block:0}
        .tv-story-card{transform:none!important}
        .tv-story-list-step{transform:none!important;transition:none!important}
      }
    `}</style>
    <div className="tv-story-pin">
      <div className="wrap">
        <p className="tag normal-case mb-4">02 — INET TV Box</p>
        <h2 id="tv-story-title" className="tv-story-heading font-display">A TV que vai<br /><span className="italic text-lime">aonde você vai.</span></h2>
        <div className="tv-story-layout">
          <div className="tv-story-visual">
            <motion.div data-tube-hide className="tv-story-card" >
              <img src="/inet-tv-receptor.webp" alt="Receptor INET TV Box com controle remoto" width={760} height={732} loading="lazy" />
            </motion.div>
          </div>
          <div className="tv-story-text">
            {list ? <ol className="tv-story-list">{steps.map((step, index) => <ListStep key={step.value} index={index} reduced={reduced} />)}</ol> : <>
              <div aria-hidden="true">{steps.map((step, index) => <ScrollStep key={step.value} index={index} progress={progress} />)}</div>
              <ol className="sr-only">{steps.map(step => <li key={step.value}>{step.value} {step.label}</li>)}</ol>
            </>}
          </div>
        </div>
        <div className="tv-story-actions">
          <Link to="/tv" className="btn-lime">Conhecer a INET TV <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <a href={waLink("Olá! Quero assinar a INET TV.")} target="_blank" rel="noreferrer" className="btn-ghost">Assinar pelo WhatsApp</a>
        </div>
      </div>
    </div>
  </section>;
}
