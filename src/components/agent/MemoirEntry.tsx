'use client';

interface MemoirEntryProps {
  season: string;
  episode: string;
  content: string;
  author: string;
  date: string;
}

export function MemoirEntry({ season, episode, content, author, date }: MemoirEntryProps) {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-white font-space-grotesk">{season}</p>
          <p className="text-xs text-white/30">{episode} · {date}</p>
        </div>
        <span className="text-xs text-white/20 italic">by {author}</span>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        {content.split('\n\n').map((para, i) => (
          <p key={i} className="text-white/60 leading-relaxed italic mb-3">&ldquo;{para}&rdquo;</p>
        ))}
      </div>
    </div>
  );
}
export default MemoirEntry;
