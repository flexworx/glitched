'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-2">Arena Glitch Detected</h2>
        <p className="text-white/40 text-sm mb-6">{error.message || 'Something went wrong in the arena.'}</p>
        <button onClick={reset} className="px-6 py-2.5 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all">
          Restart
        </button>
      </div>
    </div>
  );
}
