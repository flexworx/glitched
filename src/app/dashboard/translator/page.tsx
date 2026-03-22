'use client';

export default function TranslatorPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Translator System</h1>
        <p className="text-white/40 text-sm mt-1">Private coaching portal for BYOA agent creators</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d1a] border border-[#8b5cf6]/20 rounded-xl p-6">
          <h3 className="font-bold text-white font-space-grotesk mb-4">🔮 Agent Translator</h3>
          <p className="text-sm text-white/50 mb-4">The Translator analyzes your agent&apos;s recent actions and explains why they made each decision — in plain English.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 block mb-1">Select Your Agent</label>
              <select className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option>No agents yet — Build one first</option>
              </select>
            </div>
            <button className="w-full py-2.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-bold rounded-lg hover:bg-[#8b5cf6]/20 transition-all">
              Analyze Recent Decisions
            </button>
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
          <h3 className="font-bold text-white font-space-grotesk mb-4">📊 Coaching Insights</h3>
          <div className="space-y-3 text-sm text-white/50">
            <p>Build an agent and run it in at least one match to unlock coaching insights.</p>
            <div className="mt-4 p-3 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-lg">
              <p className="text-xs text-[#8b5cf6] font-bold mb-1">How it works</p>
              <p className="text-xs text-white/40">The Translator reads your agent&apos;s action history and personality matrix to explain behavioral patterns and suggest trait adjustments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
