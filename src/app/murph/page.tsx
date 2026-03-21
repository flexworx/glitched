'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PRICE_DATA = Array.from({ length: 30 }, (_, i) => ({ day: `D${i+1}`, price: 0.0012 + Math.sin(i*0.4)*0.0003, volume: 2000000 + i*50000 }));
const BURN_DATA = [{ day: 'Mon', burned: 284000 }, { day: 'Tue', burned: 412000 }, { day: 'Wed', burned: 198000 }, { day: 'Thu', burned: 567000 }, { day: 'Fri', burned: 341000 }, { day: 'Sat', burned: 489000 }, { day: 'Sun', burned: 623000 }];
const STATS = [
  { label: 'Total Supply', value: '1,000,000,000', color: '#39FF14' },
  { label: 'Circulating', value: '342,891,204', color: '#00D4FF' },
  { label: 'Total Burned', value: '18,234,891', color: '#FF006E' },
  { label: 'Current Price', value: '$0.0014', color: '#FFBF00' },
  { label: 'Market Cap', value: '$480,048', color: '#7B2FBE' },
  { label: '24h Volume', value: '$2.1M', color: '#FF6B35' },
];
const EARN_METHODS = [
  { method: 'Win a Match', amount: '+500', color: '#39FF14' },
  { method: 'Daily Login Streak', amount: '+50', color: '#00D4FF' },
  { method: 'Correct Prediction', amount: '+2x Wager', color: '#FFBF00' },
  { method: 'Eliminate Rival', amount: '+200', color: '#FF6B35' },
  { method: 'Alliance Betrayal', amount: '+350', color: '#8B5CF6' },
  { method: 'Season Champion', amount: '+10,000', color: '#FFD700' },
];
const BURN_MECHANISMS = [
  { trigger: 'Prediction Loss', rate: '5% of wager', desc: 'Losing predictions burn a portion of the wager' },
  { trigger: 'Agent Elimination', rate: '100 $MURPH', desc: 'Each elimination burns tokens from the prize pool' },
  { trigger: 'BYOA Submission', rate: '1,000 $MURPH', desc: 'Submitting a custom agent requires a burn' },
  { trigger: 'Premium Cosmetics', rate: 'Variable', desc: 'Exclusive skins and effects require burns' },
  { trigger: 'Chaos Event Vote', rate: '500 $MURPH', desc: 'Voting to inject chaos events burns tokens' },
  { trigger: 'Faction War Entry', rate: '250 $MURPH', desc: 'Entering faction wars requires a burn' },
];

export default function MurphPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const connectWallet = () => { setWalletAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'); setWalletConnected(true); setBalance(12450); };
  return (
    <div className="min-h-screen bg-arena-black">
      <div className="border-b border-arena-border bg-arena-dark px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-2xl text-neon-yellow uppercase tracking-widest">$MURPH Economy</h1>
            <p className="text-sm text-gray-400 mt-1">SPL Token-2022 on Solana — The currency of the Glitch Arena</p>
          </div>
          {walletConnected ? (
            <div className="bg-arena-surface border border-neon-green px-4 py-2">
              <div className="text-xs text-gray-400 font-jetbrains">{walletAddress.slice(0,8)}...{walletAddress.slice(-6)}</div>
              <div className="text-lg font-orbitron text-neon-green">{balance.toLocaleString()} $MURPH</div>
            </div>
          ) : (
            <button onClick={connectWallet} className="px-6 py-3 bg-neon-yellow text-arena-black font-orbitron uppercase tracking-wider hover:bg-neon-yellow/80 transition-colors">Connect Wallet</button>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-arena-surface border border-arena-border p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="font-orbitron text-sm font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>
        <div className="bg-arena-surface border border-arena-border p-6">
          <h2 className="font-orbitron text-sm text-neon-green uppercase tracking-wider mb-4">$MURPH Price — 30 Day</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PRICE_DATA}>
              <defs><linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/><stop offset="95%" stopColor="#39FF14" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
              <XAxis dataKey="day" stroke="#4a4a5a" tick={{ fontSize: 10, fill: '#6b7280' }}/>
              <YAxis stroke="#4a4a5a" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v: number) => `$${v.toFixed(4)}`}/>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', fontSize: 12 }} formatter={(v: number) => [`$${v.toFixed(5)}`, 'Price']}/>
              <Area type="monotone" dataKey="price" stroke="#39FF14" strokeWidth={2} fill="url(#priceGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-arena-surface border border-arena-border p-6">
            <h2 className="font-orbitron text-sm text-neon-pink uppercase tracking-wider mb-4">Weekly Burn Tracker</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={BURN_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
                <XAxis dataKey="day" stroke="#4a4a5a" tick={{ fontSize: 10, fill: '#6b7280' }}/>
                <YAxis stroke="#4a4a5a" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`}/>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', fontSize: 12 }} formatter={(v: number) => [v.toLocaleString(), 'Burned']}/>
                <Bar dataKey="burned" fill="#FF006E" radius={[2, 2, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-arena-surface border border-arena-border p-6">
            <h2 className="font-orbitron text-sm text-neon-yellow uppercase tracking-wider mb-4">Burn Mechanisms</h2>
            <div className="space-y-3">
              {BURN_MECHANISMS.map((b) => (
                <div key={b.trigger} className="flex items-start justify-between gap-3">
                  <div><div className="text-xs font-orbitron text-white">{b.trigger}</div><div className="text-xs text-gray-500">{b.desc}</div></div>
                  <div className="text-xs font-jetbrains text-neon-pink flex-shrink-0">{b.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-arena-surface border border-arena-border p-6">
          <h2 className="font-orbitron text-sm text-electric-blue uppercase tracking-wider mb-4">How to Earn $MURPH</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {EARN_METHODS.map((method) => (
              <div key={method.method} className="text-center p-3 border border-arena-border">
                <div className="font-orbitron text-lg font-bold" style={{ color: method.color }}>{method.amount}</div>
                <div className="text-xs text-gray-400 mt-1">{method.method}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-arena-surface border border-arena-border p-6">
          <h2 className="font-orbitron text-sm text-neon-green uppercase tracking-wider mb-4">Token Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-jetbrains text-sm">
            {[{ label: 'Standard', value: 'SPL Token-2022' }, { label: 'Network', value: 'Solana Mainnet' }, { label: 'Decimals', value: '9' }, { label: 'Max Supply', value: '1,000,000,000' }, { label: 'Mint Authority', value: 'Multisig DAO' }, { label: 'Freeze Authority', value: 'None (Revoked)' }, { label: 'Transfer Fee', value: '0.5%' }, { label: 'Fee Destination', value: 'Burn Wallet' }].map(({ label, value }) => (
              <div key={label}><div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div><div className="text-white mt-0.5">{value}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
