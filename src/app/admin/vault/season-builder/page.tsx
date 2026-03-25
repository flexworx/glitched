'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORIES: Record<string, { icon: string; color: string }> = {
  CHANCE: { icon: '🎲', color: '#f59e0b' },
  INTELLIGENCE: { icon: '🧠', color: '#3b82f6' },
  SOCIAL: { icon: '🤝', color: '#ec4899' },
  STRATEGY: { icon: '♟️', color: '#8b5cf6' },
  PERFORMANCE: { icon: '🎭', color: '#10b981' },
  POKER: { icon: '🃏', color: '#ef4444' },
  ENDURANCE: { icon: '🏃', color: '#06b6d4' },
  CUSTOM: { icon: '⚡', color: '#f97316' },
};

interface Template {
  id: string;
  name: string;
  displayTitle: string;
  category: string;
  description: string;
  minAgents: number;
  maxAgents: number;
  eliminationRule: string;
}

interface SeasonGameEntry {
  templateId: string;
  eliminationOverride: number;
  durationOverride?: number;
}

interface Season {
  id: string;
  number: number;
  name: string;
}

export default function SeasonBuilderPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [games, setGames] = useState<SeasonGameEntry[]>([]);
  const [startAgents, setStartAgents] = useState(26);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/vault/templates?status=PUBLISHED').then((r) => r.json()),
      fetch('/api/seasons').then((r) => r.json()),
    ]).then(([tplData, seasonData]) => {
      setTemplates(tplData.templates || []);
      setSeasons(seasonData.seasons || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Load existing season game plan when season is selected
  useEffect(() => {
    if (!selectedSeasonId) return;
    fetch(`/api/vault/seasons/${selectedSeasonId}/games`)
      .then((r) => r.json())
      .then((data) => {
        if (data.games?.length > 0) {
          setGames(data.games.map((g: any) => ({
            templateId: g.templateId,
            eliminationOverride: g.eliminationOverride || 1,
            durationOverride: g.durationOverride,
          })));
        }
      })
      .catch(() => {});
  }, [selectedSeasonId]);

  const moveGame = (from: number, to: number) => {
    const updated = [...games];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setGames(updated);
  };

  const addGame = (templateId: string) => {
    setGames([...games, { templateId, eliminationOverride: 1 }]);
    setShowPicker(false);
  };

  const saveSeason = async () => {
    if (!selectedSeasonId) return;
    setSaving(true);
    try {
      // Clear existing games via reorder with empty, then add new ones
      for (let i = 0; i < games.length; i++) {
        await fetch(`/api/vault/seasons/${selectedSeasonId}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: games[i].templateId,
            orderIndex: i + 1,
            eliminationOverride: games[i].eliminationOverride,
            durationOverride: games[i].durationOverride,
          }),
        });
      }
      alert('Season saved!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-white/30">Loading...</div>;

  let runningAgents = startAgents;

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-arena-dark border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-arena-dark to-[#16213e] px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">📋 Season Builder</h2>
              <p className="text-xs text-white/40 mt-1">Drag games to reorder. Configure elimination counts per game.</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-white/40">Season</label>
                <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(e.target.value)}
                  className="ml-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white">
                  <option value="">Select season</option>
                  {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40">Starting Agents</label>
                <input type="number" value={startAgents} onChange={(e) => setStartAgents(parseInt(e.target.value) || 26)} min={4} max={200}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white ml-2" />
              </div>
              <Link href="/admin/vault" className="px-4 py-2 text-sm text-white/50 border border-white/10 rounded-lg hover:text-white/80">Back</Link>
              <button onClick={saveSeason} disabled={saving || !selectedSeasonId}
                className="px-4 py-2 text-sm font-bold text-black bg-neon-green rounded-lg disabled:opacity-50">Save Season</button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-2">
              {games.map((game, idx) => {
                const tpl = templates.find((t) => t.id === game.templateId);
                const agentsBefore = runningAgents;
                const eliminated = game.eliminationOverride || 0;
                const agentsAfter = Math.max(1, agentsBefore - eliminated);
                runningAgents = agentsAfter;
                const cat = tpl ? CATEGORIES[tpl.category] : null;

                return (
                  <div key={idx} draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragEnd={() => setDragIdx(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragIdx !== null && dragIdx !== idx) {
                        moveGame(dragIdx, idx);
                        setDragIdx(idx);
                      }
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${dragIdx === idx ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 bg-white/[0.02] hover:border-white/15'}`}>
                    <div className="text-white/20 cursor-grab text-lg">⠿</div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg font-bold text-white/30">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{tpl?.displayTitle || 'Select Game'}</span>
                        {cat && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: cat.color + '20', color: cat.color }}>
                            {cat.icon} {tpl?.category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{tpl?.name}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/30">Agents</div>
                      <div className="text-sm font-bold">
                        <span className="text-white/70">{agentsBefore}</span>
                        <span className="text-white/20 mx-1">&rarr;</span>
                        <span className="text-neon-green">{agentsAfter}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/30">Eliminate</div>
                      <input type="number" value={eliminated} min={0} max={agentsBefore - 1}
                        onChange={(e) => {
                          const updated = [...games];
                          updated[idx] = { ...game, eliminationOverride: parseInt(e.target.value) || 0 };
                          setGames(updated);
                        }}
                        className="w-12 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-red-400 font-bold text-center" />
                    </div>
                    <button onClick={() => setGames(games.filter((_, i) => i !== idx))}
                      className="text-white/20 hover:text-red-400 text-sm">&times;</button>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowPicker(true)}
              className="w-full mt-3 py-3 border border-dashed border-white/10 rounded-xl text-sm text-white/30 hover:text-white/50 hover:border-white/20 transition-all">
              + Add Game from Vault
            </button>

            {/* Flow visualization */}
            <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-2">
              <div className="flex-shrink-0 bg-neon-green/10 border border-neon-green/30 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-neon-green">{startAgents}</div>
                <div className="text-[10px] text-white/40">START</div>
              </div>
              {(() => {
                let running = startAgents;
                return games.map((game, idx) => {
                  const tpl = templates.find((t) => t.id === game.templateId);
                  const before = running;
                  running = Math.max(1, before - (game.eliminationOverride || 0));
                  const cat = tpl ? CATEGORIES[tpl.category] : null;
                  return (
                    <div key={idx} className="flex items-center gap-1 flex-shrink-0">
                      <div className="text-white/15 text-xs">&rarr;</div>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center min-w-[60px]">
                        <div className="text-[10px] text-white/30">G{idx + 1}</div>
                        <div className="text-xs font-bold text-white/60">{before}&rarr;{running}</div>
                        {cat && <div className="text-[8px]" style={{ color: cat.color }}>{tpl?.category?.slice(0, 5)}</div>}
                      </div>
                    </div>
                  );
                });
              })()}
              <div className="flex-shrink-0 flex items-center gap-1">
                <div className="text-white/15 text-xs">&rarr;</div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg">🏆</div>
                  <div className="text-[10px] text-yellow-400">CHAMPION</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Picker Modal — Pick from Vault or Create New */}
        {showPicker && (
          <PickerModal
            templates={templates}
            categories={CATEGORIES}
            currentAgentCount={(() => {
              let r = startAgents;
              for (const g of games) r = Math.max(1, r - (g.eliminationOverride || 0));
              return r;
            })()}
            onPick={(id) => addGame(id)}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Picker Modal ─────────────────────────────────────────────

function PickerModal({ templates, categories, currentAgentCount, onPick, onClose }: {
  templates: Template[];
  categories: Record<string, { icon: string; color: string }>;
  currentAgentCount: number;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'vault' | 'ai'>('vault');
  const [filterRound, setFilterRound] = useState('ALL');
  const [aiDesc, setAiDesc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Auto-determine recommended round based on agent count
  const suggestedRound = currentAgentCount > 20 ? 'early' : currentAgentCount > 8 ? 'mid' : currentAgentCount > 3 ? 'late' : 'finale';
  const suggestedAgentRange = currentAgentCount > 25 ? '25+' : currentAgentCount > 10 ? '10-25' : currentAgentCount > 5 ? '6-10' : currentAgentCount > 2 ? '3-5' : '2';

  const sorted = useMemo(() => {
    let list = [...templates];
    if (filterRound !== 'ALL') {
      list = list.filter((t: any) => (t.recommendedRounds || []).includes(filterRound));
    }
    // Sort: recommended for current agent count first
    list.sort((a: any, b: any) => {
      const aMatch = (a.recommendedAgents || []).includes(suggestedAgentRange) ? 1 : 0;
      const bMatch = (b.recommendedAgents || []).includes(suggestedAgentRange) ? 1 : 0;
      return bMatch - aMatch;
    });
    return list;
  }, [templates, filterRound, suggestedAgentRange]);

  const generateGame = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/vault/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiDesc }),
      });
      const data = await res.json();
      if (res.ok) setAiResult(data.template);
      else alert(data.error || 'Generation failed');
    } catch { alert('Generation failed'); }
    finally { setAiLoading(false); }
  };

  const saveAndPick = async () => {
    if (!aiResult) return;
    const res = await fetch('/api/vault/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...aiResult, status: 'PUBLISHED' }),
    });
    if (res.ok) {
      const data = await res.json();
      onPick(data.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-arena-dark border border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header with tabs */}
        <div className="px-6 pt-5 pb-0 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Add Game to Season</h3>
            <div className="text-xs text-white/30">
              ~{currentAgentCount} agents remaining &middot; Suggested: <span className="text-neon-green">{suggestedRound}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setTab('vault')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === 'vault' ? 'border-neon-green text-neon-green' : 'border-transparent text-white/40 hover:text-white/60'}`}>
              📚 Pick from Vault
            </button>
            <button onClick={() => setTab('ai')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === 'ai' ? 'border-purple-400 text-purple-400' : 'border-transparent text-white/40 hover:text-white/60'}`}>
              🤖 AI Create New
            </button>
            <Link href="/admin/vault/new" className="px-4 py-2.5 text-sm font-medium text-white/40 hover:text-white/60 border-b-2 border-transparent">
              ✏️ Manual Create
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'vault' && (
            <div>
              {/* Round filter */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-white/30">Filter:</span>
                {['ALL', 'early', 'mid', 'late', 'finale'].map((r) => (
                  <button key={r} onClick={() => setFilterRound(r)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${filterRound === r ? 'border-neon-green/50 bg-neon-green/10 text-neon-green' : 'border-white/5 text-white/40 hover:border-white/15'}`}>
                    {r === 'ALL' ? 'All' : r}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {sorted.map((tpl) => {
                  const cat = categories[tpl.category];
                  const isRecommended = (tpl as any).recommendedAgents?.includes(suggestedAgentRange);
                  return (
                    <button key={tpl.id} onClick={() => onPick(tpl.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${isRecommended ? 'border-neon-green/20 bg-neon-green/[0.03]' : 'border-white/5'} hover:border-neon-green/30 hover:bg-neon-green/5`}>
                      <div className="text-2xl">{cat?.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{tpl.displayTitle}</span>
                          {isRecommended && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20">Recommended</span>}
                        </div>
                        <div className="text-xs text-white/40">{tpl.name} &middot; {tpl.minAgents}-{tpl.maxAgents} agents</div>
                        <div className="text-xs text-white/30 mt-0.5 line-clamp-1">{tpl.description}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: (cat?.color || '#fff') + '20', color: cat?.color }}>
                        {tpl.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div>
              <p className="text-xs text-white/40 mb-3">
                Describe a game and the Game Master will generate a complete template, then add it to your season.
              </p>
              <textarea value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} rows={3}
                placeholder={`e.g. A negotiation game for ${currentAgentCount} agents where they trade resources and form temporary alliances...`}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none mb-3"
                disabled={aiLoading} />

              {!aiResult && (
                <button onClick={generateGame} disabled={aiLoading || !aiDesc.trim()}
                  className="w-full py-3 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">
                  {aiLoading ? '🤖 Game Master is thinking...' : '⚡ Generate & Add to Season'}
                </button>
              )}

              {aiResult && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mt-2">
                  <h4 className="text-lg font-bold text-white">{aiResult.displayTitle}</h4>
                  <p className="text-sm text-white/50">{aiResult.name}</p>
                  <p className="text-xs text-white/40 mt-2">{aiResult.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setAiResult(null)} className="flex-1 py-2 text-xs text-white/50 border border-white/10 rounded-lg">
                      Regenerate
                    </button>
                    <button onClick={saveAndPick} className="flex-1 py-2 text-xs font-bold text-black bg-neon-green rounded-lg">
                      Add to Season
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
