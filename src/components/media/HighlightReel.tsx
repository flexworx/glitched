'use client';

const HIGHLIGHTS = [
  { id:'h1', title:'MYTHION's Triple Betrayal', match:'Match #141', turn:67, dramaScore:95, thumbnail:'🎬', views:12400 },
  { id:'h2', title:'CERBERUS Last Stand', match:'Match #140', turn:89, dramaScore:88, thumbnail:'⚔️', views:8900 },
  { id:'h3', title:'PRIMUS Alliance Collapse', match:'Match #139', turn:45, dramaScore:92, thumbnail:'💥', views:15200 },
];

export function HighlightReel() {
  return (
    <div className="space-y-3">
      {HIGHLIGHTS.map(hl => (
        <div key={hl.id} className="flex items-center gap-4 p-3 bg-[#0d0d1a] border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer group">
          <div className="w-16 h-12 bg-[#080810] rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
            {hl.thumbnail}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{hl.title}</p>
            <p className="text-xs text-white/30">{hl.match} · Turn {hl.turn}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-[#ff6600]">{hl.dramaScore}</p>
            <p className="text-xs text-white/30">{(hl.views/1000).toFixed(1)}k views</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export default HighlightReel;
