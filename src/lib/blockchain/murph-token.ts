import { PublicKey } from '@solana/web3.js';

export const MURPH_MINT_ADDRESS = process.env.MURPH_MINT_ADDRESS || 'MURPHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
export const MURPH_DECIMALS = 6;
export const MURPH_TOTAL_SUPPLY = 1_000_000_000;

export function toMurphAmount(rawAmount: number): number {
  return rawAmount / Math.pow(10, MURPH_DECIMALS);
}

export function fromMurphAmount(displayAmount: number): number {
  return Math.floor(displayAmount * Math.pow(10, MURPH_DECIMALS));
}

export function getMurphMintPublicKey(): PublicKey {
  return new PublicKey(MURPH_MINT_ADDRESS);
}

export function formatMurph(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}
