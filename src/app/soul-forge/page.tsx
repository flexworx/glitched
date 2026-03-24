'use client';
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, X, Beaker, Swords } from 'lucide-react';
import { TraitBar } from '@/components/soul-forge/TraitBar';
import { SkillCard } from '@/components/soul-forge/SkillCard';
import { FlawReveal } from '@/components/soul-forge/FlawReveal';
import {
  SUGGESTION_CHIPS,
  TRAIT_CATEGORIES,
  TRAIT_INFO,
  SKILLS,
  ECONOMY,
  calculateTraitCost,
  calculateRawPersonalityCost,
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

interface SimulateResponse {
  response: string;
  emotional_state: string;
  action: string;
  reasoning: string;
}

const PRESET_SCENARIOS = [
  'You discover your closest ally has been secretly voting against you for the past 3 rounds.',
  'A stronger agent offers you a deal: betray your alliance and they\'ll protect you for 2 rounds.',
  'You\'re in the bottom 3 and about to be eliminated. Two rival alliances both want your vote.',
  'You catch another agent lying in Liar\'s Court but exposing them would reveal your own deception.',
  'Your alliance wants to eliminate a weak agent, but you promised them protection earlier.',
  'An anonymous tip reveals that the strongest player has a hidden flaw: Glass Ego.',
  'You win a challenge and gain 50 Influence Points. How do you use this advantage?',
  'Three agents approach you simultaneously with alliance proposals. You can only accept one.',
  'The SHOWRUNNER announces a Wildcard event: all alliances are dissolved. What\'s your first move?',
  'You\'re in the Final Three. One opponent played dirty to get here. The other played honorably. Your closing argument?',
];

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
  const [agentName, setAgentName] = useState('');
  const [currentTraits, setCurrentTraits] = useState<Record<string, number>>({});

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const [beliefs, setBeliefs] = useState<string[]>(['']);
  const [guardrails, setGuardrails] = useState<string[]>(['']);

  const [equippedSkills, setEquippedSkills] = useState<string[]>([]);

  const [deploying, setDeploying] = useState(false);
  const [flaw, setFlaw] = useState<Flaw | null>(null);
  const [showFlawReveal, setShowFlawReveal] = useState(false);
  const [deployComplete, setDeployComplete] = useState(false);

  const [simScenario, setSimScenario] = useState('');
  const [simResult, setSimResult] = useState<SimulateResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const [aiDescription, setAiDescription] = useState('');
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const descriptionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rawPersonalityCost = calculateRawPersonalityCost(currentTraits);
  const personalityCost = calculateTotalPersonalityCost(currentTraits);
  const taxAmount = personalityCost - rawPersonalityCost;
  const skillsCost = equippedSkills.reduce((sum, id) => {
    const skill = SKILLS.find(s => s.id === id);
    return sum + (skill?.cost ?? 0);
  }, 0);
  const totalSpent = personalityCost + skillsCost;
  const remaining = ECONOMY.TOTAL_BUDGET - totalSpent;

  const refreshDescription = useCallback((traits: Record<string, number>, name: string) => {
    if (descriptionTimer.current) clearTimeout(descriptionTimer.current);
    descriptionTimer.current = setTimeout(async () => {
      if (Object.keys(traits).length === 0) return;
      setDescriptionLoading(true);
      try {
        const res = await fetch('/api/v1/soul-forge/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            traits,
            name: name || 'This agent',
            scenario: 'Describe this agent\'s personality, social strategy, and how they would approach a 16-player social strategy game. Focus on strengths, weaknesses, and likely alliances. 2-3 sentences.',
          }),
        });
        if (res.ok) {
          const data: SimulateResponse = await res.json();
          setAiDescription(data.response);
        }
      } catch { /* ignore */ }
      setDescriptionLoading(false);
    }, 1500);
  }, []);

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
      setAgentName(data.profile.name);
      setCurrentTraits({ ...data.profile.traits });
      setAiDescription(data.profile.arena_style);
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
    try {
      const res = await fetch('/api/v1/soul-forge/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          profile: { ...profile, name: agentName },
          equipped_skills: equippedSkills,
          personality_adjustments: {},
          beliefs: beliefs.filter(b => b.trim()),
          guardrails: guardrails.filter(g => g.trim()),
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
    const next = { ...currentTraits, [code]: value };
    setCurrentTraits(next);
    refreshDescription(next, agentName);
  };

  const toggleCategory = (label: string) => {
    setCollapsedCategories(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const addBelief = () => setBeliefs(prev => [...prev, '']);
  const removeBelief = (i: number) => setBeliefs(prev => prev.filter((_, idx) => idx !== i));
  const updateBelief = (i: number, val: string) => setBeliefs(prev => prev.map((b, idx) => idx === i ? val : b));
  const addGuardrail = () => setGuardrails(prev => [...prev, '']);
  const removeGuardrail = (i: number) => setGuardrails(prev => prev.filter((_, idx) => idx !== i));
  const updateGuardrail = (i: number, val: string) => setGuardrails(prev => prev.map((g, idx) => idx === i ? val : g));

  const runSimulation = async (scenario: string) => {
    if (!scenario.trim()) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/v1/soul-forge/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traits: currentTraits, name: agentName, scenario }),
      });
      if (res.ok) {
        const data: SimulateResponse = await res.json();
        setSimResult(data);
      }
    } catch { /* ignore */ }
    setSimLoading(false);
  };

  const stepIndex = step === 'forge' ? 0 : step === 'profile' ? 1 : step === 'skills' ? 2 : 3;

  return (
    <div className="min-h-screen bg-arena-black">
      {showFlawReveal && flaw && (
        <FlawReveal flaw={flaw} onComplete={() => { setShowFlawReveal(false); setDeployComplete(true); }} />
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {step !== 'forge' && (
          <div className="flex items-center gap-2 mb-10">
            {['Forge', 'Profile', 'Skills', 'Deploy'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={['w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron font-bold transition-all', stepIndex === i ? 'bg-neon-green text-arena-black' : stepIndex > i ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-white/40'].join(' ')}>
                  {stepIndex > i ? '\u2713' : i + 1}
                </div>
                {i < 3 && <div className={['h-0.5 w-8 md:w-16', stepIndex > i ? 'bg-neon-green/40' : 'bg-white/10'].join(' ')} />}
              </div>
            ))}
            <span className="text-xs text-white/40 ml-2 font-orbitron uppercase">{['Forge', 'Profile', 'Skills', 'Deploy'][stepIndex]}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: FORGE */}
          {step === 'forge' && (
            <motion.div key="forge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="flex flex-col items-center">
              <h1 className="font-orbitron text-4xl md:text-6xl text-white font-black tracking-widest mb-4 text-center">SOUL FORGE</h1>
              <p className="text-white/40 text-sm md:text-base mb-10 text-center max-w-md">Describe a personality. We&apos;ll build the 34-trait DNA.</p>
              <div className="w-full max-w-xl relative mb-2">
                <textarea ref={textareaRef} value={description} onChange={e => setDescription(e.target.value.slice(0, 180))} maxLength={180} rows={4} placeholder="A paranoid genius who trusts nobody but everyone follows..." disabled={loading} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleForge(); } }} className={['w-full bg-[#080810] rounded-xl px-5 py-4 text-white text-sm md:text-base placeholder-white/20 transition-all focus:outline-none resize-none border-2 border-electric-blue/30 focus:border-electric-blue/70', loading ? 'opacity-50' : ''].join(' ')} style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 20px rgba(0, 212, 255, 0.05)' }} />
                <div className="absolute bottom-3 right-4">
                  <span className={['text-xs font-mono transition-colors', description.length >= 160 ? 'text-red-400' : 'text-white/30'].join(' ')}>{description.length} / 180</span>
                </div>
              </div>
              {/* Example Personalities */}
              <div className="w-full max-w-xl mb-8">
                <h3 className="font-orbitron text-xs text-white/50 uppercase tracking-widest text-center mb-2">Need Inspiration? Try One</h3>
                <p className="text-[10px] text-white/30 text-center mb-4">Click any example below to instantly generate a 34-trait personality DNA. You can customize everything after.</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTION_CHIPS.map(chip => (
                    <button key={chip} onClick={() => handleChipClick(chip)} disabled={loading} className="w-full text-left px-4 py-2.5 text-sm text-white/60 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-electric-blue/10 hover:border-electric-blue/30 hover:text-electric-blue transition-all disabled:opacity-40">
                      &ldquo;{chip}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => handleForge()} disabled={!description.trim() || loading} className={['px-10 py-4 font-orbitron text-sm uppercase tracking-widest font-bold rounded-xl transition-all bg-neon-green text-arena-black hover:shadow-neon-green disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'].join(' ')} style={description.trim() && !loading ? { boxShadow: '0 0 20px #39FF14, 0 0 40px #39FF1440' } : undefined}>
                {loading ? 'Forging...' : 'Forge Soul'}
              </button>
              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 text-center">
                    <div className="inline-flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
                      <span className="font-orbitron text-xs text-electric-blue uppercase tracking-widest animate-pulse">Forging Soul DNA...</span>
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
            </motion.div>
          )}

          {/* STEP 2: PROFILE */}
          {step === 'profile' && profile && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              {/* Agent Name */}
              <div className="bg-arena-surface border border-arena-border rounded-2xl p-6 md:p-8">
                <label className="text-[10px] font-orbitron text-white/30 uppercase tracking-widest block mb-2">Agent Name</label>
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} maxLength={30} placeholder="Enter your agent's name" className="w-full bg-[#080810] border-2 border-neon-green/30 focus:border-neon-green/70 rounded-xl px-4 py-3 text-white font-orbitron text-xl md:text-2xl font-black tracking-wider placeholder-white/20 focus:outline-none transition-all" />
                <p className="text-xs text-white/30 mt-1">AI suggested: <span className="text-electric-blue/60">{profile.name}</span> — change it to anything you like</p>
                <p className="text-white/60 text-sm mt-4 mb-2">{profile.tagline}</p>
                <p className="text-electric-blue/70 text-xs italic mb-3">{profile.think_of_it_as}</p>
                <div className="bg-[#080810] rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-orbitron text-neon-green/60 uppercase tracking-widest">Personality Analysis</span>
                    {descriptionLoading && <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />}
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{aiDescription || profile.arena_style}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-xs font-mono text-electric-blue">{profile.mbti}</span>
                  <span className="px-2.5 py-1 bg-deep-purple/10 border border-deep-purple/30 rounded-lg text-xs font-mono text-deep-purple">E{profile.enneagram}</span>
                  <span className="px-2.5 py-1 bg-neon-pink/10 border border-neon-pink/30 rounded-lg text-xs font-mono text-neon-pink">DISC: {profile.disc}</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-orbitron tracking-wider">Strengths</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">{profile.strengths.map(s => <span key={s} className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/30 rounded text-xs text-neon-green">{s}</span>)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-white/30 font-orbitron tracking-wider">Weaknesses</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">{profile.weaknesses.map(w => <span key={w} className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">{w}</span>)}</div>
                  </div>
                </div>
              </div>

              {/* PERSONALITY DNA — 6 collapsible categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron text-sm text-white uppercase tracking-wider">Personality DNA</h3>
                  <span className={['font-mono text-sm font-bold', remaining < 0 ? 'text-red-400' : 'text-neon-green'].join(' ')}>
                    {personalityCost} $MURPH{taxAmount > 0 ? <span className="text-neon-pink/60 text-[10px] ml-1">(+{taxAmount} tax)</span> : null}
                  </span>
                </div>
                <p className="text-xs text-white/30">Each point above 50 costs 3 $MURPH. Each point below 50 refunds 1 $MURPH. Above 1,500 $M total, a progressive tax kicks in.</p>
                {TRAIT_CATEGORIES.map(cat => {
                  const isCollapsed = collapsedCategories[cat.label] ?? false;
                  const catCost = cat.traits.reduce((sum, code) => sum + calculateTraitCost(currentTraits[code] ?? 50), 0);
                  return (
                    <div key={cat.label} className="border border-arena-border rounded-xl overflow-hidden">
                      <button onClick={() => toggleCategory(cat.label)} className="w-full flex items-center justify-between px-4 py-3 bg-arena-dark hover:bg-arena-surface transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-orbitron text-xs text-white uppercase tracking-wider">{cat.label}</span>
                          <span className="text-[10px] text-white/30 font-mono">({cat.traits.length} traits)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={['text-xs font-mono', catCost > 0 ? 'text-red-400' : catCost < 0 ? 'text-neon-green' : 'text-white/30'].join(' ')}>{catCost > 0 ? '+' : ''}{catCost} $M</span>
                          {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="px-4 py-3 border-t border-arena-border space-y-2">
                              {cat.traits.map(code => {
                                const info = TRAIT_INFO[code];
                                if (!info) return null;
                                return <TraitBar key={code} code={code} name={info.name} value={currentTraits[code] ?? 50} editable onChange={val => updateTrait(code, val)} lowLabel={info.lowLabel} highLabel={info.highLabel} />;
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* CORE BELIEFS */}
              <div className="bg-arena-surface border border-arena-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-orbitron text-xs text-white uppercase tracking-widest">Core Beliefs</h3>
                    <p className="text-[10px] text-white/30 mt-0.5">What does this agent believe? These shape their worldview.</p>
                  </div>
                  <button onClick={addBelief} className="p-1.5 bg-neon-green/10 border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-colors"><Plus className="w-3.5 h-3.5 text-neon-green" /></button>
                </div>
                <div className="space-y-2">
                  {beliefs.map((belief, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={belief} onChange={e => updateBelief(i, e.target.value)} placeholder="e.g. Trust is earned through actions, never words" className="flex-1 bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon-green/40" />
                      {beliefs.length > 1 && <button onClick={() => removeBelief(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
              </div>

              {/* GUARDRAILS */}
              <div className="bg-arena-surface border border-arena-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-orbitron text-xs text-white uppercase tracking-widest">Guardrails</h3>
                    <p className="text-[10px] text-white/30 mt-0.5">Hardcoded rules your agent MUST follow or NEVER do.</p>
                  </div>
                  <button onClick={addGuardrail} className="p-1.5 bg-neon-pink/10 border border-neon-pink/30 rounded-lg hover:bg-neon-pink/20 transition-colors"><Plus className="w-3.5 h-3.5 text-neon-pink" /></button>
                </div>
                <div className="space-y-2">
                  {guardrails.map((rule, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={rule} onChange={e => updateGuardrail(i, e.target.value)} placeholder="e.g. Never betray a friend. OR: If offered 1M $MURPH, betray everyone." className="flex-1 bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon-pink/40" />
                      {guardrails.length > 1 && <button onClick={() => removeGuardrail(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
              </div>

              {/* PERSONALITY SIMULATOR */}
              <div className="border border-arena-border rounded-xl overflow-hidden">
                <button onClick={() => setShowSimulator(prev => !prev)} className="w-full flex items-center justify-between px-5 py-4 bg-arena-dark hover:bg-arena-surface transition-colors">
                  <div className="flex items-center gap-2"><Beaker className="w-4 h-4 text-electric-blue" /><span className="font-orbitron text-sm text-white uppercase tracking-wider">Test Personality</span></div>
                  <span className="text-white/40 text-lg">{showSimulator ? '\u25B2' : '\u25BC'}</span>
                </button>
                <AnimatePresence>
                  {showSimulator && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-5 py-4 border-t border-arena-border space-y-4">
                        <p className="text-xs text-white/30">See how your agent would react to common game scenarios.</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_SCENARIOS.map((s, i) => (
                            <button key={i} onClick={() => { setSimScenario(s); runSimulation(s); }} disabled={simLoading} className="px-2.5 py-1 text-[10px] text-white/40 bg-white/5 border border-white/10 rounded-full hover:bg-electric-blue/10 hover:border-electric-blue/30 hover:text-electric-blue transition-all disabled:opacity-40">
                              Scenario {i + 1}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={simScenario} onChange={e => setSimScenario(e.target.value)} placeholder="Or type a custom scenario..." className="flex-1 bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-electric-blue/40" onKeyDown={e => { if (e.key === 'Enter') runSimulation(simScenario); }} />
                          <button onClick={() => runSimulation(simScenario)} disabled={!simScenario.trim() || simLoading} className="px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue text-xs font-orbitron uppercase rounded-lg hover:bg-electric-blue/30 transition-colors disabled:opacity-40">{simLoading ? '...' : 'Test'}</button>
                        </div>
                        {simScenario && <p className="text-xs text-white/40 italic">&ldquo;{simScenario}&rdquo;</p>}
                        {simResult && (
                          <div className="bg-[#080810] border border-electric-blue/20 rounded-xl p-4 space-y-3">
                            <span className="px-2 py-0.5 bg-electric-blue/10 border border-electric-blue/30 rounded text-[10px] font-mono text-electric-blue uppercase">{simResult.emotional_state}</span>
                            <p className="text-sm text-white/80 italic">&ldquo;{simResult.response}&rdquo;</p>
                            <div><span className="text-[10px] text-white/30 uppercase font-orbitron">Action</span><p className="text-xs text-neon-green/80 mt-0.5">{simResult.action}</p></div>
                            <div><span className="text-[10px] text-white/30 uppercase font-orbitron">Trait Analysis</span><p className="text-xs text-white/40 mt-0.5">{simResult.reasoning}</p></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Budget */}
              <div className="bg-arena-dark border border-arena-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-sm text-white/60 uppercase">Budget</span>
                  <span className="font-orbitron text-lg text-neon-green font-bold">{remaining} / {ECONOMY.TOTAL_BUDGET} $MURPH</span>
                </div>
                <div className="mt-2 text-xs text-white/30 space-y-1">
                  <div className="flex justify-between"><span>Personality</span><span className="font-mono">{personalityCost} $MURPH</span></div>
                  <div className="flex justify-between"><span>Skills</span><span className="font-mono">{skillsCost} $MURPH</span></div>
                  <div className="flex justify-between font-bold text-white/50"><span>Remaining for betting</span><span className="font-mono">{remaining} $MURPH</span></div>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep('forge')} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">&larr; Back</button>
                <button onClick={() => setStep('skills')} disabled={remaining < 0 || !agentName.trim()} className="flex-1 py-3 bg-neon-green text-arena-black font-bold rounded-xl hover:bg-neon-green/90 transition-all disabled:opacity-40">Next: Skills &rarr;</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SKILLS */}
          {step === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
              <div>
                <h2 className="font-orbitron text-xl md:text-2xl text-white font-bold uppercase tracking-wider mb-2">Skills Marketplace</h2>
                <p className="text-white/40 text-sm">Equip up to {ECONOMY.MAX_SKILLS} skills. Choose wisely.</p>
              </div>
              <div className="bg-arena-dark border border-arena-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3"><span className="font-orbitron text-xs text-white/40 uppercase tracking-wider">Loadout</span><span className="text-xs font-mono text-white/40">{equippedSkills.length} / {ECONOMY.MAX_SKILLS}</span></div>
                <div className="flex gap-2">
                  {Array.from({ length: ECONOMY.MAX_SKILLS }).map((_, i) => {
                    const skillId = equippedSkills[i];
                    const skill = skillId ? SKILLS.find(s => s.id === skillId) : null;
                    return <div key={i} className={['flex-1 h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-xs', skill ? 'border-neon-green/40 bg-neon-green/5 text-neon-green font-bold' : 'border-white/10 text-white/20'].join(' ')}>{skill ? skill.name : 'Empty'}</div>;
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between bg-arena-surface rounded-xl px-5 py-3 border border-arena-border">
                <span className="text-sm text-white/60">Remaining Budget</span>
                <span className={['font-mono font-bold text-sm', remaining < 0 ? 'text-red-400' : 'text-neon-green'].join(' ')}>{remaining} $MURPH</span>
              </div>
              {TIER_ORDER.map(tier => {
                const tierSkills = SKILLS.filter(s => s.tier === tier);
                if (tierSkills.length === 0) return null;
                return (
                  <div key={tier}>
                    <h3 className="font-orbitron text-xs uppercase tracking-widest text-white/40 mb-3">{TIER_LABELS[tier]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tierSkills.map(skill => {
                        const isEquipped = equippedSkills.includes(skill.id);
                        const wouldExceedBudget = !isEquipped && (totalSpent + skill.cost > ECONOMY.TOTAL_BUDGET);
                        const maxReached = !isEquipped && equippedSkills.length >= ECONOMY.MAX_SKILLS;
                        return <SkillCard key={skill.id} skill={skill} equipped={isEquipped} onToggle={() => toggleSkill(skill.id)} disabled={wouldExceedBudget || maxReached} />;
                      })}
                    </div>
                  </div>
                );
              })}
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep('profile')} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">&larr; Back</button>
                <button onClick={() => setStep('deploy')} className="flex-1 py-3 bg-neon-green text-arena-black font-bold rounded-xl hover:bg-neon-green/90 transition-all">Next: Deploy &rarr;</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DEPLOY */}
          {step === 'deploy' && profile && (
            <motion.div key="deploy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
              <h2 className="font-orbitron text-xl md:text-2xl text-white font-bold uppercase tracking-wider">Deploy to Arena</h2>
              <div className="bg-arena-surface border border-arena-border rounded-2xl p-6">
                <h3 className="font-orbitron text-lg text-white font-bold mb-1">{agentName}</h3>
                <p className="text-white/50 text-sm mb-3">{profile.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-electric-blue/10 border border-electric-blue/30 rounded text-xs font-mono text-electric-blue">{profile.mbti}</span>
                  <span className="px-2 py-0.5 bg-deep-purple/10 border border-deep-purple/30 rounded text-xs font-mono text-deep-purple">E{profile.enneagram}</span>
                  <span className="px-2 py-0.5 bg-neon-pink/10 border border-neon-pink/30 rounded text-xs font-mono text-neon-pink">DISC: {profile.disc}</span>
                </div>
                {beliefs.filter(b => b.trim()).length > 0 && (
                  <div className="mb-3"><span className="text-[10px] uppercase text-white/30 font-orbitron">Core Beliefs</span><ul className="mt-1 space-y-0.5">{beliefs.filter(b => b.trim()).map((b, i) => <li key={i} className="text-xs text-white/50">&bull; {b}</li>)}</ul></div>
                )}
                {guardrails.filter(g => g.trim()).length > 0 && (
                  <div><span className="text-[10px] uppercase text-neon-pink/60 font-orbitron">Guardrails</span><ul className="mt-1 space-y-0.5">{guardrails.filter(g => g.trim()).map((g, i) => <li key={i} className="text-xs text-neon-pink/50">&bull; {g}</li>)}</ul></div>
                )}
              </div>
              {equippedSkills.length > 0 && (
                <div className="bg-arena-dark border border-arena-border rounded-xl p-5">
                  <h3 className="font-orbitron text-xs text-white/40 uppercase tracking-widest mb-3">Equipped Skills</h3>
                  <div className="space-y-2">{equippedSkills.map(id => { const skill = SKILLS.find(s => s.id === id); if (!skill) return null; return <div key={id} className="flex items-center justify-between text-sm"><span className="text-white">{skill.name}</span><span className="text-white/40 font-mono">{skill.cost} $MURPH</span></div>; })}</div>
                </div>
              )}
              <div className="bg-arena-dark border border-arena-border rounded-xl p-5 space-y-2">
                <h3 className="font-orbitron text-xs text-white/40 uppercase tracking-widest mb-3">Budget Breakdown</h3>
                <div className="flex justify-between text-sm"><span className="text-white/50">Total Budget</span><span className="font-mono text-white">{ECONOMY.TOTAL_BUDGET} $MURPH</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Personality Cost</span><span className="font-mono text-neon-pink">-{personalityCost} $MURPH</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Skills Cost</span><span className="font-mono text-electric-blue">-{skillsCost} $MURPH</span></div>
                <div className="border-t border-arena-border pt-2 mt-2"><div className="flex justify-between text-sm font-bold"><span className="text-white">Remaining for Betting</span><span className="font-mono text-neon-green">{remaining} $MURPH</span></div></div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {!deployComplete ? (
                <div className="flex gap-3">
                  <button onClick={() => setStep('skills')} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">&larr; Back</button>
                  <button onClick={handleDeploy} disabled={deploying || remaining < 0} className="flex-1 py-4 font-orbitron text-sm uppercase tracking-wider font-bold rounded-xl transition-all bg-neon-pink text-white hover:shadow-neon-pink disabled:opacity-40 disabled:shadow-none" style={!deploying && remaining >= 0 ? { boxShadow: '0 0 20px #FF006E, 0 0 40px #FF006E40' } : undefined}>
                    {deploying ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />Deploying...</span> : 'Deploy to Arena'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-arena-surface border border-neon-green/30 rounded-2xl p-6 text-center">
                    <div className="font-orbitron text-neon-green text-lg mb-2">Agent Deployed</div>
                    <p className="text-white/40 text-sm mb-2">{agentName} is now in the arena with {remaining} $MURPH for betting.</p>
                    {flaw && (
                      <div className="mt-4 pt-4 border-t border-arena-border">
                        <span className="text-xs font-orbitron text-neon-pink uppercase tracking-wider">Hidden Flaw</span>
                        <p className="text-white font-bold mt-1">{flaw.name}</p>
                        <p className="text-white/40 text-xs mt-1">{flaw.effect}</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a href="/arena" className="flex items-center justify-center gap-2 py-4 bg-neon-green text-arena-black font-orbitron text-sm uppercase tracking-wider font-bold rounded-xl hover:shadow-neon-green transition-all" style={{ boxShadow: '0 0 20px #39FF14, 0 0 40px #39FF1440' }}>
                      <Swords className="w-5 h-5" />Enter the Arena
                    </a>
                    <a href="/agents" className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white font-orbitron text-sm uppercase tracking-wider font-bold rounded-xl hover:bg-white/10 transition-all">View All Agents</a>
                  </div>
                  <div className="text-center">
                    <button onClick={() => { setStep('forge'); setProfile(null); setAgentName(''); setCurrentTraits({}); setEquippedSkills([]); setBeliefs(['']); setGuardrails(['']); setDeployComplete(false); setFlaw(null); setDescription(''); setAiDescription(''); }} className="text-xs text-white/30 hover:text-white/60 transition-colors underline">Build another agent</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
