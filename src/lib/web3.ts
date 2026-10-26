import { createPublicClient, createWalletClient, custom, http, parseAbi, formatUnits, parseUnits, Address, Hash } from 'viem';
import { celo } from 'viem/chains';

export const CELO_CHAIN_ID = 42220; // 0xa4ec
export const CELO_RPC = 'https://forno.celo.org';

// Deposit Vault Contract on Celo Mainnet
export const DEPOSIT_VAULT_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS as Address) ||
  '0x573a678Ea7a51B51344fe6a1781BBCCbF0E453C7';

// Autonomous AI smart account on Celo Mainnet. This is the recipient of
// deposits from the deposit vault and the source for the 20% reserve view.
export const AI_CAPITAL_ACCOUNT_ADDRESS: Address =
  '0x74E16132B76Af0B03730F5c4BF540D777b085DDc';

export const AI_CAPITAL_TOKENS = {
  USDT: {
    address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as Address,
    decimals: 6,
  },
  aCelUSDT: {
    address: '0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df' as Address,
    decimals: 6,
  },
} as const;

export const VAULT_PORTFOLIO_TOKENS = [
  { symbol: 'USDT', name: 'Tether USD', address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as Address, decimals: 6, fallbackUsdPrice: 1 },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0xd221812de1bd094f35587ee8e174b07b6167d9af' as Address, decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x8ac2901dd8a1f17a1a4768a6ba4c3751e3995b2d' as Address, decimals: 8 },
  { symbol: 'wBRL', name: 'Real Digital', address: '0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0' as Address, decimals: 18, fallbackUsdPrice: 1 / 5.05 },
  { symbol: 'wARS', name: 'Peso Digital', address: '0x0DC4F92879B7670e5f4e4e6e3c801D229129D90D' as Address, decimals: 18, fallbackUsdPrice: 1 / 1050 },
] as const;

// Standard market exchange rate for Colombian Pesos (COP per USD / USDT)
export const USD_TO_COP_RATE = 4200;

export const DEPOSIT_TOKENS = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as Address,
    decimals: 6,
    defaultCountry: 'CO',
    ripioToken: 'USDT',
  },
  wBRL: {
    symbol: 'wBRL',
    name: 'Real Digital (wBRL)',
    address: '0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0' as Address,
    decimals: 18,
    defaultCountry: 'CO',
    ripioToken: 'WBRL',
  },
  wARS: {
    symbol: 'wARS',
    name: 'Peso Digital (wARS)',
    address: '0x0DC4F92879B7670e5f4e4e6e3c801D229129D90D' as Address,
    decimals: 18,
    defaultCountry: 'CO',
    ripioToken: 'WARS',
  },
} as const;

export type SupportedDepositToken = keyof typeof DEPOSIT_TOKENS;

/**
 * Convert a token amount into Colombian Pesos (COP) for Ripio Ramp
 */
export function convertTokenToCOP(
  tokenSymbol: SupportedDepositToken,
  tokenAmount: number,
  brlRate = 5.05
): number {
  if (tokenAmount <= 0) return 50000; // Sensible default: 50,000 COP

  if (tokenSymbol === 'USDT') {
    return Math.round(tokenAmount * USD_TO_COP_RATE);
  } else if (tokenSymbol === 'wBRL') {
    const usd = tokenAmount / (brlRate > 0 ? brlRate : 5.05);
    return Math.round(usd * USD_TO_COP_RATE);
  } else if (tokenSymbol === 'wARS') {
    const usd = tokenAmount / 1050;
    return Math.round(usd * USD_TO_COP_RATE);
  }
  return Math.round(tokenAmount * USD_TO_COP_RATE);
}

/**
 * Format Colombian Pesos (e.g. COP $ 210.000)
 */
export function formatCOP(copAmount: number): string {
  return `COP $ ${copAmount.toLocaleString('es-CO')}`;
}

/**
 * Generate Ripio Ramp URL with dynamic token, amount in COP for Colombia, chain, country, and wallet address
 */
export function buildRipioRampUrl(
  tokenSymbol: SupportedDepositToken,
  amount: number | string,
  walletAddress?: string | null,
  country: string = 'CO',
  brlRate = 5.05
): string {
  const token = DEPOSIT_TOKENS[tokenSymbol];
  const numTokenAmount = Math.max(0, parseFloat(String(amount || '0')) || 0);

  // In Ripio Ramp Colombia (country=CO), the amount MUST be expressed in Colombian Pesos (COP) for PSE
  let finalAmount: number;
  if (country === 'CO') {
    finalAmount = convertTokenToCOP(tokenSymbol, numTokenAmount, brlRate);
  } else {
    finalAmount = Math.round(numTokenAmount);
  }

  const params = new URLSearchParams({
    country: country || 'CO',
    chain: CELO_CHAIN_ID.toString(),
    token: token?.ripioToken || 'USDT',
    amount: finalAmount > 0 ? finalAmount.toString() : '50000',
  });

  if (walletAddress) {
    params.set('address', walletAddress);
  }

  return `https://ramp.ripio.com/onramp?${params.toString()}`;
}

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

export const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]);

export const VAULT_DEPOSIT_ABI = parseAbi([
  'function depositAsset(address _token, uint256 _amount, bytes _path) external',
]);

/**
 * Creates a Viem WalletClient using injected window.ethereum / MetaMask
 */
export function getViemWalletClient(provider: any) {
  return createWalletClient({
    chain: celo,
    transport: custom(provider),
  });
}

/**
 * Check on-chain token allowance for the deposit contract
 */
export async function fetchTokenAllowance(
  userAddress: Address,
  tokenAddress: Address,
  spenderAddress: Address = DEPOSIT_VAULT_CONTRACT_ADDRESS
): Promise<bigint> {
  try {
    return await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress, spenderAddress],
    });
  } catch (err) {
    console.warn('Error reading token allowance:', err);
    return 0n;
  }
}

/**
 * Read the live on-chain token balance of a user on Celo Mainnet
 */
export async function fetchOnChainTokenBalance(
  userAddress: string,
  tokenSymbol: SupportedDepositToken
): Promise<number> {
  try {
    const token = DEPOSIT_TOKENS[tokenSymbol];
    if (!token || !userAddress) return 0;

    const rawBalance = await publicClient.readContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress as Address],
    });

    const formatted = formatUnits(rawBalance, token.decimals);
    return parseFloat(formatted);
  } catch (err) {
    console.warn(`Could not read balance for ${tokenSymbol}:`, err);
    return 0;
  }
}
