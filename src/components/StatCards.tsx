'use client';

import React from 'react';

interface StatCardsProps {
  aave: {
    collateral: string;
    debt: string;
    healthFactor: string;
  };
  balances: Record<string, string>;
  positions: Array<{
    estimatedValueNum: number;
    investedNum: number;
    pnlValue: number;
    pnlPercent: number;
  }>;
  totalDecisions: number;
  totalChecks: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  aave,
  balances,
  positions = [],
  totalDecisions,
  totalChecks,
}) => {
  // Aggregate financial metrics
  const aaveCollateral = parseFloat(aave.collateral || '0');
  const walletUsdt = parseFloat(balances['USDT'] || '0');
  const positionsValue = positions.reduce((acc, pos) => acc + (pos.estimatedValueNum || 0), 0);
  const totalBalance = aaveCollateral + walletUsdt + positionsValue;

  const totalInvestedInPositions = positions.reduce((acc, pos) => acc + (pos.investedNum || 0), 0);
  const totalGainsInPositions = positions.reduce((acc, pos) => acc + (pos.pnlValue || 0), 0);
  const isPositiveGain = totalGainsInPositions >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Total Portfolio Balance */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Total Net Worth
        </span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            ${totalBalance.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-slate-400">USD</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <span>Across all pools &amp; assets</span>
          <span className="font-semibold text-slate-700">100% Backed</span>
        </div>
      </div>

      {/* Metric 2: Aave High Yield */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Earning Interest (Aave)
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
            ~3.2% APY
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-emerald-600 font-mono">
            ${aaveCollateral.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-slate-400">USD</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <span>Daily yield payout</span>
          <span className="font-semibold text-emerald-700">Zero Risk</span>
        </div>
      </div>

      {/* Metric 3: Active Holdings (StockWallet) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Managed Assets
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
              isPositiveGain
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {isPositiveGain ? '+' : ''}
            {totalInvestedInPositions > 0
              ? ((totalGainsInPositions / totalInvestedInPositions) * 100).toFixed(2)
              : '0.00'}
            %
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            ${positionsValue.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-slate-400">USD</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <span>Protected by Stop-Loss</span>
          <span className="font-semibold text-slate-700">2 Assets</span>
        </div>
      </div>

      {/* Metric 4: Cash Available */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Available Cash (Idle)
        </span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            ${walletUsdt.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-slate-400">USD</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <span>Ready to be deployed</span>
          <span className="font-semibold text-slate-700">Liquid</span>
        </div>
      </div>
    </div>
  );
};
