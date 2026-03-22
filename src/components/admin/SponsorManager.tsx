'use client';

export function SponsorManager() {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">Sponsor Manager</h3>
      <div className="text-center py-8 text-white/30">
        <p className="text-2xl mb-2">🤝</p>
        <p className="text-sm">No active sponsors</p>
        <button className="mt-4 px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-sm rounded-xl hover:bg-white/10 transition-all">
          Add Sponsor
        </button>
      </div>
    </div>
  );
}
export default SponsorManager;
