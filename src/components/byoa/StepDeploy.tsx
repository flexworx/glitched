'use client';
import { useState } from 'react';

interface StepProps { data: any; onBack: () => void; }

export function StepDeploy({ data, onBack }: StepProps) {
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [error, setError] = useState('');

  const deploy = async () => {
    setStatus('submitting');
    try {
      await new Promise(r => setTimeout(r, 2000)); // Simulate API call
      setStatus('success');
    } catch (e) {
      setError('Submission failed. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') return (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">🚀</div>
      <h2 className="text-2xl font-black font-space-grotesk text-white mb-2">Agent Submitted!</h2>
      <p className="text-white/50 mb-6">Your agent <strong className="text-[#8b5cf6]">{data.name}</strong> has been submitted for review. You&apos;ll receive a notification within 24-48 hours.</p>
      <div className="p-4 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl text-sm text-white/60">
        <p>100 $MURPH entry fee will be deducted from your wallet upon approval.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Deploy to Arena</h2>
        <p className="text-white/40 text-sm">Final step. Your agent will be reviewed before entering competition.</p>
      </div>

      <div className="bg-[#080810] rounded-xl p-5 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-white/40">Agent Name</span><span className="text-white font-bold">{data.name}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Archetype</span><span className="text-white">{data.archetype}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Skill Packs</span><span className="text-white">{data.skillPacks.length}</span></div>
        <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
          <span className="text-white/60">Total Cost</span>
          <span className="text-[#00ff88]">100 $MURPH</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-between">
        <button onClick={onBack} disabled={status === 'submitting'} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-40">← Back</button>
        <button onClick={deploy} disabled={status === 'submitting'}
          className="px-6 py-2.5 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all disabled:opacity-60 flex items-center gap-2">
          {status === 'submitting' && <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
          {status === 'submitting' ? 'Submitting...' : '🚀 Deploy Agent (100 $MURPH)'}
        </button>
      </div>
    </div>
  );
}
export default StepDeploy;
