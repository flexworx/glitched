import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// $MURPH Token Configuration (SPL Token-2022)
export const MURPH_CONFIG = {
  MINT_ADDRESS: process.env.NEXT_PUBLIC_MURPH_MINT || 'MURPHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  DECIMALS: 9,
  TOTAL_SUPPLY: 1_000_000_000,
  PROGRAM_ID: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', // Token-2022
};

export function getMurphConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
  return new Connection(rpcUrl, 'confirmed');
}

export async function getMurphBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getMurphConnection();
    const wallet = new PublicKey(walletAddress);
    const mint = new PublicKey(MURPH_CONFIG.MINT_ADDRESS);

    // Find associated token account
    const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
    const ata = getAssociatedTokenAddressSync(mint, wallet);

    const balance = await connection.getTokenAccountBalance(ata);
    return Number(balance.value.uiAmount || 0);
  } catch (error) {
    console.error('Failed to fetch MURPH balance:', error);
    return 0;
  }
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getMurphConnection();
    const wallet = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(wallet);
    return lamports / 1e9;
  } catch (error) {
    console.error('Failed to fetch SOL balance:', error);
    return 0;
  }
}

export function formatMurphAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B $MURPH`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M $MURPH`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K $MURPH`;
  return `${amount.toFixed(0)} $MURPH`;
}
