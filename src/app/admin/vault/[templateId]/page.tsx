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
const ROUND_OPTIONS = [
  { id: 'early', label: 'Early (R1-2)', color: '#22c55e' },
  { id: 'mid', label: 'Mid (R3-5)', color: '#eab308' },
  { id: 'late', label: 'Late (R6-7)', color: '#f97316' },
  { id: 'finale', label: 'Finale (R8)', color: '#ef4444' },
];
const AGENT_RANGE_OPTIONS = [
  { id: '25+', label: '25+ agents' },
  { id: '10-25', label: '10-25' },
  { id: '6-10', label: '6-10' },
  { id: '3-5', label: '3-5' },
  { id: '2', label: 'Final 2' },
];
const TRIGGER_OPTIONS = ['RANDOM', 'ROUND_START', 'ELIMINATION', 'ALLIANCE_FORMED', 'BETRAYAL', 'SCORE_MILESTONE'];
const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6b7280', TESTING: '#f59e0b', PUBLISHED: '#10b981', ARCHIVED: '#9ca3af',
};

interface EasterEgg {
  id: string;
  probability: number;
  trigger: string;
  easterEgg: { id: string; name: string; description: string; type: string; rarity: string };
}
interface SeasonGame {
  id: string;
  orderIndex: number;
  status: string;
  season?: { name: string };
}
interface TemplateForm {
  name: string;
  displayTitle: string;
  category: string;
  description: string;
  systemPrompt: string;
  minAgents: number;
  maxAgents: number;
  eliminationRule: string;
  eliminationCount: number;
  scoringMethod: string;
  scoringLogic: Record<string, unknown>;
  estimatedDuration: number;
  tags: string[];
  creditRewards: Record<string, number>;
  recommendedRounds: string[];
  recommendedAgents: string[];
  teamFormation: Record<string, unknown>;
  status: string;
  version: number;
  easterEggs: EasterEgg[];
  seasonGames: SeasonGame[];
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const [form, setForm] = useState<TemplateForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [showVarRef, setShowVarRef] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/vault/templates/${templateId}`)
      .then((r) => r.json())
      .then((data) => {
        // API returns { template: {...} } — destructure correctly
        const t = data.template ?? data;
        setForm({
          name: t.name ?? '',
          displayTitle: t.displayTitle ?? '',
          category: t.category ?? 'CUSTOM',
          description: t.description ?? '',
          systemPrompt: t.systemPrompt ?? '',
          minAgents: t.minAgents ?? 2,
          maxAgents: t.maxAgents ?? 26,
          eliminationRule: t.eliminationRule ?? 'HALF',
          eliminationCount: t.eliminationCount ?? 0,
          scoringMethod: t.scoringMethod ?? 'SCORE',
          scoringLogic: (t.scoringLogic as Record<string, unknown>) ?? {},
          estimatedDuration: t.estimatedDuration ?? 60,
          tags: t.tags ?? [],
          creditRewards: (t.creditRewards as Record<string, number>) ?? {},
          recommendedRounds: t.recommendedRounds ?? [],
          recommendedAgents: t.recommendedAgents ?? [],
          teamFormation: (t.teamFormation as Record<string, unknown>) ?? {},
          status: t.status ?? 'DRAFT',
          version: t.version ?? 1,
          easterEggs: (t.easterEggs as EasterEgg[]) ?? [],
          seasonGames: (t.seasonGames as SeasonGame[]) ?? [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [templateId]);

  if (loading || !form) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="text-white/30 text-sm animate-pulse">Loading template...</div>
    </div>
  );

  const u = (field: keyof TemplateForm, val: unknown) =>
    setForm((prev) => prev ? { ...prev, [field]: val } : prev);
  const uCredit = (field: string, val: number) =>
    setForm((prev) => prev ? { ...prev, creditRewards: { ...prev.creditRewards, [field]: val } } : prev);
  const toggleArr = (field: 'recommendedRounds' | 'recommendedAgents', val: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });

  const showToast = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/vault/templates/${templateId}`, {
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
          scoringLogic: form.scoringLogic,
          estimatedDuration: form.estimatedDuration,
          tags: form.tags,
          creditRewards: form.creditRewards,
          recommendedRounds: form.recommendedRounds,
          recommendedAgents: form.recommendedAgents,
          teamFormation: form.teamFormation,
        }),
      });
      if (res.ok) showToast('success', 'Template saved');
      else showToast('error', 'Save failed');
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
    const res = await fetch(`/api/vault/templates/${templateId}/publish`, { method: 'POST' });
    if (res.ok) { u('status', 'PUBLISHED'); showToast('success', 'Template published'); }
  };

  const removeEasterEgg = async (eggId: string) => {
    await fetch(`/api/vault/templates/${templateId}/easter-eggs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ easterEggId: eggId }),
    });
    u('easterEggs', form.easterEggs.filter((e) => e.easterEgg.id !== eggId));
  };

  const catInfo = CATEGORIES.find((c) => c.id === form.category);
  const tabs = [
    { id: 'rules', label: '📋 Rules & Prompt' },
    { id: 'scoring', label: '⚖️ Scoring & Elimination' },
    { id: 'credits', label: '💰 Credit Rewards' },
    { id: 'placement', label: '🗓️ Placement & Teams' },
    { id: 'eggs', label: `🥚 Easter Eggs (${form.easterEggs.length})` },
    { id: 'info', label: 'ℹ️ Info' },
  ];

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-neon-green text-black' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="bg-arena-dark border border-white/10 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-arena-dark to-[#16213e] px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => router.push('/admin/vault')}
                  className="text-white/40 hover:text-white/80 text-sm shrink-0">← Back</button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{catInfo?.icon ?? '⚡'}</span>
                    <h2 className="text-lg font-bold text-white truncate">{form.displayTitle || form.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border shrink-0"
                      style={{ color: STATUS_COLORS[form.status], borderColor: STATUS_COLORS[form.status] + '40' }}>
                      {form.status}
                    </span>
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">v{form.version} · {form.seasonGames.length} season uses</div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={duplicate}
                  className="px-3 py-1.5 text-xs text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
                  Duplicate
                </button>
                {form.status !== 'PUBLISHED' && (
                  <button onClick={publish}
                    className="px-3 py-1.5 text-xs text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/10">
                    Publish
                  </button>
                )}
                <button onClick={save} disabled={saving}
                  className="px-4 py-1.5 text-xs font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Internal Name</label>
                <input value={form.name} onChange={(e) => u('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Display Title (shown to viewers)</label>
                <input value={form.displayTitle} onChange={(e) => u('displayTitle', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white uppercase tracking-widest focus:outline-none focus:border-neon-green/50" />
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
              <label className="block text-xs text-white/40 mb-1">Short Description (shown on vault card)</label>
              <textarea value={form.description} onChange={(e) => u('description', e.target.value)} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50 resize-none" />
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
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
                onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { u('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } }}
                className="bg-transparent border-b border-white/10 text-xs text-white px-1 py-0.5 w-24 focus:outline-none" />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/5 px-6 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-neon-green text-neon-green' : 'border-transparent text-white/40 hover:text-white/60'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-5">

            {/* ── RULES & PROMPT ── */}
            {activeTab === 'rules' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/40 font-medium">Agent System Prompt</label>
                  <button onClick={() => setShowVarRef(!showVarRef)} className="text-[10px] text-neon-green/60 hover:text-neon-green">
                    {showVarRef ? 'Hide' : 'Show'} Variables
                  </button>
                </div>
                {showVarRef && (
                  <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {PROMPT_VARIABLES.map((v) => (
                        <div key={v.var} className="flex items-center gap-2">
                          <code className="text-[10px] text-neon-green font-mono">{v.var}</code>
                          <span className="text-[10px] text-white/40">{v.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <textarea value={form.systemPrompt} onChange={(e) => u('systemPrompt', e.target.value)} rows={16}
                  placeholder="Write the game rules and instructions for agents here. Use variables like {your_name}, {agents_remaining}, etc."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-neon-green/50 resize-y leading-relaxed placeholder:text-white/20" />
                <div className="flex items-center gap-6 mt-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40">Min Agents</label>
                    <input type="number" min={2} max={26} value={form.minAgents} onChange={(e) => u('minAgents', parseInt(e.target.value) || 2)}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40">Max Agents</label>
                    <input type="number" min={2} max={26} value={form.maxAgents} onChange={(e) => u('maxAgents', parseInt(e.target.value) || 26)}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40">Est. Duration (min)</label>
                    <input type="number" min={5} value={form.estimatedDuration} onChange={(e) => u('estimatedDuration', parseInt(e.target.value) || 60)}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center" />
                  </div>
                </div>
              </div>
            )}

            {/* ── SCORING & ELIMINATION ── */}
            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-white/40 mb-2 block font-medium">Elimination Rule</label>
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
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs text-white/40">Elimination Count</label>
                      <input type="number" min={1} value={form.eliminationCount}
                        onChange={(e) => u('eliminationCount', parseInt(e.target.value) || 1)}
                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-center" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block font-medium">Scoring Method</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SCORING_METHODS.map((method) => (
                      <button key={method.id} onClick={() => u('scoringMethod', method.id)}
                        className={`p-3 rounded-xl border transition-all ${form.scoringMethod === method.id ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 hover:border-white/15'}`}>
                        <div className={`text-sm font-medium ${form.scoringMethod === method.id ? 'text-neon-green' : 'text-white/70'}`}>{method.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block font-medium">Scoring Logic (JSON config)</label>
                  <textarea
                    value={JSON.stringify(form.scoringLogic, null, 2)}
                    onChange={(e) => { try { u('scoringLogic', JSON.parse(e.target.value)); } catch { /* invalid JSON — ignore */ } }}
                    rows={6}
                    placeholder='{"pointsPerRound": 10, "bonusForFirst": 50}'
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-neon-green/50 resize-y" />
                </div>
              </div>
            )}

            {/* ── CREDIT REWARDS ── */}
            {activeTab === 'credits' && (
              <div>
                <p className="text-xs text-white/40 mb-4">Set how many $MURPH credits agents earn for each outcome in this game.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'survive', label: 'Survive Round', icon: '🛡️', desc: 'Per round survived' },
                    { key: 'win', label: 'Win Game', icon: '🏆', desc: 'First place prize' },
                    { key: 'mvp', label: 'MVP Award', icon: '⭐', desc: 'Most dramatic agent' },
                    { key: 'eliminateStealPct', label: 'Steal % on Elim', icon: '🔓', desc: '% of eliminated agent credits' },
                    { key: 'alliance', label: 'Alliance Bonus', icon: '🤝', desc: 'Forming an alliance' },
                    { key: 'betrayal', label: 'Betrayal Bonus', icon: '🗡️', desc: 'Successful betrayal' },
                    { key: 'wildcard', label: 'Wildcard Trigger', icon: '🃏', desc: 'Triggering a wildcard' },
                    { key: 'participation', label: 'Participation', icon: '🎮', desc: 'Just for playing' },
                  ].map((reward) => (
                    <div key={reward.key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-2xl mb-1">{reward.icon}</div>
                      <div className="text-xs text-white/60 font-medium">{reward.label}</div>
                      <div className="text-[10px] text-white/30 mb-2">{reward.desc}</div>
                      <input type="number" min={0} value={form.creditRewards[reward.key] ?? 0}
                        onChange={(e) => uCredit(reward.key, parseInt(e.target.value) || 0)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-lg font-bold text-neon-green text-center focus:outline-none focus:border-neon-green/50" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PLACEMENT & TEAMS ── */}
            {activeTab === 'placement' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-white/40 mb-2 block font-medium">Recommended Season Rounds</label>
                  <p className="text-[10px] text-white/30 mb-3">Which rounds of the season is this game best suited for?</p>
                  <div className="flex gap-2 flex-wrap">
                    {ROUND_OPTIONS.map((r) => (
                      <button key={r.id} onClick={() => toggleArr('recommendedRounds', r.id)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${form.recommendedRounds.includes(r.id) ? 'border-current' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                        style={form.recommendedRounds.includes(r.id) ? { color: r.color, borderColor: r.color, background: r.color + '15' } : {}}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block font-medium">Recommended Agent Count</label>
                  <p className="text-[10px] text-white/30 mb-3">Which agent counts does this game work best with?</p>
                  <div className="flex gap-2 flex-wrap">
                    {AGENT_RANGE_OPTIONS.map((a) => (
                      <button key={a.id} onClick={() => toggleArr('recommendedAgents', a.id)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${form.recommendedAgents.includes(a.id) ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block font-medium">Team Formation Config (JSON)</label>
                  <p className="text-[10px] text-white/30 mb-2">Rules for handling odd/even agent counts, team sizes, pairing logic.</p>
                  <textarea
                    value={JSON.stringify(form.teamFormation, null, 2)}
                    onChange={(e) => { try { u('teamFormation', JSON.parse(e.target.value)); } catch { /* ignore */ } }}
                    rows={5}
                    placeholder='{"teamSize": 2, "allowOdd": true, "oddHandling": "bye"}'
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-neon-green/50 resize-y" />
                </div>
              </div>
            )}

            {/* ── EASTER EGGS ── */}
            {activeTab === 'eggs' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">Easter Eggs</h4>
                    <p className="text-xs text-white/40 mt-0.5">Hidden events that can trigger during this game</p>
                  </div>
                  <button
                    onClick={() => router.push('/admin/vault/easter-eggs')}
                    className="px-3 py-1.5 text-xs text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/10">
                    Manage Egg Library →
                  </button>
                </div>
                {form.easterEggs.length === 0 ? (
                  <div className="text-center py-12 text-white/20">
                    <div className="text-4xl mb-3">🥚</div>
                    <div className="text-sm">No easter eggs attached to this template</div>
                    <div className="text-xs mt-1">Add them from the Easter Egg Library</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.easterEggs.map((ee) => (
                      <div key={ee.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{ee.easterEgg.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">{ee.easterEgg.rarity}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{ee.easterEgg.type}</span>
                          </div>
                          <div className="text-xs text-white/40 mt-0.5 truncate">{ee.easterEgg.description}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-white/40">Trigger: <span className="text-white/60">{ee.trigger}</span></div>
                          <div className="text-xs text-white/40">Prob: <span className="text-neon-green">{(ee.probability * 100).toFixed(0)}%</span></div>
                        </div>
                        <button onClick={() => removeEasterEgg(ee.easterEgg.id)}
                          className="text-white/20 hover:text-red-400 text-lg leading-none shrink-0">&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── INFO ── */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">Template Details</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-white/40">Version</div><div className="text-white">v{form.version}</div>
                    <div className="text-white/40">Status</div>
                    <div style={{ color: STATUS_COLORS[form.status] }}>{form.status}</div>
                    <div className="text-white/40">Category</div><div className="text-white">{catInfo?.icon} {catInfo?.label}</div>
                    <div className="text-white/40">Min / Max Agents</div><div className="text-white">{form.minAgents} – {form.maxAgents}</div>
                    <div className="text-white/40">Est. Duration</div><div className="text-white">{form.estimatedDuration} min</div>
                    <div className="text-white/40">Elimination Rule</div><div className="text-white">{form.eliminationRule}</div>
                    <div className="text-white/40">Scoring Method</div><div className="text-white">{form.scoringMethod}</div>
                    <div className="text-white/40">Easter Eggs</div><div className="text-white">{form.easterEggs.length}</div>
                    <div className="text-white/40">Season Uses</div><div className="text-white">{form.seasonGames.length}</div>
                  </div>
                </div>
                {form.seasonGames.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">Used in Seasons</h4>
                    <div className="space-y-1">
                      {form.seasonGames.map((sg) => (
                        <div key={sg.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 text-sm">
                          <span className="text-white/70">{sg.season?.name ?? 'Unknown Season'}</span>
                          <span className="text-white/30">Game #{sg.orderIndex + 1}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{sg.status}</span>
                        </div>
                      ))}
                    </div>
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
