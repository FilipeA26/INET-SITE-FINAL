/** Moldura neutra para a captura existente, sem marca ou especificações de aparelho. */
export default function InetPhone() {
  return <div style={{ transformStyle: "preserve-3d", boxShadow: "12px 8px 0 #172d49, 16px 10px 0 #436080, 25px 35px 55px rgba(0,0,0,.6)" }} className="relative rounded-[2.6rem] border border-white/25 bg-[#07152D] p-2 shadow-[0_28px_70px_-30px_rgba(0,8,24,0.85)]">
    <div aria-hidden="true" className="mx-auto mb-2 mt-1 h-1 w-12 rounded-full bg-[#5CC8FF]/30" />
    <img src="/movel/site-mobile.webp" alt="Site da INET aberto em um celular" width={780} height={1688} loading="eager" decoding="async" className="block h-auto w-full rounded-[2rem]" />
  </div>;
}
