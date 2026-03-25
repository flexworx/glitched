'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'CHANCE', label: 'Chance', icon: '🎲', color: '#f59e0b' },
  { id: 'INTELLIGENCE', label: 'Intelligence', icon: '🧠', color: '#3b82f6' },
  { id: 'SOCIAL', label: 'Social', icon: '🤝', color: '#ec4899' },
  { id: 'STRATEGY', label: 'Strategy', icon: '♟️', color: '#8b5cf6' },
  { id: 'PERFORMANCE', label: 'Performance', icon: '🎭', color: '#10b981' },
  { id: 'POKER', label: 'Poker', icon: '🃏', color: '#ef4444' },
  { id: 'ENDURANCE', label: 'Endurance', icon: '🏃', color: '#06b6d4' },
  { id: 'CUSTOM', label: 'Custom', icon: '⚡', color: '#f97316' },
];

const ELIMINATION_RULES = [
  { id: 'HALF', label: 'Half Eliminated', desc: 'Bottom 50% are cut' },
  { id: 'FIXED', label: 'Fixed Count', desc: 'Exactly N agents eliminated' },
  { id: 'BOTTOM', label: 'Bottom N', desc: 'Bottom N performers eliminated' },
  { id: 'VOTE', label: 'Agent Vote', desc: 'Agents vote who to eliminate' },
  { id: 'SCORE_BASED', label: 'Score Threshold', desc: 'Below threshold eliminated' },
  { id: 'LAST_STANDING', label: 'Last Standing', desc: 'Last agent remaining wins' },
  { id: 'BRACKET', label: 'Bracket', desc: 'Head-to-head elimination' },
];

const SCORING_METHODS = [
  { id: 'VOTE', label: 'Peer Voting' },
  { id: 'SCORE', label: 'Point Score' },
  { id: 'SPEED', label: 'Speed' },
  { id: 'SURVIVAL', label: 'Survival' },
  { id: 'ELIMINATION', label: 'Direct Elimination' },
  { id: 'POKER', label: 'Chip Stack' },
  { id: 'TERRITORY', label: 'Territory Control' },
  { id: 'HYBRID', label: 'Multi-Factor' },
];

const PROMPT_VARIABLES = [
  { var: '{current_game_number}', desc: 'Which game (1-8)' },
  { var: '{current_game_name}', desc: 'Display title' },
  { var: '{agents_remaining}', desc: 'Count of active agents' },
  { var: '{active_agent_names}', desc: 'List of competing agents' },
  { var: '{eliminated_agent_names}', desc: 'Eliminated agent list' },
  { var: '{your_name}', desc: "This agent's name" },
  { var: '{your_credits}', desc: "Agent's credit balance" },
  { var: '{credit_standings}', desc: 'Full credit leaderboard' },
  { var: '{oracle_odds}', desc: 'Championship odds' },
  { var: '{previous_game_results}', desc: 'Last game results' },
  { var: '{agent_secret_score}', desc: 'Hidden value (chance games)' },
  { var: '{your_personality_summary}', desc: 'Agent trait summary' },
  { var: '{alliance_map}', desc: 'Known alliances' },
  { var: '{veritas_scores}', desc: 'Trust scores' },
];

const EASTER_EGG_TRIGGERS = [
  { id: 'RANDOM', label: 'Random' },
  { id: 'ROUND_START', label: 'Round Start' },
  { id: 'LOW_AGENT_COUNT', label: 'Low Agent Count' },
  { id: 'HIGH_DRAMA', label: 'High Drama' },
  { id: 'MANUAL', label: 'Manual' },
];

interface EasterEggDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  effectType: string;
}

interface AttachedEgg {
  easterEggId: string;
  probability: number;
  trigger: string;
}

const DEFAULT_FORM = {
  name: '', displayTitle: '', category: 'CHANCE', description: '', systemPrompt: '',
  minAgents: 2, maxAgents: 26, eliminationRule: 'HALF', eliminationCount: 0,
  scoringMethod: 'SCORE', estimatedDuration: 180, tags: [] as string[],
  creditRewards: { survive: 200, win: 500, mvp: 300, eliminateStealPct: 50 } as Record<string, number>,
};

