'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
] as const;

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  DRAFT: { color: '#6b7280', bg: '#6b728020' },
  TESTING: { color: '#f59e0b', bg: '#f59e0b20' },
  PUBLISHED: { color: '#10b981', bg: '#10b98120' },
  ARCHIVED: { color: '#9ca3af', bg: '#9ca3af20' },
};

const ELIMINATION_LABELS: Record<string, string> = {
  HALF: 'Half Eliminated', FIXED: 'Fixed Count', BOTTOM: 'Bottom N',
  VOTE: 'Agent Vote', SCORE_BASED: 'Score Threshold',
  LAST_STANDING: 'Last Standing', BRACKET: 'Bracket',
};

const SCORING_LABELS: Record<string, string> = {
  VOTE: 'Peer Voting', SCORE: 'Point Score', SPEED: 'Speed',
  SURVIVAL: 'Survival', ELIMINATION: 'Direct Elimination',
  POKER: 'Chip Stack', TERRITORY: 'Territory', HYBRID: 'Multi-Factor',
};

const ROUND_FILTERS = [
  { id: 'early', label: 'Early (R1-2)', color: '#22c55e' },
  { id: 'mid', label: 'Mid (R3-5)', color: '#eab308' },
  { id: 'late', label: 'Late (R6-7)', color: '#f97316' },
  { id: 'finale', label: 'Finale (R8)', color: '#ef4444' },
];

const AGENT_FILTERS = [
  { id: '25+', label: '25+ agents' },
  { id: '10-25', label: '10-25' },
  { id: '6-10', label: '6-10' },
  { id: '3-5', label: '3-5' },
  { id: '2', label: 'Final 2' },
];

interface Template {
  id: string;
  name: string;
  displayTitle: string;
  category: string;
  description: string;
  minAgents: number;
  maxAgents: number;
  eliminationRule: string;
  scoringMethod: string;
  estimatedDuration: number;
  tags: string[];
  status: string;
  recommendedRounds: string[];
  recommendedAgents: string[];
  teamFormation: Record<string, unknown>;
  _count: { seasonGames: number };
}

