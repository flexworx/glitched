'use client';
import { useState } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    const mockAddress = 'GLiTcH' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'arena';
    onConnect?.(mockAddress);
    setConnecting(false);
  };

  return (
    <button onClick={connect} disabled={connecting}
      className="flex items-center gap-2 px-4 py-2 bg-[#9945FF]/10 border border-[#9945FF]/30 text-[#9945FF] font-bold text-sm rounded-xl hover:bg-[#9945FF]/20 transition-all disabled:opacity-60">
      {connecting ? (
        <><span className="w-4 h-4 rounded-full border-2 border-[#9945FF]/20 border-t-[#9945FF] animate-spin" />Connecting...</>
      ) : (
        <><span>◎</span>Connect Wallet</>
      )}
    </button>
  );
}
export default WalletConnect;
