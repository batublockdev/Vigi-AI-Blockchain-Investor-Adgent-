'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BtcLogo,
  EthLogo,
  UsdtLogo,
  WbrlLogo,
  WarsLogo,
  CeloLogo,
  MetaMaskLogo,
} from './CoinLogos';
import {
  SupportedDepositToken,
  DEPOSIT_TOKENS,
  DEPOSIT_VAULT_CONTRACT_ADDRESS,
  ERC20_ABI,
  VAULT_DEPOSIT_ABI,
  publicClient,
  getViemWalletClient,
  fetchTokenAllowance,
  fetchOnChainTokenBalance,
  buildRipioRampUrl,
  convertTokenToCOP,
  formatCOP,
} from '@/lib/web3';
import { parseUnits, Address } from 'viem';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

type DepositStatus =
  | 'idle'
  | 'checking'
  | 'approving'
  | 'waiting-approval'
  | 'depositing'
  | 'waiting-deposit'
  | 'success'
  | 'error';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  brlRate?: number;
}

export const InvestModal: React.FC<InvestModalProps> = ({
  isOpen,
  onClose,
  brlRate = 5.05,
}) => {
  // Wallet Connection State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Deposit Token Selection (USDT, wBRL, wARS)
  const [selectedToken, setSelectedToken] = useState<SupportedDepositToken>('USDT');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false);

  // Country for Ripio Ramp - Defaults to Colombia (CO) as requested
  const [country, setCountry] = useState<string>('CO');

  // Amount
  const [amount, setAmount] = useState<string>('50');
  const numAmount = Math.max(0, parseFloat(amount || '0'));

  // Deposit on-chain execution states
  const [depositStatus, setDepositStatus] = useState<DepositStatus>('idle');
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Reset deposit state on modal close or amount/token change
  useEffect(() => {
    if (!isOpen) {
      setDepositStatus('idle');
      setDepositTxHash(null);
      setDepositError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (depositStatus === 'success' || depositStatus === 'error') {
      setDepositStatus('idle');
      setDepositError(null);
    }
  }, [amount, selectedToken]);

  // Calculate equivalent in Colombian Pesos (COP)
  const amountInCOP = convertTokenToCOP(selectedToken, numAmount, brlRate);

  // Get MetaMask provider specifically if multiple Web3 wallets exist
  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return null;
    }
    const eth = (window as any).ethereum;
    if (eth.providers && Array.isArray(eth.providers)) {
      const mm = eth.providers.find((p: any) => p.isMetaMask);
      if (mm) return mm;
    }
    return eth;
  };

  // Direct connection to MetaMask
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

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No MetaMask accounts authorized');
      }

      setWalletAddress(accounts[0]);

      // Ensure user is on Celo Mainnet (Chain ID 42220 / 0xa4ec)
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

  // Check if MetaMask is already connected or trigger direct connection upon opening
  const checkExistingConnection = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider) return;

    try {
      const accounts = await provider.request({
        method: 'eth_accounts',
      });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else if (!hasAutoAttemptedRef.current) {
        // Trigger MetaMask directly upon opening Add Funds if not connected
        hasAutoAttemptedRef.current = true;
        connectMetaMask();
      }
    } catch (err) {
      console.error('Error checking existing wallet connection:', err);
    }
  }, [connectMetaMask]);

  // When modal opens, connect directly to MetaMask
  useEffect(() => {
    if (isOpen) {
      checkExistingConnection();
    } else {
      hasAutoAttemptedRef.current = false;
    }
  }, [isOpen, checkExistingConnection]);

  // Listen for account and network changes in MetaMask
  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (provider && provider.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
          setTokenBalance(null);
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

  const disconnectWallet = () => {
    setWalletAddress(null);
    setTokenBalance(null);
  };

  // Fetch token balance when wallet or token selection changes
  const updateBalance = useCallback(async () => {
    if (!walletAddress) {
      setTokenBalance(null);
      return;
    }

    setIsCheckingBalance(true);
    try {
      const balance = await fetchOnChainTokenBalance(walletAddress, selectedToken);
      setTokenBalance(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setTokenBalance(0);
    } finally {
      setIsCheckingBalance(false);
    }
  }, [walletAddress, selectedToken]);

  useEffect(() => {
    if (walletAddress) {
      updateBalance();
    }
  }, [walletAddress, selectedToken, updateBalance]);

  const isProcessing = [
    'checking',
    'approving',
    'waiting-approval',
    'depositing',
    'waiting-deposit',
  ].includes(depositStatus);

  const handleConfirmDeposit = async () => {
    if (!walletAddress) {
      await connectMetaMask();
      return;
    }

    const provider = getMetaMaskProvider();
    if (!provider) {
      setDepositError('MetaMask extension not found. Please install MetaMask to continue.');
      return;
    }

    if (numAmount <= 0) {
      setDepositError('Please enter a valid deposit amount greater than 0.');
      return;
    }

    if (tokenBalance !== null && numAmount > tokenBalance) {
      setDepositError(`Insufficient ${selectedToken} balance in your wallet.`);
      return;
    }

    setDepositError(null);
    setDepositTxHash(null);
    setDepositStatus('checking');

    try {
      // 1. Ensure user is on Celo Mainnet (Chain ID 42220 / 0xa4ec)
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

      const tokenConfig = DEPOSIT_TOKENS[selectedToken];

      // Sanitize input decimals to prevent parseUnits error
      const rawAmountStr = amount.trim();
      const parts = rawAmountStr.split('.');
      const sanitizedAmountStr =
        parts.length > 1
          ? `${parts[0]}.${parts[1].slice(0, tokenConfig.decimals)}`
          : rawAmountStr;

      const parsedAmount = parseUnits(sanitizedAmountStr, tokenConfig.decimals);
      if (parsedAmount <= 0n) {
        throw new Error('Deposit amount must be greater than 0.');
      }

      const walletClient = getViemWalletClient(provider);

      // 2. Check current allowance
      const currentAllowance = await fetchTokenAllowance(
        walletAddress as Address,
        tokenConfig.address,
        DEPOSIT_VAULT_CONTRACT_ADDRESS
      );

      // Step 1: If current allowance is less than amount, request approval
      if (currentAllowance < parsedAmount) {
        setDepositStatus('approving');

        const approveHash = await walletClient.writeContract({
          address: tokenConfig.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [DEPOSIT_VAULT_CONTRACT_ADDRESS, parsedAmount],
          account: walletAddress as Address,
        });

        setDepositStatus('waiting-approval');
        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });
      }

      // Step 2: Call depositAsset(address _token, uint256 _amount, bytes _path)
      // Selector: 0x530f19ed, _path: '0x' for auto-detection
      setDepositStatus('depositing');

      const depositHash = await walletClient.writeContract({
        address: DEPOSIT_VAULT_CONTRACT_ADDRESS,
        abi: VAULT_DEPOSIT_ABI,
        functionName: 'depositAsset',
        args: [tokenConfig.address, parsedAmount, '0x'],
        account: walletAddress as Address,
      });

      setDepositStatus('waiting-deposit');
      setDepositTxHash(depositHash);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: depositHash,
      });

      if (receipt.status === 'success') {
        setDepositStatus('success');
        await updateBalance();
      } else {
        throw new Error('Deposit transaction reverted on Celo.');
      }
    } catch (err: any) {
      console.error('Error during deposit flow:', err);
      setDepositStatus('error');
      if (
        err.name === 'UserRejectedRequestError' ||
        err.code === 4001 ||
        (err.message && err.message.toLowerCase().includes('user rejected'))
      ) {
        setDepositError('Transaction was cancelled in MetaMask.');
      } else if (err.shortMessage) {
        setDepositError(err.shortMessage);
      } else {
        setDepositError(err.message || 'Deposit failed. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  // Exact allocation formula: 78% Tokens (39% ETH, 39% BTC), 20% AI Agent, 2% Gas
  const gasAmount = numAmount * 0.02;
  const agentAmount = numAmount * 0.20;
  const tokensAmount = numAmount * 0.78;
  const ethAmount = numAmount * 0.39;
  const btcAmount = numAmount * 0.39;

  const hasInsufficientBalance =
    walletAddress !== null &&
    tokenBalance !== null &&
    (tokenBalance < numAmount || numAmount <= 0);

  // Dynamic Ripio Ramp URL: amount expressed in Colombian Pesos (COP) for Colombia (CO)
  const ripioRampUrl = buildRipioRampUrl(
    selectedToken,
    numAmount,
    walletAddress,
    country,
    brlRate
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Add Funds to AI Portfolio
            </h3>
            <p className="text-[11px] text-slate-500">
              Automated allocation with on-chain verification
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
          {/* DIRECT METAMASK CONNECTION STRIP (SAVES SPACE) */}
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

          {/* CURRENCY & RAMP SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                Currency
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span>Ramp:</span>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold text-slate-800 focus:outline-none"
                >
                  <option value="CO">🇨🇴 Colombia (PSE)</option>
                  <option value="BR">🇧🇷 Brazil (PIX)</option>
                  <option value="AR">🇦🇷 Argentina (ARS)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* USDT */}
              <button
                type="button"
                onClick={() => setSelectedToken('USDT')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border transition ${
                  selectedToken === 'USDT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UsdtLogo className="h-4 w-4" />
                <span className="text-xs font-bold">USDT</span>
              </button>

              {/* wBRL */}
              <button
                type="button"
                onClick={() => setSelectedToken('wBRL')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border transition ${
                  selectedToken === 'wBRL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <WbrlLogo className="h-4 w-4" />
                <span className="text-xs font-bold">wBRL</span>
              </button>

              {/* wARS */}
              <button
                type="button"
                onClick={() => setSelectedToken('wARS')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border transition ${
                  selectedToken === 'wARS'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <WarsLogo className="h-4 w-4" />
                <span className="text-xs font-bold">wARS</span>
              </button>
            </div>
          </div>

          {/* AMOUNT & ON-CHAIN BALANCE */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">
                Amount
              </span>

              {walletAddress && (
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400">Wallet:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {isCheckingBalance
                      ? 'Checking...'
                      : tokenBalance !== null
                      ? `${tokenBalance.toFixed(2)} ${selectedToken}`
                      : '0.00'}
                  </span>
                  {tokenBalance !== null && tokenBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(tokenBalance.toString())}
                      className="text-[10px] font-bold text-emerald-700 hover:underline uppercase ml-0.5"
                    >
                      MAX
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3.5 pr-14 text-slate-900 font-bold font-mono text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                {selectedToken}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span>Equivalent in COP:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCOP(amountInCOP)}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="mt-1.5 flex gap-1.5">
              {['25', '50', '100', '250'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`flex-1 rounded-lg border py-0.5 text-xs font-bold transition ${
                    amount === preset
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* COMPACT SPACE-SAVING BUY ON RIPIO BAR */}
            {hasInsufficientBalance && (
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200/90 px-3 py-2 text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-bold text-amber-900 block truncate">
                    Insufficient {selectedToken} ({tokenBalance !== null ? tokenBalance.toFixed(2) : '0.00'} in wallet)
                  </span>
                  <span className="text-[10px] text-amber-700">
                    Need {formatCOP(amountInCOP)} via PSE Colombia
                  </span>
                </div>
                <a
                  href={ripioRampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs px-3 py-1.5 shadow-xs transition shrink-0"
                >
                  <span>Buy on Ripio</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            )}
          </div>

          {/* ALLOCATION BREAKDOWN (78% / 20% / 2%) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-extrabold text-slate-800 text-[11px]">Distribution</span>
              <span className="font-bold text-slate-600 font-mono text-[11px]">
                {numAmount.toFixed(2)} {selectedToken}
              </span>
            </div>

            {/* 1. Selected Tokens (78%) */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">1. Selected Tokens (78%)</span>
                <span className="font-mono font-bold text-slate-800">
                  {tokensAmount.toFixed(2)} {selectedToken}
                </span>
              </div>
              <div className="pl-2 space-y-0.5 text-[10px] text-slate-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <EthLogo className="h-3 w-3" />
                    <span>ETH (39%)</span>
                  </div>
                  <span className="font-mono">{ethAmount.toFixed(2)} {selectedToken}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <BtcLogo className="h-3 w-3" />
                    <span>BTC (39%)</span>
                  </div>
                  <span className="font-mono">{btcAmount.toFixed(2)} {selectedToken}</span>
                </div>
              </div>
            </div>

            {/* 2. Autonomous AI Agent (20%) */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/40">
              <div className="flex items-center gap-1">
                <UsdtLogo className="h-3 w-3" />
                <span className="font-bold text-slate-700">2. Autonomous AI (20%)</span>
              </div>
              <span className="font-bold font-mono text-emerald-700">
                {agentAmount.toFixed(2)} {selectedToken}
              </span>
            </div>

            {/* 3. Gas (2%) */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/40">
              <div className="flex items-center gap-1">
                <CeloLogo className="h-3 w-3" />
                <span className="font-bold text-slate-700">3. Gas Reserve (2%)</span>
              </div>
              <span className="font-bold font-mono text-amber-700">
                {gasAmount.toFixed(2)} {selectedToken}
              </span>
            </div>
          </div>

          {/* STATUS NOTIFICATIONS */}
          {depositStatus === 'success' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-950 space-y-1.5 animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Deposit Confirmed Successfully!</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Your deposit of <strong className="font-mono">{numAmount.toFixed(2)} {selectedToken}</strong> was received by the vault contract and swapped into portfolio assets.
              </p>
              {depositTxHash && (
                <div className="pt-1">
                  <a
                    href={`https://celoscan.io/tx/${depositTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline font-mono"
                  >
                    <span>View on Celoscan</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-950 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-blue-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  {depositStatus === 'checking' && 'Verifying on-chain token allowance...'}
                  {depositStatus === 'approving' && 'Step 1/2: Please approve token spending in MetaMask...'}
                  {depositStatus === 'waiting-approval' && 'Step 1/2: Waiting for approval confirmation on Celo...'}
                  {depositStatus === 'depositing' && 'Step 2/2: Please confirm depositAsset in MetaMask...'}
                  {depositStatus === 'waiting-deposit' && 'Step 2/2: Confirming depositAsset transaction on Celo...'}
                </span>
              </div>
              <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width:
                      depositStatus === 'checking'
                        ? '15%'
                        : depositStatus === 'approving'
                        ? '35%'
                        : depositStatus === 'waiting-approval'
                        ? '50%'
                        : depositStatus === 'depositing'
                        ? '75%'
                        : '92%',
                  }}
                />
              </div>
            </div>
          )}

          {depositError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-900 space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Transaction Notice</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed break-words">
                {depositError}
              </p>
            </div>
          )}

          {/* MAIN ACTION BUTTON */}
          {!walletAddress ? (
            <button
              type="button"
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition active:scale-98"
            >
              <MetaMaskLogo className="h-4 w-4" />
              <span>{isConnecting ? 'Connecting to MetaMask...' : 'Connect MetaMask to Deposit'}</span>
            </button>
          ) : hasInsufficientBalance ? (
            <a
              href={ripioRampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition text-center"
            >
              <span>Buy {formatCOP(amountInCOP)} on Ripio</span>
              <span>↗</span>
            </a>
          ) : depositStatus === 'success' ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDepositStatus('idle');
                  setDepositTxHash(null);
                }}
                className="flex-1 rounded-xl py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Make Another Deposit
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
              onClick={handleConfirmDeposit}
              disabled={isProcessing || numAmount <= 0}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                isProcessing || numAmount <= 0
                  ? 'bg-emerald-400 cursor-not-allowed opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>
                    {depositStatus === 'checking' && 'Checking Allowance...'}
                    {depositStatus === 'approving' && '1/2: Approve in MetaMask...'}
                    {depositStatus === 'waiting-approval' && '1/2: Confirming Approval...'}
                    {depositStatus === 'depositing' && '2/2: Confirm in MetaMask...'}
                    {depositStatus === 'waiting-deposit' && '2/2: Depositing to Vault...'}
                  </span>
                </>
              ) : (
                <span>Confirm Deposit ({numAmount.toFixed(2)} {selectedToken})</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
