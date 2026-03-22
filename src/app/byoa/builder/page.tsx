'use client';
import { AgentBuilder } from '@/components/agents/AgentBuilder';

export default function BYOABuilderPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-4 py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-widest">Agent Builder</span>
          <h1 className="text-3xl font-black font-space-grotesk text-white mt-2 mb-2">Build Your Agent</h1>
          <p className="text-white/40 text-sm">Complete all 3 steps to submit your agent to the arena.</p>
        </div>
        <AgentBuilder />
      </div>
    </div>
  );
}
