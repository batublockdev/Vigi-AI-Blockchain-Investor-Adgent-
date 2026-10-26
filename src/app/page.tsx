'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { AccountSummary } from '@/components/AccountSummary';
import { SelectedTokens } from '@/components/SelectedTokens';
import { CashReserve } from '@/components/CashReserve';
import { AiActivity } from '@/components/AiActivity';
import { ProtectionLog } from '@/components/ProtectionLog';
import { InvestModal } from '@/components/InvestModal';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'reserve' | 'ai' | 'audit'>(
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

  // Auto-refresh every 15s
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
    positions = [],
    stats = { totalActivities: 0, totalDecisions: 0, trackedAssets: 0 },
  } = data || {};

  // Aggregate financial metrics in USD
  const aaveCollateralUSD = aiCapital ? parseFloat(aiCapital.collateral) : 0;
  const walletUsdtUSD = parseFloat(balances['USDT'] || '0');
  const portfolioPositions = vaultPortfolio?.positions || [];
  const tokensValueUSD = vaultPortfolio?.totalValue || 0;
  const totalBalanceUSD = aaveCollateralUSD + walletUsdtUSD + tokensValueUSD;

  // On-chain balances don't include a cost basis, so avoid presenting the
  // database agent's P&L as if it belonged to the vault.
  const totalGainAmountUSD = 0;
  const totalGainPercent = 0;

  if (loading && !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] text-slate-700">
        <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 font-semibold text-xs text-slate-400 uppercase tracking-wider">
          Loading Portfolio in USD...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          isPaused={botState?.isPaused || false}
          isRefreshing={refreshing}
          onRefresh={() => fetchData(true)}
          onAddFunds={() => setIsInvestModalOpen(true)}
        />

        {/* Main Content Container */}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
          {/* Top Account & Allocation Summary in USD */}
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
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'overview', label: 'My Portfolio' },
              { id: 'tokens', label: 'Selected Tokens (78%)', count: portfolioPositions.length },
              { id: 'reserve', label: 'Autonomous AI Capital (20%)' },
              { id: 'ai', label: 'AI Pilot Activity', count: decisions.length },
              { id: 'audit', label: 'Safety Log', count: stats.totalActivities },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 font-bold transition border-b-2 ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/70 rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 rounded-t-xl'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
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
            <div className="space-y-6">
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
              />
              <AiActivity decisions={decisions} />
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <SelectedTokens
                positions={portfolioPositions}
                portfolioAddress={vaultPortfolio?.address}
                onAddFunds={() => setIsInvestModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'reserve' && (
            <div className="space-y-6">
              <CashReserve
                aave={{
                  collateral: aiCapital?.collateral || '0',
                  debt: '0',
                  healthFactor: aiCapital ? 'N/A' : 'Unavailable',
                }}
                accountAddress={aiCapital?.address}
                tokenBalances={aiCapital ? { USDT: aiCapital.usdt, aCelUSDT: aiCapital.aCelUSDT } : null}
                onAddFunds={() => setIsInvestModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <AiActivity decisions={decisions} />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <ProtectionLog />
            </div>
          )}
        </main>
      </div>

      {/* Invest Modal with Web3 Wallet Connection, Token Selector, and Ripio Ramp COP conversion */}
      <InvestModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>AI Automated Investing — Displaying in USD ($) • Active On-Chain Protection</span>
          </div>

          <p className="text-slate-400">
            Automated wealth management with stop-loss protection.
          </p>
        </div>
      </footer>
    </div>
  );
}
