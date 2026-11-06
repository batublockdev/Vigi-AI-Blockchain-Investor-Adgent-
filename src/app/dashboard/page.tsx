'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { AccountSummary } from '@/components/AccountSummary';
import { SelectedTokens } from '@/components/SelectedTokens';
import { CashReserve } from '@/components/CashReserve';
import { AiActivity } from '@/components/AiActivity';
import { ProtectionLog } from '@/components/ProtectionLog';
import { InvestModal } from '@/components/InvestModal';
import { DecisionsSidebar } from '@/components/DecisionsSidebar';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'reserve' | 'audit'>(
    'overview'
  );

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const {
    botState,
    aiCapital,
    vaultPortfolio,
    aave = { collateral: '1.08', debt: '0.00', healthFactor: 'Infinite' },
    balances = {},
    decisions = [],
    trades = [],
    positions = [],
    stats = { totalActivities: 0, totalDecisions: 0, trackedAssets: 0 },
  } = data || {};

  const aaveCollateralUSD = aiCapital ? parseFloat(aiCapital.collateral) : 0;
  const walletUsdtUSD = parseFloat(balances['USDT'] || '0');
  const portfolioPositions = vaultPortfolio?.positions || [];
  const tokensValueUSD = vaultPortfolio?.totalValue || 0;
  const totalBalanceUSD = aaveCollateralUSD + walletUsdtUSD + tokensValueUSD;
  const totalGainAmountUSD = 0;
  const totalGainPercent = 0;

  // Latest decision for CashReserve (sea cual sea, incluyendo hold)
  // Priorizar decisiones con tx_hash (movimientos reales)
  const latestDecision = decisions.find(d => d.tx_hash) || decisions[0] || null;

  if (loading && !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F4] text-[#0C1424]">
        <div className="h-6 w-6 border-2 border-[#2540EB] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
          Loading Portfolio...
        </p>
      </div>
    );
  }

  // Removed "Vigi Activity" tab — now lives permanently in the sidebar
  const tabs = [
    { id: 'overview', label: 'Portfolio' },
    { id: 'tokens', label: 'Tokens 78%', count: portfolioPositions.length },
    { id: 'reserve', label: 'Vigi Capital 20%' },
    { id: 'audit', label: 'Safety Log', count: stats.totalActivities },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#0C1424] flex flex-col">
      {/* Top Nav */}
      <Navbar
        isPaused={botState?.isPaused || false}
        isRefreshing={refreshing}
        onRefresh={() => fetchData(true)}
        onAddFunds={() => setIsInvestModalOpen(true)}
      />

      {/* Main layout: 2 columns — content left, sidebar right */}
      <div className="flex flex-1 gap-6 px-6 py-12">
        {/* Main content — left column */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-8">
          {/* Back link */}
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
            <Link href="/" className="hover:text-[#2540EB] transition-colors">
              ← Adgent Protocol
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-[#0C1424]">Dashboard</span>
          </div>

          {/* Account Summary */}
          <AccountSummary
            totalBalance={totalBalanceUSD}
            tokensValue={tokensValueUSD}
            reserveValue={aaveCollateralUSD}
            cashValue={walletUsdtUSD}
            totalGainAmount={totalGainAmountUSD}
            totalGainPercent={totalGainPercent}
            showPerformance={false}
            onAddFunds={() => setIsInvestModalOpen(true)}
          />

          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200/60 gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[11px] font-medium uppercase tracking-wider transition-colors duration-300 border-b-2 ${
                    isActive
                      ? 'border-[#2540EB] text-[#2540EB]'
                      : 'border-transparent text-ink-muted hover:text-[#0C1424]'
                  }`}
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        isActive
                          ? 'bg-[#2540EB]/10 text-[#2540EB]'
                          : 'bg-stone-200/60 text-ink-muted'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <SelectedTokens
                positions={portfolioPositions}
                portfolioAddress={vaultPortfolio?.address}
                onAddFunds={() => setIsInvestModalOpen(true)}
              />
              <CashReserve
                aave={{
                  collateral: aiCapital?.collateral || '0',
                  debt: '0',
                  healthFactor: aiCapital ? 'N/A' : 'Unavailable',
                }}
                accountAddress={aiCapital?.address}
                tokenBalances={aiCapital ? { USDT: aiCapital.usdt, aCelUSDT: aiCapital.aCelUSDT } : null}
                onAddFunds={() => setIsInvestModalOpen(true)}
                latestDecision={latestDecision}
              />
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-8">
              <SelectedTokens
                positions={portfolioPositions}
                portfolioAddress={vaultPortfolio?.address}
                onAddFunds={() => setIsInvestModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'reserve' && (
            <div className="space-y-8">
              <CashReserve
                aave={{
                  collateral: aiCapital?.collateral || '0',
                  debt: '0',
                  healthFactor: aiCapital ? 'N/A' : 'Unavailable',
                }}
                accountAddress={aiCapital?.address}
                tokenBalances={aiCapital ? { USDT: aiCapital.usdt, aCelUSDT: aiCapital.aCelUSDT } : null}
                onAddFunds={() => setIsInvestModalOpen(true)}
                latestDecision={latestDecision}
              />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-8">
              <ProtectionLog />
            </div>
          )}
        </main>

        {/* Sidebar — right column, desktop only, sticky inside its column */}
        <div className="hidden lg:flex flex-col w-[340px] shrink-0">
          <div className="sticky top-6 h-[calc(100vh-120px)] rounded-2xl border border-stone-200/60 shadow-lg shadow-[#0C1424]/[0.03] overflow-hidden">
            <DecisionsSidebar decisions={[...decisions, ...trades.map(t => ({
              id: 1000 + t.id,
              timestamp: t.timestamp,
              action: t.action,
              asset: t.asset,
              amount: t.amount,
              reason: t.reason || '',
              confidence: t.confidence || 0,
              level: t.level || 'alto',
              executed: 1,
              result: '',
              tx_hash: t.tx_hash,
            }))]} />
          </div>
        </div>
      </div>

      <InvestModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200/60 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
              Vigi · Live on-chain · Displaying in USD
            </span>
          </div>
          <p className="text-[11px] text-ink-muted" style={{ fontFamily: 'var(--font-inter)' }}>
            Automated wealth management with stop-loss protection.
          </p>
        </div>
      </footer>
    </div>
  );
}
