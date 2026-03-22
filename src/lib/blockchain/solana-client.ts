import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

let connection: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

export async function getBalance(publicKey: string): Promise<number> {
  const conn = getSolanaConnection();
  const pk = new PublicKey(publicKey);
  const balance = await conn.getBalance(pk);
  return balance / LAMPORTS_PER_SOL;
}

export async function getTokenBalance(walletAddress: string, mintAddress: string): Promise<number> {
  const conn = getSolanaConnection();
  const wallet = new PublicKey(walletAddress);
  const mint = new PublicKey(mintAddress);

  try {
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(wallet, { mint });
    if (tokenAccounts.value.length === 0) return 0;
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch {
    return 0;
  }
}

export async function getTransactionHistory(address: string, limit = 10) {
  const conn = getSolanaConnection();
  const pk = new PublicKey(address);
  const signatures = await conn.getSignaturesForAddress(pk, { limit });
  return signatures;
}
