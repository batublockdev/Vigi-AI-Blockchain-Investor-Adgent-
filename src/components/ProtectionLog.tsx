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
        return 'text-rose-800 bg-rose-50 border-rose-200';
      case 'INVEST':
      case 'SIMULATE_INVEST':
      case 'deposit':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'PAUSE':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Critical Events &amp; Protection Audit
            </h2>
            <p className="text-xs text-slate-500">
              Filtered audit log: stores executed sales, investments, deposits, and automated circuit breaker pauses
            </p>
          </div>

          <button
            onClick={() => fetchActivities()}
            className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event or asset..."
            className="flex-1 min-w-[200px] rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Filter:</span>
            <select
              value={assetFilter}
              onChange={(e) => {
                setAssetFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Tokens</option>
              <option value="WETH">Ethereum (ETH)</option>
              <option value="WBTC">Bitcoin (BTC)</option>
              <option value="USD₮">Tether USD (USDT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {loading && activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading critical events...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-500">
            <div className="max-w-md mx-auto space-y-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block mb-1 animate-pulse" />
              <p className="font-extrabold text-slate-800 text-sm">
                All Positions Monitored &amp; Protected
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                The database optimization filtered out routine polling. Only critical on-chain actions (auto-sales, re-investments, user deposits, or 24h cooldown pauses) will be recorded here.
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
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition gap-2"
              >
                <div className="flex items-center gap-3">
                  {assetInfo.logo}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {assetInfo.name}
                      </span>
                      <span className={`text-[10px] font-bold border px-2 py-0.2 rounded ${getActionBadgeStyle(item.action)}`}>
                        {item.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.reason || 'Critical position event recorded.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                  {valUSD !== null && (
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">
                        Market Value
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ${valUSD.toFixed(4)} USD
                      </span>
                    </div>
                  )}

                  <div className="text-right font-mono text-slate-400 text-[11px]">
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
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
          <div>
            Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
