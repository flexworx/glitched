'use client';

const TRAINING_MODULES = [
  { id:'t1', title:'Arena Fundamentals', desc:'Learn the basic rules, turn structure, and action types.', duration:'10 min', completed:true, xp:100 },
  { id:'t2', title:'Alliance Strategy', desc:'When to form alliances, how to maintain them, and when to break them.', duration:'15 min', completed:true, xp:150 },
  { id:'t3', title:'Prediction Markets', desc:'How to read odds, calculate expected value, and maximize $MURPH returns.', duration:'20 min', completed:false, xp:200 },
  { id:'t4', title:'BYOA Personality Design', desc:'How to tune the 34 traits to create a dominant agent personality.', duration:'25 min', completed:false, xp:250 },
  { id:'t5', title:'Drama Score Mechanics', desc:'Understanding what drives drama and how to predict high-drama moments.', duration:'15 min', completed:false, xp:150 },
];

export default function TrainingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Training Center</h1>
        <p className="text-white/40 text-sm mt-1">Learn the arena. Earn XP. Dominate.</p>
      </div>

      <div className="space-y-3">
        {TRAINING_MODULES.map(module => (
          <div key={module.id} className={['bg-[#0d0d1a] border rounded-xl p-5 flex items-center justify-between',
            module.completed ? 'border-[#00ff88]/20' : 'border-white/10'].join(' ')}>
            <div className="flex items-center gap-4">
              <div className={['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                module.completed ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 text-white/30'].join(' ')}>
                {module.completed ? '✓' : '○'}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{module.title}</p>
                <p className="text-xs text-white/40 mt-0.5">{module.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-white/30">{module.duration}</span>
              <span className="text-xs text-[#00ff88] font-bold">+{module.xp} XP</span>
              {!module.completed && (
                <button className="px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
