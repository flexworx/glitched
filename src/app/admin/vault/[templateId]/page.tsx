'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  { id: 'VOTE', label: 'Peer Voting' }, { id: 'SCORE', label: 'Point Score' },
  { id: 'SPEED', label: 'Speed' }, { id: 'SURVIVAL', label: 'Survival' },
  { id: 'ELIMINATION', label: 'Direct Elimination' }, { id: 'POKER', label: 'Chip Stack' },
  { id: 'TERRITORY', label: 'Territory Control' }, { id: 'HYBRID', label: 'Multi-Factor' },
];

const PROMPT_VARIABLES = [
  { var: '{current_game_number}', desc: 'Which game (1-8)' },
  { var: '{agents_remaining}', desc: 'Count of active agents' },
  { var: '{active_agent_names}', desc: 'List of competing agents' },
  { var: '{your_name}', desc: "This agent's name" },
  { var: '{your_credits}', desc: "Agent's credit balance" },
  { var: '{agent_secret_score}', desc: 'Hidden value (chance games)' },
  { var: '{alliance_map}', desc: 'Known alliances' },
  { var: '{veritas_scores}', desc: 'Trust scores' },
];

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [showVarRef, setShowVarRef] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetch(`/api/vault/templates/${templateId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name,
          displayTitle: data.displayTitle,
          category: data.category,
          description: data.description,
          systemPrompt: data.systemPrompt,
          minAgents: data.minAgents,
          maxAgents: data.maxAgents,
          eliminationRule: data.eliminationRule,
          eliminationCount: data.eliminationCount || 0,
          scoringMethod: data.scoringMethod,
          estimatedDuration: data.estimatedDuration,
          tags: data.tags || [],
          creditRewards: (data.creditRewards as Record<string, number>) || {},
          status: data.status,
          version: data.version,
          seasonGames: data.seasonGames || [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [templateId]);

  if (loading || !form) return <div className="p-6 text-white/30">Loading template...</div>;

  const u = (field: string, val: any) => setForm((prev: any) => ({ ...prev, [field]: val }));
  const uCredit = (field: string, val: number) =>
    setForm((prev: any) => ({ ...prev, creditRewards: { ...prev.creditRewards, [field]: val } }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/vault/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          displayTitle: form.displayTitle,
          category: form.category,
          description: form.description,
          systemPrompt: form.systemPrompt,
          minAgents: form.minAgents,
          maxAgents: form.maxAgents,
          eliminationRule: form.eliminationRule,
          eliminationCount: form.eliminationCount || undefined,
          scoringMethod: form.scoringMethod,
          estimatedDuration: form.estimatedDuration,
          tags: form.tags,
          creditRewards: form.creditRewards,
        }),
      });
      router.push('/admin/vault');
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    const res = await fetch(`/api/vault/templates/${templateId}/duplicate`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/vault/${data.id}`);
    }
  };

  const publish = async () => {
    await fetch(`/api/vault/templates/${templateId}/publish`, { method: 'POST' });
    u('status', 'PUBLISHED');
  };

  const tabs = [
    { id: 'rules', label: 'Rules & Prompt' },
    { id: 'scoring', label: 'Scoring & Elimination' },
    { id: 'credits', label: 'Credit Rewards' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-arena-dark border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-arena-dark to-[#16213e] px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Edit: {form.displayTitle}</h2>
                <div className="text-xs text-white/30 mt-1">v{form.version} &middot; {form.status}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push('/admin/vault')}
                  className="px-4 py-2 text-sm text-white/50 border border-white/10 rounded-lg hover:text-white/80">
                  Cancel
                </button>
                <button onClick={duplicate}
                  className="px-4 py-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
                  Duplicate
                </button>
                {form.status !== 'PUBLISHED' && (
                  <button onClick={publish}
                    className="px-4 py-2 text-sm text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/10">
                    Publish
                  </button>
                )}
                <button onClick={save} disabled={saving}
                  className="px-4 py-2 text-sm font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80 disabled:opacity-50">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Game Name</label>
                <input value={form.name} onChange={(e) => u('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Display Title</label>
                <input value={form.displayTitle} onChange={(e) => u('displayTitle', e.target.value)}
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50 resize-none" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label className="text-xs text-white/40">Tags:</label>
              <div className="flex flex-wrap gap-1">
                {form.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {tag}
                    <button onClick={() => u('tags', form.tags.filter((_: any, j: number) => j !== i))} className="text-white/30 hover:text-white/60">&times;</button>
                  </span>
                ))}
              </div>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="+ add tag"
                onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { u('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } }}
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
                  <label className="text-xs text-white/40">System Prompt</label>
                  <button onClick={() => setShowVarRef(!showVarRef)} className="text-[10px] text-neon-green/60 hover:text-neon-green">
                    {showVarRef ? 'Hide' : 'Show'} Variables
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
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-neon-green/50 resize-y leading-relaxed" />
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <label className="text-xs text-white/40">Min Agents</label>
                    <input type="number" value={form.minAgents} onChange={(e) => u('minAgents', parseInt(e.target.value) || 2)}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white ml-2" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40">Max Agents</label>
                    <input type="number" value={form.maxAgents} onChange={(e) => u('maxAgents', parseInt(e.target.value) || 26)}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white ml-2" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40">Duration (min)</label>
                    <input type="number" value={form.estimatedDuration} onChange={(e) => u('estimatedDuration', parseInt(e.target.value) || 60)}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'survive', label: 'Survive Round', icon: '🛡️' },
                  { key: 'win', label: 'Win Game', icon: '🏆' },
                  { key: 'mvp', label: 'MVP Award', icon: '⭐' },
                  { key: 'eliminateStealPct', label: 'Steal %', icon: '🔓' },
                ].map((reward) => (
                  <div key={reward.key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-lg mb-1">{reward.icon}</div>
                    <div className="text-xs text-white/40 mb-2">{reward.label}</div>
                    <input type="number" value={form.creditRewards[reward.key] || 0}
                      onChange={(e) => uCredit(reward.key, parseInt(e.target.value) || 0)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-lg font-bold text-neon-green text-center" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-white/50 mb-3">TEMPLATE INFO</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white/40">Version</div><div className="text-white">{form.version}</div>
                    <div className="text-white/40">Status</div><div className="text-white">{form.status}</div>
                  </div>
                </div>
                {form.seasonGames.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white/50 mb-3">USED IN SEASONS</h4>
                    {form.seasonGames.map((sg: any) => (
                      <div key={sg.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 text-sm">
                        <span className="text-white/70">{sg.season?.name || 'Season'}</span>
                        <span className="text-white/30">Game #{sg.orderIndex}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{sg.status}</span>
                      </div>
                    ))}
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
