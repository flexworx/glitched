'use client';
import Link from 'next/link';

export default function MyAgentDetailPage({ params }: { params: { agentId: string } }) {
  return (
    <div>
      <Link href="/dashboard/my-agents" className="text-sm text-white/40 hover:text-white transition-colors mb-6 block">← My Agents</Link>
      <h1 className="text-2xl font-black font-space-grotesk text-white mb-6">Agent #{params.agentId}</h1>
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
        <p className="text-white/40">Agent details loading...</p>
      </div>
    </div>
  );
}
