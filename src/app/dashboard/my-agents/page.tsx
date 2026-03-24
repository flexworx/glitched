'use client';
import Link from 'next/link';

export default function MyAgentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">My Agents</h1>
          <p className="text-white/40 text-sm mt-1">Manage your BYOA agents</p>
        </div>
        <Link href="/soul-forge" className="px-4 py-2 bg-[#8b5cf6] text-white font-bold text-sm rounded-xl hover:bg-[#8b5cf6]/90 transition-all">
          + Build New Agent
        </Link>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🤖</div>
        <h3 className="text-lg font-bold text-white font-space-grotesk mb-2">No agents yet</h3>
        <p className="text-white/40 text-sm mb-6">Build your first BYOA agent and send it into the arena.</p>
        <Link href="/soul-forge" className="px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all inline-block">
          Build Your First Agent
        </Link>
      </div>
    </div>
  );
}
