'use client';

import React from 'react';

export const SecuritySection: React.FC = () => {
  const layers = [
    { num: '01', title: 'Whitelist de contratos', desc: 'Solo se puede interactuar con Uniswap V3, Permit2 y Aave V3. Ningún otro contrato puede ser llamado.' },
    { num: '02', title: 'Whitelist de funciones', desc: 'Solo selectores verificados: approve, swap, supply, borrow, repay, withdraw. Nada más puede ejecutarse.' },
    { num: '03', title: 'Validación de recipient', desc: 'El contrato inspecciona el calldata y verifica que los tokens solo vayan a la wallet del agent o addresses autorizadas.' },
  ];

  return (
    <section id="seguridad" className="py-32 bg-[#FAFAF9]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              Seguridad
            </span>
          </div>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-tight text-[#0C1424] leading-[1.15] max-w-2xl">
            Zero-trust on-chain<br />
            <span className="text-ink-muted">no es opcional</span>
          </h2>
          <p className="mt-6 text-sm text-ink-light leading-relaxed max-w-xl">
            MinimalAccount verifica cada operación en 3 capas independientes.
            Aunque la IA se equivocara, el smart contract rechaza operaciones
            no autorizadas.
          </p>
        </div>

        {/* 3 layers — minimalista con números grandes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone-200/60 mb-20">
          {layers.map((layer) => (
            <div key={layer.num} className="bg-[#FAFAF9] p-10">
              <div className="font-serif-display text-5xl font-medium text-[#2540EB]/20 mb-6">
                {layer.num}
              </div>
              <h3 className="font-serif-display text-xl font-medium text-[#0C1424] mb-3">
                {layer.title}
              </h3>
              <p className="text-sm text-ink-light leading-relaxed">
                {layer.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Guarantees — lista limpia */}
        <div className="border-t border-stone-200/60 pt-12">
          <h3 className="font-serif-display text-2xl font-medium text-[#0C1424] mb-8">
            Garantías del sistema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
            {[
              'Non-custodial: tus claves, tu control',
              'Sin claves API con permiso de retiro',
              'Kill switch: owner puede pausar on-chain',
              'Confidence ≥ 70% para ejecutar cualquier trade',
              'Pausa automática de 24h tras cada venta',
              'Cada operación registrada on-chain con tx hash',
              'Firma off-chain (EIP-191) con nonce anti-replay',
              'Batch execute atómico: si algo falla, todo revierte',
            ].map((guarantee) => (
              <div key={guarantee} className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] mt-2 shrink-0" />
                <span className="text-sm text-ink-light font-medium">
                  {guarantee}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
