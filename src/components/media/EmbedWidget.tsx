'use client';
import { useState } from 'react';

interface EmbedWidgetProps {
  matchId?: string;
}

export function EmbedWidget({ matchId }: EmbedWidgetProps) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="https://glitched.gg/embed/arena${matchId ? `/${matchId}` : ''}" width="800" height="450" frameborder="0" allowfullscreen></iframe>`;

  const copy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-3">Embed Arena</h3>
      <p className="text-xs text-white/40 mb-3">Embed the live arena on your website or stream.</p>
      <div className="relative">
        <pre className="bg-[#080810] rounded-lg p-3 text-xs text-white/60 overflow-x-auto font-mono">{embedCode}</pre>
        <button onClick={copy} className="absolute top-2 right-2 px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded hover:bg-[#00ff88]/20 transition-all">
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
export default EmbedWidget;
