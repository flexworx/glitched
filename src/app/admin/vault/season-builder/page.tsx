'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  estimatedDuration: number;
  recommendedRounds: string[];
  recommendedAgents: string[];
}

interface SeasonGameEntry {
  id?: string;
  templateId: string;
  eliminationOverride: number;
  durationOverride?: number;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  promptOverride?: string;
  status?: string;
}

interface Season {
  id: string;
  number: number;
  name: string;
  status: string;
  startedAt?: string;
  endedAt?: string;
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(val: string) {
  if (!val) return undefined;
  return new Date(val).toISOString();
}

export default function SeasonBuilderPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [games, setGames] = useState<SeasonGameEntry[]>([]);
  const [startAgents, setStartAgents] = useState(26);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

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

  useEffect(() => {
    if (!selectedSeasonId) return;
    fetch(`/api/vault/seasons/${selectedSeasonId}/games`)
      .then((r) => r.json())
      .then((data) => {
        if (data.games?.length > 0) {
          setGames(data.games.map((g: Record<string, unknown>) => ({
            id: g.id as string,
            templateId: g.templateId as string,
            eliminationOverride: (g.eliminationOverride as number) || 1,
            durationOverride: g.durationOverride as number | undefined,
            scheduledStartAt: g.scheduledStartAt as string | undefined,
            scheduledEndAt: g.scheduledEndAt as string | undefined,
            promptOverride: g.promptOverride as string | undefined,
            status: g.status as string,
          })));
        } else {
          setGames([]);
        }
      })
      .catch(() => {});
  }, [selectedSeasonId]);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  const moveGame = (from: number, to: number) => {
    const updated = [...games];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setGames(updated);
  };

