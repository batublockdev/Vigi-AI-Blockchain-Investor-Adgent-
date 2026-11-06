'use client';

import React from 'react';
import { ExternalLink, Activity, TrendingUp, TrendingDown, ArrowRightLeft, ShieldCheck, Clock, Bot } from 'lucide-react';

export interface SidebarDecision {
  id: number;
  timestamp: string;
  action: string;
  asset?: string | null;
  amount?: string | null;
  reason: string;
  confidence: number;
  level: string;
  executed: number;
  result?: string | null;
  tx_hash?: string | null;
}

interface DecisionsSidebarProps {
  decisions: SidebarDecision[];
}

export const DecisionsSidebar: React.FC<DecisionsSidebarProps> = ({
  decisions,
}) => {
  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'swap':
      case 'swap_and_supply':
        return <ArrowRightLeft className="h-3.5 w-3.5 text-[#2540EB]" />;
      case 'supply':
        return <TrendingUp className="h-3.5 w-3.5 text-[#2540EB]" />;
      case 'borrow':
        return <TrendingDown className="h-3.5 w-3.5 text-amber-600" />;
      case 'repay':
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />;
      case 'withdraw':
        return <TrendingDown className="h-3.5 w-3.5 text-stone-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-stone-400" />;
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
      invest: 'INVEST',
      sell_all: 'STOP-LOSS',
      sell_profit: 'TAKE-PROFIT',
      request_approval: 'NEEDS APPROVAL',
      request_setup: 'NEEDS SETUP',
    };
    return labels[action?.toLowerCase()] || action?.toUpperCase() || 'UNKNOWN';
  };

  const formatDate = (timestamp: string) => {
    const d = new Date(parseInt(timestamp, 10));
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractTxHash = (dec: SidebarDecision): string | null => {
    if (dec.tx_hash) return dec.tx_hash;
    if (dec.result) {
      const match = dec.result.match(/0x[a-fA-F0-9]{64}/);
      if (match) return match[0];
    }
    return null;
  };

  // Filter out hold decisions — only show actual moves
  const activeDecisions = decisions.filter(
    (d) => d.action?.toLowerCase() !== 'hold'
  );

  return (
    <div
      className="flex flex-col h-full bg-[#FAFAF9]"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-200/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2540EB]/5 border border-[#2540EB]/10">
            <Bot className="h-4 w-4 text-[#2540EB]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C1424]">
                Vigi Decisions
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-0.5">
              Movimientos on-chain con tx verificable
            </p>
          </div>
        </div>
      </div>

      {/* Decisions list — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeDecisions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2540EB]/5 mb-4">
              <Clock className="h-5 w-5 text-[#2540EB]/40" />
            </div>
            <p className="text-sm font-medium text-ink-muted">
              Vigi está monitoreando
            </p>
            <p className="text-xs text-ink-muted/60 mt-1">
              Sin movimientos aún
            </p>
          </div>
        ) : (
          <div className="space-y-px bg-stone-200/40 rounded-2xl overflow-hidden">
            {activeDecisions.map((dec) => {
              const wasExecuted = dec.executed === 1;
              const txHash = extractTxHash(dec);

              return (
                <div
                  key={dec.id}
                  className="p-5 hover:bg-white transition-colors duration-200 bg-[#FAFAF9]"
                >
                  {/* Top row: icon + action + confidence */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {getActionIcon(dec.action)}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C1424]">
                        {getActionLabel(dec.action)}
                      </span>
                    </div>
                    {dec.confidence > 0 && (
                      <span className="text-[10px] font-bold text-[#2540EB] bg-[#2540EB]/5 px-2 py-0.5 rounded-full">
                        {dec.confidence}%
                      </span>
                    )}
                  </div>

                  {/* Amount + asset */}
                  {(dec.amount || dec.asset) && (
                    <div className="flex items-baseline gap-2 mb-2">
                      {dec.amount && (
                        <span className="font-serif-display text-lg font-medium text-[#0C1424]">
                          {dec.amount}
                        </span>
                      )}
                      {dec.asset && (
                        <span className="text-xs text-ink-muted">
                          {dec.asset}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <p className="text-xs text-ink-light leading-relaxed line-clamp-3 mb-3">
                    {dec.reason}
                  </p>

                  {/* Bottom row: date + status + tx link */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="text-[10px] font-mono text-ink-muted">
                      {formatDate(dec.timestamp)}
                    </span>

                    <div className="flex items-center gap-3">
                      {wasExecuted ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>EXECUTED</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-ink-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                          <span>SKIP</span>
                        </span>
                      )}

                      {txHash && (
                        <a
                          href={`https://celoscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2540EB] hover:text-[#0C1424] transition-colors"
                        >
                          <span>View tx</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer — count + MinimalAccount link */}
      <div className="px-6 py-4 border-t border-stone-200/60 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          {activeDecisions.length} movimientos
        </span>
        <a
          href="https://celoscan.io/address/0x74E16132B76Af0B03730F5c4BF540D777b085DDc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2540EB] hover:text-[#0C1424] transition-colors"
        >
          <span>MinimalAccount</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
};
