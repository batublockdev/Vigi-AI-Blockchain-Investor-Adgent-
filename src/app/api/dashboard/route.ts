import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { AI_CAPITAL_ACCOUNT_ADDRESS, AI_CAPITAL_TOKENS, DEPOSIT_VAULT_CONTRACT_ADDRESS, ERC20_ABI, publicClient, VAULT_PORTFOLIO_TOKENS } from '@/lib/web3';
import { formatUnits } from 'viem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    try {
      // 1. Bot State
      const botStateRes = await client.query(
        `SELECT key, last_processed_block, pause_until, processed_events, updated_at 
         FROM bot_state WHERE key = 'singleton' LIMIT 1`
      );
      const botState = botStateRes.rows[0] || null;

      // The autonomous reserve belongs to the AI smart account, not to the
      // dashboard server wallet or the deposit vault. Count its liquid USDT
      // and its Aave USDT receipt tokens (1 aCelUSDT ~= 1 USD).
      let aiCapital: {
        address: string;
        usdt: string;
        aCelUSDT: string;
        collateral: string;
        source: 'celo';
      } | null = null;
      try {
        const [usdtRaw, aUsdtRaw] = await Promise.all([
          publicClient.readContract({
            address: AI_CAPITAL_TOKENS.USDT.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [AI_CAPITAL_ACCOUNT_ADDRESS],
          }),
          publicClient.readContract({
            address: AI_CAPITAL_TOKENS.aCelUSDT.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [AI_CAPITAL_ACCOUNT_ADDRESS],
          }),
        ]);
        const usdt = formatUnits(usdtRaw, AI_CAPITAL_TOKENS.USDT.decimals);
        const aCelUSDT = formatUnits(aUsdtRaw, AI_CAPITAL_TOKENS.aCelUSDT.decimals);
        aiCapital = {
          address: AI_CAPITAL_ACCOUNT_ADDRESS,
          usdt,
          aCelUSDT,
          collateral: (Number(usdt) + Number(aCelUSDT)).toFixed(6),
          source: 'celo',
        };
      } catch (chainError) {
        console.warn('Could not read AI capital account on Celo:', chainError);
      }

      // 2. Knowledge
      const knowledgeRes = await client.query(
        `SELECT id, category, key, value, created_at 
         FROM knowledge ORDER BY id ASC`
      );
      const knowledge = knowledgeRes.rows;

      // Parse structured Aave & Balances from knowledge
      let aaveData: { collateral: string; debt: string; healthFactor: string } | null = null;
      const parsedBalances: Record<string, string> = {};
      const parsedPrices: Record<string, string> = {};
      const parsedTvls: Record<string, string> = {};

      for (const item of knowledge) {
        if (item.key === 'aave_position') {
          const colMatch = item.value.match(/Colateral:\s*([\d.]+)\s*USD/i);
          const debtMatch = item.value.match(/Deuda:\s*([\d.]+)\s*USD/i);
          const hfMatch = item.value.match(/Health Factor:\s*([\d.e+]+)/i);
          aaveData = {
            collateral: colMatch ? colMatch[1] : '1.08',
            debt: debtMatch ? debtMatch[1] : '0.00',
            healthFactor: hfMatch ? hfMatch[1] : '∞',
          };
        } else if (item.key.startsWith('balance_')) {
          const token = item.key.replace('balance_', '');
          const valMatch = item.value.match(/balance\s+\w+:\s*([\d.]+)/i);
          parsedBalances[token] = valMatch ? valMatch[1] : item.value;
        } else if (item.key.startsWith('price_')) {
          const pair = item.key.replace('price_', '');
          parsedPrices[pair] = item.value;
        } else if (item.key.startsWith('tvl_')) {
          const pair = item.key.replace('tvl_', '');
          parsedTvls[pair] = item.value;
        }
      }

      // 3. Decisions from AI Agent
      const decisionsRes = await client.query(
        `SELECT id, timestamp, action, asset, amount, reason, confidence, level, executed, result 
         FROM decisions ORDER BY timestamp DESC LIMIT 20`
      );
      const decisions = decisionsRes.rows;

      // 4. Performance
      const perfRes = await client.query(
        `SELECT id, timestamp, total_value, total_pnl, win_rate, trade_count 
         FROM performance ORDER BY timestamp DESC LIMIT 1`
      );
      const performance = perfRes.rows[0] || null;

      // 5. StockWallet Active Positions (Using new stockwallet_asset_status table!)
      let rawPositions: any[] = [];
      try {
        const statusRes = await client.query(`
          SELECT 
            asset,
            symbol as asset_symbol,
            balance,
            estimated_value,
            invested,
            pool_fee,
            action,
            reason,
            updated_at as timestamp
          FROM stockwallet_asset_status
          ORDER BY updated_at DESC
        `);
        rawPositions = statusRes.rows;
      } catch (tableErr) {
        // Fallback to stockwallet_activity if table doesn't exist yet
        console.warn('stockwallet_asset_status query fallback:', tableErr);
      }

      // If stockwallet_asset_status was empty or unavailable, fallback to distinct activity
      if (rawPositions.length === 0) {
        const fallbackRes = await client.query(`
          SELECT DISTINCT ON (asset)
            asset,
            asset_symbol,
            balance,
            estimated_value,
            invested,
            pool_fee,
            action,
            reason,
            timestamp
          FROM stockwallet_activity
          WHERE asset IS NOT NULL
          ORDER BY asset, timestamp DESC
        `);
        rawPositions = fallbackRes.rows;
      }

      const positions = rawPositions.map((pos) => {
        const est = parseFloat(pos.estimated_value || '0');
        const inv = parseFloat(pos.invested || '0');
        const diff = est - inv;
        const pnlPct = inv > 0 ? (diff / inv) * 100 : 0;

        return {
          ...pos,
          estimatedValueNum: est,
          investedNum: inv,
          pnlValue: diff,
          pnlPercent: pnlPct,
        };
      });

      // My Portfolio shows the current ERC-20 balances held by the deposit
      // vault itself. Prices come from the existing tracked positions when
      // available; stable deposit tokens have a conservative reference price.
      let vaultPortfolio: { address: string; positions: any[]; totalValue: number } | null = null;
      try {
        const vaultPositions = await Promise.all(VAULT_PORTFOLIO_TOKENS.map(async (token) => {
          const rawBalance = await publicClient.readContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [DEPOSIT_VAULT_CONTRACT_ADDRESS],
          });
          const balance = Number(formatUnits(rawBalance, token.decimals));
          const tracked = positions.find((position) => position.asset_symbol?.toUpperCase() === token.symbol.toUpperCase());
          const trackedBalance = Number(tracked?.balance || 0);
          const trackedPrice = tracked && trackedBalance > 0 ? tracked.estimatedValueNum / trackedBalance : undefined;
          const priceUsd = trackedPrice && Number.isFinite(trackedPrice) && trackedPrice > 0
            ? trackedPrice
            : ('fallbackUsdPrice' in token ? token.fallbackUsdPrice : undefined);
          return {
            id: token.address,
            asset: token.address,
            asset_symbol: token.symbol,
            name: token.name,
            balance: balance.toString(),
            estimated_value: priceUsd === undefined ? '0' : (balance * priceUsd).toString(),
            invested: '0',
            action: 'ON_CHAIN_BALANCE',
            reason: 'Live ERC-20 balance read from the deposit vault on Celo',
            estimatedValueNum: priceUsd === undefined ? 0 : balance * priceUsd,
            investedNum: 0,
            pnlValue: 0,
            pnlPercent: 0,
            priceAvailable: priceUsd !== undefined,
          };
        }));
        const heldPositions = vaultPositions.filter((position) => Number(position.balance) > 0);
        vaultPortfolio = {
          address: DEPOSIT_VAULT_CONTRACT_ADDRESS,
          positions: heldPositions,
          totalValue: heldPositions.reduce((sum, position) => sum + position.estimatedValueNum, 0),
        };
      } catch (chainError) {
        console.warn('Could not read portfolio vault balances on Celo:', chainError);
      }

      // 6. Total activity count
      const countRes = await client.query(
        `SELECT COUNT(*) as total FROM stockwallet_activity`
      );
      const totalActivities = parseInt(countRes.rows[0].total, 10);

      return NextResponse.json({
        success: true,
        data: {
          botState: {
            ...botState,
            isPaused: botState ? Number(botState.pause_until) > Math.floor(Date.now() / 1000) : false,
            serverTime: Date.now(),
          },
          aave: aaveData || {
            collateral: '1.08',
            debt: '0.00',
            healthFactor: 'Infinite (Safe)',
          },
          aiCapital,
          vaultPortfolio,
          balances: parsedBalances,
          prices: parsedPrices,
          tvls: parsedTvls,
          knowledge,
          decisions,
          performance,
          positions,
          stats: {
            totalActivities,
            totalDecisions: decisions.length,
            trackedAssets: positions.length,
          },
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('API /api/dashboard error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Database Error' },
      { status: 500 }
    );
  }
}
