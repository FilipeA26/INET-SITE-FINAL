export default function HomeSnowStyles() {
  return <style>{`
    .r4-home .tone-snow [class*="text-white/"]{color:rgb(1 8 24 / .65)}
    .r4-home .tone-snow :is(.tag,.text-lime,.card-link){color:#0062EC}
    .r4-home .tone-snow .card{background:#F7F9FC;border-color:rgb(1 8 24 / .08)}
    .r4-home .tone-snow [class*="border-white/"]{border-color:rgb(1 8 24 / .08)}
    .r4-home .tone-snow [class*="divide-white/"] > :not([hidden]) ~ :not([hidden]){border-color:rgb(1 8 24 / .08)}
    .r4-home .tone-snow :focus-visible{outline-color:#0062EC}
    .r4-home .tone-snow .btn-lime{color:#010818}
    .r4-home .tone-snow button:hover{color:#0062EC}
  `}</style>;
}
