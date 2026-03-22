'use client';
import { useState } from 'react';

interface PIPWindowProps {
  matchId: string;
  matchTitle: string;
  dramaScore: number;
  onClose: () => void;
  onExpand: () => void;
}

export function PIPWindow({ matchId, matchTitle, dramaScore, onClose, onExpand }: PIPWindowProps) {
  const [minimized, setMinimized] = useState(false);

  const dramaColor = dramaScore >= 90 ? '#ff0040' : dramaScore >= 70 ? '#ff6600' : '#ffcc00';

  return (
    <div className={['fixed bottom-6 right-6 z-40 transition-all duration-300',
      minimized ? 'w-48 h-10' : 'w-72 h-48'].join(' ')}>
      <div className="w-full h-full bg-[#0d0d1a] border rounded-xl overflow-hidden shadow-2xl"
        style={{ borderColor: dramaColor + '60' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b"
          style={{ borderColor: dramaColor + '30', background: dramaColor + '10' }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: dramaColor }} />
            <span className="text-xs font-bold text-white truncate">{matchTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono font-bold" style={{ color: dramaColor }}>{dramaScore}</span>
            <button onClick={() => setMinimized(!minimized)} className="p-0.5 text-white/40 hover:text-white transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {minimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
              </svg>
            </button>
            <button onClick={onExpand} className="p-0.5 text-white/40 hover:text-white transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button onClick={onClose} className="p-0.5 text-white/40 hover:text-red-400 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {!minimized && (
          <div className="flex-1 flex items-center justify-center h-32 relative">
            <div className="text-center">
              <p className="text-3xl mb-1">⚔️</p>
              <p className="text-xs text-white/40 font-mono">Match #{matchId.slice(-6)}</p>
            </div>
            {/* Drama indicator */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${dramaScore}%`, background: `linear-gradient(90deg, ${dramaColor}80, ${dramaColor})` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PIPWindow;
