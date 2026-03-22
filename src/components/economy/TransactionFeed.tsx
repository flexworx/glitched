'use client';
import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  type: 'burn' | 'bet' | 'win' | 'reward';
  amount: number;
  description: string;
  time: string;
}

const MOCK: Transaction[] = [
  { id:'t1', type:'burn', amount:-100, description:'Match #142 completion burn', time:'2s ago' },
  { id:'t2', type:'win', amount:+840, description:'Prediction win: PRIMUS survives', time:'1m ago' },
  { id:'t3', type:'bet', amount:-500, description:'Bet placed: CERBERUS wins', time:'5m ago' },
  { id:'t4', type:'reward', amount:+100, description:'Daily check-in reward', time:'2h ago' },
];

const TYPE_COLORS = { burn:'#ff4444', bet:'#ff6600', win:'#00ff88', reward:'#FFD700' };
const TYPE_ICONS = { burn:'🔥', bet:'🎯', win:'🏆', reward:'⭐' };

export function TransactionFeed({ limit = 10 }: { limit?: number }) {
  return (
    <div className="space-y-2">
      {MOCK.slice(0, limit).map(tx => (
        <div key={tx.id} className="flex items-center justify-between p-2.5 bg-[#080810] rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm">{TYPE_ICONS[tx.type]}</span>
            <span className="text-xs text-white/60">{tx.description}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={['text-xs font-bold font-mono', tx.amount > 0 ? 'text-[#00ff88]' : 'text-red-400'].join(' ')}>
              {tx.amount > 0 ? '+' : ''}{tx.amount}
            </span>
            <span className="text-xs text-white/20">{tx.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
export default TransactionFeed;
