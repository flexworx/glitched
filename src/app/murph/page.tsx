'use client';

import { useEconomy } from '@/hooks/useEconomy';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MURPHPriceTicker from '@/components/economy/MURPHPriceTicker';
import TransactionFeed from '@/components/economy/TransactionFeed';


export default function MurphPage() {
  const { stats, loading, error } = useEconomy();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-16">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black font-space-grotesk text-white">$MURPH Token</h1>
          <p className="text-white/40 text-sm mt-1">Live economy stats — SPL Token-2022 on Solana</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {!loading && stats && (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Price', value: `$${stats.price.toFixed(4)}`, sub: `${stats.priceChange24h >= 0 ? '+' : ''}${stats.priceChange24h.toFixed(2)}% 24h`, color: stats.priceChange24h >= 0 ? '#00ff88' : '#ff4444' },
                { label: 'Market Cap', value: `$${(stats.marketCap / 1e6).toFixed(2)}M`, sub: 'USD', color: '#3b82f6' },
                { label: 'Total Burned', value: stats.totalBurned.toLocaleString(), sub: '$MURPH', color: '#ff4444' },
                { label: 'Holders', value: stats.holders.toLocaleString(), sub: 'wallets', color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-white/30 mb-1">{s.label}</p>
                  <p className="text-xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: s.color + 'aa' }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Burn Chart */}
            {stats.burnHistory?.length > 0 && (
              <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Burn History</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.burnHistory}>
                    <defs>
                      <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0d0d1a', border: '1px solid #ffffff20', borderRadius: 8 }}
                      labelStyle={{ color: '#ffffff60' }}
                      itemStyle={{ color: '#ff4444' }}
                    />
                    <Area type="monotone" dataKey="burned" stroke="#ff4444" fill="url(#burnGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Transactions */}
            {stats.recentTransactions?.length > 0 && (
              <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto table-scroll">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-3 text-white/40 font-medium">Type</th>
                        <th className="text-left px-4 py-3 text-white/40 font-medium">User</th>
                        <th className="text-right px-4 py-3 text-white/40 font-medium">Amount</th>
                        <th className="text-right px-4 py-3 text-white/40 font-medium hidden sm:table-cell">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map(tx => (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${
                              tx.type === 'BURN' ? 'bg-red-500/20 text-red-400' :
                              tx.type === 'EARN' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/60">{tx.username}</td>
                          <td className="px-4 py-3 text-right font-mono text-white">{tx.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-white/30 text-xs hidden sm:table-cell">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !stats && !error && (
          <div className="text-center py-20 text-white/30">No economy data available yet.</div>
        )}
      </div>
    </div>
  );
}
