'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EasterEggDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  effectType: string;
  isActive: boolean;
}

export default function EasterEggsPage() {
  const [eggs, setEggs] = useState<EasterEggDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🎁', description: '', effectType: '' });
  const [saving, setSaving] = useState(false);

  const loadEggs = () => {
    fetch('/api/vault/easter-eggs')
      .then((r) => r.json())
      .then((data) => { setEggs(data.easterEggs || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadEggs(); }, []);

  const createEgg = async () => {
    if (!form.name || !form.effectType) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vault/easter-eggs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', icon: '🎁', description: '', effectType: '' });
        setShowForm(false);
        loadEggs();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🥚 Easter Egg Inventory</h1>
            <p className="text-sm text-gray-400 mt-1">Manage easter egg definitions and see which templates use them</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/vault" className="px-4 py-2 text-sm text-white/50 border border-white/10 rounded-lg hover:text-white/80">
              Back to Vault
            </Link>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-sm font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80">
              + New Easter Egg
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-arena-dark border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-white/70 mb-4">CREATE NEW EASTER EGG</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Immunity Card"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Icon (emoji)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Effect Type</label>
                <input value={form.effectType} onChange={(e) => setForm({ ...form, effectType: e.target.value })} placeholder="IMMUNITY"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-neon-green/50" />
              </div>
              <div className="flex items-end">
                <button onClick={createEgg} disabled={saving}
                  className="w-full px-4 py-2 text-sm font-bold text-black bg-neon-green rounded-lg hover:bg-neon-green/80 disabled:opacity-50">
                  Create
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this easter egg does..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50" />
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Loading easter eggs...</div>
        ) : eggs.length === 0 ? (
          <div className="text-center py-16 text-white/20">No easter eggs defined yet. Create your first one!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {eggs.map((egg) => (
              <div key={egg.id} className="bg-arena-dark border border-white/5 rounded-xl p-4 hover:border-white/15 transition-all">
                <div className="text-3xl mb-2">{egg.icon}</div>
                <h3 className="text-sm font-bold text-white">{egg.name}</h3>
                <p className="text-[10px] text-white/40 mt-1">{egg.description}</p>
                <div className="mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono">
                    {egg.effectType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
