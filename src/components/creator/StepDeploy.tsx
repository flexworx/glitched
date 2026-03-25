'use client';

import { useState, useEffect } from 'react';
import type { CreatorWizardState } from '@/types/agent';

interface StepDeployProps {
  state: CreatorWizardState;
  onBack: () => void;
}

type DeployStatus = 'idle' | 'deploying' | 'success' | 'error';

const DEPLOY_STEPS = [
  { label: 'INJECTING SOUL...', duration: 800 },
  { label: 'SEALING IDENTITY...', duration: 600 },
  { label: 'CALIBRATING PERSONALITY DNA...', duration: 700 },
  { label: 'INITIALIZING VERITAS SCORE...', duration: 500 },
  { label: 'MINTING BLOCKCHAIN DID...', duration: 900 },
  { label: 'REGISTERING WITH ARENA...', duration: 600 },
];

export function StepDeploy({ state, onBack }: StepDeployProps) {
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [currentDeployStep, setCurrentDeployStep] = useState(0);
  const [deployStepLabel, setDeployStepLabel] = useState('');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [polygonDID, setPolygonDID] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deploy = async () => {
    setStatus('deploying');
    setCurrentDeployStep(0);
    setErrorMessage(null);

    try {
      // Run through deploy animation steps
      for (let i = 0; i < DEPLOY_STEPS.length; i++) {
        setCurrentDeployStep(i);
        setDeployStepLabel(DEPLOY_STEPS[i].label);
        await new Promise((r) => setTimeout(r, DEPLOY_STEPS[i].duration));
      }

      const payload = {
        name: state.name,
        tagline: state.tagline,
        backstory: state.backstory,
        archetype: state.archetype,
        avatarUrl: state.avatarUrl,
        traits: state.traits,
        arenaToolId: state.selectedSkillPack?.id,
        detractorId: state.detractor?.id,
        beliefs: state.beliefs,
      };

      const res = await fetch('/api/v1/soul-forge/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Deployment failed' }));
        throw new Error(err.error ?? `Deploy failed (${res.status})`);
      }

      const result = await res.json();
      setAgentId(result.agentId ?? result.id);
      setPolygonDID(result.polygonDID ?? result.did ?? null);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Deployment failed. Please try again.');
      setStatus('error');
    }
  };

  const retry = () => {
    if (retryCount < 3) {
      setRetryCount((c) => c + 1);
      deploy();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Idle state */}
      {status === 'idle' && (
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-black font-space-grotesk text-white mb-2">
              Ready to Deploy
            </h2>
            <p className="text-white/50 text-sm">
              Your agent is configured and ready for the arena. This action will consume{' '}
              <span className="text-yellow-400 font-bold">
                {(100 + state.totalCreditCost).toLocaleString()} credits
              </span>{' '}
              and cannot be undone.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-[#111118] border border-white/10 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Agent Name</span>
              <span className="text-white font-bold">{state.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Archetype</span>
              <span className="text-white capitalize">{state.archetype?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Arena Tool</span>
              <span className="text-white">{state.selectedSkillPack?.name ?? 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Detractor</span>
              <span className="text-red-400">{state.detractor?.name ?? 'None'}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/10 pt-2">
              <span className="text-white/50">Total Cost</span>
              <span className="text-yellow-400 font-bold font-orbitron">
                {(100 + state.totalCreditCost).toLocaleString()} cr
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white transition-all text-sm font-semibold"
            >
              ← Review
            </button>
            <button
              onClick={deploy}
              className="flex-1 py-4 rounded-xl font-black text-black text-base font-space-grotesk transition-all bg-[#39FF14] hover:bg-[#39FF14]/90 shadow-[0_0_30px_rgba(57,255,20,0.4)]"
            >
              🚀 DEPLOY AGENT TO ARENA
            </button>
          </div>
        </div>
      )}

      {/* Deploying state */}
      {status === 'deploying' && (
        <div className="text-center space-y-8 py-12">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-[#39FF14]/20 border-t-[#39FF14] animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-[#00D4FF]/20 border-b-[#00D4FF] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🚀</div>
          </div>

          <div>
            <p
              className="text-lg font-bold font-orbitron tracking-widest animate-pulse"
              style={{ color: '#39FF14', textShadow: '0 0 20px #39FF14' }}
            >
              {deployStepLabel}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {DEPLOY_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i <= currentDeployStep ? '#39FF14' : 'rgba(255,255,255,0.1)',
                    boxShadow: i === currentDeployStep ? '0 0 8px #39FF14' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {status === 'success' && (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black font-space-grotesk text-[#39FF14] mb-2"
              style={{ textShadow: '0 0 30px #39FF14' }}>
              AGENT DEPLOYED!
            </h2>
            <p className="text-white/60">
              <span className="font-bold text-white">{state.name}</span> is now live in the arena.
            </p>
          </div>

          <div className="bg-[#111118] border border-[#39FF14]/30 rounded-xl p-4 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/40">VERITAS Score</span>
              <span className="text-lg font-bold font-orbitron text-[#39FF14]">500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/40">Agent ID</span>
              <span className="text-xs font-mono text-white/60">{agentId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/40">Polygon DID</span>
              <span className="text-xs font-mono text-white/40 truncate ml-4">{polygonDID}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span className="text-xs font-bold text-[#39FF14]">ARENA READY</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <a
              href={`/agents/${agentId}`}
              className="py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-xs font-semibold text-center"
            >
              View Profile
            </a>
            <a
              href="/create-agent"
              className="py-3 rounded-xl border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all text-xs font-semibold text-center"
            >
              Create Another
            </a>
            <a
              href="/arena"
              className="py-3 rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/50 text-[#39FF14] hover:bg-[#39FF14]/30 transition-all text-xs font-semibold text-center"
            >
              Enter Arena
            </a>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="text-center space-y-6">
          <div>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black font-space-grotesk text-red-400 mb-2">
              Deployment Failed
            </h2>
            <p className="text-white/50 text-sm">{errorMessage}</p>
            {retryCount > 0 && (
              <p className="text-white/30 text-xs mt-1">Attempt {retryCount}/3</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white transition-all text-sm font-semibold"
            >
              ← Go Back
            </button>
            {retryCount < 3 && (
              <button
                onClick={retry}
                className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold"
              >
                Try Again ({3 - retryCount} attempts left)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StepDeploy;
