'use client';

interface Dream {
  id: string;
  title: string;
  content: string;
  frequency: number;
  sentiment: 'ambition' | 'fear' | 'hope' | 'grief';
}

interface DreamLogProps {
  dreams: Dream[];
}

const SENTIMENT_COLORS = { ambition:'#00ff88', fear:'#ff4444', hope:'#0ea5e9', grief:'#8b5cf6' };

export function DreamLog({ dreams }: DreamLogProps) {
  if (!dreams.length) return <p className="text-white/30 text-sm">No dreams recorded yet.</p>;

  return (
    <div className="space-y-4">
      {dreams.map(dream => (
        <div key={dream.id} className="bg-[#080810] rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-white text-sm">{dream.title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">{dream.frequency}x</span>
              <span className="px-1.5 py-0.5 text-xs rounded-full capitalize"
                style={{ color: SENTIMENT_COLORS[dream.sentiment], background: SENTIMENT_COLORS[dream.sentiment] + '15' }}>
                {dream.sentiment}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/50 italic leading-relaxed">&ldquo;{dream.content}&rdquo;</p>
        </div>
      ))}
    </div>
  );
}
export default DreamLog;
