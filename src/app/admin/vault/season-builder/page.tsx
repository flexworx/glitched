'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

        {/* Template Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowPicker(false)}>
            <div className="bg-arena-dark border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-4">Select a Game Template</h3>
              <div className="grid grid-cols-1 gap-2">
                {templates.map((tpl) => {
                  const cat = CATEGORIES[tpl.category];
                  return (
                    <button key={tpl.id} onClick={() => addGame(tpl.id)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-neon-green/30 hover:bg-neon-green/5 transition-all text-left">
                      <div className="text-2xl">{cat?.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{tpl.displayTitle}</div>
                        <div className="text-xs text-white/40">{tpl.name} &middot; {tpl.minAgents}-{tpl.maxAgents} agents</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: (cat?.color || '#fff') + '20', color: cat?.color }}>
                        {tpl.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
