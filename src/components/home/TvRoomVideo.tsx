import { useEffect, useRef, useState } from "react";
import { DUR, EASE } from "../../motion";
import useMotionPreference from "./useMotionPreference";

// Pexels 5571655, Monsieur Sylvain. Pexels License; source and measurements in r7-onix.md.
// Screen corners in the original 1280 × 720: TL (482,78), TR (970,97), BR (961,385), BL (480,391).
function screenMatrix() {
  const [x0,y0,x1,y1,x2,y2,x3,y3] = [482,78,970,97,961,385,480,391];
  const dx1=x1-x2, dx2=x3-x2, dx3=x0-x1+x2-x3;
  const dy1=y1-y2, dy2=y3-y2, dy3=y0-y1+y2-y3;
  const den=dx1*dy2-dx2*dy1;
  const g=(dx3*dy2-dx2*dy3)/den, h=(dx1*dy3-dx3*dy1)/den;
  return `matrix3d(${(x1-x0+g*x1)/1280},${(y1-y0+g*y1)/1280},0,${g/1280},${(x3-x0+h*x3)/720},${(y3-y0+h*y3)/720},0,${h/720},0,0,1,0,${x0},${y0},0,1)`;
}

export default function TvRoomVideo() {
  const root=useRef<HTMLElement>(null);
  const room=useRef<HTMLVideoElement>(null);
  const inet=useRef<HTMLVideoElement>(null);
  const reduced=useMotionPreference();
  const [near,setNear]=useState(false);
  const [visible,setVisible]=useState(false);
  const [on,setOn]=useState(false);
  useEffect(()=>{
    const el=root.current;if(!el)return;
    const preload=new IntersectionObserver(([e])=>{if(e.isIntersecting)setNear(true)}, {rootMargin:"240px"});
    const playback=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.2});
    preload.observe(el);playback.observe(el);
    return()=>{preload.disconnect();playback.disconnect()};
  },[]);
  useEffect(()=>{
    const sync=()=>{
      for(const video of [room.current,inet.current]){
        if(!video)continue;
        if(near&&visible&&!reduced&&!document.hidden)void video.play().catch(()=>{});
        else video.pause();
      }
    };
    sync();document.addEventListener('visibilitychange',sync);
    return()=>{room.current?.pause();inet.current?.pause();document.removeEventListener('visibilitychange',sync)};
  },[near,visible,reduced]);
  useEffect(()=>{if(reduced)setOn(false)},[reduced]);
  return <section ref={root} data-tv-room className={`tv-room wrap ${on&&!reduced?'is-on':''}`} aria-label="INET TV na sua televisão">
    <style>{`
      .tv-room{padding-block:24px 96px}
      .tv-room-scene{display:block;width:min(100%,900px,calc((100svh - 180px)*824/720));height:auto;margin:auto;overflow:hidden;background:#010818;
        -webkit-mask-image:linear-gradient(to right,transparent 0%,rgb(0 0 0 / .7) 4%,#000 14%,#000 86%,rgb(0 0 0 / .7) 96%,transparent 100%),linear-gradient(to bottom,transparent 0%,rgb(0 0 0 / .7) 4%,#000 14%,#000 84%,rgb(0 0 0 / .5) 96%,transparent 100%);
        -webkit-mask-composite:source-in;
        mask-image:linear-gradient(to right,transparent 0%,rgb(0 0 0 / .7) 4%,#000 14%,#000 86%,rgb(0 0 0 / .7) 96%,transparent 100%),linear-gradient(to bottom,transparent 0%,rgb(0 0 0 / .7) 4%,#000 14%,#000 84%,rgb(0 0 0 / .5) 96%,transparent 100%);
        mask-composite:intersect}
      .tv-room-ambient{position:relative;width:1280px;height:720px}
      .tv-room-ambient::after{content:"";position:absolute;inset:0;background:rgb(1 8 24 / .16);pointer-events:none}
      .tv-room-scene video{display:block;width:1280px;height:720px;object-fit:fill;pointer-events:none}
      .tv-room-screen{position:relative;width:1280px;height:720px;background:#010818;transform-origin:0 0;box-shadow:0 2px 6px #010818}
      .tv-room-screen video{opacity:0;transition:opacity ${DUR}s cubic-bezier(${EASE.join(",")});filter:brightness(.92) saturate(.9)}
      .tv-room.is-on .tv-room-screen video{opacity:1}
      .tv-room-screen::after{content:"";position:absolute;inset:0;pointer-events:none;background:#EFF3F9;opacity:0}
      .tv-room.is-on .tv-room-screen::after{animation:tv-room-power ${DUR}s cubic-bezier(${EASE.join(",")}) both}
      @keyframes tv-room-power{0%{opacity:.45}100%{opacity:0}}
      .tv-room-scene video::-webkit-media-controls{display:none!important}
      @media(max-width:767px){.tv-room{padding-block:24px 64px}}
      @media(prefers-reduced-motion:reduce){.tv-room-screen video{transition:none!important;opacity:0!important}.tv-room-screen::after{animation:none!important}}
    `}</style>
    <svg className="tv-room-scene" viewBox="200 0 824 720" role="img" aria-label="Braço com controle remoto ligando uma televisão com INET TV">
      <foreignObject width="1280" height="720">
        <div className="tv-room-ambient">
        <video ref={room} src={near&&!reduced?'/video/tv-remote-pexels-5571655.mp4':undefined} poster="/video/tv-room-poster.jpg" muted playsInline loop disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" preload="none" onTimeUpdate={e=>{if(e.currentTarget.currentTime>1.4)setOn(true)}} tabIndex={-1}/>
        </div>
      </foreignObject>
      <foreignObject width="1280" height="720" style={{overflow:'visible'}}>
        <div className="tv-room-screen" style={{transform:screenMatrix()}}>
          <video ref={inet} src={near&&!reduced?'/video/inet-tv-motion-v4.mp4':undefined} poster="/video/inet-tv-poster.jpg" muted playsInline loop disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" preload="none" tabIndex={-1}/>
        </div>
      </foreignObject>
    </svg>
  </section>;
}
