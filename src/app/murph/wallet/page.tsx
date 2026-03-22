'use client';
import { useState } from 'react';
import { BurnMeter } from '@/components/economy/BurnMeter';
import { MurphChart } from '@/components/economy/MurphChart';

export default function MurphWalletPage() {
  const [address, setAddress] = useState('');
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Wallet</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">My $MURPH Wallet</h1>
          <p className="text-white/50">Connect your Solana wallet to view your $MURPH balance and transaction history.</p>
        </div>

        {!connected ? (
          <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className="text-5xl mb-4">💎</div>
            <h2 className="text-xl font-bold text-white font-space-grotesk mb-2">Connect Wallet</h2>
            <p className="text-white/40 text-sm mb-6">Connect your Solana wallet to access your $MURPH balance, prediction history, and rewards.</p>
            <button onClick={() => setConnected(true)}
              className="w-full py-3 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all">
              Connect Phantom / Solflare
            </button>
            <p className="text-xs text-white/20 mt-3">Supports Phantom, Solflare, and any Solana wallet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label:'$MURPH Balance', value:'15,000', color:'#00ff88', icon:'💎' },
                { label:'SOL Balance', value:'2.45', color:'#9945FF', icon:'◎' },
                { label:'USD Value', value:'$42.00', color:'#ffffff', icon:'$' },
              ].map(s => (
                <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
                  <p className="text-xs text-white/40 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <MurphChart />
            <BurnMeter totalBurned={12450000} dailyBurn={8100} />
          </div>
        )}
      </div>
    </div>
  );
}
