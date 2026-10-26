'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface NavbarProps {
  isPaused: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onAddFunds: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isPaused,
  isRefreshing,
  onRefresh,
  onAddFunds,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                My AI Portfolio
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {isPaused ? 'Cooldown' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Automated investing with AI decision-making &amp; limit protection
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            title="Refresh latest values"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Funds Button */}
          <button
            onClick={onAddFunds}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition text-white font-bold text-xs px-4 py-2 shadow-xs"
          >
            + Add Funds
          </button>
        </div>
      </div>
    </header>
  );
};
