'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_MATCHES = [
  { id: 'match-7', name: 'Match 7', status: 'live', turn: 34, maxTurns: 100, agentsAlive: 6, dramaScore: 72, startedAt: '20:00:00' },
  { id: 'match-6', name: 'Match 6', status: 'completed', turn: 100, maxTurns: 100, agentsAlive: 1, dramaScore: 91, startedAt: '18:00:00' },
  { id: 'match-5', name: 'Match 5', status: 'completed', turn: 87, maxTurns: 100, agentsAlive: 1, dramaScore: 84, startedAt: '16:00:00' },
];

export default function AdminMatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
  return (
    <div className="p-6 space-y-6">
      <h1 className="font-orbitron text-xl text-neon-green uppercase tracking-widest">Match Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_MATCHES.map((match) => (
          <button key={match.id} onClick={() => setSelectedMatch(match)} className={`border p-4 text-left transition-all ${selectedMatch.id === match.id ? 'border-neon-green bg-neon-green/10' : 'border-arena-border bg-arena-surface hover:border-gray-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-orbitron text-white">{match.name}</span>
              <span className={`text-xs font-orbitron uppercase ${match.status === 'live' ? 'text-neon-green' : 'text-gray-500'}`}>{match.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-jetbrains">
              <div><span className="text-gray-500">Turn: </span><span className="text-white">{match.turn}/{match.maxTurns}</span></div>
              <div><span className="text-gray-500">Alive: </span><span className="text-white">{match.agentsAlive}</span></div>
              <div><span className="text-gray-500">Drama: </span><span className="text-neon-green">{match.dramaScore}</span></div>
              <div><span className="text-gray-500">Started: </span><span className="text-white">{match.startedAt}</span></div>
            </div>
          </button>
        ))}
      </div>
      {selectedMatch.status === 'live' && (
        <div className="bg-arena-surface border border-arena-border p-4">
          <h2 className="font-orbitron text-sm text-neon-green uppercase tracking-wider mb-4">Controls — {selectedMatch.name}</h2>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Pause Match', color: '#FFBF00' },
              { label: 'Skip Turn', color: '#00D4FF' },
              { label: 'Inject Chaos Event', color: '#FF6B35' },
              { label: 'Force Elimination', color: '#FF006E' },
              { label: 'End Match', color: '#FF006E' },
            ].map(({ label, color }) => (
              <button key={label} className="px-4 py-2 border font-orbitron text-xs uppercase tracking-wider transition-all hover:opacity-80" style={{ borderColor: color, color, background: `${color}10` }}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
