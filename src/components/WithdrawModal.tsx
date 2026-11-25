'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UsdtLogo,
  BtcLogo,
  EthLogo,
  MetaMaskLogo,
} from './CoinLogos';
import {
  DEPOSIT_VAULT_CONTRACT_ADDRESS,
  VAULT_WITHDRAW_ABI,
  VAULT_PORTFOLIO_TOKENS,
  ERC20_ABI,
  publicClient,
  getViemWalletClient,
} from '@/lib/web3';
import { formatUnits, Address } from 'viem';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';

type WithdrawStep = 'sell-all' | 'withdraw-usdt';
type TxStatus = 'idle' | 'preparing' | 'waiting-wallet' | 'waiting-confirm' | 'success' | 'error';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Wallet
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Step management
  const [step, setStep] = useState<WithdrawStep>('sell-all');
  const [sellAllDone, setSellAllDone] = useState<boolean>(false);

  // Vault balances
  const [vaultBalances, setVaultBalances] = useState<
    { symbol: string; address: Address; decimals: number; balance: number; logo: React.ReactNode }[]
  >([]);
  const [vaultUsdtBalance, setVaultUsdtBalance] = useState<number>(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);

  // Withdraw amount
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  // Tx state
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep('sell-all');
      setSellAllDone(false);
      setTxStatus('idle');
      setTxHash(null);
      setTxError(null);
      setWithdrawAmount('');
      setVaultBalances([]);
      setVaultUsdtBalance(0);
    }
  }, [isOpen]);

  // Reset tx state when step changes
  useEffect(() => {
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);
  }, [step]);

  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return null;
    const eth = (window as any).ethereum;
    if (eth.providers && Array.isArray(eth.providers)) {
      const mm = eth.providers.find((p: any) => p.isMetaMask);
      if (mm) return mm;
    }
    return eth;
  };

  const connectMetaMask = useCallback(async () => {
    setIsConnecting(true);
    setWalletError(null);

    try {
      const provider = getMetaMaskProvider();
      if (!provider) {
        setWalletError('MetaMask extension not found. Please install MetaMask to continue.');
        setIsConnecting(false);
        return;
      }

      // Force MetaMask to show the account selector popup
      try {
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permErr: any) {
        if (permErr.code !== 4001) {
          // Non-rejection error — continue, might already have permissions
        }
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No MetaMask accounts authorized');
      }

      setWalletAddress(accounts[0]);

      // Switch to Celo
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa4ec' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xa4ec',
                chainName: 'Celo Mainnet',
                nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
                rpcUrls: ['https://forno.celo.org'],
                blockExplorerUrls: ['https://celoscan.io'],
              },
            ],
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to connect MetaMask:', err);
      if (err.code === 4001) {
        setWalletError('MetaMask connection was cancelled.');
      } else {
        setWalletError(err.message || 'Failed to connect MetaMask');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const hasAutoAttemptedRef = useRef(false);

  const checkExistingConnection = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider) return;

    try {
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else if (!hasAutoAttemptedRef.current) {
        hasAutoAttemptedRef.current = true;
        connectMetaMask();
      }
    } catch (err) {
      console.error('Error checking existing wallet connection:', err);
    }
  }, [connectMetaMask]);

  useEffect(() => {
    if (isOpen) {
      checkExistingConnection();
    } else {
      hasAutoAttemptedRef.current = false;
    }
  }, [isOpen, checkExistingConnection]);

  // Listen for account changes
  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (provider && provider.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      };
      provider.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  // Fetch vault token balances
  const fetchVaultBalances = useCallback(async () => {
    if (!isOpen) return;
    setIsLoadingBalances(true);

    const tokenLogos: Record<string, React.ReactNode> = {
      USDT: <UsdtLogo className="h-4 w-4" />,
      WBTC: <BtcLogo className="h-4 w-4" />,
      WETH: <EthLogo className="h-4 w-4" />,
    };

    try {
      const results = await Promise.all(
        VAULT_PORTFOLIO_TOKENS.map(async (token) => {
          try {
            const rawBalance = await publicClient.readContract({
              address: token.address,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [DEPOSIT_VAULT_CONTRACT_ADDRESS],
            });
            const formatted = parseFloat(formatUnits(rawBalance, token.decimals));
            return {
              symbol: token.symbol,
              address: token.address,
              decimals: token.decimals,
              balance: formatted,
              logo: tokenLogos[token.symbol] || null,
            };
          } catch {
            return {
              symbol: token.symbol,
              address: token.address,
              decimals: token.decimals,
              balance: 0,
              logo: tokenLogos[token.symbol] || null,
            };
          }
        })
      );

      setVaultBalances(results);

      // Extract USDT balance for step 2
      const usdt = results.find((r) => r.symbol === 'USDT');
      setVaultUsdtBalance(usdt?.balance || 0);
    } catch (err) {
      console.error('Error fetching vault balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchVaultBalances();
    }
  }, [isOpen, fetchVaultBalances]);

  // Refresh USDT balance after sell-all
  const refreshUsdtBalance = async () => {
    try {
      const usdtToken = VAULT_PORTFOLIO_TOKENS.find((t) => t.symbol === 'USDT');
      if (!usdtToken) return;

      const rawBalance = await publicClient.readContract({
        address: usdtToken.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [DEPOSIT_VAULT_CONTRACT_ADDRESS],
      });
      const formatted = parseFloat(formatUnits(rawBalance, usdtToken.decimals));
      setVaultUsdtBalance(formatted);

      // Also refresh all balances for display
      fetchVaultBalances();
    } catch (err) {
      console.error('Error refreshing USDT balance:', err);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  const isProcessing = txStatus === 'preparing' || txStatus === 'waiting-wallet' || txStatus === 'waiting-confirm';

  // Execute selltokenAll
  const handleSellAll = async () => {
    if (!walletAddress) {
      await connectMetaMask();
      return;
    }

    const provider = getMetaMaskProvider();
    if (!provider) {
      setTxError('MetaMask extension not found.');
      return;
    }

    setTxError(null);
    setTxHash(null);
    setTxStatus('preparing');

    try {
      // Ensure Celo
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa4ec' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xa4ec',
                chainName: 'Celo Mainnet',
                nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
                rpcUrls: ['https://forno.celo.org'],
                blockExplorerUrls: ['https://celoscan.io'],
              },
            ],
          });
        }
      }

      const walletClient = getViemWalletClient(provider);

      setTxStatus('waiting-wallet');

      const hash = await walletClient.writeContract({
        address: DEPOSIT_VAULT_CONTRACT_ADDRESS,
        abi: VAULT_WITHDRAW_ABI,
        functionName: 'selltokenAll',
        args: [[] as any],
        account: walletAddress as Address,
      });

      setTxHash(hash);
      setTxStatus('waiting-confirm');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setTxStatus('success');
        setSellAllDone(true);
        await refreshUsdtBalance();
      } else {
        throw new Error('Sell All transaction reverted on Celo.');
      }
    } catch (err: any) {
      console.error('Error during sell all:', err);
      setTxStatus('error');
      if (err.name === 'UserRejectedRequestError' || err.code === 4001 ||
          (err.message && err.message.toLowerCase().includes('user rejected'))) {
        setTxError('Transaction was cancelled in MetaMask.');
      } else if (err.shortMessage) {
        setTxError(err.shortMessage);
      } else {
        setTxError(err.message || 'Sell All failed. Please try again.');
      }
    }
  };

  // Execute withdrawAssetUsdt
  const handleWithdrawUsdt = async () => {
    if (!walletAddress) {
      await connectMetaMask();
      return;
    }

    const provider = getMetaMaskProvider();
    if (!provider) {
      setTxError('MetaMask extension not found.');
      return;
    }

    const numAmount = parseFloat(withdrawAmount || '0');
    if (numAmount <= 0) {
      setTxError('Please enter a valid amount greater than 0.');
      return;
    }

    if (numAmount > vaultUsdtBalance) {
      setTxError(`Insufficient USDT in vault. Available: ${vaultUsdtBalance.toFixed(2)} USDT`);
      return;
    }

    setTxError(null);
    setTxHash(null);
    setTxStatus('preparing');

    try {
      // Ensure Celo
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa4ec' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xa4ec',
                chainName: 'Celo Mainnet',
                nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
                rpcUrls: ['https://forno.celo.org'],
                blockExplorerUrls: ['https://celoscan.io'],
              },
            ],
          });
        }
      }

      // Parse amount with 6 decimals (USDT)
      const parsedAmount = BigInt(Math.round(numAmount * 1_000_000));

      const walletClient = getViemWalletClient(provider);

      setTxStatus('waiting-wallet');

      const hash = await walletClient.writeContract({
        address: DEPOSIT_VAULT_CONTRACT_ADDRESS,
        abi: VAULT_WITHDRAW_ABI,
        functionName: 'withdrawAssetUsdt',
        args: [parsedAmount],
        account: walletAddress as Address,
      });

      setTxHash(hash);
      setTxStatus('waiting-confirm');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setTxStatus('success');
        await refreshUsdtBalance();
      } else {
        throw new Error('Withdraw transaction reverted on Celo.');
      }
    } catch (err: any) {
      console.error('Error during withdraw:', err);
      setTxStatus('error');
      if (err.name === 'UserRejectedRequestError' || err.code === 4001 ||
          (err.message && err.message.toLowerCase().includes('user rejected'))) {
        setTxError('Transaction was cancelled in MetaMask.');
      } else if (err.shortMessage) {
        setTxError(err.shortMessage);
      } else {
        setTxError(err.message || 'Withdraw failed. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  const numWithdrawAmount = parseFloat(withdrawAmount || '0');
  const hasNonUsdtTokens = vaultBalances.some(
    (t) => t.symbol !== 'USDT' && t.balance > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Withdraw from Vault
            </h3>
            <p className="text-[11px] text-slate-500">
              Sell all assets → withdraw USDT to your wallet
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-bold p-1 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* METAMASK CONNECTION */}
          {walletAddress ? (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <MetaMaskLogo className="h-4 w-4 shrink-0" />
                <span className="font-mono text-slate-800 text-[11px] font-bold">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                  Celo
                </span>
              </div>
              <button
                type="button"
                onClick={disconnectWallet}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition font-medium"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={connectMetaMask}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/90 py-2.5 px-4 text-xs font-bold text-orange-950 transition active:scale-98 shadow-xs"
              >
                <MetaMaskLogo className="h-4 w-4 shrink-0" />
                <span>{isConnecting ? 'Connecting to MetaMask...' : 'Connect MetaMask'}</span>
              </button>
              {walletError && (
                <p className="text-[11px] text-rose-600 font-medium px-1">
                  {walletError}
                </p>
              )}
            </div>
          )}

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-2 text-[11px]">
            <div className={`flex items-center gap-1.5 ${step === 'sell-all' || !sellAllDone ? 'text-[#2540EB] font-bold' : 'text-emerald-600 font-bold'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${sellAllDone ? 'bg-emerald-100 text-emerald-700' : 'bg-[#2540EB]/10 text-[#2540EB]'}`}>
                {sellAllDone ? '✓' : '1'}
              </span>
              <span>Sell All</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <div className={`flex items-center gap-1.5 ${step === 'withdraw-usdt' ? 'text-[#2540EB] font-bold' : 'text-slate-400 font-medium'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 'withdraw-usdt' ? 'bg-[#2540EB]/10 text-[#2540EB]' : 'bg-slate-100 text-slate-400'}`}>
                2
              </span>
              <span>Withdraw USDT</span>
            </div>
          </div>

          {/* ════════════════ STEP 1: SELL ALL ════════════════ */}
          {step === 'sell-all' && (
            <div className="space-y-3">
              {/* Vault token balances */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-extrabold text-slate-800 text-[11px]">Vault Holdings</span>
                  {isLoadingBalances ? (
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  ) : (
                    <button
                      type="button"
                      onClick={fetchVaultBalances}
                      className="text-[10px] font-bold text-slate-400 hover:text-[#2540EB] transition"
                    >
                      ↻ Refresh
                    </button>
                  )}
                </div>

                {vaultBalances.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {token.logo}
                      <span className="font-bold text-slate-700">{token.symbol}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {token.balance > 0 ? token.balance.toFixed(token.symbol === 'WBTC' ? 8 : 4) : '0.00'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sell All info */}
              {!sellAllDone && hasNonUsdtTokens && (
                <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-3 text-xs space-y-1.5">
                  <p className="text-[11px] font-bold text-amber-900">
                    This will convert all WBTC, WETH, and other tokens to USDT inside the vault via Uniswap V3.
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Positions will be reset. USDT stays in the vault for withdrawal in Step 2.
                  </p>
                </div>
              )}

              {/* Success message after sell all */}
              {sellAllDone && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>All assets sold to USDT!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Vault USDT balance: <strong className="font-mono">{vaultUsdtBalance.toFixed(2)} USDT</strong>
                  </p>
                  {txHash && (
                    <a
                      href={`https://celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline font-mono"
                    >
                      <span>View on Celoscan</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Processing state */}
              {isProcessing && step === 'sell-all' && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    {txStatus === 'preparing' && 'Preparing transaction...'}
                    {txStatus === 'waiting-wallet' && 'Please confirm selltokenAll in MetaMask...'}
                    {txStatus === 'waiting-confirm' && 'Confirming on Celo...'}
                  </div>
                  <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: txStatus === 'waiting-wallet' ? '50%' : '80%' }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {txError && step === 'sell-all' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Transaction Notice</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed break-words">{txError}</p>
                </div>
              )}

              {/* Action buttons */}
              {sellAllDone ? (
                <button
                  type="button"
                  onClick={() => setStep('withdraw-usdt')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold bg-[#2540EB] hover:bg-[#2540EB]/90 text-white shadow-xs transition active:scale-98"
                >
                  <span>Continue to Withdraw USDT</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : !hasNonUsdtTokens && vaultBalances.length > 0 ? (
                <div className="space-y-2">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center text-[11px] text-slate-500">
                    No tokens to sell. Vault only holds USDT.
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('withdraw-usdt')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold bg-[#2540EB] hover:bg-[#2540EB]/90 text-white shadow-xs transition active:scale-98"
                  >
                    <span>Skip to Withdraw USDT</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSellAll}
                  disabled={isProcessing || !walletAddress || isLoadingBalances}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                    isProcessing || !walletAddress || isLoadingBalances
                      ? 'bg-amber-400 cursor-not-allowed opacity-80'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Selling All Assets...</span>
                    </>
                  ) : (
                    <span>Sell All Assets → USDT</span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* ════════════════ STEP 2: WITHDRAW USDT ════════════════ */}
          {step === 'withdraw-usdt' && (
            <div className="space-y-3">
              {/* Back to step 1 */}
              {!sellAllDone && (
                <button
                  type="button"
                  onClick={() => setStep('sell-all')}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1"
                >
                  ← Back to Sell All
                </button>
              )}

              {/* Vault USDT balance */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <UsdtLogo className="h-4 w-4" />
                    <span className="font-bold text-slate-700">USDT in Vault</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLoadingBalances ? (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    ) : (
                      <span className="font-mono font-bold text-slate-800">
                        {vaultUsdtBalance.toFixed(2)} USDT
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={refreshUsdtBalance}
                      className="text-[10px] font-bold text-slate-400 hover:text-[#2540EB] transition"
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                    Withdraw Amount
                  </span>
                  {vaultUsdtBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(vaultUsdtBalance.toString())}
                      className="text-[10px] font-bold text-[#2540EB] hover:underline uppercase"
                    >
                      MAX
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3.5 pr-14 text-slate-900 font-bold font-mono text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    USDT
                  </span>
                </div>

                {/* Quick presets */}
                <div className="mt-1.5 flex gap-1.5">
                  {[0.25, 0.5, 0.75, 1].map((pct) => {
                    const val = (vaultUsdtBalance * pct).toFixed(2);
                    const label = pct === 1 ? 'MAX' : `${pct * 100}%`;
                    return (
                      <button
                        key={pct}
                        onClick={() => setWithdrawAmount(val)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Success message */}
              {txStatus === 'success' && step === 'withdraw-usdt' && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>USDT Withdrawn Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    <strong className="font-mono">{numWithdrawAmount.toFixed(2)} USDT</strong> sent to your wallet.
                  </p>
                  {txHash && (
                    <a
                      href={`https://celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline font-mono"
                    >
                      <span>View on Celoscan</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Processing state */}
              {isProcessing && step === 'withdraw-usdt' && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    {txStatus === 'preparing' && 'Preparing transaction...'}
                    {txStatus === 'waiting-wallet' && 'Please confirm withdrawAssetUsdt in MetaMask...'}
                    {txStatus === 'waiting-confirm' && 'Confirming on Celo...'}
                  </div>
                  <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: txStatus === 'waiting-wallet' ? '50%' : '80%' }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {txError && step === 'withdraw-usdt' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Transaction Notice</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed break-words">{txError}</p>
                </div>
              )}

              {/* Action buttons */}
              {txStatus === 'success' && step === 'withdraw-usdt' ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxStatus('idle');
                      setTxHash(null);
                      setWithdrawAmount('');
                    }}
                    className="flex-1 rounded-xl py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Withdraw More
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-98"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleWithdrawUsdt}
                  disabled={isProcessing || !walletAddress || numWithdrawAmount <= 0 || numWithdrawAmount > vaultUsdtBalance}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                    isProcessing || !walletAddress || numWithdrawAmount <= 0 || numWithdrawAmount > vaultUsdtBalance
                      ? 'bg-emerald-400 cursor-not-allowed opacity-80'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Withdrawing USDT...</span>
                    </>
                  ) : (
                    <span>Withdraw {numWithdrawAmount > 0 ? numWithdrawAmount.toFixed(2) : ''} USDT</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
