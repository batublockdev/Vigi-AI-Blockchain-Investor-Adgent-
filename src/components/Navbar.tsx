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
    <header
      className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#F5F5F4]/90 backdrop-blur-md"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Isotipo geométrico cuadrado */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C1424]">
            {/* Bordes concéntricos */}
            <div className="absolute inset-[3px] rounded-[5px] border border-[#2540EB]/40" />
            <div className="absolute inset-[6px] rounded-[3px] border border-[#2540EB]/70" />
            {/* Letra A */}
            <span className="relative text-sm font-bold text-white tracking-tight">
              A
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="text-[15px] font-bold tracking-tight text-[#0C1424]">
                Vigi Protocol
              </span>

              {/* Status badge */}
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPaused ? 'bg-stone-400' : 'bg-[#2540EB]'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isPaused ? 'text-stone-400' : 'text-[#2540EB]'
                  }`}
                >
                  {isPaused ? 'Cooldown' : 'Active'}
                </span>
              </span>
            </div>

            {/* Subtítulo oculto en mobile */}
            <p className="hidden text-[12px] font-normal text-stone-500 sm:block">
              Automated investing with AI decision-making &amp; limit protection
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-500 transition hover:bg-stone-50 active:scale-95 disabled:opacity-40"
            title="Refresh latest values"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshing ? 'animate-spin text-[#2540EB]' : ''
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Funds Button */}
          <button
            onClick={onAddFunds}
            className="rounded-2xl bg-[#0C1424] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0C1424]/90 active:scale-95"
          >
            + Add Funds
          </button>
        </div>
      </div>
    </header>
  );
};
