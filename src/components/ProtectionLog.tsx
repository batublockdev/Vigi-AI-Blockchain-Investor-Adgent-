'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BtcLogo, EthLogo, UsdtLogo } from './CoinLogos';

interface ActivityItem {
  id: number;
  timestamp: string;
  type: string;
  asset?: string;
  asset_symbol?: string;
  balance?: string;
  estimated_value?: string;
  invested?: string;
  action: string;
  reason?: string;
  tx_hash?: string;
  pool_fee?: number;
  confidence?: number;
}

export const ProtectionLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [assetFilter, setAssetFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (assetFilter !== 'ALL') params.set('asset', assetFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/activity?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setActivities(json.data);
        setTotalPages(json.pagination.totalPages || 1);
        setTotalCount(json.pagination.total || 0);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [page, assetFilter, debouncedSearch]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(parseInt(ts, 10));
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFriendlyAsset = (symbol?: string) => {
    if (!symbol) {
      return { name: 'All Portfolio Assets', logo: <EthLogo className="h-4 w-4" /> };
    }
    if (symbol.includes('WETH')) {
      return { name: 'Ethereum', logo: <EthLogo className="h-4 w-4" /> };
    }
    if (symbol.includes('WBTC')) {
      return { name: 'Bitcoin', logo: <BtcLogo className="h-4 w-4" /> };
    }
    if (symbol.includes('USD')) {
      return { name: 'Tether USD', logo: <UsdtLogo className="h-4 w-4" /> };
    }
    return { name: symbol, logo: <EthLogo className="h-4 w-4" /> };
  };

  const getActionBadgeStyle = (action: string) => {
    switch (action) {
      case 'SELL_ALL':
      case 'SELL_PROFIT':
        return 'bg-rose-50 border-rose-200/60 text-rose-600';
      case 'INVEST':
      case 'SIMULATE_INVEST':
      case 'deposit':
        return 'bg-[#2540EB]/5 border-[#2540EB]/10 text-[#2540EB]';
      case 'PAUSE':
        return 'bg-amber-50 border-amber-200/60 text-amber-700';
      default:
        return 'bg-stone-50 border-stone-200 text-[#6B7280]';
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAFAF9] shadow-sm"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Header */}
      <div className="border-b border-stone-100 px-8 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Audit Trail
            </p>
            <h2
              className="text-xl font-bold text-[#0C1424]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Critical Events &amp; Protection Log
            </h2>
            <p className="text-sm text-[#6B7280]">
              Executed sales, investments, deposits, and automated circuit breaker pauses
            </p>
          </div>

          <button
            onClick={() => fetchActivities()}
            className="self-start sm:self-auto rounded-2xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-[#0C1424] hover:bg-stone-50 transition-colors"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event or asset…"
            className="flex-1 min-w-[220px] rounded-2xl border border-stone-200 bg-stone-50/50 py-2 px-4 text-sm text-[#0C1424] placeholder-[#6B7280]/60 focus:border-[#2540EB]/40 focus:bg-white focus:outline-none transition-colors"
          />

          <select
            value={assetFilter}
            onChange={(e) => {
              setAssetFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-sm text-[#0C1424] font-medium focus:border-[#2540EB]/40 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="ALL">All Tokens</option>
            <option value="WETH">Ethereum (ETH)</option>
            <option value="WBTC">Bitcoin (BTC)</option>
            <option value="USD₮">Tether USD (USDT)</option>
          </select>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-100">
        {loading && activities.length === 0 ? (
          <div className="py-16 text-center text-[#6B7280] text-sm">
            Loading critical events…
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 px-8 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2540EB] inline-block mb-2 animate-pulse" />
              <p
                className="font-bold text-[#0C1424] text-base"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                All Positions Monitored &amp; Protected
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                The database optimization filtered out routine polling. Only critical on-chain
                actions — auto-sales, re-investments, user deposits, or 24h cooldown pauses —
                will appear here.
              </p>
            </div>
          </div>
        ) : (
          activities.map((item) => {
            const assetInfo = getFriendlyAsset(item.asset_symbol);
            const valUSD = item.estimated_value ? parseFloat(item.estimated_value) : null;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 hover:bg-stone-50/50 transition-colors gap-3"
              >
                <div className="flex items-center gap-4">
                  {assetInfo.logo}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0C1424] text-sm">
                        {assetInfo.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${getActionBadgeStyle(item.action)}`}
                      >
                        {item.action}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {item.reason || 'Critical position event recorded.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-8 text-xs">
                  {valUSD !== null && (
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B7280]/70 block font-medium">
                        Market Value
                      </span>
                      <span className="font-mono font-semibold text-[#0C1424]">
                        ${valUSD.toFixed(4)} USD
                      </span>
                    </div>
                  )}

                  <div className="text-right font-mono text-[#6B7280] text-[11px]">
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-stone-100 px-8 py-4 text-xs text-[#6B7280]">
          <div>
            <span className="text-[10px] uppercase tracking-wider">Page</span>{' '}
            <span className="font-bold text-[#0C1424]">{page}</span>{' '}
            <span className="text-[10px] uppercase tracking-wider">of</span>{' '}
            <span className="font-bold text-[#0C1424]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-stone-200 bg-white px-4 py-1.5 text-[#0C1424] font-medium hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-stone-200 bg-white px-4 py-1.5 text-[#0C1424] font-medium hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
