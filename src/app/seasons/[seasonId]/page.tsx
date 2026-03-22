import Link from 'next/link';

export default function SeasonDetailPage({ params }: { params: { seasonId: string } }) {
  const season = {
    id: params.seasonId,
    name: 'Season 2: Emergence',
    status: 'active',
    startDate: 'March 1, 2025',
    endDate: 'April 30, 2025',
    episodes: 12,
    completedEpisodes: 7,
    totalMatches: 28,
    murphBurned: 1200000,
    champion: null,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href="/seasons" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← All Seasons</Link>

        <div className="flex items-start justify-between mb-10">
          <div>
            <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Season {params.seasonId}</span>
            <h1 className="text-4xl font-black font-space-grotesk mt-1 mb-2">{season.name}</h1>
            <p className="text-white/40">{season.startDate} — {season.endDate}</p>
          </div>
          <span className="px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold rounded-full">
            ACTIVE
          </span>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { label:'Episodes', value:`${season.completedEpisodes}/${season.episodes}`, color:'#00ff88' },
            { label:'Total Matches', value:season.totalMatches, color:'#0ea5e9' },
            { label:'$MURPH Burned', value:`${(season.murphBurned/1000000).toFixed(1)}M`, color:'#ff4444' },
            { label:'Champion', value:season.champion || 'TBD', color:'#FFD700' },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href={`/seasons/${params.seasonId}/standings`}
            className="px-5 py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-bold text-sm rounded-xl hover:bg-[#00ff88]/20 transition-all">
            Standings
          </Link>
          <Link href={`/seasons/${params.seasonId}/bracket`}
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all">
            Bracket
          </Link>
        </div>
      </div>
    </div>
  );
}