  const addGame = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    setGames([...games, {
      templateId,
      eliminationOverride: 1,
      durationOverride: tpl?.estimatedDuration,
    }]);
    setShowPicker(false);
  };

  const updateGame = (idx: number, patch: Partial<SeasonGameEntry>) => {
    const updated = [...games];
    updated[idx] = { ...updated[idx], ...patch };
    setGames(updated);
  };

  const saveSeason = async () => {
    if (!selectedSeasonId) return;
    setSaving(true);
    try {
      // Delete all existing games first, then re-create in order
      const existing = await fetch(`/api/vault/seasons/${selectedSeasonId}/games`).then((r) => r.json());
      for (const g of (existing.games || [])) {
        await fetch(`/api/vault/seasons/${selectedSeasonId}/games/${g.id}`, { method: 'DELETE' });
      }
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        await fetch(`/api/vault/seasons/${selectedSeasonId}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: game.templateId,
            orderIndex: i,
            eliminationOverride: game.eliminationOverride || undefined,
            durationOverride: game.durationOverride || undefined,
            scheduledStartAt: game.scheduledStartAt || undefined,
            scheduledEndAt: game.scheduledEndAt || undefined,
            promptOverride: game.promptOverride || undefined,
          }),
        });
      }
      showToast('success', 'Season game plan saved!');
    } catch {
      showToast('error', 'Failed to save season');
    } finally {
      setSaving(false);
    }
  };

  const activateSeason = async () => {
    if (!selectedSeasonId) return;
    if (!confirm('Activate this season? This will make it LIVE and visible in the Arena.')) return;
    setActivating(true);
    try {
      const res = await fetch(`/api/seasons/${selectedSeasonId}/activate`, { method: 'POST' });
      if (res.ok) {
        showToast('success', '🚀 Season is now LIVE! Visible in Arena.');
        // Refresh seasons list
        const data = await fetch('/api/seasons').then((r) => r.json());
        setSeasons(data.seasons || []);
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Activation failed');
      }
    } finally {
      setActivating(false);
    }
  };

  if (loading) return <div className="p-6 text-white/30">Loading...</div>;

  let runningAgents = startAgents;

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${toast.type === 'success' ? 'bg-neon-green text-black' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-arena-dark border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-arena-dark to-[#16213e] px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">📋 Season Builder</h2>
                <p className="text-xs text-white/40 mt-1">Drag to reorder games. Set start/end times. Activate to go live.</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="text-xs text-white/40 mr-1">Season</label>
                  <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white">
                    <option value="">Select season</option>
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} [{s.status}]</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mr-1">Starting Agents</label>
                  <input type="number" value={startAgents} onChange={(e) => setStartAgents(parseInt(e.target.value) || 26)}
                    min={4} max={200}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center" />
                </div>
                <Link href="/admin/vault" className="px-3 py-1.5 text-xs text-white/50 border border-white/10 rounded-lg hover:text-white/80">Back</Link>
                <button onClick={saveSeason} disabled={saving || !selectedSeasonId}
                  className="px-4 py-1.5 text-xs font-bold text-black bg-neon-green rounded-lg disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Plan'}
                </button>
                {selectedSeason && selectedSeason.status === 'UPCOMING' && (
                  <button onClick={activateSeason} disabled={activating || games.length === 0}
                    className="px-4 py-1.5 text-xs font-bold text-black bg-orange-400 rounded-lg disabled:opacity-50 flex items-center gap-1">
                    {activating ? '⏳ Activating…' : '🚀 Activate Season'}
                  </button>
                )}
                {selectedSeason && selectedSeason.status === 'ACTIVE' && (
                  <span className="px-3 py-1.5 text-xs font-bold text-neon-green border border-neon-green/30 rounded-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse inline-block" />
                    LIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Season status banner */}
          {selectedSeason && (
            <div className={`px-6 py-2 text-xs flex items-center gap-3 ${selectedSeason.status === 'ACTIVE' ? 'bg-neon-green/10 border-b border-neon-green/20' : selectedSeason.status === 'UPCOMING' ? 'bg-yellow-500/10 border-b border-yellow-500/20' : 'bg-white/5 border-b border-white/5'}`}>
              <span className={`font-bold ${selectedSeason.status === 'ACTIVE' ? 'text-neon-green' : selectedSeason.status === 'UPCOMING' ? 'text-yellow-400' : 'text-white/40'}`}>
                {selectedSeason.status === 'ACTIVE' ? '● LIVE NOW' : selectedSeason.status === 'UPCOMING' ? '⏳ UPCOMING' : selectedSeason.status}
              </span>
              <span className="text-white/30">{selectedSeason.name}</span>
              {selectedSeason.status === 'UPCOMING' && games.length > 0 && (
                <span className="text-white/30">· {games.length} games scheduled · Click "Activate Season" to go live</span>
              )}
              {selectedSeason.status === 'ACTIVE' && (
                <span className="text-white/30">· Visible in Arena at <Link href="/arena" className="text-neon-green hover:underline">/arena</Link></span>
              )}
            </div>
          )}

          {/* Game List */}
          <div className="px-6 py-4">
            {games.length === 0 && selectedSeasonId && (
              <div className="text-center py-12 text-white/20">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-sm">No games scheduled yet</div>
                <div className="text-xs mt-1">Click "+ Add Game from Vault" to build the season</div>
              </div>
            )}
            {games.length === 0 && !selectedSeasonId && (
              <div className="text-center py-12 text-white/20">
                <div className="text-sm">Select a season above to start building</div>
              </div>
            )}

            <div className="space-y-2">
              {games.map((game, idx) => {
                const tpl = templates.find((t) => t.id === game.templateId);
                const agentsBefore = runningAgents;
                const eliminated = game.eliminationOverride || 0;
                const agentsAfter = Math.max(1, agentsBefore - eliminated);
                runningAgents = agentsAfter;
                const cat = tpl ? CATEGORIES[tpl.category] : null;
                const isExpanded = expandedIdx === idx;

                return (
                  <div key={idx}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragEnd={() => setDragIdx(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragIdx !== null && dragIdx !== idx) {
                        moveGame(dragIdx, idx);
                        setDragIdx(idx);
                      }
                    }}
                    className={`rounded-xl border transition-all ${dragIdx === idx ? 'border-neon-green/50 bg-neon-green/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>

                    {/* Compact row */}
                    <div className="flex items-center gap-3 p-3">
                      <div className="text-white/20 cursor-grab text-lg">⠿</div>
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-white/40 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{tpl?.displayTitle || 'Unknown Game'}</span>
                          {cat && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: cat.color + '20', color: cat.color }}>
                              {cat.icon} {tpl?.category}
                            </span>
                          )}
                          {game.status && game.status !== 'DRAFT' && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${game.status === 'COMPLETED' ? 'bg-neon-green/20 text-neon-green' : game.status === 'ACTIVE' ? 'bg-orange-400/20 text-orange-400' : 'bg-white/10 text-white/40'}`}>
                              {game.status}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/30 mt-0.5 truncate">
                          {game.scheduledStartAt
                            ? `Starts ${new Date(game.scheduledStartAt).toLocaleString()}`
                            : 'No start time set'}
                          {game.scheduledEndAt && ` · Ends ${new Date(game.scheduledEndAt).toLocaleString()}`}
                        </div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="text-[10px] text-white/30">Agents</div>
                        <div className="text-xs font-bold">
                          <span className="text-white/60">{agentsBefore}</span>
                          <span className="text-white/20 mx-0.5">→</span>
                          <span className="text-neon-green">{agentsAfter}</span>
                        </div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="text-[10px] text-white/30">Elim</div>
                        <input type="number" value={eliminated} min={0} max={agentsBefore - 1}
                          onChange={(e) => updateGame(idx, { eliminationOverride: parseInt(e.target.value) || 0 })}
                          className="w-10 bg-black/30 border border-white/10 rounded px-1 py-0.5 text-xs text-red-400 font-bold text-center" />
                      </div>
                      <button onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        className="text-white/30 hover:text-white/70 text-xs px-2 py-1 border border-white/10 rounded shrink-0">
                        {isExpanded ? '▲' : '▼'} Edit
                      </button>
                      <button onClick={() => setGames(games.filter((_, i) => i !== idx))}
                        className="text-white/20 hover:text-red-400 text-base leading-none shrink-0">&times;</button>
                    </div>

                    {/* Expanded edit panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-white/40 mb-1">Scheduled Start Time</label>
                            <input type="datetime-local"
                              value={toDatetimeLocal(game.scheduledStartAt)}
                              onChange={(e) => updateGame(idx, { scheduledStartAt: fromDatetimeLocal(e.target.value) })}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
                          </div>
                          <div>
                            <label className="block text-xs text-white/40 mb-1">Scheduled End Time</label>
                            <input type="datetime-local"
                              value={toDatetimeLocal(game.scheduledEndAt)}
                              onChange={(e) => updateGame(idx, { scheduledEndAt: fromDatetimeLocal(e.target.value) })}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
                          </div>
                          <div>
                            <label className="block text-xs text-white/40 mb-1">Duration Override (min)</label>
                            <input type="number" min={5}
                              value={game.durationOverride ?? tpl?.estimatedDuration ?? 60}
                              onChange={(e) => updateGame(idx, { durationOverride: parseInt(e.target.value) || undefined })}
                              placeholder={`Default: ${tpl?.estimatedDuration ?? 60} min`}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
                          </div>
                          <div>
                            <label className="block text-xs text-white/40 mb-1">Eliminations This Game</label>
                            <input type="number" min={0} max={agentsBefore - 1}
                              value={game.eliminationOverride}
                              onChange={(e) => updateGame(idx, { eliminationOverride: parseInt(e.target.value) || 0 })}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-red-400 font-bold focus:outline-none focus:border-red-400/50" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-white/40 mb-1">Prompt Override (optional — overrides template prompt for this game only)</label>
                          <textarea
                            value={game.promptOverride ?? ''}
                            onChange={(e) => updateGame(idx, { promptOverride: e.target.value || undefined })}
                            rows={3}
                            placeholder="Leave blank to use the template's default system prompt…"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-neon-green/50 resize-none placeholder:text-white/20" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowPicker(true)}
              className="w-full mt-3 py-3 border border-dashed border-white/10 rounded-xl text-sm text-white/30 hover:text-white/50 hover:border-white/20 transition-all">
              + Add Game from Vault
            </button>

            {/* Flow visualization */}
            {games.length > 0 && (
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
                        <div className="text-white/15 text-xs">→</div>
                        <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center min-w-[64px]">
                          <div className="text-[10px] text-white/30">G{idx + 1}</div>
                          <div className="text-xs font-bold text-white/60">{before}→{running}</div>
                          {cat && <div className="text-[8px]" style={{ color: cat.color }}>{tpl?.category?.slice(0, 5)}</div>}
                          {game.scheduledStartAt && (
                            <div className="text-[8px] text-white/20 mt-0.5">
                              {new Date(game.scheduledStartAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
                <div className="flex-shrink-0 flex items-center gap-1">
                  <div className="text-white/15 text-xs">→</div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-center">
                    <div className="text-lg">🏆</div>
                    <div className="text-[10px] text-yellow-400">CHAMPION</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template Picker Modal */}
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
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);

  const suggestedRound = currentAgentCount > 20 ? 'early' : currentAgentCount > 8 ? 'mid' : currentAgentCount > 3 ? 'late' : 'finale';
  const suggestedAgentRange = currentAgentCount > 25 ? '25+' : currentAgentCount > 10 ? '10-25' : currentAgentCount > 5 ? '6-10' : currentAgentCount > 2 ? '3-5' : '2';

  const sorted = useMemo(() => {
    let list = [...templates];
    if (filterRound !== 'ALL') {
      list = list.filter((t) => (t.recommendedRounds || []).includes(filterRound));
    }
    list.sort((a, b) => {
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
      if (res.ok) setAiResult(data.template as Record<string, unknown>);
    } finally {
      setAiLoading(false);
    }
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
        <div className="px-6 pt-5 pb-0 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Add Game to Season</h3>
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/30">
                ~{currentAgentCount} agents · Suggested: <span className="text-neon-green">{suggestedRound}</span>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl leading-none">&times;</button>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setTab('vault')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === 'vault' ? 'border-neon-green text-neon-green' : 'border-transparent text-white/40 hover:text-white/60'}`}>
              📚 Pick from Vault
            </button>
            <button onClick={() => setTab('ai')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === 'ai' ? 'border-purple-400 text-purple-400' : 'border-transparent text-white/40 hover:text-white/60'}`}>
              🤖 Generate with AI
            </button>
          </div>
        </div>

        {tab === 'vault' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex gap-2 mb-3 flex-wrap">
              {['ALL', 'early', 'mid', 'late', 'finale'].map((r) => (
                <button key={r} onClick={() => setFilterRound(r)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${filterRound === r ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                  {r === 'ALL' ? 'All Rounds' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            {sorted.length === 0 && (
              <div className="text-center py-8 text-white/20 text-sm">No published templates match this filter</div>
            )}
            <div className="space-y-2">
              {sorted.map((tpl) => {
                const cat = categories[tpl.category];
                const isRecommended = (tpl.recommendedAgents || []).includes(suggestedAgentRange);
                return (
                  <button key={tpl.id} onClick={() => onPick(tpl.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all hover:border-white/20 ${isRecommended ? 'border-neon-green/20 bg-neon-green/5' : 'border-white/5 bg-white/[0.02]'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: cat?.color + '20' }}>
                        {cat?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{tpl.displayTitle}</span>
                          {isRecommended && <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/20 text-neon-green">✓ Recommended</span>}
                        </div>
                        <div className="text-xs text-white/40 truncate">{tpl.description}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-white/30">{tpl.minAgents}–{tpl.maxAgents} agents</div>
                        <div className="text-xs text-white/30">{tpl.estimatedDuration}min</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { onClose(); router.push('/admin/vault/new'); }}
              className="w-full mt-3 py-2.5 border border-dashed border-white/10 rounded-xl text-xs text-white/30 hover:text-white/50 hover:border-white/20">
              + Create New Template in Vault
            </button>
          </div>
        )}

        {tab === 'ai' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <label className="block text-xs text-white/40 mb-2">Describe the game you want to create</label>
              <textarea value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} rows={4}
                placeholder="e.g. A social deduction game where agents must form alliances but secretly vote to eliminate each other each round…"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-400/50 resize-none placeholder:text-white/20" />
              <button onClick={generateGame} disabled={aiLoading || !aiDesc.trim()}
                className="mt-2 px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">
                {aiLoading ? '⏳ Generating…' : '✨ Generate Game'}
              </button>
            </div>
            {aiResult && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-sm font-bold text-purple-300 mb-1">{String(aiResult.displayTitle || aiResult.name)}</h4>
                <p className="text-xs text-white/60 mb-3">{String(aiResult.description || '')}</p>
                <div className="flex gap-2">
                  <button onClick={saveAndPick}
                    className="px-4 py-2 text-xs font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80">
                    Save & Add to Season
                  </button>
                  <button onClick={() => setAiResult(null)} className="px-4 py-2 text-xs text-white/40 hover:text-white/60">
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
