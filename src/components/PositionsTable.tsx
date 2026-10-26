'use client';

import React, { useState } from 'react';

export interface PositionData {
  id: number;
  timestamp: string;
  asset: string;
  asset_symbol: string;
  balance: string;
  estimated_value: string;
  invested: string;
  action: string;
  reason: string;
  pool_fee?: number;
  tx_hash?: string;
  estimatedValueNum: number;
  investedNum: number;
  pnlValue: number;
  pnlPercent: number;
}

interface PositionsTableProps {
  positions: PositionData[];
  onInvestClick?: () => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions, onInvestClick }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const getAssetDetails = (symbol: string) => {
    switch (symbol?.toUpperCase()) {
      case 'WETH':
        return {
          name: 'Ethereum',
          ticker: 'ETH',
          type: 'Smart Contract Network',
        };
      case 'WBTC':
        return {
          name: 'Bitcoin',
          ticker: 'BTC',
          type: 'Digital Gold / Store of Value',
        };
      case 'USD₮':
      case 'USDT':
        return {
          name: 'Tether USD',
          ticker: 'USDT',
          type: 'Digital Dollar (Pegged 1:1)',
        };
      default:
        return {
          name: symbol || 'Digital Asset',
          ticker: symbol?.slice(0, 4) || 'ASSET',
          type: 'Managed Portfolio Asset',
        };
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Managed Asset Holdings
          </h2>
          <p className="text-xs text-slate-500">
            Assets monitored and protected by automatic stop-loss rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            {showTechnicalDetails ? 'Hide Contract Details' : 'Show Contract Details'}
          </button>
          {onInvestClick && (
            <button
              onClick={onInvestClick}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 shadow-xs transition"
            >
              Invest More
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {positions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No assets currently held in portfolio.
          </div>
        ) : (
          positions.map((pos) => {
            const info = getAssetDetails(pos.asset_symbol);
            const isPositive = pos.pnlValue >= 0;
            const hasQuote = pos.estimatedValueNum > 0;

            return (
              <div
                key={pos.asset}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/70 transition gap-4"
              >
                {/* Asset Identity */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                    {info.ticker}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {info.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {info.ticker}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">{info.type}</span>
                    {showTechnicalDetails && (
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                        Address: {pos.asset}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial figures */}
                <div className="flex flex-wrap items-center sm:justify-end gap-6 sm:gap-8">
                  {/* Balance */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Quantity Held
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {parseFloat(pos.balance || '0').toLocaleString('en-US', {
                        maximumFractionDigits: 6,
                      })}{' '}
                      {info.ticker}
                    </span>
                  </div>

                  {/* USD Value */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Market Value
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {hasQuote ? `$${pos.estimatedValueNum.toFixed(4)} USD` : 'Calculating...'}
                    </span>
                  </div>

                  {/* Return */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Return
                    </span>
                    {hasQuote && pos.investedNum > 0 ? (
                      <span
                        className={`inline-block font-mono text-xs font-bold rounded px-1.5 py-0.5 ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {pos.pnlPercent.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Stable</span>
                    )}
                  </div>

                  {/* Protection Badge */}
                  <div className="hidden md:block text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Protection
                    </span>
                    <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                      Stop-Loss Active
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
