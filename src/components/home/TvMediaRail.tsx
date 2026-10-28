import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { SPRING } from "../../motion";
import useMotionPreference from "./useMotionPreference";

function RailVideo({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const preload = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200px 360px" });
    const playback = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    preload.observe(video);
    playback.observe(video);
    return () => { preload.disconnect(); playback.disconnect(); };
  }, []);
  useEffect(() => {
    if (near && !reduced) setLoaded(true);
  }, [near, reduced]);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const sync = () => {
      if (reduced) { video.pause(); video.load(); return; }
      if (loaded && visible && !reduced && !document.hidden && !document.querySelector("dialog[open]")) void video.play().catch(() => {});
      else video.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("inet:tv-player", sync);
    return () => { video.pause(); document.removeEventListener("visibilitychange", sync); document.removeEventListener("inet:tv-player", sync); };
  }, [loaded, visible, reduced]);
  return <video ref={ref} data-tv-rail-video src={loaded && !reduced ? "/video/inet-tv-motion-v4.mp4" : undefined} poster="/video/inet-tv-poster.jpg" muted loop playsInline disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" preload={near && !reduced ? "metadata" : "none"} aria-label="Vídeo da INET TV" tabIndex={-1} />;
}

export default function TvMediaRail() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [mobile, setMobile] = useState(() => matchMedia("(max-width:767px)").matches);
  // Reserve the scroll range on the first render; ResizeObserver refines the measured width.
  const [distance, setDistance] = useState(() => innerWidth * 1.06 + 80);
  useEffect(() => {
    const mq = matchMedia("(max-width:767px)");
    const update = () => setMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const staticLayout = reduced;
  useEffect(() => {
    const frame = viewport.current;
    const content = track.current;
    if (!frame || !content) return;
    const measure = () => setDistance(Math.max(0, content.scrollWidth - frame.clientWidth));
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [staticLayout]);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, SPRING);
  const x = useTransform(progress, [0, 1], [0, -distance]);
  const introX = useTransform(progress, [0, 1], [0, distance]);
  const introOpacity = useTransform(progress, [0, mobile ? .2 : .6, mobile ? .45 : .85, 1], [1, 1, 0, 0]);

  return <section ref={section} id="inet-tv-midia" aria-label="INET TV" className={`tv-media-rail ${reduced ? "is-reduced" : mobile ? "is-mobile" : "is-desktop"}`} style={staticLayout ? undefined : { height: `calc(100svh + ${distance}px)` }}>
    <style>{`
      .tv-media-rail{position:relative;color:#F7F9FC}
      .tv-media-stage{position:sticky;top:0;height:100svh;display:flex;align-items:center;padding-top:80px;padding-bottom:40px}
      .tv-media-viewport{width:100%;overflow:clip}
      .tv-media-track{display:flex;align-items:center;gap:40px;width:max-content;padding:20px 4vw}
      .tv-media-intro{flex:0 0 100vw;width:100vw;padding-right:8vw}
      .tv-media-intro h2{font-size:clamp(3rem,6vw,6rem);line-height:1;letter-spacing:-.035em;margin:0 0 24px}
      .tv-media-intro p{font-size:clamp(1rem,1.4vw,1.25rem);line-height:1.6;max-width:32ch;color:rgb(247 249 252 / .75)}
      .tv-media-card{position:relative;flex:none;margin:0;border-radius:2rem;overflow:clip;background:#021A4A}
      .tv-media-video-card{width:min(82vw,calc((100svh - 170px)*16/9));height:auto;aspect-ratio:16/9}
      .tv-media-photo-card{width:70vw;height:calc(100svh - 170px)}
      .tv-media-card video{display:block;width:100%;height:100%;object-fit:cover;object-position:center;pointer-events:none}
      .tv-media-card video::-webkit-media-controls{display:none!important}
      .tv-media-card img{display:block;width:100%;height:100%;object-fit:contain;padding:clamp(24px,5vw,80px)}
      .tv-media-card figcaption{position:absolute;left:24px;bottom:20px;font-size:14px;color:#F7F9FC;background:rgb(1 8 24 / .85);border-radius:999px;padding:8px 16px}
      .tv-media-control{position:absolute;right:4vw;top:86px;z-index:2}
      .tv-media-control button:focus-visible{outline:3px solid #70E000;outline-offset:4px}
      .is-mobile .tv-media-stage{padding-block:90px 48px}
      .is-mobile .tv-media-control{display:none}
      .is-mobile .tv-media-viewport{overflow:clip}
      .is-mobile .tv-media-track{gap:16px;padding:8px 20px 16px}
      .is-mobile .tv-media-intro{width:100vw;flex-basis:100vw;padding:0 16px 0 0;scroll-snap-align:start}
      .is-mobile .tv-media-intro h2{font-size:3rem}
      .is-mobile .tv-media-card{width:86vw;height:420px;max-height:70svh;scroll-snap-align:start;border-radius:1.5rem}
      .is-mobile .tv-media-video-card{height:auto;max-height:none;aspect-ratio:16/9}
      .is-mobile .tv-media-card img{padding:20px}
      .is-mobile .tv-media-card figcaption{left:16px;bottom:16px;font-size:12px;padding:6px 12px}
      .is-reduced .tv-media-stage{position:relative;height:auto;display:block;padding-block:96px 48px}
      .is-reduced .tv-media-control{position:relative;right:auto;top:auto;margin:0 4vw 24px}
      .is-reduced .tv-media-viewport{overflow:visible}
      .is-reduced .tv-media-track{display:flex;flex-direction:column;align-items:stretch;width:100%;gap:24px;transform:none!important}
      .is-reduced .tv-media-intro{width:100%;flex-basis:auto;padding:0}
      .is-reduced .tv-media-card{width:100%;height:auto;aspect-ratio:16/10}
      .is-reduced .tv-media-video-card{aspect-ratio:16/9}
      @media(prefers-reduced-motion:reduce){.tv-media-rail{height:auto!important}.tv-media-stage{position:relative;height:auto}.tv-media-track{transform:none!important}}
    `}</style>
    <div className="tv-media-stage">
      
      <div ref={viewport} className="tv-media-viewport" >
        <motion.div ref={track} data-tv-rail-track className="tv-media-track" style={staticLayout ? undefined : { x }}>
          <motion.div className="tv-media-intro" style={staticLayout ? { x: 0, opacity: 1 } : { x: introX, opacity: introOpacity }}>
            <h2 className="font-display">INET TV</h2>
            <p>TV ao vivo, rádios e filmes em qualquer TV, até nas que não são smart.</p>
          </motion.div>
          <figure data-tube-hide className="tv-media-card tv-media-video-card">
            <RailVideo reduced={reduced} />
            <figcaption>INET TV</figcaption>
          </figure>

        </motion.div>
      </div>
    </div>
  </section>;
}
