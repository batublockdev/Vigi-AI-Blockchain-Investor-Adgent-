'use client';

import React from 'react';
import { Bot, Zap, ShieldCheck, ArrowRightLeft, ExternalLink, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

interface CashReserveProps {
  aave: {
    collateral: string;
    debt: string;
    healthFactor: string;
  };
  accountAddress?: string;
  tokenBalances?: { USDT: string; aCelUSDT: string } | null;
  onAddFunds: () => void;
  latestDecision?: {
    id: number;
    timestamp: string;
    action: string;
    asset?: string | null;
    amount?: string | null;
    reason: string;
    confidence: number;
    executed: number;
    result?: string | null;
    tx_hash?: string | null;
    payment_tx?: string | null;
  } | null;
}

export const CashReserve: React.FC<CashReserveProps> = ({ aave, accountAddress, tokenBalances, onAddFunds, latestDecision }) => {
  const collateralValueUSD = parseFloat(aave.collateral || '0');
  const debtValueUSD = parseFloat(aave.debt || '0');

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'swap':
      case 'swap_and_supply':
        return <ArrowRightLeft className="h-4 w-4 text-[#2540EB]" />;
      case 'supply':
        return <TrendingUp className="h-4 w-4 text-[#2540EB]" />;
      case 'borrow':
        return <TrendingDown className="h-4 w-4 text-amber-600" />;
      case 'repay':
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case 'withdraw':
        return <TrendingDown className="h-4 w-4 text-stone-400" />;
      case 'hold':
        return <Clock className="h-4 w-4 text-stone-400" />;
      default:
        return <Activity className="h-4 w-4 text-stone-400" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      swap: 'SWAP',
      swap_and_supply: 'SWAP + SUPPLY',
      supply: 'SUPPLY',
      borrow: 'BORROW',
      repay: 'REPAY',
      withdraw: 'WITHDRAW',
      hold: 'HOLD',
      request_approval: 'NEEDS APPROVAL',
      request_setup: 'NEEDS SETUP',
    };
    return labels[action?.toLowerCase()] || action?.toUpperCase() || 'UNKNOWN';
  };

  const formatDateLong = (timestamp: string) => {
    const d = new Date(parseInt(timestamp, 10));
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractTxHash = (): string | null => {
    if (latestDecision?.tx_hash) return latestDecision.tx_hash;
    if (latestDecision?.result) {
      const match = latestDecision.result.match(/0x[a-fA-F0-9]{64}/);
      if (match) return match[0];
    }
    return null;
  };

  const txHash = latestDecision ? extractTxHash() : null;

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-[#F5F5F4] p-10">
      {/* Header */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2540EB]/5 border border-[#2540EB]/10 shrink-0">
            <Bot className="h-6 w-6 text-[#2540EB]" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif-display text-2xl font-medium text-[#0C1424]">
                Vigi Autonomous Capital
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2540EB]/5 border border-[#2540EB]/10 px-3 py-1 text-[10px] font-bold tracking-wider text-[#2540EB] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] animate-pulse" />
                100% Autonomous
              </span>
            </div>
            <p
              className="text-sm text-ink-light max-w-xl leading-relaxed"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Vigi gestiona este capital de forma totalmente autónoma. Cada 10 horas
              analiza el mercado, lee posiciones en Aave, evalúa precios en Uniswap V3,
              y decide si swap, supply, borrow o hold. Todo firmado off-chain y
              verificado on-chain por MinimalAccount. Sin intervención humana.
            </p>

            {/* Capability badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-[#FAFAF9] px-2.5 py-1 text-[10px] font-medium text-ink-light">
                <ArrowRightLeft className="h-3 w-3 text-[#2540EB]" />
                <span>Swaps Uniswap V3</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-[#FAFAF9] px-2.5 py-1 text-[10px] font-medium text-ink-light">
                <Zap className="h-3 w-3 text-[#2540EB]" />
                <span>Supply / Borrow Aave V3</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-[#FAFAF9] px-2.5 py-1 text-[10px] font-medium text-ink-light">
                <ShieldCheck className="h-3 w-3 text-[#2540EB]" />
                <span>14 tokens · 3 capas de seguridad</span>
              </span>
            </div>

            {accountAddress && (
              <a
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#2540EB] hover:text-[#0C1424] transition-colors pt-1"
                href={`https://celoscan.io/address/${accountAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <span>MinimalAccount: {accountAddress.slice(0, 8)}...{accountAddress.slice(-6)}</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}
          </div>
        </div>

        <button
          onClick={onAddFunds}
          className="shrink-0 rounded-2xl bg-[#0C1424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1A2235] active:scale-95"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Add to Vigi Reserve
        </button>
      </div>

      {/* Spacer */}
      <div className="mt-12" />

      {/* Grid of 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-stone-200/60 rounded-xl overflow-hidden">
        <div className="bg-[#FAFAF9] p-8">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]" style={{ fontFamily: 'var(--font-inter)' }}>
            Vigi Managed Capital
          </span>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-medium text-[#0C1424]" style={{ fontFamily: 'var(--font-playfair)' }}>
              ${collateralValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium text-[#6B7280]" style={{ fontFamily: 'var(--font-inter)' }}>USD</span>
          </div>
          <p className="mt-4 text-xs text-[#6B7280] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
            {tokenBalances ? 'Capital real leyéndose on-chain desde Celo' : 'Lectura on-chain no disponible'}
          </p>
        </div>

        <div className="bg-[#FAFAF9] p-8">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]" style={{ fontFamily: 'var(--font-inter)' }}>
            Current Vigi Placement
          </span>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-xl font-medium text-[#0C1424]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {tokenBalances && parseFloat(tokenBalances.aCelUSDT) > 0 ? 'Aave V3 · USDT' : 'Liquid USDT'}
            </span>
          </div>
          <p className="mt-4 text-xs text-[#6B7280] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
            {tokenBalances
              ? `${parseFloat(tokenBalances.USDT).toFixed(4)} USDT liquid · ${parseFloat(tokenBalances.aCelUSDT).toFixed(4)} aCelUSDT generating yield`
              : 'No se pudieron leer los tokens desde Celo'}
          </p>
        </div>

        <div className="bg-[#FAFAF9] p-8">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]" style={{ fontFamily: 'var(--font-inter)' }}>
            Debt &amp; Loans
          </span>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-medium text-[#0C1424]" style={{ fontFamily: 'var(--font-playfair)' }}>
              ${debtValueUSD.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-[#6B7280]" style={{ fontFamily: 'var(--font-inter)' }}>USD</span>
          </div>
          <p className="mt-4 text-xs text-[#6B7280] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
            {debtValueUSD > 0 ? 'Deuda activa en Aave V3 · monitorear Health Factor' : 'Sin deuda. Vigi puede usar leverage si HF > 1.5'}
          </p>
        </div>

        <div className="bg-[#FAFAF9] p-8">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]" style={{ fontFamily: 'var(--font-inter)' }}>
            Vigi Autonomy Status
          </span>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-2xl font-medium text-[#2540EB]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {accountAddress ? 'Active' : 'Unavailable'}
            </span>
          </div>
          <p className="mt-4 text-xs text-[#6B7280] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
            {accountAddress ? 'Vigi opera solo · confidence ≥ 70% para ejecutar' : 'Verificar conexión RPC de Celo'}
          </p>
        </div>
      </div>

      {/* ===== Latest Vigi Decision ===== */}
      {latestDecision && (
        <div className="mt-8">
          <div className="rounded-2xl bg-[#0C1424] p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400" style={{ fontFamily: 'var(--font-inter)' }}>
                Última decisión de Vigi
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Left: action + amount */}
              <div className="sm:w-1/2">
                <div className="flex items-center gap-2.5 mb-4">
                  {getActionIcon(latestDecision.action)}
                  <span className="text-xs font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-inter)' }}>
                    {getActionLabel(latestDecision.action)}
                  </span>
                  {latestDecision.confidence > 0 && (
                    <span className="text-[10px] font-bold text-[#2540EB] bg-[#2540EB]/20 px-2 py-0.5 rounded-full">
                      {latestDecision.confidence}% confidence
                    </span>
                  )}
                </div>

                {(latestDecision.amount || latestDecision.asset) && (
                  <div className="flex items-baseline gap-2 mb-3">
                    {latestDecision.amount && (
                      <span className="font-serif-display text-2xl font-medium text-white">
                        {latestDecision.amount}
                      </span>
                    )}
                    {latestDecision.asset && (
                      <span className="text-sm text-stone-400">{latestDecision.asset}</span>
                    )}
                  </div>
                )}

                <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                  {latestDecision.reason}
                </p>
              </div>

              {/* Right: date + status + tx */}
              <div className="sm:w-1/2 sm:border-l sm:border-stone-700/50 sm:pl-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 block" style={{ fontFamily: 'var(--font-inter)' }}>
                      Fecha
                    </span>
                    <span className="text-xs font-mono text-stone-300 mt-1 block">
                      {formatDateLong(latestDecision.timestamp)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 block" style={{ fontFamily: 'var(--font-inter)' }}>
                      Estado
                    </span>
                    <div className="mt-1">
                      {latestDecision.executed === 1 ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>EXECUTED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />
                          <span>{latestDecision.action?.toLowerCase() === 'hold' ? 'HOLDING' : 'NOT EXECUTED'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {txHash && (
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 block" style={{ fontFamily: 'var(--font-inter)' }}>
                        Transacción
                      </span>
                      <a
                        href={`https://celoscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2540EB] hover:text-white transition-colors mt-1"
                      >
                        <span>Ver en Celoscan</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Pago x402 — consulta al LLM */}
                  {latestDecision.payment_tx && (
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 block" style={{ fontFamily: 'var(--font-inter)' }}>
                        Pago x402 (consulta IA)
                      </span>
                      <a
                        href={`https://celoscan.io/tx/${latestDecision.payment_tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2540EB] hover:text-white transition-colors mt-1"
                      >
                        <span>0.003 USDC · Ver pago</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
