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

interface DecisionsFeedProps {
  decisions: DecisionItem[];
}

export const DecisionsFeed: React.FC<DecisionsFeedProps> = ({ decisions }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getDecisionSummary = (action: string, amount?: string | null, asset?: string | null) => {
    switch (action?.toLowerCase()) {
      case 'supply':
        return {
          title: `Supply ${amount || ''} ${asset || 'USDT'} into Aave Yield Pool`,
          category: 'Yield Generation',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          plainEnglish:
            'The AI agent detected available idle cash and deployed it directly into the Aave lending market to earn compound interest with zero debt risk.',
        };
      case 'swap':
        return {
          title: `Rebalance Portfolio Holdings`,
          category: 'Strategic Swap',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          plainEnglish:
            'Taking advantage of current market liquidity to reallocate into stronger-performing assets.',
        };
      case 'hold':
        return {
          title: `Hold & Preserve Current Positions`,
          category: 'Capital Protection',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          plainEnglish:
            'Market conditions are steady. Holding positions avoids unnecessary transaction fees while assets continue compounding.',
        };
      default:
        return {
          title: `Automated Execution: ${action.toUpperCase()}`,
          category: 'Portfolio Management',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          plainEnglish: 'Portfolio optimization executed based on predefined risk parameters.',
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            AI Agent Decision Journal
          </h2>
          <p className="text-xs text-slate-500">
            Chronological audit of autonomous decisions made by the portfolio intelligence engine
          </p>
        </div>
        <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Engine: Autonomous LLM Pilot
        </span>
      </div>

      <div className="divide-y divide-slate-100 p-2 sm:p-4">
        {decisions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            AI agent is continuously evaluating market data. Decisions will appear here.
          </div>
        ) : (
          decisions.map((dec) => {
            const isExpanded = expandedId === dec.id;
            const summary = getDecisionSummary(dec.action, dec.amount, dec.asset);

            return (
              <div
                key={dec.id}
                className="p-4 transition rounded-2xl hover:bg-slate-50/80"
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => toggleExpand(dec.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {summary.title}
                        </span>
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${summary.color}`}
                        >
                          {summary.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {summary.plainEnglish}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-5 sm:pl-0">
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {formatDate(dec.timestamp)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {dec.confidence}% Confidence
                      </span>
                    </div>

                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                      aria-label="View analysis"
                    >
                      {isExpanded ? 'Hide Analysis' : 'View Analysis'}
                    </button>
                  </div>
                </div>

                {/* Deep Analysis Drawer */}
                {isExpanded && (
                  <div className="mt-4 ml-0 sm:ml-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      Full Model Reasoning &amp; Mathematical Verification:
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
