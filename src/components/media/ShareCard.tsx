'use client';
import { useState } from 'react';

interface ShareCardProps {
  title: string;
  description: string;
  url?: string;
}

export function ShareCard({ title, description, url = window?.location?.href || '' }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-3">Share</h3>
      <p className="text-sm text-white/60 mb-4">{title}: {description}</p>
      <div className="flex gap-2">
        {[
          { label:'Twitter/X', icon:'𝕏', color:'#1DA1F2' },
          { label:'Discord', icon:'💬', color:'#5865F2' },
          { label:'Telegram', icon:'✈️', color:'#0088cc' },
        ].map(s => (
          <button key={s.label} className="flex-1 py-2 text-xs font-bold rounded-lg border border-white/10 hover:border-white/20 transition-all" style={{ color: s.color }}>
            {s.icon} {s.label}
          </button>
        ))}
        <button onClick={copy} className="flex-1 py-2 text-xs font-bold rounded-lg border border-white/10 hover:border-white/20 transition-all text-white/60">
          {copied ? '✓ Copied!' : '🔗 Copy'}
        </button>
      </div>
    </div>
  );
}
export default ShareCard;
