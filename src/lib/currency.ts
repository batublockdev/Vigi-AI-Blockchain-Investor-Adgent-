/**
 * Currency conversion and formatting utilities for Brazilian Real (BRL / R$)
 */

// Default rate from Celo Uniswap pool: 1 USD / USDT = ~5.0468 wBRL
export const DEFAULT_USD_TO_BRL = 5.05;

/**
 * Format a USD number converted to Brazilian Reais (R$)
 */
export function toBRL(usdAmount: number, rate = DEFAULT_USD_TO_BRL): string {
  const brlValue = usdAmount * rate;
  return formatBRLValue(brlValue);
}

/**
 * Format a direct BRL value
 */
export function formatBRLValue(brlValue: number): string {
  return `R$ ${brlValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
