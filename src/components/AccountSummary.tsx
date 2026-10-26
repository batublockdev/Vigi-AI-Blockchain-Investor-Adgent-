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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Total Portfolio Value
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-slate-900 font-mono">
              ${totalBalance.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">USD</span>

            {/* Performance pill */}
            {showPerformance ? <span
              className={`ml-2 inline-flex items-center text-xs font-bold rounded-lg px-2.5 py-0.5 ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isPositive ? '+' : ''}
              {totalGainPercent.toFixed(2)}% ({isPositive ? '+' : ''}${Math.abs(totalGainAmount).toFixed(4)})
            </span> : <span className="ml-2 inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Live on-chain balances</span>}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current token balances read directly from the portfolio vault on Celo.
          </p>
        </div>

        <button
          onClick={onAddFunds}
          className="self-start sm:self-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition text-white font-bold text-xs px-5 py-3 shadow-xs"
        >
          + Add Funds
        </button>
      </div>

      {/* Allocation breakdown bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
          <span>Capital Allocation</span>
          <span className="text-slate-400 font-normal">Auto-rebalanced by AI</span>
        </div>

        {/* Visual progress bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="bg-slate-900 h-full"
            style={{ width: `${tokensPct}%` }}
            title={`Selected Tokens: ${tokensPct}%`}
          />
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${reservePct}%` }}
            title={`Autonomous AI Capital: ${reservePct}%`}
          />
          <div
            className="bg-amber-400 h-full"
            style={{ width: `${cashPct}%` }}
            title={`Gas & Available Cash: ${cashPct}%`}
          />
        </div>

        {/* 3 Summary Cards in USD */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tokens */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              <span className="text-xs font-bold text-slate-700">Selected Tokens (78%)</span>
              <span className="text-[11px] font-semibold text-slate-400 ml-auto">
                {tokensPct}%
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900">
              ${tokensValue.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">USD</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Bitcoin (WBTC) &amp; Ethereum (WETH)
            </span>
          </div>

          {/* AI Discretionary Capital */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Autonomous AI Capital (20%)</span>
              <span className="text-[11px] font-semibold text-emerald-700 ml-auto font-bold">
                {reservePct}%
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-700">
              ${reserveValue.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">USD</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Discretionary AI management &amp; safe reserve
            </span>
          </div>

          {/* Cash & Gas */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-slate-700">Gas &amp; Liquid Cash (2%)</span>
              <span className="text-[11px] font-semibold text-slate-400 ml-auto">
                {cashPct}%
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900">
              ${cashValue.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">USD</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Celo on-chain execution &amp; stop-loss triggers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
