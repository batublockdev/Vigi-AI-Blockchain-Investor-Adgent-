'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UsdtLogo,
  MetaMaskLogo,
} from './CoinLogos';
import {
  AI_CAPITAL_ACCOUNT_ADDRESS,
  AI_CAPITAL_TOKENS,
  ERC20_ABI,
  publicClient,
  getViemWalletClient,
} from '@/lib/web3';
import { formatUnits, Address, Hex, encodeAbiParameters, keccak256, concatHex } from 'viem';
import { celo } from 'viem/chains';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, ArrowRight, Wallet } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS — Aave V3 Pool & MinimalAccount on Celo mainnet
// ═══════════════════════════════════════════════════════════════

const AAVE_POOL: Address = '0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402';
const CELO_CHAIN_ID = 42220;
const AAVE_WITHDRAW_SELECTOR: Hex = '0x69328dec'; // withdraw(address,uint256,address)

// MinimalAccount ABI for execute() + owner + nonce + withdrawToken + withdrawCelo
const MINIMAL_ACCOUNT_ABI = [
  {
    type: 'function',
    name: 'execute',
    inputs: [
      { name: 'target', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawToken',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawCelo',
    inputs: [
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'nonce',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const;

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Step = 'review' | 'aave-withdraw' | 'withdraw-tokens' | 'done';
type TxStatus = 'idle' | 'preparing' | 'waiting-wallet' | 'waiting-confirm' | 'success' | 'error';

interface BalanceInfo {
  usdt: number;
  aCelUSDT: number;
  celo: number;
}

// ═══════════════════════════════════════════════════════════════
// EIP-191 SIGNATURE HELPERS
// Replicates the same logic from executor.ts (bot_adgent)
// ═══════════════════════════════════════════════════════════════

function computeExecuteHash(
  target: Address,
  value: bigint,
  data: Hex,
  nonce: bigint,
  chainId: bigint
): Hex {
  const innerHash = keccak256(data);
  const encoded = encodeAbiParameters(
    [
      { type: 'address', name: 'target' },
      { type: 'uint256', name: 'value' },
      { type: 'bytes32', name: 'dataHash' },
      { type: 'uint256', name: 'nonce' },
      { type: 'uint256', name: 'chainId' },
    ],
    [target, value, innerHash, nonce, chainId]
  );
  // Return the RAW hash (without EIP-191 prefix).
  // MetaMask's personal_sign will apply the EIP-191 prefix itself.
  // The contract also applies toEthSignedMessageHash() = EIP-191 prefix.
  // So we must NOT double-prefix — pass rawHash to personal_sign.
  return keccak256(encoded);
}

function buildAaveWithdrawData(
  asset: Address,
  amount: bigint,
  to: Address
): Hex {
  const params = encodeAbiParameters(
    [
      { type: 'address', name: 'asset' },
      { type: 'uint256', name: 'amount' },
      { type: 'address', name: 'to' },
    ],
    [asset, amount, to]
  );
  return concatHex([AAVE_WITHDRAW_SELECTOR, params]);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

interface WithdrawAICapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawAICapitalModal: React.FC<WithdrawAICapitalModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Wallet
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Balances
  const [balances, setBalances] = useState<BalanceInfo>({ usdt: 0, aCelUSDT: 0, celo: 0 });
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);

  // Step management
  const [step, setStep] = useState<Step>('review');
  const [aaveWithdrawDone, setAaveWithdrawDone] = useState<boolean>(false);
  const [tokenWithdrawDone, setTokenWithdrawDone] = useState<boolean>(false);

  // Tx state
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Amount to withdraw (for the final withdrawToken step)
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  // ═══════════════════════════════════════════════════════════════
  // RESET ON CLOSE
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isOpen) {
      setStep('review');
      setAaveWithdrawDone(false);
      setTokenWithdrawDone(false);
      setTxStatus('idle');
      setTxHash(null);
      setTxError(null);
      setWithdrawAmount('');
      setBalances({ usdt: 0, aCelUSDT: 0, celo: 0 });
    }
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════
  // METAMASK CONNECTION
  // ═══════════════════════════════════════════════════════════════

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

      try {
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permErr: any) {
        if (permErr.code !== 4001) {
          // Non-rejection error — continue
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

  // ═══════════════════════════════════════════════════════════════
  // FETCH BALANCES from MinimalAccount
  // ═══════════════════════════════════════════════════════════════

  const fetchBalances = useCallback(async () => {
    if (!isOpen) return;
    setIsLoadingBalances(true);

    try {
      // USDT balance
      const usdtRaw = await publicClient.readContract({
        address: AI_CAPITAL_TOKENS.USDT.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [AI_CAPITAL_ACCOUNT_ADDRESS],
      });
      const usdt = parseFloat(formatUnits(usdtRaw, AI_CAPITAL_TOKENS.USDT.decimals));

      // aCelUSDT balance (Aave receipt token)
      const aCelUSDTRaw = await publicClient.readContract({
        address: AI_CAPITAL_TOKENS.aCelUSDT.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [AI_CAPITAL_ACCOUNT_ADDRESS],
      });
      const aCelUSDT = parseFloat(formatUnits(aCelUSDTRaw, AI_CAPITAL_TOKENS.aCelUSDT.decimals));

      // CELO native balance
      const celoRaw = await publicClient.getBalance({ address: AI_CAPITAL_ACCOUNT_ADDRESS });
      const celo = parseFloat(formatUnits(celoRaw, 18));

      setBalances({ usdt, aCelUSDT, celo });

      // Check if connected wallet is the owner
      if (walletAddress) {
        const ownerAddr = await publicClient.readContract({
          address: AI_CAPITAL_ACCOUNT_ADDRESS,
          abi: MINIMAL_ACCOUNT_ABI,
          functionName: 'owner',
        });
        setIsOwner(
          (ownerAddr as string).toLowerCase() === walletAddress.toLowerCase()
        );
      }
    } catch (err) {
      console.error('Error fetching MinimalAccount balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isOpen, walletAddress]);

  useEffect(() => {
    if (isOpen) {
      fetchBalances();
    }
  }, [isOpen, fetchBalances]);

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Withdraw from Aave (aCelUSDT → USDT back to MinimalAccount)
  // Uses execute() with EIP-191 signature from the owner's MetaMask
  // ═══════════════════════════════════════════════════════════════

  const handleAaveWithdraw = async () => {
    if (!walletAddress) {
      await connectMetaMask();
      return;
    }

    const provider = getMetaMaskProvider();
    if (!provider) {
      setTxError('MetaMask extension not found.');
      return;
    }

    if (balances.aCelUSDT <= 0) {
      // Nothing to withdraw from Aave, skip
      setAaveWithdrawDone(true);
      setStep('withdraw-tokens');
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

      // 1. Read current nonce from MinimalAccount
      const nonce = await publicClient.readContract({
        address: AI_CAPITAL_ACCOUNT_ADDRESS,
        abi: MINIMAL_ACCOUNT_ABI,
        functionName: 'nonce',
      });

      // 2. Build calldata for Aave withdraw(USDT, amount, MinimalAccount)
      const aCelUsdtRaw = await publicClient.readContract({
        address: AI_CAPITAL_TOKENS.aCelUSDT.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [AI_CAPITAL_ACCOUNT_ADDRESS],
      });

      const withdrawData = buildAaveWithdrawData(
        AI_CAPITAL_TOKENS.USDT.address,
        aCelUsdtRaw as bigint,
        AI_CAPITAL_ACCOUNT_ADDRESS
      );

      // 3. Compute raw hash (without EIP-191 prefix).
      // MetaMask's personal_sign applies the EIP-191 prefix automatically.
      // The contract also applies toEthSignedMessageHash() = EIP-191 prefix.
      // So we pass the raw hash to personal_sign to avoid double-prefixing.
      const rawHash = computeExecuteHash(
        AAVE_POOL,
        0n,
        withdrawData,
        nonce as bigint,
        BigInt(CELO_CHAIN_ID)
      );

      // 4. Sign with MetaMask (personal_sign)
      // personal_sign does: keccak256("\x19Ethereum Signed Message:\n32" + rawHash)
      // which matches what the contract expects (toEthSignedMessageHash)
      setTxStatus('waiting-wallet');
      const signature = await provider.request({
        method: 'personal_sign',
        params: [rawHash, walletAddress],
      });

      // MetaMask returns 0x-prefixed hex signature (r + s + v = 65 bytes)
      // Ensure v is 27/28 format
      const sigHex = signature as string;
      const sigBytes = sigHex.slice(2);
      const v = parseInt(sigBytes.slice(128, 130), 16);
      let normalizedSig = sigHex;
      if (v === 0 || v === 1) {
        // MetaMask sometimes returns v=0/1, normalize to 27/28
        const normalizedV = v + 27;
        normalizedSig = '0x' + sigBytes.slice(0, 128) + normalizedV.toString(16).padStart(2, '0');
      }

      // 5. Send execute() tx via walletClient
      const walletClient = getViemWalletClient(provider);

      setTxStatus('waiting-confirm');

      const hash = await walletClient.writeContract({
        address: AI_CAPITAL_ACCOUNT_ADDRESS,
        abi: MINIMAL_ACCOUNT_ABI as any,
        functionName: 'execute',
        args: [AAVE_POOL, 0n, withdrawData, normalizedSig as Hex],
        account: walletAddress as Address,
        gas: 500000n,
      });

      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setTxStatus('success');
        setAaveWithdrawDone(true);
        // Refresh balances
        await fetchBalances();
      } else {
        throw new Error('Aave withdraw transaction reverted on Celo.');
      }
    } catch (err: any) {
      console.error('Error during Aave withdraw:', err);
      setTxStatus('error');
      if (err.code === 4001 ||
          (err.message && err.message.toLowerCase().includes('user rejected'))) {
        setTxError('Transaction was cancelled in MetaMask.');
      } else if (err.shortMessage) {
        setTxError(err.shortMessage);
      } else {
        setTxError(err.message || 'Aave withdraw failed. Please try again.');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Withdraw USDT from MinimalAccount to owner wallet
  // Direct call: withdrawToken(USDT, amount) — onlyOwner
  // ═══════════════════════════════════════════════════════════════

  const handleWithdrawTokens = async () => {
    if (!walletAddress) {
      await connectMetaMask();
      return;
    }

    const provider = getMetaMaskProvider();
    if (!provider) {
      setTxError('MetaMask extension not found.');
      return;
    }

    // Read fresh USDT balance
    const usdtRaw = await publicClient.readContract({
      address: AI_CAPITAL_TOKENS.USDT.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [AI_CAPITAL_ACCOUNT_ADDRESS],
    });
    const usdtAmount = parseFloat(formatUnits(usdtRaw, 6));

    if (usdtAmount <= 0) {
      setTxError('No USDT available in MinimalAccount to withdraw.');
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
        address: AI_CAPITAL_ACCOUNT_ADDRESS,
        abi: MINIMAL_ACCOUNT_ABI as any,
        functionName: 'withdrawToken',
        args: [AI_CAPITAL_TOKENS.USDT.address, usdtRaw as bigint],
        account: walletAddress as Address,
        gas: 200000n,
      });

      setTxHash(hash);
      setTxStatus('waiting-confirm');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setTxStatus('success');
        setTokenWithdrawDone(true);
        await fetchBalances();
      } else {
        throw new Error('Withdraw transaction reverted on Celo.');
      }
    } catch (err: any) {
      console.error('Error during token withdraw:', err);
      setTxStatus('error');
      if (err.code === 4001 ||
          (err.message && err.message.toLowerCase().includes('user rejected'))) {
        setTxError('Transaction was cancelled in MetaMask.');
      } else if (err.shortMessage) {
        setTxError(err.shortMessage);
      } else {
        setTxError(err.message || 'Withdraw failed. Please try again.');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Withdraw CELO from MinimalAccount to owner wallet
  // Direct call: withdrawCelo(amount) — onlyOwner
  // ═══════════════════════════════════════════════════════════════

  const [celoWithdrawn, setCeloWithdrawn] = useState<boolean>(false);

  const handleWithdrawCelo = async () => {
    if (!walletAddress) return;

    const provider = getMetaMaskProvider();
    if (!provider) {
      setTxError('MetaMask extension not found.');
      return;
    }

    if (balances.celo <= 0) {
      setCeloWithdrawn(true);
      return;
    }

    setTxError(null);
    setTxHash(null);
    setTxStatus('preparing');

    try {
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

      const celoRaw = await publicClient.getBalance({ address: AI_CAPITAL_ACCOUNT_ADDRESS });

      const walletClient = getViemWalletClient(provider);

      setTxStatus('waiting-wallet');

      const hash = await walletClient.writeContract({
        address: AI_CAPITAL_ACCOUNT_ADDRESS,
        abi: MINIMAL_ACCOUNT_ABI as any,
        functionName: 'withdrawCelo',
        args: [celoRaw],
        account: walletAddress as Address,
        gas: 100000n,
      });

      setTxHash(hash);
      setTxStatus('waiting-confirm');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setTxStatus('success');
        setCeloWithdrawn(true);
        await fetchBalances();
      } else {
        throw new Error('CELO withdraw transaction reverted on Celo.');
      }
    } catch (err: any) {
      console.error('Error during CELO withdraw:', err);
      setTxStatus('error');
      if (err.code === 4001 ||
          (err.message && err.message.toLowerCase().includes('user rejected'))) {
        setTxError('Transaction was cancelled in MetaMask.');
      } else if (err.shortMessage) {
        setTxError(err.shortMessage);
      } else {
        setTxError(err.message || 'CELO withdraw failed. Please try again.');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // WITHDRAW ALL — sequential execution
  // ═══════════════════════════════════════════════════════════════

  const handleWithdrawAll = async () => {
    // Step 1: Aave withdraw
    await handleAaveWithdraw();
    // Step 2 + 3 handled by user clicking through steps
  };

  const handleContinueToTokens = () => {
    setStep('withdraw-tokens');
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);
  };

  const handleContinueToCelo = () => {
    setStep('withdraw-tokens');
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (!isOpen) return null;

  const isProcessing = txStatus === 'preparing' || txStatus === 'waiting-wallet' || txStatus === 'waiting-confirm';
  const totalUSD = balances.usdt + balances.aCelUSDT; // aCelUSDT is 1:1 with USDT

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsOwner(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Withdraw from Vigi Capital
            </h3>
            <p className="text-[11px] text-slate-500">
              MinimalAccount · AI Autonomous Capital
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
                {isOwner && (
                  <span className="rounded-full bg-[#2540EB]/10 text-[#2540EB] text-[10px] font-bold px-2 py-0.2">
                    Owner
                  </span>
                )}
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

          {/* OWNER WARNING */}
          {walletAddress && !isOwner && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Not the contract owner</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Only the MinimalAccount owner can withdraw funds. Connect the owner wallet.
              </p>
            </div>
          )}

          {/* BALANCES SUMMARY */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-extrabold text-slate-800 text-[11px]">MinimalAccount Holdings</span>
              {isLoadingBalances ? (
                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
              ) : (
                <button
                  type="button"
                  onClick={fetchBalances}
                  className="text-[10px] font-bold text-slate-400 hover:text-[#2540EB] transition"
                >
                  ↻ Refresh
                </button>
              )}
            </div>

            {/* USDT */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <UsdtLogo className="h-4 w-4" />
                <span className="font-bold text-slate-700">USDT (liquid)</span>
              </div>
              <span className="font-mono font-bold text-slate-800">
                {balances.usdt.toFixed(4)} USDT
              </span>
            </div>

            {/* aCelUSDT (Aave) */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <UsdtLogo className="h-4 w-4 opacity-60" />
                <span className="font-bold text-slate-700">aCelUSDT (Aave V3)</span>
              </div>
              <span className="font-mono font-bold text-slate-800">
                {balances.aCelUSDT.toFixed(4)} USDT
              </span>
            </div>

            {/* CELO */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-amber-600" />
                <span className="font-bold text-slate-700">CELO (native)</span>
              </div>
              <span className="font-mono font-bold text-slate-800">
                {balances.celo.toFixed(6)} CELO
              </span>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200/60 pt-1.5 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px]">Total (USD equiv.)</span>
              <span className="font-mono font-extrabold text-[#2540EB]">
                ${(totalUSD + balances.celo * 0.85).toFixed(2)}
              </span>
            </div>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <div className={`flex items-center gap-1 ${step === 'review' && !aaveWithdrawDone ? 'text-[#2540EB] font-bold' : aaveWithdrawDone ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${aaveWithdrawDone ? 'bg-emerald-100 text-emerald-700' : step === 'review' ? 'bg-[#2540EB]/10 text-[#2540EB]' : 'bg-slate-100 text-slate-400'}`}>
                {aaveWithdrawDone ? '✓' : '1'}
              </span>
              <span>Aave</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <div className={`flex items-center gap-1 ${step === 'withdraw-tokens' && !tokenWithdrawDone ? 'text-[#2540EB] font-bold' : tokenWithdrawDone ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${tokenWithdrawDone ? 'bg-emerald-100 text-emerald-700' : step === 'withdraw-tokens' ? 'bg-[#2540EB]/10 text-[#2540EB]' : 'bg-slate-100 text-slate-400'}`}>
                {tokenWithdrawDone ? '✓' : '2'}
              </span>
              <span>USDT</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <div className={`flex items-center gap-1 ${celoWithdrawn ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${celoWithdrawn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {celoWithdrawn ? '✓' : '3'}
              </span>
              <span>CELO</span>
            </div>
          </div>

          {/* ═══════════ STEP 1: AAVE WITHDRAW ═══════════ */}
          {step === 'review' && (
            <div className="space-y-3">
              {balances.aCelUSDT > 0 ? (
                <>
                  <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-3 text-xs space-y-1.5">
                    <p className="text-[11px] font-bold text-blue-900">
                      Step 1: Withdraw from Aave V3
                    </p>
                    <p className="text-[10px] text-blue-700">
                      Will withdraw {balances.aCelUSDT.toFixed(4)} aCelUSDT from Aave V3 back to the MinimalAccount as USDT. Requires EIP-191 signature via MetaMask.
                    </p>
                  </div>

                  {/* Processing state */}
                  {isProcessing && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        {txStatus === 'preparing' && 'Preparing transaction...'}
                        {txStatus === 'waiting-wallet' && 'Please sign the message in MetaMask...'}
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
                  {txError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Transaction Notice</span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed break-words">{txError}</p>
                    </div>
                  )}

                  {/* Success */}
                  {aaveWithdrawDone && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Withdrawn from Aave!</span>
                      </div>
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

                  {/* Action buttons */}
                  {aaveWithdrawDone ? (
                    <button
                      type="button"
                      onClick={handleContinueToTokens}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold bg-[#2540EB] hover:bg-[#2540EB]/90 text-white shadow-xs transition active:scale-98"
                    >
                      <span>Continue to Withdraw USDT</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAaveWithdraw}
                      disabled={isProcessing || !walletAddress || !isOwner || isLoadingBalances}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                        isProcessing || !walletAddress || !isOwner || isLoadingBalances
                          ? 'bg-blue-400 cursor-not-allowed opacity-80'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          <span>Withdrawing from Aave...</span>
                        </>
                      ) : (
                        <span>Step 1: Withdraw from Aave V3</span>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center text-[11px] text-slate-500">
                    No aCelUSDT in Aave. Skipping to USDT withdrawal.
                  </div>
                  <button
                    type="button"
                    onClick={handleContinueToTokens}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold bg-[#2540EB] hover:bg-[#2540EB]/90 text-white shadow-xs transition active:scale-98"
                  >
                    <span>Continue to Withdraw USDT</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ STEP 2: WITHDRAW USDT ═══════════ */}
          {step === 'withdraw-tokens' && !tokenWithdrawDone && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <UsdtLogo className="h-4 w-4" />
                    <span className="font-bold text-slate-700">USDT available</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">
                    {balances.usdt.toFixed(4)} USDT
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs space-y-1.5">
                <p className="text-[11px] font-bold text-emerald-900">
                  Step 2: Withdraw USDT to your wallet
                </p>
                <p className="text-[10px] text-emerald-700">
                  Calls <code className="font-mono">withdrawToken(USDT, balance)</code> on the MinimalAccount. Only the owner can execute this.
                </p>
              </div>

              {/* Processing */}
              {isProcessing && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    {txStatus === 'preparing' && 'Preparing transaction...'}
                    {txStatus === 'waiting-wallet' && 'Please confirm withdrawToken in MetaMask...'}
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
              {txError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Transaction Notice</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed break-words">{txError}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleWithdrawTokens}
                disabled={isProcessing || !walletAddress || !isOwner || balances.usdt <= 0}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                  isProcessing || !walletAddress || !isOwner || balances.usdt <= 0
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
                  <span>Withdraw {balances.usdt.toFixed(4)} USDT</span>
                )}
              </button>

              {/* Back */}
              <button
                type="button"
                onClick={() => { setStep('review'); setTxStatus('idle'); setTxError(null); }}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1 w-full justify-center"
              >
                ← Back to Aave
              </button>
            </div>
          )}

          {/* ═══════════ STEP 2 SUCCESS → STEP 3 CELO ═══════════ */}
          {step === 'withdraw-tokens' && tokenWithdrawDone && !celoWithdrawn && (
            <div className="space-y-3">
              {/* USDT success */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>USDT Withdrawn Successfully!</span>
                </div>
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

              {/* CELO section */}
              {balances.celo > 0.001 ? (
                <>
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs space-y-1.5">
                    <p className="text-[11px] font-bold text-amber-900">
                      Step 3: Withdraw CELO
                    </p>
                    <p className="text-[10px] text-amber-700">
                      {balances.celo.toFixed(6)} CELO available. Calls <code className="font-mono">withdrawCelo(balance)</code>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleWithdrawCelo}
                    disabled={isProcessing || !walletAddress || !isOwner}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                      isProcessing || !walletAddress || !isOwner
                        ? 'bg-amber-400 cursor-not-allowed opacity-80'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Withdrawing CELO...</span>
                      </>
                    ) : (
                      <span>Withdraw {balances.celo.toFixed(6)} CELO</span>
                    )}
                  </button>
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center text-[11px] text-slate-500">
                  No CELO to withdraw.
                </div>
              )}

              {/* Processing */}
              {isProcessing && step === 'withdraw-tokens' && tokenWithdrawDone && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    {txStatus === 'preparing' && 'Preparing...'}
                    {txStatus === 'waiting-wallet' && 'Please confirm in MetaMask...'}
                    {txStatus === 'waiting-confirm' && 'Confirming on Celo...'}
                  </div>
                </div>
              )}

              {/* Error */}
              {txError && step === 'withdraw-tokens' && tokenWithdrawDone && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Transaction Notice</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed break-words">{txError}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ ALL DONE ═══════════ */}
          {(tokenWithdrawDone && (celoWithdrawn || balances.celo <= 0.001)) && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-center space-y-2 animate-in fade-in duration-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-extrabold text-emerald-800">
                  All funds withdrawn!
                </p>
                <p className="text-[11px] text-emerald-600">
                  Everything from the MinimalAccount has been sent to your wallet.
                </p>
                {txHash && (
                  <a
                    href={`https://celoscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline font-mono"
                  >
                    <span>Last tx on Celoscan</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition active:scale-98"
              >
                Close
              </button>
            </div>
          )}

          {/* Contract address reference */}
          <div className="pt-1 border-t border-slate-100">
            <a
              href={`https://celoscan.io/address/${AI_CAPITAL_ACCOUNT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-[#2540EB] transition"
            >
              <span>MinimalAccount: {AI_CAPITAL_ACCOUNT_ADDRESS.slice(0, 8)}...{AI_CAPITAL_ACCOUNT_ADDRESS.slice(-6)}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
