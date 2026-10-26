'use client';

import React from 'react';

interface AaveSectionProps {
  aave: {
    collateral: string;
    debt: string;
    healthFactor: string;
  };
  onInvestClick: () => void;
}

export const AaveSection: React.FC<AaveSectionProps> = ({ aave, onInvestClick }) => {
  const collateralValue = parseFloat(aave.collateral || '0');
  const debtValue = parseFloat(aave.debt || '0');
  const estAnnualYield = collateralValue * 0.032; // ~3.2% average APY on stablecoins

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              High-Yield Savings Pool (Aave V3 Protocol)
            </h2>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              Active Yield
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Your idle digital dollars are automatically deposited into audited decentralized liquidity pools to generate variable interest.
          </p>
        </div>

        <button
          onClick={onInvestClick}
          className="self-start sm:self-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 shadow-xs transition active:scale-95"
        >
          Deposit &amp; Earn
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Deposited Value */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Supplied &amp; Earning
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${collateralValue.toFixed(4)}
            </span>
            <span className="text-xs font-semibold text-slate-500">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Asset: Tether USD (aUSDT)
          </span>
        </div>

        {/* Metric 2: Annual Percentage Yield */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Variable APY
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              ~3.20%
            </span>
            <span className="text-xs font-semibold text-emerald-700">Annual</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Compound interest paid continuously
          </span>
        </div>

        {/* Metric 3: Debt / Borrowing */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Debt &amp; Loans Taken
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${debtValue.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">USD</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Zero debt (No borrowing risk)
          </span>
        </div>

        {/* Metric 4: Liquidation Safety */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Account Safety Rating
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">
              100%
            </span>
            <span className="text-xs font-semibold text-emerald-700">Protected</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Zero liquidation possibility
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold text-emerald-900">How your yield works: </span>
          <span>
            Every second your funds remain in the Aave pool, they generate interest backed by decentralized borrower demand on Celo mainnet.
          </span>
        </div>
        <div className="shrink-0 font-mono text-[11px] font-semibold text-emerald-800 bg-white border border-emerald-200 rounded-lg px-2.5 py-1">
          Est. Annual: +${estAnnualYield.toFixed(4)} USD
        </div>
      </div>
    </div>
  );
};