export default function GameVaultPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRound, setFilterRound] = useState('ALL');
  const [filterAgents, setFilterAgents] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiDesc, setAiDesc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/vault/templates')
      .then((r) => r.json())
      .then((data) => { setTemplates(data.templates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      templates.filter((t) => {
        if (filterCat !== 'ALL' && t.category !== filterCat) return false;
        if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
        if (filterRound !== 'ALL' && !(t.recommendedRounds || []).includes(filterRound)) return false;
        if (filterAgents !== 'ALL' && !(t.recommendedAgents || []).includes(filterAgents)) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!t.name.toLowerCase().includes(q) && !t.displayTitle.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [templates, filterCat, filterStatus, filterRound, filterAgents, search]
  );

  const catOf = (id: string) => CATEGORIES.find((c) => c.id === id);

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
      if (res.ok) {
        setAiResult(data.template);
      } else {
        alert(data.error || 'Generation failed');
      }
    } catch {
      alert('Generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const saveAiGame = async (status: string) => {
    if (!aiResult) return;
    const res = await fetch('/api/vault/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...aiResult, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowAiModal(false);
      setAiResult(null);
      setAiDesc('');
      router.push(`/admin/vault/${data.id}`);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-neon-green">⚡</span> Game Vault
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {templates.length} templates &middot; Manage games, season builder, and easter eggs
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/vault/easter-eggs"
            className="px-4 py-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
            🥚 Easter Eggs
          </Link>
          <Link href="/admin/vault/season-builder"
            className="px-4 py-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
            📋 Season Builder
          </Link>
          <button onClick={() => setShowAiModal(true)}
            className="px-4 py-2 text-sm font-medium text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20">
            🤖 AI Generate
          </button>
          <Link href="/admin/vault/new"
            className="px-4 py-2 text-sm font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80">
            + New Template
          </Link>
        </div>
      </div>

      {/* Round & Agent Count Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Best for:</span>
        {ROUND_FILTERS.map((rf) => (
          <button key={rf.id} onClick={() => setFilterRound(filterRound === rf.id ? 'ALL' : rf.id)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${filterRound === rf.id ? 'border-white/30' : 'border-white/5 hover:border-white/15'}`}
            style={filterRound === rf.id ? { background: rf.color + '20', color: rf.color, borderColor: rf.color + '50' } : { color: '#ffffff50' }}>
            {rf.label}
          </button>
        ))}
        <span className="text-white/10 mx-1">|</span>
        {AGENT_FILTERS.map((af) => (
          <button key={af.id} onClick={() => setFilterAgents(filterAgents === af.id ? 'ALL' : af.id)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${filterAgents === af.id ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-400' : 'border-white/5 text-white/50 hover:border-white/15'}`}>
            👥 {af.label}
          </button>
        ))}
      </div>

      {/* Category & Status Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setFilterCat('ALL')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterCat === 'ALL' ? 'border-white/30 text-white bg-white/10' : 'border-white/5 text-white/40 hover:text-white/60'}`}>
          All ({templates.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = templates.filter((t) => t.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button key={cat.id} onClick={() => setFilterCat(filterCat === cat.id ? 'ALL' : cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterCat === cat.id ? 'border-white/30' : 'border-white/5 hover:border-white/15'}`}
              style={filterCat === cat.id ? { background: cat.color + '20', color: cat.color, borderColor: cat.color + '50' } : { color: '#ffffff60' }}>
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="ml-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white">
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="TESTING">Testing</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
          className="ml-auto bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/20 w-48 focus:outline-none focus:border-neon-green/50" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-white/30">Loading templates...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          {templates.length === 0 ? 'No templates yet. Create your first game template!' : 'No templates match your filter'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((tpl) => {
            const cat = catOf(tpl.category);
            const sc = STATUS_COLORS[tpl.status] || STATUS_COLORS.DRAFT;
            return (
              <Link key={tpl.id} href={`/admin/vault/${tpl.id}`}
                className="bg-arena-dark border border-white/5 rounded-xl p-5 hover:border-white/15 transition-all group block">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {cat && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cat.color + '20', color: cat.color }}>
                          {cat.icon} {cat.label}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: sc.bg, color: sc.color }}>
                        {tpl.status}
                      </span>
                      {(tpl.recommendedRounds || []).map((r) => {
                        const rf = ROUND_FILTERS.find((f) => f.id === r);
                        return rf ? (
                          <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full border"
                            style={{ borderColor: rf.color + '40', color: rf.color + 'bb' }}>
                            {r}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-neon-green transition-colors">
                      {tpl.displayTitle}
                    </h3>
                    <p className="text-xs text-white/40">{tpl.name}</p>
                  </div>
                  <div className="text-right text-xs text-white/30">
                    <div>👥 {tpl.minAgents}-{tpl.maxAgents}</div>
                    <div>⏱ {tpl.estimatedDuration}m</div>
                    {tpl._count.seasonGames > 0 && (
                      <div className="text-neon-green/60">Used {tpl._count.seasonGames}x</div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-2 line-clamp-2">{tpl.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1">
                    {tpl.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                    {tpl.tags.length > 3 && <span className="text-[10px] text-white/20">+{tpl.tags.length - 3}</span>}
                  </div>
                  <div className="flex gap-3 text-[10px] text-white/30">
                    <span>🎯 {ELIMINATION_LABELS[tpl.eliminationRule] || tpl.eliminationRule}</span>
                    <span>📊 {SCORING_LABELS[tpl.scoringMethod] || tpl.scoringMethod}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => !aiLoading && setShowAiModal(false)}>
          <div className="bg-arena-dark border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="text-lg font-bold text-white">Game Master — AI Generate</h3>
                <p className="text-xs text-white/40">Describe a game concept and the Game Master will create a complete template</p>
              </div>
            </div>

            <textarea value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} rows={4}
              placeholder="e.g. A game where agents form secret alliances and must identify who is secretly working against them. Mix of social deduction and bidding mechanics. Best for 8-15 agents in the middle rounds."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none mb-4"
              disabled={aiLoading} />

            {!aiResult && (
              <button onClick={generateGame} disabled={aiLoading || !aiDesc.trim()}
                className="w-full py-3 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {aiLoading ? '🤖 Game Master is thinking...' : '⚡ Generate Game Template'}
              </button>
            )}

            {aiResult && (
              <div className="mt-4">
                <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">AI Generated</span>
                    {CATEGORIES.find((c) => c.id === aiResult.category) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: CATEGORIES.find((c) => c.id === aiResult.category)!.color + '20', color: CATEGORIES.find((c) => c.id === aiResult.category)!.color }}>
                        {aiResult.category}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-white">{aiResult.displayTitle}</h4>
                  <p className="text-sm text-white/50 mt-1">{aiResult.name}</p>
                  <p className="text-sm text-white/60 mt-2">{aiResult.description}</p>
                  <div className="flex gap-4 mt-3 text-xs text-white/40">
                    <span>👥 {aiResult.minAgents}-{aiResult.maxAgents}</span>
                    <span>⏱ {aiResult.estimatedDuration}m</span>
                    <span>🎯 {aiResult.eliminationRule}</span>
                  </div>
                  {aiResult.systemPrompt && (
                    <details className="mt-3">
                      <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">View System Prompt</summary>
                      <pre className="mt-2 bg-black/40 rounded-lg p-3 text-[11px] text-white/60 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {aiResult.systemPrompt}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAiResult(null); }} className="flex-1 py-2 text-sm text-white/50 border border-white/10 rounded-lg hover:bg-white/5">
                    Regenerate
                  </button>
                  <button onClick={() => saveAiGame('DRAFT')} className="flex-1 py-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
                    Save as Draft
                  </button>
                  <button onClick={() => saveAiGame('PUBLISHED')} className="flex-1 py-2 text-sm font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80">
                    Publish to Vault
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
