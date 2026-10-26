'use client';

import React, { useState } from 'react';
import { BtcLogo, EthLogo, UsdtLogo } from './CoinLogos';

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

interface SelectedTokensProps {
  positions: PositionData[];
  portfolioAddress?: string;
  onAddFunds: () => void;
}

export const SelectedTokens: React.FC<SelectedTokensProps> = ({
  positions,
  portfolioAddress,
  onAddFunds,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getTokenInfo = (symbol: string) => {
    switch (symbol?.toUpperCase()) {
      case 'WETH':
        return {
          name: 'Ethereum',
          ticker: 'ETH',
          logo: <EthLogo className="h-9 w-9 shrink-0" />,
          stopLoss: '5% Max Loss',
          takeProfit: '15% Target Profit',
        };
      case 'WBTC':
        return {
          name: 'Bitcoin',
          ticker: 'BTC',
          logo: <BtcLogo className="h-9 w-9 shrink-0" />,
          stopLoss: '5% Max Loss',
          takeProfit: '20% Target Profit',
        };
      case 'USD₮':
      case 'USDT':
        return {
          name: 'Tether USD',
          ticker: 'USDT',
          logo: <UsdtLogo className="h-9 w-9 shrink-0" />,
          stopLoss: 'Peg Guard',
          takeProfit: 'Stable',
        };
      default:
        return {
          name: symbol || 'Selected Token',
          ticker: symbol?.slice(0, 4) || 'TKN',
          logo: <EthLogo className="h-9 w-9 shrink-0" />,
          stopLoss: '5% Max Loss',
          takeProfit: '15% Target Profit',
        };
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            My Selected Tokens &amp; Safety Limits
          </h2>
          <p className="text-xs text-slate-500">
            Live token balances held by the portfolio vault on Celo.
          </p>
          {portfolioAddress && (
            <a className="mt-1 inline-block font-mono text-[10px] text-emerald-700 hover:underline" href={`https://celoscan.io/address/${portfolioAddress}`} target="_blank" rel="noreferrer">
              Vault: {portfolioAddress}
            </a>
          )}
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          {showConfig ? 'Hide Limits Detail' : 'View Safety Limits Detail'}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {positions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No tokens currently active.
          </div>
        ) : (
          positions.map((pos) => {
            const info = getTokenInfo(pos.asset_symbol);
            const isPositive = pos.pnlValue >= 0;
            const hasQuote = pos.estimatedValueNum > 0;

            return (
              <div
                key={pos.asset}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Token Identity with Authentic Logo */}
                  <div className="flex items-center gap-3.5">
                    {info.logo}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{info.name}</span>
                        <span className="text-xs font-semibold text-slate-400">{info.ticker}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Holdings:{' '}
                        {parseFloat(pos.balance || '0').toLocaleString('en-US', {
                          maximumFractionDigits: 6,
                        })}{' '}
                        {info.ticker}
                      </span>
                    </div>
                  </div>

                  {/* Financial Values in USD */}
                  <div className="flex flex-wrap items-center sm:justify-end gap-6 sm:gap-8">
                    {/* Dollar Value */}
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
                        <div className="flex items-center gap-1">
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
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({isPositive ? '+' : ''}${Math.abs(pos.pnlValue).toFixed(4)})
                          </span>
                        </div>
                      ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        {info.ticker === 'USDT' ? 'Stable' : 'Basis unavailable'}
                      </span>
                      )}
                    </div>

                    {/* Safety Status */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Status
                      </span>
                      <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                        On-chain balance
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safety Limits Drawer */}
                {showConfig && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Stop-Loss Protection: </span>
                      <span>If {info.name} drops past threshold, AI automatically sells into safe cash.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-700">
                        Stop: {info.stopLoss}
                      </span>
                      <span className="rounded bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-700">
                        Target: {info.takeProfit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
