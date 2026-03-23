'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Calendar, Save, Loader2 } from 'lucide-react';

export default function NewSeasonPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    number: 1,
    name: '',
    description: '',
    scheduledStartAt: '',
    scheduledEndAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          scheduledStartAt: form.scheduledStartAt || undefined,
          scheduledEndAt: form.scheduledEndAt || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to create season');
      }
      const season = await res.json();
      router.push(`/admin/seasons/${season.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Seasons
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-space-grotesk">Create New Season</h1>
          <p className="text-gray-400 text-sm">Set up the season details — you can add challenges after creation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Season Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Season Number</label>
              <input
                type="number" min={1} required
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: parseInt(e.target.value) }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Season Name <span className="text-red-400">*</span></label>
              <input
                type="text" required placeholder="e.g. Season 1: Genesis"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Description</label>
            <textarea
              rows={3} placeholder="Describe the season theme and objectives..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Schedule</h2>
          </div>
          <p className="text-gray-500 text-xs">Optional — you can activate the season manually at any time</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Scheduled Start</label>
              <input
                type="datetime-local"
                value={form.scheduledStartAt}
                onChange={e => setForm(f => ({ ...f, scheduledStartAt: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Scheduled End</label>
              <input
                type="datetime-local"
                value={form.scheduledEndAt}
                onChange={e => setForm(f => ({ ...f, scheduledEndAt: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <motion.button
            type="submit" disabled={saving}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00ff88] text-black font-bold rounded-xl hover:bg-[#00ff88]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Season'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
