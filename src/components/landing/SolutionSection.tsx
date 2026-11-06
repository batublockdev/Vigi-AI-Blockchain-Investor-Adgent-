'use client';

import React from 'react';
import { ExternalLink, TrendingDown, TrendingUp, Clock, Zap, ShieldCheck, ArrowRightLeft, Eye, Lock, FileCheck } from 'lucide-react';

export const SolutionSection: React.FC = () => {
  return (
    <section id="solucion" className="py-32 bg-[#FAFAF9]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              La Solución
            </span>
          </div>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-tight text-[#0C1424] leading-[1.15] max-w-2xl">
            Vigi: tu guardián automático<br />
            <span className="text-ink-muted">on-chain</span>
          </h2>
          <p className="mt-6 text-base text-ink-light leading-relaxed max-w-xl">
            Vigi monitorea precios cada minuto y ejecuta stop-loss o
            take-profit automáticamente. Sin emociones, sin pánico, sin
            cancelaciones a mitad de la noche.
          </p>
        </div>

        {/* ===== LIVE PROOF ===== */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB]" style={{ fontFamily: 'var(--font-inter)' }}>
              Live Proof · Caso real verificado on-chain
            </span>
          </div>

          <h3 className="font-serif-display text-3xl font-medium text-[#0C1424] leading-[1.2] mb-6 max-w-2xl">
            Cómo Vigi protegió el portafolio en la caída de ETH
          </h3>

          <p className="text-base text-ink-light leading-relaxed mb-12 max-w-2xl">
            Durante la caída de ETH desencadenada por el{' '}
            <strong className="text-[#0C1424]">hack de Binance</strong>{' '}
            en octubre 2026, mientras muchos inversores perdieron capital
            significativo, Vigi ejecutó el stop-loss automáticamente: cerró
            la posición de WETH y limitó la pérdida a solo el 5%
            pre-configurado como riesgo aceptable. El 95% del capital fue
            preservado en stablecoin.
          </p>

          {/* Timeline — minimalista */}
          <div className="border-l border-stone-300/70 ml-2 mb-12">
            {[
              { date: 'Oct 22, 2026 · 20:49 UTC', event: 'StockWallet.sol desplegado en Celo Mainnet', highlight: false },
              { date: 'Oct 22, 2026 · 23:34 UTC', event: 'Primera inversión: 0.863154 USDT → WETH + WBTC', tx: '0xb8cf8f33e4ce5c94c7ec44a4d51dfd5e44093b8963682441bd77f9c0b426dc26' },
              { date: 'Oct 24, 2026 · 18:43 UTC', event: 'Segunda inversión: 3.008949 USDT → WETH + WBTC', tx: '0x4a7efff26f01ae06e9b09c908d3a48007fa998402e4561d40564815071c61bc8' },
              { date: 'Oct 25, 2026 · 06:08 UTC', event: 'Tercera inversión: 0.060178 USDT → WETH + WBTC', tx: '0x732243abda48b9e82b02c77ce3a686a145d6416bcda28bd1bbb5654408a21ab5' },
              { date: 'Oct 30, 2026 · 00:19 UTC', event: 'STOP-LOSS EJECUTADO · Posición WETH vendida automáticamente', highlight: true, tx: '0xee44fe34f7ce6030013c99d589a962486b5c60c133c953192b96fa7c7d0e508f' },
            ].map((item, i) => (
              <div key={i} className="relative pl-8 pb-8 last:pb-0">
                <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                  item.highlight
                    ? 'bg-[#2540EB] border-[#2540EB]'
                    : 'bg-[#FAFAF9] border-stone-400'
                }`} />
                <p className={`text-[11px] font-mono font-medium mb-1 ${
                  item.highlight ? 'text-[#2540EB]' : 'text-ink-muted'
                }`}>
                  {item.date}
                </p>
                <p className={`text-sm leading-relaxed ${
                  item.highlight ? 'font-semibold text-[#0C1424]' : 'text-ink-light'
                }`}>
                  {item.event}
                </p>
                {item.tx && (
                  <a
                    href={`https://celoscan.io/tx/${item.tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-[#2540EB] hover:text-[#0C1424] transition-colors"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    <span>Ver tx en Celoscan</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Numbers — grid minimalista */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200/60 mb-10">
            <div className="bg-[#FAFAF9] p-8">
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted block mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                Total invertido
              </span>
              <span className="font-serif-display text-3xl font-medium text-[#0C1424]">3.93</span>
              <span className="text-xs text-ink-muted ml-1">USDT</span>
            </div>
            <div className="bg-[#FAFAF9] p-8">
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted block mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                Invertido en WETH
              </span>
              <span className="font-serif-display text-3xl font-medium text-[#0C1424]">1.53</span>
              <span className="text-xs text-ink-muted ml-1">USDT</span>
            </div>
            <div className="bg-[#FAFAF9] p-8">
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted block mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                Pérdida realizada
              </span>
              <span className="font-serif-display text-3xl font-medium text-[#0C1424]">-0.079</span>
              <span className="text-xs text-ink-muted ml-1">USDT (-5.18%)</span>
            </div>
            <div className="bg-[#FAFAF9] p-8">
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted block mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                Capital preservado
              </span>
              <span className="font-serif-display text-3xl font-medium text-[#2540EB]">1.454</span>
              <span className="text-xs text-ink-muted ml-1">USDT → stablecoin</span>
            </div>
          </div>

          {/* Stop-loss & Take-profit config */}
          <div className="rounded-2xl border border-stone-200/80 p-6 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-[#2540EB]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#0C1424]" style={{ fontFamily: 'var(--font-inter)' }}>
                Configuración de riesgo aplicada
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200/60">
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C1424]">Stop-loss: 95%</p>
                  <p className="text-xs text-ink-muted">Si el valor cae a 95% de la inversión, Vigi vende todo. Pérdida máxima: 5%.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C1424]">Take-profit: 110% (BTC) · 110% (ETH)</p>
                  <p className="text-xs text-ink-muted">Si sube 10% sobre la inversión, Vigi vende solo la ganancia. El capital sigue invertido.</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted mt-4 pt-4 border-t border-stone-100">
              Estos no son números aleatorios. Son los umbrales configurados en el smart contract por el owner. Cada asset tiene su propio stop-loss y take-profit, ajustables en cualquier momento via <code className="text-[10px] bg-stone-100 px-1 py-0.5 rounded font-mono">updateRiskConfig()</code>.
            </p>
          </div>

          {/* Price comparison */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 border-y border-stone-200/60 mb-10">
            <div className="flex items-center gap-4">
              <TrendingDown className="h-5 w-5 text-ink-muted" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>ETH al comprar</p>
                <p className="font-serif-display text-2xl font-medium text-[#0C1424]">$2,351.87</p>
              </div>
            </div>
            <div className="text-xl text-stone-300 font-light">→</div>
            <div className="flex items-center gap-4">
              <TrendingDown className="h-5 w-5 text-[#2540EB]" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>ETH al vender (stop-loss)</p>
                <p className="font-serif-display text-2xl font-medium text-[#2540EB]">$2,222.54</p>
              </div>
            </div>
            <div className="text-sm font-semibold text-[#0C1424] bg-stone-100 px-3 py-1.5 rounded-lg">
              ↓ -5.47%
            </div>
          </div>

          {/* What would have happened */}
          <div className="max-w-2xl mb-12">
            <p className="text-sm text-ink-light leading-relaxed">
              <strong className="text-[#0C1424] font-semibold">¿Qué habría pasado sin el stop-loss?</strong>{' '}
              La posición de WETH habría quedado expuesta a la caída continuada
              de ETH. Vigi convirtió automáticamente el asset que estaba
              cayendo de vuelta a USDT (stablecoin), bloqueando el valor
              recuperado. Luego activó una pausa de 24h para evitar re-entrar
              al mercado durante la alta volatilidad. El inversor solo perdió
              0.079 USDT (5.18%) mientras <strong className="text-[#2540EB]">1.454 USDT quedaron preservados</strong> en stablecoin.
            </p>
          </div>

          {/* All verified txs */}
          <div className="border border-stone-200/80 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200/80 bg-[#F5F5F4]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
                Transacciones verificadas on-chain
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {[
                { hash: '0x74de664f7e690cfb184e44ebc43d95ab2c08d39574e9b5b3e51ae82e7c2f1b24', date: 'Oct 22, 20:49', action: 'Deploy contrato' },
                { hash: '0xb8cf8f33e4ce5c94c7ec44a4d51dfd5e44093b8963682441bd77f9c0b426dc26', date: 'Oct 22, 23:34', action: 'invest() · 1ra inversión' },
                { hash: '0x4a7efff26f01ae06e9b09c908d3a48007fa998402e4561d40564815071c61bc8', date: 'Oct 24, 18:43', action: 'invest() · 2da inversión' },
                { hash: '0x732243abda48b9e82b02c77ce3a686a145d6416bcda28bd1bbb5654408a21ab5', date: 'Oct 25, 06:08', action: 'invest() · 3ra inversión' },
                { hash: '0xee44fe34f7ce6030013c99d589a962486b5c60c133c953192b96fa7c7d0e508f', date: 'Oct 30, 00:19', action: 'STOP-LOSS · WETH vendido', highlight: true },
              ].map((tx, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-4 px-6 py-3.5 ${
                    tx.highlight ? 'bg-[#2540EB]/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] shrink-0" />
                    <span className="font-mono text-[11px] text-ink-muted shrink-0">{tx.date}</span>
                    <span className={`text-sm truncate ${tx.highlight ? 'font-semibold text-[#2540EB]' : 'text-ink-light'}`}>
                      {tx.action}
                    </span>
                  </div>
                  <a
                    href={`https://celoscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2540EB] hover:text-[#0C1424] transition-colors shrink-0"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    <span className="hidden sm:inline">Celoscan</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== HOW IT WORKS ===== */}
        <div className="border-t border-stone-200/60 pt-20 mb-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              Cómo funciona
            </span>
          </div>
          <h3 className="font-serif-display text-3xl font-medium text-[#0C1424] mb-4 max-w-xl">
            Distribución configurable de cada depósito
          </h3>
          <p className="text-sm text-ink-light leading-relaxed mb-12 max-w-xl">
            Los porcentajes no están hardcoded. El owner puede ajustar la
            allocation de cada asset en cualquier momento desde el smart
            contract con <code className="text-[11px] bg-stone-100 px-1.5 py-0.5 rounded font-mono">updateAllocation()</code>.
            La configuración actual es:
          </p>

          {/* Allocation bar */}
          <div className="mb-16">
            <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden flex mb-4">
              <div className="bg-[#0C1424] h-full" style={{ width: '78%' }} />
              <div className="bg-[#2540EB] h-full" style={{ width: '20%' }} />
              <div className="bg-stone-400 h-full" style={{ width: '2%' }} />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#0C1424]" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>78% Tokens</span>
                </div>
                <p className="text-xs text-ink-muted">WETH + WBTC via Uniswap V3</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#2540EB]" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>20% Vigi</span>
                </div>
                <p className="text-xs text-ink-muted">Capital autónomo en MinimalAccount</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-stone-400" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>2% Gas</span>
                </div>
                <p className="text-xs text-ink-muted">Ejecución on-chain</p>
              </div>
            </div>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                01 Protección
              </div>
              <h4 className="font-serif-display text-lg font-medium text-[#0C1424] mb-2">
                Stop-loss automático
              </h4>
              <p className="text-sm text-ink-light leading-relaxed mb-3">
                Reglas escritas en el smart contract. Si un asset cae al 95%
                del valor invertido, Vigi vende y remueve el token del
                portafolio. Sin intervención humana.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Clock className="h-3 w-3" />
                <span>Monitoreo cada 1 minuto</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                02 Crecimiento
              </div>
              <h4 className="font-serif-display text-lg font-medium text-[#0C1424] mb-2">
                Take-profit parcial
              </h4>
              <p className="text-sm text-ink-light leading-relaxed mb-3">
                Cuando un asset sube 10% sobre la inversión, Vigi vende solo
                la ganancia. El capital inicial sigue invertido. No es todo
                o nada.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Clock className="h-3 w-3" />
                <span>Pausa 24h anti-churn</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                03 Inteligencia
              </div>
              <h4 className="font-serif-display text-lg font-medium text-[#0C1424] mb-2">
                Vigi IA cada 10 horas
              </h4>
              <p className="text-sm text-ink-light leading-relaxed mb-3">
                Vigi analiza portafolio, precios y posiciones en Aave. Decide
                swap, supply, borrow o hold. Ejecuta solo si confidence ≥ 70%.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Zap className="h-3 w-3" />
                <span>x402 micropayments en USDC</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== VIGI AUTONOMY ===== */}
        <div className="border-t border-stone-200/60 pt-20 mb-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              Autonomía de Vigi
            </span>
          </div>
          <h3 className="font-serif-display text-3xl font-medium text-[#0C1424] mb-4 max-w-2xl">
            El 20% del capital autónomo:<br />
            <span className="text-ink-muted">libertad con verificación en cada paso</span>
          </h3>
          <p className="text-sm text-ink-light leading-relaxed mb-12 max-w-2xl">
            Cada depósito envía el 20% a MinimalAccount, la smart wallet de
            Vigi. Con ese capital, Vigi puede hacer swaps en Uniswap V3,
            supply en Aave V3 para generar yield, borrow para apalancarse, y
            realocar entre 14 tokens. Pero cada operación pasa por 3 capas
            de verificación on-chain antes de ejecutarse.
          </p>

          {/* Autonomy flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* What Vigi CAN do */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#2540EB] mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
                Lo que Vigi puede hacer solo
              </div>
              <div className="space-y-4">
                {[
                  { icon: ArrowRightLeft, title: 'Swaps en Uniswap V3', desc: 'Convertir entre 14 tokens: USDT, USDC, WBTC, WETH, CELO, wBRL, wARS, EURm, CHFm, GBPm y más.' },
                  { icon: ShieldCheck, title: 'Supply en Aave V3', desc: 'Depositar tokens para generar yield variable (~2-4% APY en stablecoins).' },
                  { icon: Zap, title: 'Borrow para apalancarse', desc: 'Pedir prestado contra colateral si Health Factor > 1.5. Repagar cuando sea necesario.' },
                  { icon: Eye, title: 'Withdraw y realocación', desc: 'Retirar colateral de Aave y mover a otro asset con mejor yield.' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2540EB]/5 border border-[#2540EB]/10">
                        <Icon className="h-4 w-4 text-[#2540EB]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0C1424]">{item.title}</p>
                        <p className="text-xs text-ink-muted leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What Vigi CANNOT do */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
                Lo que Vigi no puede hacer
              </div>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'Withdraw fondos del contrato', desc: 'Solo el owner puede retirar tokens. Vigi nunca tiene acceso a esto.' },
                  { icon: Lock, title: 'Pausar el contrato', desc: 'El kill switch solo lo activa el owner o el bot tras una venta.' },
                  { icon: Lock, title: 'Agregar tokens o protocolos nuevos', desc: 'Requiere registerTarget y setAllowedAddress desde el owner.' },
                  { icon: Lock, title: 'Enviar fondos a una dirección externa', desc: 'El contrato valida que el recipient sea MinimalAccount o whitelistado.' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 border border-stone-200/60">
                        <Icon className="h-4 w-4 text-stone-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-light">{item.title}</p>
                        <p className="text-xs text-ink-muted leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Verification layers */}
          <div className="rounded-2xl border border-stone-200/80 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileCheck className="h-4 w-4 text-[#2540EB]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#0C1424]" style={{ fontFamily: 'var(--font-inter)' }}>
                Verificación en cada operación
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="font-serif-display text-3xl font-medium text-[#2540EB]/20 mb-2">01</div>
                <p className="text-sm font-semibold text-[#0C1424] mb-1">Whitelist de contratos</p>
                <p className="text-xs text-ink-muted leading-relaxed">Solo Uniswap V3, Permit2 y Aave V3. Ningún otro contrato puede ser llamado.</p>
              </div>
              <div>
                <div className="font-serif-display text-3xl font-medium text-[#2540EB]/20 mb-2">02</div>
                <p className="text-sm font-semibold text-[#0C1424] mb-1">Whitelist de funciones</p>
                <p className="text-xs text-ink-muted leading-relaxed">Solo selectores verificados: approve, swap, supply, borrow, repay, withdraw.</p>
              </div>
              <div>
                <div className="font-serif-display text-3xl font-medium text-[#2540EB]/20 mb-2">03</div>
                <p className="text-sm font-semibold text-[#0C1424] mb-1">Validación de recipient</p>
                <p className="text-xs text-ink-muted leading-relaxed">El contrato inspecciona el calldata: los tokens solo pueden ir a MinimalAccount o addresses autorizadas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIPIO + STABLECOINS ===== */}
        <div className="border-t border-stone-200/60 pt-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              Accesibilidad LATAM
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif-display text-3xl font-medium text-[#0C1424] mb-4">
                Stablecoins locales<br />vía Ripio
              </h3>
              <p className="text-sm text-ink-light leading-relaxed mb-6">
                Depositá usando las stablecoins de tu país. Integración directa
                con Ripio Ramp para comprar con PSE en Colombia, PIX en Brasil
                o transferencia en Argentina. El depósito se swap
                automáticamente a USDT dentro del vault via Uniswap V3.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-ink-light">🇨🇴 PSE Colombia</span>
                <span className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-ink-light">🇧🇷 PIX Brasil</span>
                <span className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-ink-light">🇦🇷 ARS Argentina</span>
              </div>
            </div>

            {/* Stablecoin cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200/80 bg-[#FAFAF9] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#74ACDF] text-white text-[10px] font-bold mb-3">
                  ARS
                </div>
                <p className="text-sm font-semibold text-[#0C1424]">wARS</p>
                <p className="text-[11px] text-ink-muted">Peso argentino on-chain</p>
              </div>
              <div className="rounded-2xl border border-stone-200/80 bg-[#FAFAF9] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#009C3B] text-white text-[10px] font-bold mb-3">
                  R$
                </div>
                <p className="text-sm font-semibold text-[#0C1424]">wBRL</p>
                <p className="text-[11px] text-ink-muted">Real brasileño on-chain</p>
              </div>
              <div className="rounded-2xl border border-stone-200/80 bg-[#FAFAF9] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#26A17B] text-white text-[10px] font-bold mb-3">
                  ₮
                </div>
                <p className="text-sm font-semibold text-[#0C1424]">USDT</p>
                <p className="text-[11px] text-ink-muted">Dólar global</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
