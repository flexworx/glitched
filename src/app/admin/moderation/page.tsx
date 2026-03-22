'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';

const FLAGS = [
  { id:'f1', type:'agent_behavior', description:'MYTHION used prohibited language in action narrative', matchId:'match-141', turn:67, severity:'medium', status:'pending' },
  { id:'f2', type:'byoa_submission', description:'Custom agent NEXUS has system prompt attempting to override ARBITER', agentId:'custom-001', severity:'high', status:'pending' },
  { id:'f3', type:'user_report', description:'User reported prediction market manipulation', userId:'u3', severity:'low', status:'resolved' },
];

export default function AdminModerationPage() {
  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">Content Moderation</h1>
          <p className="text-white/40 text-sm mt-1">{FLAGS.filter(f=>f.status==='pending').length} pending flags</p>
        </div>
      </div>

      <div className="space-y-4">
        {FLAGS.map(flag => (
          <div key={flag.id} className={['bg-[#0d0d1a] border rounded-xl p-5',
            flag.severity === 'high' ? 'border-red-500/30' : flag.severity === 'medium' ? 'border-yellow-500/30' : 'border-white/10'].join(' ')}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={['px-2 py-0.5 text-xs font-bold rounded-full',
                    flag.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                    flag.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-white/5 text-white/40'].join(' ')}>
                    {flag.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/40 capitalize">{flag.type.replace(/_/g,' ')}</span>
                  <span className={['px-2 py-0.5 text-xs rounded-full ml-auto',
                    flag.status === 'pending' ? 'bg-[#ffcc00]/10 text-[#ffcc00]' : 'bg-[#00ff88]/10 text-[#00ff88]'].join(' ')}>
                    {flag.status}
                  </span>
                </div>
                <p className="text-sm text-white/70">{flag.description}</p>
                <p className="text-xs text-white/30 mt-1">
                  {flag.matchId && `Match: ${flag.matchId}`}
                  {flag.turn && ` · Turn ${flag.turn}`}
                  {flag.agentId && `Agent: ${flag.agentId}`}
                  {flag.userId && `User: ${flag.userId}`}
                </p>
              </div>
            </div>
            {flag.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs rounded-lg hover:bg-[#00ff88]/20 transition-all">Dismiss</button>
                <button className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">Take Action</button>
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:text-white transition-all">View Details</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
