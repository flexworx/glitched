// Wallet Connect: handles Solana wallet connection
export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  murphBalance: number;
}

export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'other';

export async function detectWallet(): Promise<WalletType | null> {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, unknown>;
  if (win.phantom?.solana) return 'phantom';
  if (win.solflare) return 'solflare';
  if (win.backpack) return 'backpack';
  return null;
}

export async function connectWallet(type: WalletType): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, { connect?: () => Promise<{ publicKey: { toBase58: () => string } }> }>;

  try {
    if (type === 'phantom' && win.phantom?.solana) {
      const resp = await win.phantom.solana.connect?.();
      return resp?.publicKey?.toBase58() || null;
    }
    return null;
  } catch {
    return null;
  }
}
