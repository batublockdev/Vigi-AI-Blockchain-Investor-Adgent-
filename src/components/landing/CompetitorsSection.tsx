'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export const CompetitorsSection: React.FC = () => {
  const competitors = [
    {
      name: '3Commas',
      pain: 'Preocupaciones de seguridad con claves API y conexión de cuentas. El usuario no sabe qué permisos está entregando.',
      source: 'r/3CommasCommunity',
    },
    {
      name: 'Cryptohopper',
      pain: 'Configuración difícil de entender. Dudas sobre si las estrategias y señales realmente funcionan.',
      source: 'r/CryptoHopper',
    },
    {
      name: 'GMGN / Memecoins',
      pain: 'Señales que llegan tarde, slippage alto, liquidez que desaparece. La ejecución es peor que la señal.',
      source: 'r/SolanaMemeCoins',
    },
    {
      name: 'Agentes IA on-chain',
      pain: 'Escepticismo sobre dar capacidad de acción a sistemas automatizados. ¿La IA realmente aporta valor?',
      source: 'r/CryptoTechnology',
    },
  ];

  return (
    <section id="competidores" className="py-32 bg-[#F5F5F4]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              Comparativa
            </span>
          </div>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-tight text-[#0C1424] leading-[1.15] max-w-2xl">
            Lo que falla en los competidores<br />
            <span className="text-ink-muted">y cómo Vigi es distinto</span>
          </h2>
          <p className="mt-6 text-sm text-ink-light leading-relaxed max-w-xl">
            Análisis basado en conversaciones reales de usuarios en Reddit,
            reseñas públicas y estudios de mercado (Q3 2026).
          </p>
        </div>

        {/* Competitor pain points — minimalista */}
        <div className="space-y-px bg-stone-200/60 mb-20">
          {competitors.map((comp, i) => (
            <div key={comp.name} className="bg-[#F5F5F4] p-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4 flex-1">
                <span className="font-serif-display text-2xl font-medium text-ink-muted/40 shrink-0">
                  0{i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-[#0C1424]" style={{ fontFamily: 'var(--font-inter)' }}>
                      {comp.name}
                    </h3>
                    <span className="text-[10px] text-ink-muted font-mono">{comp.source}</span>
                  </div>
                  <p className="text-sm text-ink-light leading-relaxed">
                    {comp.pain}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table — limpia */}
        <div className="mb-20">
          <h3 className="font-serif-display text-2xl font-medium text-[#0C1424] mb-8">
            Vigi vs. competidores
          </h3>
          <div className="border border-stone-200/80 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-4 border-b border-stone-200/80 bg-[#FAFAF9]">
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
                Característica
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#2540EB] text-center" style={{ fontFamily: 'var(--font-inter)' }}>
                Vigi
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted text-center" style={{ fontFamily: 'var(--font-inter)' }}>
                Bots tradicionales
              </span>
            </div>
            {[
              { feat: 'Custodia de fondos', vigi: 'Non-custodial, wallet separada', others: 'Claves API amplias' },
              { feat: 'Stop-loss on-chain', vigi: 'Ejecutado por smart contract', others: 'Orden de exchange' },
              { feat: 'Pausa automática', vigi: '24h post-venta', others: 'No existe' },
              { feat: 'Whitelist de activos', vigi: 'Sí, on-chain', others: 'Configuración manual' },
              { feat: 'Transparencia', vigi: 'Cada tx on-chain + razón', others: 'Logs opacos' },
              { feat: 'Costes ocultos', vigi: 'Visibles (gas + fee 5%)', others: 'Suscripción + slippage' },
              { feat: 'Kill switch', vigi: 'Owner pausa on-chain', others: 'Desconectar API' },
              { feat: 'Confianza en IA', vigi: 'Confidence ≥ 70%', others: 'Sin umbral' },
            ].map((row, i) => (
              <div key={row.feat} className={`grid grid-cols-3 px-6 py-4 items-center ${i % 2 === 0 ? 'bg-[#F5F5F4]' : 'bg-[#FAFAF9]'}`}>
                <span className="text-sm text-ink-light font-medium">{row.feat}</span>
                <div className="flex flex-col items-center gap-1">
                  <Check className="h-4 w-4 text-[#2540EB]" />
                  <span className="text-[10px] text-ink-muted text-center">{row.vigi}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <X className="h-4 w-4 text-stone-300" />
                  <span className="text-[10px] text-ink-muted/60 text-center">{row.others}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vigi advantages — grid 2x2 minimalista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-stone-200/60">
          {[
            { title: 'Seguridad demostrable', desc: 'Wallet separada, permisos mínimos, sin claves API con retiro. Kill switch on-chain.' },
            { title: 'Control determinista', desc: 'El LLM propone, Vigi valida tamaño, presupuesto, stop-loss y activos. Si falla, se rechaza.' },
            { title: 'Transparencia total', desc: 'Cada decisión on-chain con razón, confidence y tx hash. PnL neto verificable, no promocional.' },
            { title: 'Sin promesas vacías', desc: 'No prometemos "la mejor IA". Prometemos reglas verificables, explicación de cada operación de Vigi y costes reales.' },
          ].map((adv, i) => (
            <div key={adv.title} className="bg-[#F5F5F4] p-10">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                0{i + 1}
              </div>
              <h4 className="font-serif-display text-lg font-medium text-[#0C1424] mb-3">
                {adv.title}
              </h4>
              <p className="text-sm text-ink-light leading-relaxed">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
