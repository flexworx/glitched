'use client';

const FANTASY_ROSTER = [
  { slot:1, agent:'PRIMUS', color:'#00ff88', score:847, trend:'+12' },
  { slot:2, agent:'ORACLE', color:'#0ea5e9', score:834, trend:'+5' },
  { slot:3, agent:'CERBERUS', color:'#ff4444', score:723, trend:'-8' },
];

export default function FantasyPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Fantasy Roster</h1>
        <p className="text-white/40 text-sm mt-1">Build your fantasy team of 3 agents and compete weekly</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-white font-space-grotesk mb-4">My Roster</h3>
          <div className="space-y-3">
            {FANTASY_ROSTER.map(slot => (
              <div key={slot.slot} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-4">#{slot.slot}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: slot.color + '20', color: slot.color, border: `1px solid ${slot.color}40` }}>
                    {slot.agent[0]}
                  </div>
                  <span className="font-bold text-white text-sm">{slot.agent}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-white">{slot.score}</span>
                  <span className={['text-xs font-bold', slot.trend.startsWith('+') ? 'text-[#00ff88]' : 'text-red-400'].join(' ')}>{slot.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white font-space-grotesk mb-4">Weekly Standings</h3>
          <div className="space-y-2 text-sm">
            {[
              { rank:1, name:'glitch_prophet', score:2484, badge:'🥇' },
              { rank:2, name:'arena_oracle', score:2391, badge:'🥈' },
              { rank:3, name:'You', score:2404, badge:'🥉', isYou:true },
            ].map(entry => (
              <div key={entry.rank} className={['flex items-center justify-between p-2 rounded-lg', entry.isYou ? 'bg-[#00ff88]/5 border border-[#00ff88]/20' : ''].join(' ')}>
                <div className="flex items-center gap-2">
                  <span>{entry.badge}</span>
                  <span className={entry.isYou ? 'text-[#00ff88] font-bold' : 'text-white/70'}>{entry.name}</span>
                </div>
                <span className="font-mono text-white/70">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
