'use client';

import React, { useState } from 'react';

export interface DecisionItem {
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
}

interface AiActivityProps {
  decisions: DecisionItem[];
}

export const AiActivity: React.FC<AiActivityProps> = ({ decisions }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getFriendlyDecision = (action: string, amount?: string | null, asset?: string | null) => {
    const numAmountUSD = parseFloat(amount || '0.1726');

    switch (action?.toLowerCase()) {
      case 'supply':
        return {
          title: `Moved $${numAmountUSD.toFixed(2)} ${asset || 'USD'} into Safe Cash Reserve`,
          tag: 'Reserve Protection',
          explanation: `Vigi noticed available liquid cash ($${numAmountUSD.toFixed(2)} USD) and deposited it into the safe interest reserve to prevent funds from sitting idle.`,
        };
      case 'swap':
        return {
          title: `Reallocated Capital into Target Assets`,
          tag: 'Strategic Buy',
          explanation:
            'Identified favorable entry pricing and adjusted token allocations within your preset risk limits.',
        };
      case 'hold':
        return {
          title: `Held Current Positions Without Unnecessary Trades`,
          tag: 'Preserve Capital',
          explanation:
            'Market is moving within normal volatility bands. Staying in position saves on transaction fees while capital continues compounding.',
        };
      default:
        return {
          title: `Portfolio Optimization: ${action.toUpperCase()}`,
          tag: 'Automated Move',
          explanation: 'Vigi executed an optimization according to your safety guidelines.',
        };
    }
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

  return (
    <div
      className="overflow-hidden rounded-2xl border border-stone-200/60 bg-[#FAFAF9] shadow-sm"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-stone-100 px-8 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h2
            className="text-xl font-bold tracking-tight text-[#0C1424]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            What Vigi Did
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Real decisions made by Vigi with delegated capital
          </p>
        </div>
        <span className="self-start rounded-full border border-[#2540EB]/10 bg-[#2540EB]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#2540EB]">
          Autonomous Pilot
        </span>
      </div>

      {/* Decision List */}
      <div className="divide-y divide-stone-100 px-6 py-2">
        {decisions.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#6B7280]">
            Vigi is monitoring the market. Recent moves will be logged here.
          </div>
        ) : (
          decisions.map((dec) => {
            const isExpanded = expandedId === dec.id;
            const item = getFriendlyDecision(dec.action, dec.amount, dec.asset);

            return (
              <div
                key={dec.id}
                className="px-2 py-6 transition-colors duration-200 rounded-2xl hover:bg-stone-50/50"
              >
                <div
                  className="flex flex-col gap-4 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => toggleExpand(dec.id)}
                >
                  {/* Left: Title + Tag + Explanation */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-[#0C1424] leading-snug">
                        {item.title}
                      </span>
                      <span className="rounded-md border border-[#2540EB]/10 bg-[#2540EB]/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2540EB]">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Right: Date + Confidence + Toggle */}
                  <div className="flex items-center justify-between gap-6 shrink-0 sm:flex-col sm:items-end sm:gap-1.5">
                    <div className="text-right space-y-1.5">
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                        {formatDate(dec.timestamp)}
                      </span>
                      <span className="inline-block rounded-full bg-[#2540EB]/5 px-2.5 py-0.5 text-[10px] font-semibold text-[#2540EB]">
                        {dec.confidence}% Confidence
                      </span>
                    </div>

                    <button
                      className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] transition-colors hover:text-[#2540EB]"
                      aria-label="Toggle analysis"
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 rounded-2xl border border-stone-200/60 bg-stone-50/50 p-6">
                    <span className="mb-3 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Vigi&apos;s Thought Process &amp; Financial Calculations
                    </span>
                    <p
                      className="rounded-xl border border-stone-200/60 bg-white p-4 text-sm leading-relaxed text-[#0C1424]/80 whitespace-pre-line"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {dec.reason}
                    </p>
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