export default function NewTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('rules');
  const [showVarRef, setShowVarRef] = useState(false);
  const [saving, setSaving] = useState(false);
  const [easterEggs, setEasterEggs] = useState<EasterEggDef[]>([]);
  const [attachedEggs, setAttachedEggs] = useState<AttachedEgg[]>([]);

  useEffect(() => {
    fetch('/api/vault/easter-eggs').then(r => r.json()).then(d => setEasterEggs(d.easterEggs || [])).catch(() => {});
  }, []);

  const u = (field: string, val: any) => setForm((prev) => ({ ...prev, [field]: val }));
  const uCredit = (field: string, val: number) =>
    setForm((prev) => ({ ...prev, creditRewards: { ...prev.creditRewards, [field]: val } }));

  const save = async (status: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/vault/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status,
          eliminationCount: form.eliminationCount || undefined,
          scoringLogic: {},
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Attach easter eggs
        for (const egg of attachedEggs) {
          await fetch(`/api/vault/templates/${data.id}/easter-eggs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(egg),
          });
        }
        router.push('/admin/vault');
      }
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'rules', label: 'Rules & Prompt' },
    { id: 'scoring', label: 'Scoring & Elimination' },
    { id: 'credits', label: 'Credit Rewards' },
    { id: 'easter', label: 'Easter Eggs' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-arena-dark border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-arena-dark to-[#16213e] px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Game Template</h2>
              <div className="flex gap-2">
                <button onClick={() => router.push('/admin/vault')}
                  className="px-4 py-2 text-sm text-white/50 hover:text-white/80 border border-white/10 rounded-lg">
                  Cancel
                </button>
                <button onClick={() => save('DRAFT')} disabled={saving}
                  className="px-4 py-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50">
                  Save Draft
                </button>
                <button onClick={() => save('PUBLISHED')} disabled={saving}
                  className="px-4 py-2 text-sm font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80 disabled:opacity-50">
                  Publish
                </button>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Game Name</label>
                <input value={form.name} onChange={(e) => u('name', e.target.value)} placeholder="e.g. Liar's Lottery"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Display Title</label>
                <input value={form.displayTitle} onChange={(e) => u('displayTitle', e.target.value)} placeholder="e.g. THE PURGE"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-neon-green/50" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Category</label>
                <div className="grid grid-cols-4 gap-1">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} onClick={() => u('category', cat.id)}
                      className={`text-[10px] py-1.5 px-1 rounded-lg border transition-all text-center ${form.category === cat.id ? 'border-white/30' : 'border-white/5 hover:border-white/15'}`}
                      style={form.category === cat.id ? { background: cat.color + '20', color: cat.color } : { color: '#ffffff60' }}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-white/40 mb-1">Short Description</label>
              <textarea value={form.description} onChange={(e) => u('description', e.target.value)} rows={2}
                placeholder="What makes this game unique..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50 resize-none" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label className="text-xs text-white/40">Tags:</label>
              <div className="flex flex-wrap gap-1">
                {form.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {tag}
                    <button onClick={() => u('tags', form.tags.filter((_, j) => j !== i))} className="text-white/30 hover:text-white/60">&times;</button>
                  </span>
                ))}
              </div>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="+ add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    u('tags', [...form.tags, tagInput.trim()]);
                    setTagInput('');
                  }
                }}
                className="bg-transparent border-b border-white/10 text-xs text-white px-1 py-0.5 w-24 focus:outline-none" />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/5 px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? 'border-neon-green text-neon-green' : 'border-transparent text-white/40 hover:text-white/60'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-5">
            {activeTab === 'rules' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/40">Game Rules & System Prompt</label>
                  <button onClick={() => setShowVarRef(!showVarRef)} className="text-[10px] text-neon-green/60 hover:text-neon-green">
                    {showVarRef ? 'Hide' : 'Show'} Variable Reference
                  </button>
                </div>
                {showVarRef && (
                  <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {PROMPT_VARIABLES.map((v) => (
                        <div key={v.var} className="flex items-center gap-2">
                          <code className="text-[10px] text-neon-green bg-black/30 px-1.5 py-0.5 rounded font-mono">{v.var}</code>
                          <span className="text-[10px] text-white/40">{v.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <textarea value={form.systemPrompt} onChange={(e) => u('systemPrompt', e.target.value)} rows={14}
                  placeholder="Write the full game prompt here. Use {variables} for dynamic values..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-neon-green/50 resize-y leading-relaxed" />
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <label className="text-xs text-white/40">Min Agents</label>
                    <input type="number" value={form.minAgents} onChange={(e) => u('minAgents', parseInt(e.target.value) || 2)} min={2} max={200}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white ml-2" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40">Max Agents</label>
                    <input type="number" value={form.maxAgents} onChange={(e) => u('maxAgents', parseInt(e.target.value) || 26)} min={2} max={200}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white ml-2" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40">Duration (min)</label>
                    <input type="number" value={form.estimatedDuration} onChange={(e) => u('estimatedDuration', parseInt(e.target.value) || 60)} min={15} max={480}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white ml-2" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Elimination Rule</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ELIMINATION_RULES.map((rule) => (
                      <button key={rule.id} onClick={() => u('eliminationRule', rule.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${form.eliminationRule === rule.id ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 hover:border-white/15'}`}>
                        <div className={`text-sm font-medium ${form.eliminationRule === rule.id ? 'text-neon-green' : 'text-white/70'}`}>{rule.label}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{rule.desc}</div>
                      </button>
                    ))}
                  </div>
                  {(form.eliminationRule === 'FIXED' || form.eliminationRule === 'BOTTOM') && (
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-xs text-white/40">Eliminate exactly</label>
                      <input type="number" value={form.eliminationCount} onChange={(e) => u('eliminationCount', parseInt(e.target.value) || 0)} min={1} max={100}
                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                      <span className="text-xs text-white/40">agents</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Scoring Method</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SCORING_METHODS.map((method) => (
                      <button key={method.id} onClick={() => u('scoringMethod', method.id)}
                        className={`p-3 rounded-xl border transition-all ${form.scoringMethod === method.id ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 hover:border-white/15'}`}>
                        <div className={`text-sm font-medium ${form.scoringMethod === method.id ? 'text-neon-green' : 'text-white/70'}`}>{method.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'credits' && (
              <div>
                <p className="text-xs text-white/40 mb-4">Configure credit rewards for this game type. These can be overridden per-season.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'survive', label: 'Survive Round', icon: '🛡️' },
                    { key: 'win', label: 'Win Game', icon: '🏆' },
                    { key: 'mvp', label: 'MVP Award', icon: '⭐' },
                    { key: 'eliminateStealPct', label: 'Steal % on Eliminate', icon: '🔓' },
                  ].map((reward) => (
                    <div key={reward.key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-lg mb-1">{reward.icon}</div>
                      <div className="text-xs text-white/40 mb-2">{reward.label}</div>
                      <input type="number" value={form.creditRewards[reward.key] || 0}
                        onChange={(e) => uCredit(reward.key, parseInt(e.target.value) || 0)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-lg font-bold text-neon-green text-center" />
                      <div className="text-[10px] text-white/20 text-center mt-1">{reward.key === 'eliminateStealPct' ? 'percent' : 'credits'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'easter' && (
              <div>
                <p className="text-xs text-white/40 mb-4">Attach Easter Eggs to this game. They can trigger randomly or at specific conditions.</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  {easterEggs.map((egg) => {
                    const isAdded = attachedEggs.some((e) => e.easterEggId === egg.id);
                    return (
                      <button key={egg.id} onClick={() => {
                        if (isAdded) setAttachedEggs(attachedEggs.filter((e) => e.easterEggId !== egg.id));
                        else setAttachedEggs([...attachedEggs, { easterEggId: egg.id, probability: 0.1, trigger: 'RANDOM' }]);
                      }}
                        className={`p-3 rounded-xl border text-left transition-all ${isAdded ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 hover:border-white/15'}`}>
                        <div className="text-xl mb-1">{egg.icon}</div>
                        <div className={`text-xs font-medium ${isAdded ? 'text-neon-green' : 'text-white/60'}`}>{egg.name}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{egg.description}</div>
                        {isAdded && <div className="text-[10px] text-neon-green mt-1 font-bold">+ Added</div>}
                      </button>
                    );
                  })}
                  {easterEggs.length === 0 && <p className="text-xs text-white/30 col-span-5">No easter eggs defined yet. Create some in the Easter Eggs page.</p>}
                </div>
                {attachedEggs.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white/50 mb-3">ACTIVE EASTER EGGS</h4>
                    {attachedEggs.map((egg, i) => {
                      const def = easterEggs.find((e) => e.id === egg.easterEggId);
                      return (
                        <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                          <span className="text-lg">{def?.icon}</span>
                          <span className="text-sm text-white/70 flex-1">{def?.name}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-white/30">Chance:</label>
                            <input type="number" value={Math.round(egg.probability * 100)} min={1} max={100}
                              onChange={(e) => {
                                const updated = [...attachedEggs];
                                updated[i] = { ...egg, probability: parseInt(e.target.value) / 100 };
                                setAttachedEggs(updated);
                              }}
                              className="w-14 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white text-center" />
                            <span className="text-[10px] text-white/30">%</span>
                          </div>
                          <select value={egg.trigger} onChange={(e) => {
                            const updated = [...attachedEggs];
                            updated[i] = { ...egg, trigger: e.target.value };
                            setAttachedEggs(updated);
                          }} className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white">
                            {EASTER_EGG_TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-arena-dark to-[#16213e] rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const cat = CATEGORIES.find((c) => c.id === form.category);
                      return cat ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: cat.color + '20', color: cat.color }}>
                          {cat.icon} {cat.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{form.displayTitle || 'UNTITLED'}</h3>
                  <p className="text-sm text-white/50 mt-1">{form.name || 'No name'}</p>
                  <p className="text-sm text-white/60 mt-3">{form.description || 'No description'}</p>
                  <div className="flex gap-6 mt-4 text-xs text-white/40">
                    <span>👥 {form.minAgents}-{form.maxAgents} agents</span>
                    <span>⏱ {form.estimatedDuration} min</span>
                    <span>🎯 {ELIMINATION_RULES.find((r) => r.id === form.eliminationRule)?.label}</span>
                    <span>📊 {SCORING_METHODS.find((m) => m.id === form.scoringMethod)?.label}</span>
                  </div>
                </div>
                {form.systemPrompt && (
                  <div>
                    <h4 className="text-xs font-bold text-white/40 mb-2">PROMPT PREVIEW (with sample variables)</h4>
                    <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {form.systemPrompt
                        .replace(/\{agents_remaining\}/g, '13')
                        .replace(/\{your_name\}/g, 'PRIMUS')
                        .replace(/\{your_credits\}/g, '1,850')
                        .replace(/\{agent_secret_score\}/g, '73')}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
