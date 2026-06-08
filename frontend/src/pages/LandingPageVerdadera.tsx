import React from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPageVerdadera: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @keyframes fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slidein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fadeup  { animation: fadeup 0.8s cubic-bezier(0.22,1,0.36,1) forwards 0.2s; }
        .anim-slidein { animation: slidein 0.7s cubic-bezier(0.22,1,0.36,1) forwards 0.4s; }

        .left-grid {
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px, transparent 1px, transparent 9px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px, transparent 1px, transparent 9px);
        }
        .paper-lines {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 33px,
            rgba(160,140,100,0.13) 33px, rgba(160,140,100,0.13) 34px
          );
        }
        .cta-btn:hover .cta-arrow { transform: translateX(5px); }
      `}</style>

      <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#1C1710]">

        {/* ── PANEL OSCURO ── */}
        <div className="relative flex flex-col justify-end overflow-hidden
                        h-[42vh] md:h-auto md:flex-[1.1]
                        p-8 md:p-11 xl:p-16 2xl:p-24">

          <div className="left-grid absolute inset-0 pointer-events-none" />

          <div className="relative z-10 opacity-0 anim-fadeup">

            <span className="inline-block font-inconsolata tracking-[0.2em] uppercase border border-[#3A3020] text-[#8B7355] px-3 py-1 rounded-sm mb-5 2xl:mb-7
                             text-[10px] 2xl:text-[13px]">
              Abierto ahora
            </span>

            <p className="font-baskerville italic text-[#6B5B3E] tracking-[0.04em] mb-2
                          text-[12px] md:text-[13px] 2xl:text-[17px]">
              bienvenido a
            </p>

            <h2 className="font-baskerville font-bold text-[#E8D5B0] leading-[1.05] tracking-[-0.01em]
                           text-[32px] md:text-[40px] xl:text-[54px] 2xl:text-[72px]">
              Casa<br />del<br />Sabor
            </h2>

            <div className="w-8 h-px bg-[#5A4A2A] my-4 md:my-5 2xl:my-7 2xl:w-14" />

            <span className="font-inconsolata tracking-[0.25em] uppercase text-[#4A3E28]
                             text-[10px] 2xl:text-[13px]">
              Mendoza
            </span>

          </div>
        </div>

        {/* ── PANEL CLARO ── */}
        <div className="relative flex flex-col justify-center overflow-hidden flex-1
                        bg-[#F2E8D0]
                        px-8 py-12 md:px-14 md:py-16 xl:px-20 xl:py-20 2xl:px-32 2xl:py-28">

          <div className="paper-lines absolute inset-0 pointer-events-none" />

          <div className="relative z-10 opacity-0 anim-slidein">

            <p className="font-inconsolata tracking-[0.3em] uppercase text-[#9A8460] mb-5 md:mb-6 2xl:mb-8
                          text-[10px] 2xl:text-[13px]">
              Hecho con cuidado
            </p>

            <h1 className="font-baskerville font-bold text-[#1A1510] leading-[1.08] tracking-[-0.02em] mb-3
                           text-[36px] md:text-[44px] xl:text-[58px] 2xl:text-[78px]">
              Comé bien,<br />pedí fácil.
            </h1>

            <p className="font-baskerville italic text-[#7A6848] leading-[1.65] mb-8 md:mb-10 2xl:mb-14
                          text-[14px] md:text-[15px] xl:text-[17px] 2xl:text-[21px]">
              Todo lo que querés,<br />directo a tu puerta.
            </p>

            <button onClick={() => navigate('/store')} className="cta-btn inline-flex items-center gap-3 bg-[#6B4F28] hover:bg-[#8B6535] text-[#E8D5B0] font-inconsolata font-semibold tracking-[0.18em] uppercase rounded-sm border-none cursor-pointer self-start mb-8 md:mb-10 2xl:mb-14 transition-all duration-[180ms] hover:translate-x-1
                               text-[13px] 2xl:text-[16px] px-8 2xl:px-12 h-[50px] md:h-[54px] 2xl:h-[68px]">
              Ver el menú
              <span className="cta-arrow text-base 2xl:text-xl transition-transform duration-[180ms]">→</span>
            </button>

            <div className="flex flex-col gap-3 2xl:gap-4">
              <span className="flex items-center gap-3 font-inconsolata tracking-[0.08em] text-[#9A8460]
                               text-[11px] 2xl:text-[14px]">
                <span className="w-[18px] h-px bg-[#C4A96A] shrink-0 2xl:w-7" />
                Entrega en 30–45 min
              </span>
              <span className="flex items-center gap-3 font-inconsolata tracking-[0.08em] text-[#9A8460]
                               text-[11px] 2xl:text-[14px]">
                <span className="w-[18px] h-px bg-[#C4A96A] shrink-0 2xl:w-7" />
                Retiro en local disponible
              </span>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}

export default LandingPageVerdadera
