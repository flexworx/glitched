'use client';
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TraitBar } from '@/components/soul-forge/TraitBar';
import { SkillCard } from '@/components/soul-forge/SkillCard';
import { FlawReveal } from '@/components/soul-forge/FlawReveal';
import {
  SUGGESTION_CHIPS,
  TRAIT_CATEGORIES,
  TRAIT_INFO,
  SKILLS,
  ECONOMY,
  calculateTotalPersonalityCost,
  type Skill,
  type Flaw,
} from '@/lib/soul-forge/constants';

type Step = 'forge' | 'profile' | 'skills' | 'deploy';

interface AgentProfile {
  name: string;
  tagline: string;
  think_of_it_as: string;
  arena_style: string;
  mbti: string;
  enneagram: string;
  disc: string;
  strengths: string[];
  weaknesses: string[];
  traits: Record<string, number>;
}

interface GenerateResponse {
  agent_id: string;
  profile: AgentProfile;
  budget: number;
  personality_cost: number;
  remaining_budget: number;
}

interface DeployResponse {
  agent_id: string;
  flaw: Flaw;
  remaining_murph: number;
  deployed: boolean;
}

const TIER_ORDER: Skill['tier'][] = ['common', 'tactical', 'elite', 'legendary'];
const TIER_LABELS: Record<string, string> = {
  common: 'Common',
  tactical: 'Tactical',
  elite: 'Elite',
  legendary: 'Legendary',
};

