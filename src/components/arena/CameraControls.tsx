'use client';
import { useArenaCamera, CameraMode } from '@/hooks/useArenaCamera';

const MODES: Array<{ mode: CameraMode; label: string; icon: string; desc: string }> = [
  { mode: 'overview', label: 'Overview', icon: '🗺️', desc: 'Bird's-eye view of full arena' },
  { mode: 'cinematic', label: 'Cinematic', icon: '🎬', desc: 'Auto-zoom to drama' },
  { mode: 'pip', label: 'PIP', icon: '📺', desc: 'Picture-in-picture' },
  { mode: 'redzone', label: 'RedZone', icon: '🔴', desc: 'Multi-match dashboard' },
];

export function CameraControls() {
  const { camera, setMode, reset } = useArenaCamera();

  return (
    <div className="flex items-center gap-2 bg-[#0d0d1a] border border-white/10 rounded-xl p-2">
      {MODES.map(m => (
        <button key={m.mode} onClick={() => setMode(m.mode)} title={m.desc}
          className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            camera.mode === m.mode ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/50 hover:text-white hover:bg-white/5'].join(' ')}>
          <span>{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={reset} className="px-2 py-1.5 text-xs text-white/30 hover:text-white transition-colors" title="Reset camera">
        ↺
      </button>
    </div>
  );
}
export default CameraControls;
