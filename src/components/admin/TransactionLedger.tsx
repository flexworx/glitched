'use client';

const LEDGER = [
  { id:'l1', type:'burn', amount:-100, from:'match-142', to:'burn_wallet', time:'2s ago', txHash:'5xKj...' },
  { id:'l2', type:'reward', amount:+840, from:'prediction_pool', to:'user_wallet', time:'1m ago', txHash:'9mNp...' },
  { id:'l3', type:'fee', amount:-5, from:'user_wallet', to:'treasury', time:'5m ago', txHash:'3qRt...' },
];

export function TransactionLedger() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-white/10">
          <th className="px-3 py-2 text-left text-xs text-white/40 uppercase">Type</th>
          <th className="px-3 py-2 text-left text-xs text-white/40 uppercase">Amount</th>
          <th className="px-3 py-2 text-left text-xs text-white/40 uppercase">From</th>
          <th className="px-3 py-2 text-left text-xs text-white/40 uppercase">To</th>
          <th className="px-3 py-2 text-left text-xs text-white/40 uppercase">TX</th>
          <th className="px-3 py-2 text-left text-xs text-white/40 uppercase">Time</th>
        </tr></thead>
        <tbody>
          {LEDGER.map(tx => (
            <tr key={tx.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="px-3 py-2 capitalize text-white/60">{tx.type}</td>
              <td className={['px-3 py-2 font-mono font-bold', tx.amount > 0 ? 'text-[#00ff88]' : 'text-red-400'].join(' ')}>{tx.amount > 0 ? '+' : ''}{tx.amount}</td>
              <td className="px-3 py-2 text-white/40 font-mono text-xs">{tx.from}</td>
              <td className="px-3 py-2 text-white/40 font-mono text-xs">{tx.to}</td>
              <td className="px-3 py-2 text-white/30 font-mono text-xs">{tx.txHash}</td>
              <td className="px-3 py-2 text-white/30 text-xs">{tx.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default TransactionLedger;