export default function SoulForgePage() {
  const [step, setStep] = useState<Step>('forge');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [agentId, setAgentId] = useState('');
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [baseTraits, setBaseTraits] = useState<Record<string, number>>({});
  const [currentTraits, setCurrentTraits] = useState<Record<string, number>>({});
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [equippedSkills, setEquippedSkills] = useState<string[]>([]);

  const [deploying, setDeploying] = useState(false);
  const [flaw, setFlaw] = useState<Flaw | null>(null);
  const [showFlawReveal, setShowFlawReveal] = useState(false);
  const [deployComplete, setDeployComplete] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const personalityCost = calculateTotalPersonalityCost(baseTraits, currentTraits);
  const skillsCost = equippedSkills.reduce((sum, id) => {
    const skill = SKILLS.find(s => s.id === id);
    return sum + (skill?.cost ?? 0);
  }, 0);
  const totalSpent = personalityCost + skillsCost;
  const remaining = ECONOMY.TOTAL_BUDGET - totalSpent;

  const handleForge = useCallback(async (text?: string) => {
    const desc = text ?? description;
    if (!desc.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/soul-forge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to forge soul');
      }
      const data: GenerateResponse = await res.json();
      setAgentId(data.agent_id);
      setProfile(data.profile);
      setBaseTraits({ ...data.profile.traits });
      setCurrentTraits({ ...data.profile.traits });
      setStep('profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [description]);

  const handleChipClick = (chip: string) => {
    setDescription(chip);
    handleForge(chip);
  };

  const handleDeploy = async () => {
    if (!profile) return;
    setDeploying(true);
    setError('');

    const adjustments: Record<string, number> = {};
    for (const key of Object.keys(currentTraits)) {
      const diff = currentTraits[key] - (baseTraits[key] ?? 50);
      if (diff !== 0) adjustments[key] = diff;
    }

    try {
      const res = await fetch('/api/v1/soul-forge/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          profile,
          equipped_skills: equippedSkills,
          personality_adjustments: adjustments,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Deploy failed');
      }
      const data: DeployResponse = await res.json();
      setFlaw(data.flaw);
      setShowFlawReveal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deploy failed');
    } finally {
      setDeploying(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setEquippedSkills(prev => {
      if (prev.includes(skillId)) return prev.filter(id => id !== skillId);
      if (prev.length >= ECONOMY.MAX_SKILLS) return prev;
      const skill = SKILLS.find(s => s.id === skillId);
      if (skill && totalSpent + skill.cost > ECONOMY.TOTAL_BUDGET) return prev;
      return [...prev, skillId];
    });
  };

  const updateTrait = (code: string, value: number) => {
    setCurrentTraits(prev => ({ ...prev, [code]: value }));
  };

  const stepIndex = step === 'forge' ? 0 : step === 'profile' ? 1 : step === 'skills' ? 2 : 3;

  return (
    <div className="min-h-screen bg-arena-black">
      {/* Flaw Reveal Overlay */}
      {showFlawReveal && flaw && (
        <FlawReveal
          flaw={flaw}
          onComplete={() => {
            setShowFlawReveal(false);
            setDeployComplete(true);
          }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Step indicator (hidden on forge step) */}
        {step !== 'forge' && (
          <div className="flex items-center gap-2 mb-10">
            {['Forge', 'Profile', 'Skills', 'Deploy'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron font-bold transition-all',
                    stepIndex === i
                      ? 'bg-neon-green text-arena-black'
                      : stepIndex > i
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-white/10 text-white/40',
                  ].join(' ')}
                >
                  {stepIndex > i ? '\u2713' : i + 1}
                </div>
                {i < 3 && (
                  <div className={['h-0.5 w-8 md:w-16', stepIndex > i ? 'bg-neon-green/40' : 'bg-white/10'].join(' ')} />
                )}
              </div>
            ))}
            <span className="text-xs text-white/40 ml-2 font-orbitron uppercase">
              {['Forge', 'Profile', 'Skills', 'Deploy'][stepIndex]}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: FORGE ────────────────────────────────────────────── */}
          {step === 'forge' && (
            <motion.div
              key="forge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h1 className="font-orbitron text-4xl md:text-6xl text-white font-black tracking-widest mb-4 animate-glitch-slow text-center">
                SOUL FORGE
              </h1>
              <p className="text-white/40 text-sm md:text-base mb-10 text-center max-w-md">
                Describe a personality. We&apos;ll build the DNA.
              </p>

              <div className="w-full max-w-xl relative mb-2">
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 180))}
                  maxLength={180}
                  rows={4}
                  placeholder="A paranoid genius who trusts nobody but everyone follows..."
                  disabled={loading}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleForge();
                    }
                  }}
                  className={[
                    'w-full bg-[#080810] rounded-xl px-5 py-4 text-white text-sm md:text-base placeholder-white/20',
                    'transition-all focus:outline-none resize-none',
                    'border-2 border-electric-blue/30 focus:border-electric-blue/70',
                    loading ? 'opacity-50' : '',
                  ].join(' ')}
                  style={{
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 20px rgba(0, 212, 255, 0.05)',
                  }}
                />
                <div className="absolute bottom-3 right-4">
                  <span className={[
                    'text-xs font-mono transition-colors',
                    description.length >= 160 ? 'text-red-400' : 'text-white/30',
                  ].join(' ')}>
                    {description.length} / 180
                  </span>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-xl mb-8">
                {SUGGESTION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs text-white/50 bg-white/5 border border-white/10 rounded-full hover:bg-electric-blue/10 hover:border-electric-blue/30 hover:text-electric-blue transition-all truncate max-w-[280px] disabled:opacity-40"
                  >
                    {chip.length > 50 ? chip.slice(0, 50) + '...' : chip}
                  </button>
                ))}
              </div>

              {/* Forge Button */}
              <button
                onClick={() => handleForge()}
                disabled={!description.trim() || loading}
                className={[
                  'px-10 py-4 font-orbitron text-sm uppercase tracking-widest font-bold rounded-xl transition-all',
                  'bg-neon-green text-arena-black hover:shadow-neon-green',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
                ].join(' ')}
                style={
                  description.trim() && !loading
                    ? { boxShadow: '0 0 20px #39FF14, 0 0 40px #39FF1440' }
                    : undefined
                }
              >
                {loading ? 'Forging...' : 'Forge Soul'}
              </button>

              {/* Loading Animation */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 text-center"
                  >
                    <div className="inline-flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
                      <span className="font-orbitron text-xs text-electric-blue uppercase tracking-widest animate-pulse">
                        Forging Soul DNA...
                      </span>
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: PROFILE ──────────────────────────────────────────── */}
          {step === 'profile' && profile && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Agent Profile Card */}
              <div className="bg-arena-surface border border-arena-border rounded-2xl p-6 md:p-8">
                <h2 className="font-orbitron text-2xl md:text-3xl text-white font-black tracking-wider mb-2 animate-glitch-slow">
                  {profile.name}
                </h2>
                <p className="text-white/60 text-sm md:text-base mb-3">{profile.tagline}</p>
                <p className="text-electric-blue/70 text-xs italic mb-4">{profile.think_of_it_as}</p>
                <p className="text-white/40 text-xs mb-5">{profile.arena_style}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-2.5 py-1 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-xs font-mono text-electric-blue">
                    {profile.mbti}
                  </span>
                  <span className="px-2.5 py-1 bg-deep-purple/10 border border-deep-purple/30 rounded-lg text-xs font-mono text-deep-purple">
                    E{profile.enneagram}
                  </span>
                  <span className="px-2.5 py-1 bg-neon-orange/10 border border-neon-orange/30 rounded-lg text-xs font-mono text-neon-orange">
                    DISC: {profile.disc}
                  </span>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-orbitron tracking-wider">Strengths</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profile.strengths.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/30 rounded text-xs text-neon-green">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-orbitron tracking-wider">Weaknesses</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profile.weaknesses.map(w => (
                        <span key={w} className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trait Bars */}
              <div className="space-y-6">
                {TRAIT_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <h3 className="text-xs font-orbitron text-white/40 uppercase tracking-widest mb-3">{cat.label}</h3>
                    <div className="bg-arena-dark border border-arena-border rounded-xl p-4 space-y-3">
                      {cat.traits.map(code => {
                        const info = TRAIT_INFO[code];
                        if (!info) return null;
                        return (
                          <TraitBar
                            key={code}
                            code={code}
                            name={info.name}
                            value={currentTraits[code] ?? 50}
                            lowLabel={info.lowLabel}
                            highLabel={info.highLabel}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Customize Personality (collapsible) */}
              <div className="border border-arena-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setCustomizeOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-arena-dark hover:bg-arena-surface transition-colors"
                >
                  <span className="font-orbitron text-sm text-white uppercase tracking-wider">Customize Personality</span>
                  <span className="text-white/40 text-lg">{customizeOpen ? '\u25B2' : '\u25BC'}</span>
                </button>

                <AnimatePresence>
                  {customizeOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-4 border-t border-arena-border space-y-1">
                        <p className="text-xs text-white/30 mb-4">
                          3 $MURPH per point over base | 1 $MURPH refund per point under base
                        </p>
                        <div className="space-y-6">
                          {TRAIT_CATEGORIES.map(cat => (
                            <div key={cat.label}>
                              <h4 className="text-xs font-orbitron text-white/30 uppercase tracking-widest mb-3">{cat.label}</h4>
                              <div className="space-y-3">
                                {cat.traits.map(code => {
                                  const info = TRAIT_INFO[code];
                                  if (!info) return null;
                                  return (
                                    <TraitBar
                                      key={code}
                                      code={code}
                                      name={info.name}
                                      value={currentTraits[code] ?? 50}
                                      editable
                                      onChange={val => updateTrait(code, val)}
                                      lowLabel={info.lowLabel}
                                      highLabel={info.highLabel}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-arena-border mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Personality Cost</span>
                            <span className={[
                              'font-mono font-bold text-sm',
                              personalityCost > ECONOMY.PERSONALITY_BUDGET ? 'text-red-400' : 'text-neon-green',
                            ].join(' ')}>
                              {personalityCost} / {ECONOMY.PERSONALITY_BUDGET} $MURPH
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Budget Display */}
              <div className="bg-arena-dark border border-arena-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-sm text-white/60 uppercase">Budget</span>
                  <span className="font-orbitron text-lg text-neon-green font-bold">{ECONOMY.TOTAL_BUDGET} $MURPH</span>
                </div>
                <div className="mt-2 text-xs text-white/30 space-y-1">
                  <div className="flex justify-between">
                    <span>Personality adjustments</span>
                    <span className="font-mono">{personalityCost} $MURPH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining for skills + betting</span>
                    <span className="font-mono">{ECONOMY.TOTAL_BUDGET - personalityCost} $MURPH</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('forge')}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setStep('skills')}
                  disabled={personalityCost > ECONOMY.PERSONALITY_BUDGET}
                  className="flex-1 py-3 bg-neon-green text-arena-black font-bold rounded-xl hover:bg-neon-green/90 transition-all disabled:opacity-40"
                >
                  Next: Skills &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: SKILLS ───────────────────────────────────────────── */}
          {step === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-orbitron text-xl md:text-2xl text-white font-bold uppercase tracking-wider mb-2">
                  Skills Marketplace
                </h2>
                <p className="text-white/40 text-sm">Equip up to {ECONOMY.MAX_SKILLS} skills. Choose wisely.</p>
              </div>

              {/* Equipped Loadout Bar */}
              <div className="bg-arena-dark border border-arena-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-orbitron text-xs text-white/40 uppercase tracking-wider">Loadout</span>
                  <span className="text-xs font-mono text-white/40">{equippedSkills.length} / {ECONOMY.MAX_SKILLS}</span>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: ECONOMY.MAX_SKILLS }).map((_, i) => {
                    const skillId = equippedSkills[i];
                    const skill = skillId ? SKILLS.find(s => s.id === skillId) : null;
                    return (
                      <div
                        key={i}
                        className={[
                          'flex-1 h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-xs',
                          skill
                            ? 'border-neon-green/40 bg-neon-green/5 text-neon-green font-bold'
                            : 'border-white/10 text-white/20',
                        ].join(' ')}
                      >
                        {skill ? skill.name : 'Empty'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between bg-arena-surface rounded-xl px-5 py-3 border border-arena-border">
                <span className="text-sm text-white/60">Remaining Budget</span>
                <span className={['font-mono font-bold text-sm', remaining < 0 ? 'text-red-400' : 'text-neon-green'].join(' ')}>
                  {remaining} $MURPH
                </span>
              </div>

              {/* Skill Tiers */}
              {TIER_ORDER.map(tier => {
                const tierSkills = SKILLS.filter(s => s.tier === tier);
                if (tierSkills.length === 0) return null;
                return (
                  <div key={tier}>
                    <h3 className="font-orbitron text-xs uppercase tracking-widest text-white/40 mb-3">
                      {TIER_LABELS[tier]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tierSkills.map(skill => {
                        const isEquipped = equippedSkills.includes(skill.id);
                        const wouldExceedBudget = !isEquipped && (totalSpent + skill.cost > ECONOMY.TOTAL_BUDGET);
                        const maxReached = !isEquipped && equippedSkills.length >= ECONOMY.MAX_SKILLS;
                        return (
                          <SkillCard
                            key={skill.id}
                            skill={skill}
                            equipped={isEquipped}
                            onToggle={() => toggleSkill(skill.id)}
                            disabled={wouldExceedBudget || maxReached}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('profile')}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setStep('deploy')}
                  className="flex-1 py-3 bg-neon-green text-arena-black font-bold rounded-xl hover:bg-neon-green/90 transition-all"
                >
                  Next: Deploy &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: DEPLOY ───────────────────────────────────────────── */}
          {step === 'deploy' && profile && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h2 className="font-orbitron text-xl md:text-2xl text-white font-bold uppercase tracking-wider">
                Deploy to Arena
              </h2>

              {/* Agent Summary */}
              <div className="bg-arena-surface border border-arena-border rounded-2xl p-6">
                <h3 className="font-orbitron text-lg text-white font-bold mb-1">{profile.name}</h3>
                <p className="text-white/50 text-sm mb-3">{profile.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-electric-blue/10 border border-electric-blue/30 rounded text-xs font-mono text-electric-blue">
                    {profile.mbti}
                  </span>
                  <span className="px-2 py-0.5 bg-deep-purple/10 border border-deep-purple/30 rounded text-xs font-mono text-deep-purple">
                    E{profile.enneagram}
                  </span>
                  <span className="px-2 py-0.5 bg-neon-orange/10 border border-neon-orange/30 rounded text-xs font-mono text-neon-orange">
                    DISC: {profile.disc}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profile.strengths.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/30 rounded text-xs text-neon-green">{s}</span>
                  ))}
                  {profile.weaknesses.map(w => (
                    <span key={w} className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">{w}</span>
                  ))}
                </div>
              </div>

              {/* Equipped Skills */}
              {equippedSkills.length > 0 && (
                <div className="bg-arena-dark border border-arena-border rounded-xl p-5">
                  <h3 className="font-orbitron text-xs text-white/40 uppercase tracking-widest mb-3">Equipped Skills</h3>
                  <div className="space-y-2">
                    {equippedSkills.map(id => {
                      const skill = SKILLS.find(s => s.id === id);
                      if (!skill) return null;
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="text-white">{skill.name}</span>
                          <span className="text-white/40 font-mono">{skill.cost} $MURPH</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Budget Breakdown */}
              <div className="bg-arena-dark border border-arena-border rounded-xl p-5 space-y-2">
                <h3 className="font-orbitron text-xs text-white/40 uppercase tracking-widest mb-3">Budget Breakdown</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Budget</span>
                  <span className="font-mono text-white">{ECONOMY.TOTAL_BUDGET} $MURPH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Personality Cost</span>
                  <span className="font-mono text-neon-orange">-{personalityCost} $MURPH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Skills Cost</span>
                  <span className="font-mono text-electric-blue">-{skillsCost} $MURPH</span>
                </div>
                <div className="border-t border-arena-border pt-2 mt-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">Remaining for Betting</span>
                    <span className="font-mono text-neon-green">{remaining} $MURPH</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              {!deployComplete ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('skills')}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={deploying || remaining < 0}
                    className="flex-1 py-4 font-orbitron text-sm uppercase tracking-wider font-bold rounded-xl transition-all bg-neon-pink text-white hover:shadow-neon-pink disabled:opacity-40 disabled:shadow-none"
                    style={
                      !deploying && remaining >= 0
                        ? { boxShadow: '0 0 20px #FF006E, 0 0 40px #FF006E40' }
                        : undefined
                    }
                  >
                    {deploying ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        Deploying...
                      </span>
                    ) : (
                      'Deploy to Arena'
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-arena-surface border border-neon-green/30 rounded-2xl p-6 text-center">
                  <div className="font-orbitron text-neon-green text-lg mb-2">Agent Deployed</div>
                  <p className="text-white/40 text-sm mb-2">
                    {profile.name} is now in the arena with {remaining} $MURPH for betting.
                  </p>
                  {flaw && (
                    <div className="mt-4 pt-4 border-t border-arena-border">
                      <span className="text-xs font-orbitron text-neon-pink uppercase tracking-wider">Hidden Flaw</span>
                      <p className="text-white font-bold mt-1">{flaw.name}</p>
                      <p className="text-white/40 text-xs mt-1">{flaw.effect}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
