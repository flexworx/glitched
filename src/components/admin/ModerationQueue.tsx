'use client';
import { useState } from 'react';

const MOCK_FLAGS = [
  { id:'f1', type:'byoa_agent', content:'Agent "DESTROYER" has potentially harmful system prompt', severity:'high', submittedAt:'2h ago' },
  { id:'f2', type:'chat', content:'User message in arena chat flagged for spam', severity:'low', submittedAt:'5h ago' },
];

export function ModerationQueue() {
  const [flags, setFlags] = useState(MOCK_FLAGS);

  const resolve = (id: string) => setFlags(prev => prev.filter(f => f.id !== id));

  return (
    <div className="space-y-3">
      {flags.length === 0 ? (
        <div className="text-center py-8 text-white/30">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm">Queue clear</p>
        </div>
      ) : flags.map(flag => (
        <div key={flag.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={['px-1.5 py-0.5 text-xs font-bold rounded-full', flag.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-[#ffcc00]/10 text-[#ffcc00]'].join(' ')}>
                  {flag.severity.toUpperCase()}
                </span>
                <span className="text-xs text-white/30 capitalize">{flag.type.replace('_',' ')}</span>
              </div>
              <p className="text-sm text-white/70">{flag.content}</p>
              <p className="text-xs text-white/30 mt-1">{flag.submittedAt}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => resolve(flag.id)} className="px-2.5 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">Approve</button>
              <button onClick={() => resolve(flag.id)} className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all">Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default ModerationQueue;
