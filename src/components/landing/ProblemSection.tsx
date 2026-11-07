'use client';

import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section id="problema" className="py-32 bg-[#F5F5F4]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header — minimalista, mucho espacio */}
        <div className="mb-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              El Problema
            </span>
          </div>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-tight text-[#0C1424] leading-[1.15] max-w-2xl">
            Invertir en crypto en LATAM<br />
            <span className="text-ink-muted">es más difícil de lo que parece</span>
          </h2>
        </div>

        {/* Stats — limpios, minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone-200/60 mb-24">
          <div className="bg-[#F5F5F4] p-10">
            <div className="font-serif-display text-5xl font-medium text-[#0C1424] mb-3">~70%</div>
            <p className="text-sm text-ink-light leading-relaxed">
              de los adultos en LATAM no tienen acceso a instrumentos de
              inversión tradicionales
            </p>
            <a href="https://www.worldbank.org/en/topic/financialinclusion/brief/global-findex" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[10px] text-ink-muted/60 hover:text-[#2540EB] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
              World Bank Global Findex 2021
            </a>
          </div>
          <div className="bg-[#F5F5F4] p-10">
            <div className="font-serif-display text-5xl font-medium text-[#2540EB] mb-3">85%</div>
            <p className="text-sm text-ink-light leading-relaxed">
              de los adultos en LATAM no usa stablecoins. La barrera no es
              falta de interés, sino falta de acceso: exchanges que no operan
              en la región y métodos de pago locales no integrados
            </p>
            <a href="https://www.chainalysis.com/blog/2024-global-crypto-adoption-index/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[10px] text-ink-muted/60 hover:text-[#2540EB] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
              Chainalysis Geography of Crypto 2024
            </a>
          </div>
          <div className="bg-[#F5F5F4] p-10">
            <div className="font-serif-display text-5xl font-medium text-[#0C1424] mb-3">60%+</div>
            <p className="text-sm text-ink-light leading-relaxed">
              evita crypto por la volatilidad extrema y el miedo a perder
              su dinero
            </p>
            <a href="https://www.gemini.com/cryptopedia/state-of-crypto-global-report" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[10px] text-ink-muted/60 hover:text-[#2540EB] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
              Gemini State of Crypto 2024
            </a>
          </div>
        </div>

        {/* Three pain points — minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
              01 Acceso
            </div>
            <h3 className="font-serif-display text-xl font-medium text-[#0C1424] mb-3">
              Barreras de acceso
            </h3>
            <p className="text-sm text-ink-light leading-relaxed">
              Comprar stablecoins en LATAM requiere enfrentar procesos KYC
              complejos, exchanges que no operan en todos los países, y falta
              de integración con métodos de pago locales como PSE o PIX.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
              02 Volatilidad
            </div>
            <h3 className="font-serif-display text-xl font-medium text-[#0C1424] mb-3">
              Volatilidad sin control
            </h3>
            <p className="text-sm text-ink-light leading-relaxed">
              Bitcoin puede caer 20% en un día. Ethereum bajó 40% en una
              semana. Sin stop-loss automático, el inversor promedio pierde
              más por pánico que por el mercado.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
              03 Confianza
            </div>
            <h3 className="font-serif-display text-xl font-medium text-[#0C1424] mb-3">
              Desconfianza en bots
            </h3>
            <p className="text-sm text-ink-light leading-relaxed">
              Los bots existentes piden claves API con permisos peligrosos,
              suscripciones caras, y configuraciones que nadie entiende. El
              usuario no sabe qué hace el bot ni cuánto pierde en comisiones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
