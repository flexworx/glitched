'use client';
import { useState, useCallback } from 'react';

export interface WalletState { connected: boolean; address: string|null; balance: number; murphBalance: number; loading: boolean; }

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: null, balance: 0, murphBalance: 0, loading: false });

  const connect = useCallback(async () => {
    setWallet(p => ({ ...p, loading: true }));
    try {
      const phantom = (window as unknown as Record<string, unknown>).phantom as { solana?: { connect: () => Promise<{ publicKey: { toString: () => string } }> } }|undefined;
      if (phantom?.solana) {
        const r = await phantom.solana.connect();
        const address = r.publicKey.toString();
        const balRes = await fetch('/api/me/wallet?address=' + address);
        const balData = await balRes.json();
        setWallet({ connected: true, address, balance: balData.solBalance||0, murphBalance: balData.murphBalance||0, loading: false });
      } else throw new Error('Phantom wallet not found');
    } catch { setWallet(p => ({ ...p, loading: false })); }
  }, []);

  const disconnect = useCallback(() => setWallet({ connected: false, address: null, balance: 0, murphBalance: 0, loading: false }), []);

  const refreshBalance = useCallback(async () => {
    if (!wallet.address) return;
    const data = await fetch('/api/me/wallet?address=' + wallet.address).then(r => r.json());
    setWallet(p => ({ ...p, balance: data.solBalance||0, murphBalance: data.murphBalance||0 }));
  }, [wallet.address]);

  return { wallet, connect, disconnect, refreshBalance };
}
