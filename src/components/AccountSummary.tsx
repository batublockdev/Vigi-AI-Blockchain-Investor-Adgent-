'use client';

import React from 'react';

interface AccountSummaryProps {
  totalBalance: number;
  tokensValue: number;
  reserveValue: number;
  cashValue: number;
  totalGainAmount: number;
  totalGainPercent: number;
  showPerformance?: boolean;
  onAddFunds: () => void;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  totalBalance,
  tokensValue,
  reserveValue,
  cashValue,
  totalGainAmount,
  totalGainPercent,
  showPerformance = true,
  onAddFunds,
}) => {
  const isPositive = totalGainAmount >= 0;

  // Percentage allocations
  const safeTotal = totalBalance > 0 ? totalBalance : 1;
  const tokensPct = Math.round((tokensValue / safeTotal) * 100);
  const reservePct = Math.round((reserveValue / safeTotal) * 100);
  const cashPct = Math.max(0, 100 - tokensPct - reservePct);

  return (
    <div
      className="rounded-2xl bg-[#FAFAF9] p-10"
      style={{ boxShadow: '0 1px 3px 0 rgba(12,20,36,0.04)' }}
    >
      {/* ── Header: Title + Add Funds ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex flex-col gap-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Total Portfolio Value
          </span>

          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl tracking-tight text-[#0C1424]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 600 }}
            >
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className="text-sm font-medium text-[#6B7280]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              USD
            </span>
          </div>

          {/* Performance pill or Live badge */}
          {showPerformance ? (
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-flex items-center text-xs font-semibold rounded-full px-3 py-1 ${
                  isPositive
                    ? 'bg-[#2540EB]/8 text-[#2540EB]'
                    : 'bg-stone-200/60 text-[#6B7280]'
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}
                {totalGainPercent.toFixed(2)}%
                <span className="mx-1.5 opacity-40">·</span>
                {isPositive ? '+' : '−'}${Math.abs(totalGainAmount).toFixed(4)}
              </span>
            </div>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-200/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6B7280] w-fit"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] animate-pulse" />
              Live on-chain balances
            </span>
          )}

          <p
            className="text-xs text-[#6B7280] mt-2 max-w-md"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Current token balances read directly from the portfolio vault on Celo.
          </p>
        </div>

        {/* Add Funds button */}
        <button
          onClick={onAddFunds}
          className="self-start sm:self-auto rounded-2xl bg-[#0C1424] px-6 py-3 text-white text-xs font-semibold transition hover:bg-[#0C1424]/90 active:scale-[0.97]"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          + Add Funds
        </button>
      </div>

      {/* ── Allocation Section ────────────────────────────────────── */}
      <div className="mt-12">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider text-[#0C1424]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Capital Allocation
          </span>
          <span
            className="text-[10px] font-medium uppercase tracking-wider text-[#6B7280]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Auto-rebalanced by AI
          </span>
        </div>

        {/* Visual progress bar — minimal, flat */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-200/60">
          <div
            className="bg-[#0C1424] h-full transition-all duration-500"
            style={{ width: `${tokensPct}%` }}
            title={`Selected Tokens: ${tokensPct}%`}
          />
          <div
            className="bg-[#2540EB] h-full transition-all duration-500"
            style={{ width: `${reservePct}%` }}
            title={`Autonomous AI Capital: ${reservePct}%`}
          />
          <div
            className="bg-stone-400 h-full transition-all duration-500"
            style={{ width: `${cashPct}%` }}
            title={`Gas & Available Cash: ${cashPct}%`}
          />
        </div>

        {/* ── 3 Allocation Cards with gap-px separators ─────────── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-stone-200/60 rounded-xl overflow-hidden">
          {/* Tokens */}
          <div className="bg-[#F5F5F4] p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0C1424]" />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Selected Tokens
              </span>
              <span
                className="ml-auto text-[10px] font-semibold text-[#0C1424]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {tokensPct}%
              </span>
            </div>
            <div
              className="mt-4 text-3xl text-[#0C1424]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 600 }}
            >
              ${tokensValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span
              className="text-[11px] text-[#6B7280] mt-2 block"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Bitcoin (WBTC) &amp; Ethereum (WETH)
            </span>
          </div>

          {/* AI Discretionary Capital */}
          <div className="bg-[#F5F5F4] p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2540EB]" />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Autonomous AI Capital
              </span>
              <span
                className="ml-auto text-[10px] font-semibold text-[#2540EB]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {reservePct}%
              </span>
            </div>
            <div
              className="mt-4 text-3xl text-[#0C1424]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 600 }}
            >
              ${reserveValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span
              className="text-[11px] text-[#6B7280] mt-2 block"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Discretionary AI management &amp; safe reserve
            </span>
          </div>

          {/* Cash & Gas */}
          <div className="bg-[#F5F5F4] p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-stone-400" />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Gas &amp; Liquid Cash
              </span>
              <span
                className="ml-auto text-[10px] font-semibold text-[#6B7280]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {cashPct}%
              </span>
            </div>
            <div
              className="mt-4 text-3xl text-[#0C1424]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 600 }}
            >
              ${cashValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span
              className="text-[11px] text-[#6B7280] mt-2 block"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Celo on-chain execution &amp; stop-loss triggers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
