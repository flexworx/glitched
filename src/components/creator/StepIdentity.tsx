'use client';

import React, { useState, useCallback } from 'react';
import type { CreatorWizardState, ArchetypeId } from '@/types/agent';

interface StepIdentityProps {
  state: CreatorWizardState;
  onSubmit: (data: {
    name: string;
    tagline: string;
    backstory: string;
    archetype: ArchetypeId;
    avatarUrl: string;
    avatarFile: File | null;
  }) => void;
}

const ARCHETYPES: Array<{ id: ArchetypeId; label: string; icon: string; description: string }> = [
  { id: 'strategist', label: 'Strategist', icon: '♟️', description: 'Long-term planner. Sees the arena as a chess board.' },
  { id: 'guardian', label: 'Guardian', icon: '🛡️', description: 'Loyal protector. Builds coalitions and defends allies.' },
  { id: 'chaos_agent', label: 'Chaos Agent', icon: '💥', description: 'Unpredictable disruptor. Thrives on disorder.' },
  { id: 'merchant', label: 'Merchant', icon: '💰', description: 'Economic mastermind. Controls resources and trades.' },
  { id: 'deceiver', label: 'Deceiver', icon: '🎭', description: 'Master manipulator. Lies, bluffs, and betrays.' },
  { id: 'speedster', label: 'Speedster', icon: '⚡', description: 'Fast and aggressive. Strikes before others react.' },
  { id: 'planner', label: 'Planner', icon: '📋', description: 'Methodical executor. Never acts without a plan.' },
  { id: 'analyst', label: 'Analyst', icon: '🔬', description: 'Data-driven thinker. Finds patterns others miss.' },
  { id: 'custom', label: 'Custom', icon: '✨', description: 'Blank slate. Build from scratch with no presets.' },
];

function validateName(name: string): string | null {
  if (!name) return 'Name is required';
  if (name.length < 3) return 'Name must be at least 3 characters';
  if (name.length > 20) return 'Name must be 20 characters or less';
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Only letters, numbers, and underscores allowed';
  return null;
}

export function StepIdentity({ state, onSubmit }: StepIdentityProps) {
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(state.name);
  const [tagline, setTagline] = useState(state.tagline);
  const [backstory, setBackstory] = useState(state.backstory);
  const [archetype, setArchetype] = useState<ArchetypeId | null>(state.archetype);
  const [avatarUrl, setAvatarUrl] = useState(state.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(state.avatarFile);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    if (submitted) setNameError(validateName(v));
  }, [submitted]);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setError(null);
    const nameErr = validateName(name);
    if (nameErr) { setNameError(nameErr); return; }
    if (!archetype) { setError('Please select an archetype'); return; }
    if (!backstory || backstory.split(' ').length < 10) {
      setError('Please write a backstory of at least 10 words');
      return;
    }
    onSubmit({ name, tagline, backstory, archetype, avatarUrl, avatarFile });
  }, [name, tagline, backstory, archetype, avatarUrl, avatarFile, onSubmit]);

  const backstoryWordCount = backstory.trim() ? backstory.trim().split(/\s+/).length : 0;

  return (
    <>
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column: form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
              Define Your Agent
            </h2>
            <p className="text-white/50 text-sm">
              Give your agent an identity. This shapes how they present themselves in the arena.
            </p>
          </div>

          {/* Agent Name */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="APEX_HUNTER"
              maxLength={20}
              className={[
                'w-full bg-[#111118] border rounded-xl px-4 py-3 text-white font-space-grotesk text-sm',
                'placeholder:text-white/20 focus:outline-none transition-colors',
                nameError ? 'border-red-500' : 'border-white/10 focus:border-[#39FF14]/50',
              ].join(' ')}
            />
            <div className="flex justify-between mt-1">
              {nameError ? (
                <p className="text-xs text-red-400">{nameError}</p>
              ) : (
                <p className="text-xs text-white/30">3–20 chars, letters/numbers/underscores only</p>
              )}
              <p className="text-xs text-white/30">{name.length}/20</p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A motto to strike fear into your opponents..."
              maxLength={80}
              className="w-full bg-[#111118] border border-white/10 focus:border-[#39FF14]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors"
            />
            <p className="text-xs text-white/30 mt-1 text-right">{tagline.length}/80</p>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 bg-[#111118] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-50">🤖</span>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-colors">
                  Upload Image
                </span>
                <p className="text-[10px] text-white/30 mt-1">PNG, JPG, WebP • Max 2MB</p>
              </label>
            </div>
          </div>

          {/* Backstory */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Backstory *
            </label>
            <textarea
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Born in the digital wastelands of Sector 7, this agent was forged in the crucible of a thousand simulated conflicts..."
              rows={5}
              className="w-full bg-[#111118] border border-white/10 focus:border-[#39FF14]/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors resize-none"
            />
            <p className="text-xs text-white/30 mt-1">
              {backstoryWordCount} words (min 10, max 500)
            </p>
          </div>
        </div>

        {/* Right column: archetype selector */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
              Archetype *
            </label>
            <p className="text-xs text-white/40 mb-4">
              Selecting an archetype pre-fills your personality traits with sensible defaults. You can customize everything in the next step.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ARCHETYPES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArchetype(a.id)}
                  className={[
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                    archetype === a.id
                      ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                      : 'border-white/10 bg-[#111118] hover:border-white/30 hover:bg-[#1a1a24]',
                  ].join(' ')}
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs font-bold text-white">{a.label}</span>
                  <span className="text-[9px] text-white/40 leading-tight">{a.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl font-bold text-black text-sm font-space-grotesk transition-all bg-[#39FF14] hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            >
              Continue to Personality DNA →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default StepIdentity;
