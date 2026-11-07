'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden silk-bg">
      {/* Concentric circles */}
      <div className="concentric-rings">
        <span />
      </div>

      {/* Additional subtle rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[200px] h-[200px] rounded-full border border-[#2540EB]/[0.07]" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full border border-[#2540EB]/[0.04]" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-[#2540EB]/[0.025]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-10">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
            Live on Celo Mainnet
          </span>
        </div>

        {/* H1 — serif moderna */}
        <h1 className="font-serif-display hero-title-shadow text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#0C1424] leading-[1.05] mb-16">
          Tu portafolio<br />
          invertido y protegido por IA
        </h1>
      </div>

      {/* Bottom row — texto izquierda, CTAs derecha */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          {/* Left — descriptive text */}
          <div className="max-w-sm">
            <p className="text-sm text-ink-light leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
              Vigi combina inteligencia artificial con smart contracts de
              zero-trust para invertir y proteger tu portafolio DeFi en Celo.
              Inversión autónoma, stop-loss automático, take-profit y custodia
              non-custodial. Sin perder el control de tus fondos.
            </p>
          </div>

          {/* Right — CTAs */}
          <div className="flex flex-col items-start sm:items-end gap-4">
            <Link
              href="#solucion"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#2540EB] hover:text-[#0C1424] transition-colors duration-300"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span>Cómo funciona</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-[#0C1424] hover:bg-[#1A2235] active:scale-[0.97] transition-all duration-300 text-white text-sm font-semibold px-7 py-3.5 shadow-lg shadow-[#0C1424]/10"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Ver Live Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
