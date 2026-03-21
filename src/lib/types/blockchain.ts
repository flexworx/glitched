// Blockchain types for Glitched.gg
export interface SolanaWallet {
  address: string;
  balance: number;
  murphBalance: number;
}

export interface SPLToken {
  mint: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  circulatingSupply: number;
}

export interface PDA {
  address: string;
  bump: number;
  programId: string;
  seeds: string[];
}

export interface TransferHookData {
  amount: number;
  burnAmount: number;
  feeAmount: number;
  netAmount: number;
}

export interface WalletConnectState {
  connected: boolean;
  publicKey?: string;
  balance?: number;
  murphBalance?: number;
  connecting: boolean;
  disconnecting: boolean;
}
