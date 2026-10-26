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
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          explanation: `The AI noticed available liquid cash ($${numAmountUSD.toFixed(2)} USD) and deposited it into the safe interest reserve to prevent funds from sitting idle.`,
        };
      case 'swap':
        return {
          title: `Reallocated Capital into Target Assets`,
          tag: 'Strategic Buy',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          explanation:
            'Identified favorable entry pricing and adjusted token allocations within your preset risk limits.',
        };
      case 'hold':
        return {
          title: `Held Current Positions Without Unnecessary Trades`,
          tag: 'Preserve Capital',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          explanation:
            'Market is moving within normal volatility bands. Staying in position saves on transaction fees while capital continues compounding.',
        };
      default:
        return {
          title: `Portfolio Optimization: ${action.toUpperCase()}`,
          tag: 'Automated Move',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          explanation: 'AI executed an optimization according to your safety guidelines.',
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            What Your AI Pilot Did
          </h2>
          <p className="text-xs text-slate-500">
            Real decisions made with the capital you delegated to the artificial intelligence
          </p>
        </div>
        <span className="self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          Autonomous Pilot
        </span>
      </div>

      <div className="divide-y divide-slate-100 p-2 sm:p-4">
        {decisions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            AI is monitoring the market. Recent moves will be logged here.
          </div>
        ) : (
          decisions.map((dec) => {
            const isExpanded = expandedId === dec.id;
            const item = getFriendlyDecision(dec.action, dec.amount, dec.asset);

            return (
              <div
                key={dec.id}
                className="p-4 transition rounded-2xl hover:bg-slate-50/80"
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => toggleExpand(dec.id)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${item.color}`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {formatDate(dec.timestamp)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {dec.confidence}% AI Confidence
                      </span>
                    </div>

                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                      aria-label="Toggle analysis"
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      AI Thought Process &amp; Financial Calculations:
                    </span>
                    <p className="font-sans text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
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
