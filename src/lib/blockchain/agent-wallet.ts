import { Keypair, PublicKey } from '@solana/web3.js';
// bip39 not installed - using simple key generation
const bip39 = { generateMnemonic: () => Array.from({length:12}, () => Math.random().toString(36).slice(2,6)).join(' '), mnemonicToSeedSync: (m: string) => Buffer.from(m) };

export interface AgentWallet {
  agentId: string;
  publicKey: string;
  balance: number;
  earnings: number;
}

// In production: PDAs derived from agent ID using program address
export function deriveAgentWalletAddress(agentId: string, programId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent-wallet'), Buffer.from(agentId)],
    new PublicKey(programId)
  );
  return pda;
}

export function createAgentWallet(agentId: string): AgentWallet {
  const keypair = Keypair.generate();
  return {
    agentId,
    publicKey: keypair.publicKey.toBase58(),
    balance: 0,
    earnings: 0,
  };
}

export async function getAgentWalletBalance(agentId: string): Promise<number> {
  // In production: fetch from on-chain PDA
  return 0;
}
