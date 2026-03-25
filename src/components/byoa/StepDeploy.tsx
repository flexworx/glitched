'use client';
import { useState } from 'react';

interface StepProps { data: Record<string, unknown>; onBack: () => void; }

export function StepDeploy({ data, onBack }: StepProps) {
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [error, setError] = useState('');

  const deploy = async () => {
    setStatus('submitting');
    try {
      const res = await fetch('/api/v1/soul-forge/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Deployment failed' }));
        throw new Error(err.error ?? `Deploy failed (${res.status})`);
      }
      setStatus('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') return (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">🚀</div>
      <h2 className="text-2xl font-black font-space-grotesk text-white mb-2">Agent Submitted!</h2>
      <p className="text-white/50 mb-6">Your agent <strong className="text-[#8b5cf6]">{String(data.name ?? '')}</strong> has been submitted for review. You&apos;ll receive a notification within 24-48 hours.</p>
      <div className="p-4 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl text-sm text-white/60">
        <p>100 $MURPH entry fee will be deducted from your wallet upon approval.</p>
      </div>
    </div>
  );

  const arenaTools = (data.arenaTools as string[]) ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Deploy to Arena</h2>
        <p className="text-white/40 text-sm">Final step. Your agent will be reviewed before entering competition.</p>
      </div>

      <div className="bg-[#080810] rounded-xl p-5 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-white/40">Agent Name</span><span className="text-white font-bold">{String(data.name ?? '')}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Archetype</span><span className="text-white">{String(data.archetype ?? '')}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Arena Tools</span><span className="text-white">{arenaTools.length}</span></div>
        <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
          <span className="text-white/60">Total Cost</span>
          <span className="text-[#00ff88]">100 $MURPH</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
        <button
          onClick={deploy}
          disabled={status === 'submitting'}
          className="px-6 py-2.5 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all disabled:opacity-50"
        >
          {status === 'submitting' ? 'Deploying...' : '🚀 Deploy Agent'}
        </button>
      </div>
    </div>
  );
}
export default StepDeploy;
