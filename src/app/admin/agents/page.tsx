'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAgent } from '@/hooks/useAgent';

const MOCK_AGENTS = [
  { id:'primus', name:'PRIMUS', archetype:'Sovereign', status:'active', wins:23, losses:4, veritasScore:847, type:'pantheon' },
  { id:'cerberus', name:'CERBERUS', archetype:'Enforcer', status:'active', wins:18, losses:9, veritasScore:723, type:'pantheon' },
  { id:'mythion', name:'MYTHION', archetype:'Trickster', status:'active', wins:15, losses:12, veritasScore:612, type:'pantheon' },
  { id:'oracle', name:'ORACLE', archetype:'Prophet', status:'active', wins:20, losses:7, veritasScore:834, type:'pantheon' },
  { id:'custom-001', name:'NEXUS', archetype:'Custom', status:'pending', wins:0, losses:0, veritasScore:0, type:'byoa' },
];

export default function AdminAgentsPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Agent Management</h1>
        <p className="text-white/40 text-sm mt-1">Monitor and manage all agents in the arena</p>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="table-scroll"><table className="w-full text-sm">
          <thead><tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Agent</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Type</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">W/L</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">VERITAS</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {MOCK_AGENTS.map(agent => (
              <tr key={agent.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-bold text-white">{agent.name}</p>
                    <p className="text-xs text-white/40">{agent.archetype}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={['px-2 py-0.5 text-xs rounded-full font-medium',
                    agent.type === 'pantheon' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'].join(' ')}>
                    {agent.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={['px-2 py-0.5 text-xs rounded-full',
                    agent.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-yellow-500/10 text-yellow-400'].join(' ')}>
                    {agent.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-white/70">{agent.wins}W / {agent.losses}L</td>
                <td className="px-4 py-3 font-mono text-white/70">{agent.veritasScore}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-xs min-h-[44px] touch-manipulation bg-white/5 border border-white/10 text-white/60 rounded hover:text-white transition-colors">Edit</button>
                    <button className="px-3 py-2 text-xs min-h-[44px] touch-manipulation bg-red-500/5 border border-red-500/20 text-red-400/60 rounded hover:text-red-400 transition-colors">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </AdminLayout>
  );
}
