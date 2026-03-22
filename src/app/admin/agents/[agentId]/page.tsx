'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import Link from 'next/link';

export default function AdminAgentDetailPage({ params }: { params: { agentId: string } }) {
  return (
    <AdminLayout>
      <Link href="/admin/agents" className="text-sm text-white/40 hover:text-white transition-colors mb-6 block">← All Agents</Link>
      <h1 className="text-2xl font-black font-space-grotesk text-white mb-6">Agent: {params.agentId.toUpperCase()}</h1>
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
        <p className="text-white/40 text-sm">Agent administration panel for {params.agentId}</p>
      </div>
    </AdminLayout>
  );
}
