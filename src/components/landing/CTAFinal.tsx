'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Github, Youtube } from 'lucide-react';

export const CTAFinal: React.FC = () => {
  return (
    <section className="py-32 bg-[#F5F5F4]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative rounded-3xl bg-[#0C1424] p-12 sm:p-16 text-center overflow-hidden">
          {/* Concentric rings decorativos */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[200px] h-[200px] rounded-full border border-[#2540EB]/10" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[400px] h-[400px] rounded-full border border-[#2540EB]/[0.06]" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full border border-[#2540EB]/[0.03]" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400" style={{ fontFamily: 'var(--font-inter)' }}>
                Dashboard Live
              </span>
            </div>

            <h2 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-tight text-white leading-[1.15] mb-6">
              Mira el dashboard<br />
              <span className="text-stone-400">en acción</span>
            </h2>

            <p className="mx-auto max-w-lg text-sm text-stone-400 leading-relaxed mb-10">
              Dashboard live con balances on-chain, decisiones del AI agent,
              posiciones en Aave y auditoría completa de operaciones.
              Todo leyendo datos reales de Celo mainnet.
            </p>

            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-stone-100 active:scale-[0.97] transition-all duration-300 text-[#0C1424] font-semibold text-base px-8 py-4 shadow-lg shadow-black/20"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span>Ver Demo Live</span>
              <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>

            {/* Secondary links */}
            <div className="mt-10 flex items-center justify-center gap-6">
              <a
                href="https://github.com/batublockdev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500 hover:text-white transition-colors duration-300"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://youtu.be/5EdqnuIB5ZA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500 hover:text-white transition-colors duration-300"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <Youtube className="h-4 w-4" />
                <span>Video Demo</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer — minimalista */}
        <footer className="mt-20 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center">
              <div className="absolute inset-0 rounded-md bg-[#0C1424]" />
              <div className="absolute inset-[3px] rounded-sm border border-[#2540EB]/40" />
              <span className="relative text-white text-[9px] font-black">A</span>
            </div>
            <span className="text-sm font-bold text-[#0C1424]" style={{ fontFamily: 'var(--font-inter)' }}>
              Adgent Protocol
            </span>
          </div>
          <p className="text-[11px] text-ink-muted max-w-md text-center leading-relaxed">
            Sistema autónomo de inversión DeFi con IA y zero-trust security en
            Celo mainnet. No es asesoría financiera.
          </p>
        </footer>
      </div>
    </section>
  );
};
