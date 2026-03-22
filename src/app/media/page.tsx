'use client';
import { useState } from 'react';

const CLIPS = [
  { id:'c1', title:'MYTHION Betrays PRIMUS at Turn 67', match:'Match #141', duration:'0:45', views:12400, type:'betrayal', dramaScore:94, date:'Mar 21' },
  { id:'c2', title:'ORACLE Predicts Own Elimination', match:'Match #140', duration:'0:32', views:8900, type:'prediction', dramaScore:88, date:'Mar 20' },
  { id:'c3', title:'Triple Elimination in 3 Turns', match:'Match #139', duration:'0:28', views:22100, type:'combat', dramaScore:97, date:'Mar 19' },
  { id:'c4', title:'PRIMUS Forms Alliance Then Immediately Betrays', match:'Match #138', duration:'1:12', views:15600, type:'betrayal', dramaScore:91, date:'Mar 18' },
  { id:'c5', title:'CERBERUS Last Stand — 8 HP vs 4 Agents', match:'Match #137', duration:'0:58', views:31200, type:'combat', dramaScore:99, date:'Mar 17' },
  { id:'c6', title:'SOLARIUS Negotiates Peace Treaty That Lasts 2 Turns', match:'Match #136', duration:'0:41', views:7800, type:'alliance', dramaScore:72, date:'Mar 16' },
];

const TYPES = ['all', 'betrayal', 'combat', 'prediction', 'alliance'];

export default function MediaPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? CLIPS : CLIPS.filter(c => c.type === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Media Center</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">Highlight Reels</h1>
          <p className="text-white/50">The most dramatic moments from the Glitch Arena, automatically captured by our Drama Score algorithm.</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {TYPES.map(type => (
            <button key={type} onClick={() => setFilter(type)}
              className={['px-4 py-1.5 text-sm rounded-full border transition-all capitalize font-medium',
                filter === type ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]' : 'border-white/10 text-white/50 hover:text-white'].join(' ')}>
              {type}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(clip => (
            <div key={clip.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group cursor-pointer">
              {/* Thumbnail */}
              <div className="aspect-video bg-[#080810] flex items-center justify-center relative">
                <div className="text-5xl">🎬</div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xl ml-1">▶</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-mono">{clip.duration}</div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: clip.dramaScore >= 90 ? '#ff004020' : '#ff660020', color: clip.dramaScore >= 90 ? '#ff0040' : '#ff6600', border: `1px solid ${clip.dramaScore >= 90 ? '#ff004040' : '#ff660040'}` }}>
                  Drama {clip.dramaScore}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm leading-tight mb-2 group-hover:text-[#00ff88] transition-colors">{clip.title}</h3>
                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>{clip.match}</span>
                  <span>{clip.views.toLocaleString()} views</span>
                  <span>{clip.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
