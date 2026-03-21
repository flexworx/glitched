import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

// $MURPH Token Configuration — SPL Token-2022 on Solana
export const MURPH_CONFIG = {
  mintAddress: process.env.NEXT_PUBLIC_MURPH_MINT_ADDRESS || '11111111111111111111111111111111',
  decimals: 9,
  symbol: '$MURPH',
  name: 'MURPH Token',
  totalSupply: 1_000_000_000,
  burnWallet: process.env.NEXT_PUBLIC_BURN_WALLET || '1nc1nerator11111111111111111111111111111111',
  transferFeeBasisPoints: 50, // 0.5% transfer fee
};

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

export function getConnection(): Connection {
  return new Connection(RPC_ENDPOINT, 'confirmed');
}

export function getMurphMint(): PublicKey {
  return new PublicKey(MURPH_CONFIG.mintAddress);
}

export async function getMurphBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getConnection();
    const wallet = new PublicKey(walletAddress);
    const mint = getMurphMint();
    const ata = getAssociatedTokenAddressSync(mint, wallet, false, TOKEN_2022_PROGRAM_ID);
    const balance = await connection.getTokenAccountBalance(ata);
    return parseFloat(balance.value.uiAmountString || '0');
  } catch {
    return 0;
  }
}

export async function getAgentPDAWallet(agentId: string): Promise<PublicKey> {
  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_GLITCH_PROGRAM_ID || '11111111111111111111111111111111'
  );
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent_wallet'), Buffer.from(agentId)],
    programId
  );
  return pda;
}

export async function buildTransferInstruction(
  fromWallet: PublicKey,
  toWallet: PublicKey,
  amount: number
): Promise<Transaction> {
  const connection = getConnection();
  const mint = getMurphMint();
  const fromATA = getAssociatedTokenAddressSync(mint, fromWallet, false, TOKEN_2022_PROGRAM_ID);
  const toATA = getAssociatedTokenAddressSync(mint, toWallet, false, TOKEN_2022_PROGRAM_ID);

  const tx = new Transaction();

  // Create destination ATA if it doesn't exist
  const toATAInfo = await connection.getAccountInfo(toATA);
  if (!toATAInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        fromWallet, toATA, toWallet, mint, TOKEN_2022_PROGRAM_ID
      )
    );
  }

  const amountRaw = murphToRaw(amount);
  tx.add(
    createTransferInstruction(fromATA, toATA, fromWallet, amountRaw, [], TOKEN_2022_PROGRAM_ID)
  );

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromWallet;
  return tx;
}

export function murphToRaw(amount: number): bigint {
  return BigInt(Math.floor(amount * 10 ** MURPH_CONFIG.decimals));
}

export function rawToMurph(raw: bigint): number {
  return Number(raw) / 10 ** MURPH_CONFIG.decimals;
}

export function calculateTransferFee(amount: number): number {
  return Math.floor(amount * (MURPH_CONFIG.transferFeeBasisPoints / 10000));
}

export function calculateBurnAmount(amount: number): number {
  return Math.floor(amount * 0.05);
}

export function calculatePredictionPayout(wager: number, odds: number): number {
  return Math.floor(wager * odds);
}
