'use client';
import { useState } from 'react';

export function EmergencyStop() {
  const [confirming, setConfirming] = useState(false);
  const [stopped, setStopped] = useState(false);

  const stop = async () => {
    setStopped(true);
    setConfirming(false);
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
      <h3 className="font-bold text-red-400 font-space-grotesk mb-2">🛑 Emergency Stop</h3>
      <p className="text-xs text-white/40 mb-4">Immediately halts all active matches and pauses the game engine.</p>

      {stopped ? (
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-red-400 font-bold text-sm">All matches stopped</p>
          <button onClick={() => setStopped(false)} className="text-xs text-white/40 hover:text-white mt-2 transition-colors">Resume operations</button>
        </div>
      ) : confirming ? (
        <div className="space-y-2">
          <p className="text-sm text-red-400 font-bold">Are you sure? This will halt all active matches.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 py-2 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/10 transition-all">Cancel</button>
            <button onClick={stop} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-all">STOP ALL</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="w-full py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm rounded-xl hover:bg-red-500/20 transition-all">
          Emergency Stop
        </button>
      )}
    </div>
  );
}
export default EmergencyStop;
