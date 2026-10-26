'use client';

import React from 'react';
import { UsdtLogo } from './CoinLogos';

interface CashReserveProps {
  aave: {
    collateral: string;
    debt: string;
    healthFactor: string;
  };
  accountAddress?: string;
  tokenBalances?: { USDT: string; aCelUSDT: string } | null;
  onAddFunds: () => void;
}

export const CashReserve: React.FC<CashReserveProps> = ({ aave, accountAddress, tokenBalances, onAddFunds }) => {
  const collateralValueUSD = parseFloat(aave.collateral || '0');
  const debtValueUSD = parseFloat(aave.debt || '0');

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <UsdtLogo className="h-9 w-9 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Autonomous AI Capital Reserve
              </h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                100% Autonomous AI Discretion
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Live balance from the Autonomous AI smart account on Celo, including liquid USDT and USDT supplied to Aave.
            </p>
            {accountAddress && (
              <a className="mt-1 inline-block font-mono text-[10px] text-emerald-700 hover:underline" href={`https://celoscan.io/address/${accountAddress}`} target="_blank" rel="noreferrer">
                Account: {accountAddress}
              </a>
            )}
          </div>
        </div>

        <button
          onClick={onAddFunds}
          className="self-start sm:self-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition text-white font-bold text-xs px-4 py-2.5 shadow-xs shrink-0"
        >
          + Add to AI Reserve
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Reserve Balance in USD */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            AI Managed Capital
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${collateralValueUSD.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {tokenBalances ? 'Live on-chain balance on Celo' : 'On-chain balance unavailable'}
          </span>
        </div>

        {/* Current Placement */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current AI Placement
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-700 font-sans">
              {tokenBalances && parseFloat(tokenBalances.aCelUSDT) > 0 ? 'Aave USDT' : 'Liquid USDT'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {tokenBalances ? `${parseFloat(tokenBalances.USDT).toFixed(4)} USDT liquid · ${parseFloat(tokenBalances.aCelUSDT).toFixed(4)} aCelUSDT supplied` : 'Could not read account tokens from Celo'}
          </span>
        </div>

        {/* Debt Risk */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Debt &amp; Loans
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${debtValueUSD.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">USD</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Debt data is not read from this account yet
          </span>
        </div>

        {/* AI Autonomy */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            AI Discretion Status
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">
              {accountAddress ? 'On-chain' : 'Unavailable'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {accountAddress ? 'Source: Autonomous AI account' : 'Check Celo RPC connection'}
          </span>
        </div>
      </div>
    </div>
  );
};
