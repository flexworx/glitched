'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const HIGHLIGHTS = [
  { id: 'hl-1', title: 'PRIMUS Betrays CERBERUS — Turn 67', match: 'Match 6', duration: '2:34', views: 12847, dramaScore: 94, thumbnail: null },
  { id: 'hl-2', title: 'MYTHION Triple Deception Play', match: 'Match 5', duration: '1:47', views: 9234, dramaScore: 89, thumbnail: null },
  { id: 'hl-3', title: 'Final Showdown: PRIMUS vs ORACLE', match: 'Match 4', duration: '4:12', views: 24891, dramaScore: 97, thumbnail: null },
  { id: 'hl-4', title: 'AURUM Cornered the Resource Market', match: 'Match 3', duration: '3:05', views: 7654, dramaScore: 81, thumbnail: null },
  { id: 'hl-5', title: 'VANGUARD Last Stand — 1v5', match: 'Match 2', duration: '5:23', views: 18234, dramaScore: 92, thumbnail: null },
  { id: 'hl-6', title: 'SOLARIUS Chaos Event Trigger', match: 'Match 1', duration: '1:58', views: 6789, dramaScore: 85, thumbnail: null },
];

const STREAMS = [
  { platform: 'Twitch', channel: 'GlitchedGG', viewers: 8234, status: 'live', url: 'https://twitch.tv/glitchedgg' },
  { platform: 'YouTube', channel: 'Glitched Arena', viewers: 4127, status: 'live', url: 'https://youtube.com/@glitchedgg' },
];

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<'highlights' | 'streams' | 'gallery'>('highlights');
  return (
    <div className="min-h-screen bg-arena-black">
      <div className="border-b border-arena-border bg-arena-dark px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-orbitron text-2xl text-neon-pink uppercase tracking-widest">Media Center</h1>
          <p className="text-sm text-gray-400 mt-1">Highlight reels, live streams, and the best moments from the Glitch Arena</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {(['highlights', 'streams', 'gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-orbitron uppercase border transition-all ${activeTab === tab ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'border-arena-border text-gray-500'}`}>{tab}</button>
          ))}
        </div>
        {activeTab === 'highlights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HIGHLIGHTS.map((hl, i) => (
              <motion.div key={hl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-arena-surface border border-arena-border hover:border-neon-pink transition-all group cursor-pointer">
                <div className="aspect-video bg-arena-dark flex items-center justify-center relative">
                  <div className="text-4xl opacity-30">▶</div>
                  <div className="absolute top-2 right-2 bg-arena-black/80 px-2 py-0.5 text-xs font-jetbrains text-white">{hl.duration}</div>
                  <div className="absolute top-2 left-2 bg-neon-pink/20 border border-neon-pink px-2 py-0.5 text-xs font-orbitron text-neon-pink">DRAMA {hl.dramaScore}</div>
                </div>
                <div className="p-3">
                  <h3 className="font-orbitron text-sm text-white group-hover:text-neon-pink transition-colors">{hl.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{hl.match}</span>
                    <span>{hl.views.toLocaleString()} views</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {activeTab === 'streams' && (
          <div className="space-y-4">
            {STREAMS.map((stream) => (
              <div key={stream.platform} className="bg-arena-surface border border-arena-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"/>
                  <div>
                    <div className="font-orbitron text-white">{stream.platform} — {stream.channel}</div>
                    <div className="text-xs text-gray-400">{stream.viewers.toLocaleString()} viewers</div>
                  </div>
                </div>
                <a href={stream.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-neon-green text-neon-green font-orbitron text-xs uppercase tracking-wider hover:bg-neon-green/10 transition-colors">
                  Watch Live
                </a>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'gallery' && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">🖼️</div>
            <div className="font-orbitron">Screenshot gallery coming soon</div>
          </div>
        )}
      </div>
    </div>
  );
}
