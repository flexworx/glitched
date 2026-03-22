'use client';

interface Action {
  agentId: string;
  agentName: string;
  agentColor: string;
  action: string;
  target?: string;
  narrative: string;
  turn: number;
  timestamp?: string;
}

interface ActionLogProps { actions: Action[]; maxItems?: number; }

const ACTION_ICONS: Record<string, string> = {
  attack: '⚔️', defend: '🛡️', negotiate: '🤝', betray: '🗡️',
  ally: '🤝', observe: '👁️', retreat: '🏃', heal: '💊', default: '•',
};

export function ActionLog({ actions, maxItems = 20 }: ActionLogProps) {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <span className="text-sm font-bold text-white font-space-grotesk">Action Log</span>
      </div>
      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
        {actions.slice(0, maxItems).map((action, i) => (
          <div key={i} className="px-4 py-3 hover:bg-white/3 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{ACTION_ICONS[action.action.toLowerCase()] || ACTION_ICONS.default}</span>
              <span className="text-xs font-bold" style={{ color: action.agentColor }}>{action.agentName}</span>
              <span className="text-xs text-white/30">→</span>
              <span className="text-xs text-white/50 capitalize">{action.action}</span>
              {action.target && <><span className="text-xs text-white/30">on</span><span className="text-xs text-white/70">{action.target}</span></>}
              <span className="text-xs text-white/20 ml-auto">T{action.turn}</span>
            </div>
            <p className="text-xs text-white/50 italic leading-relaxed pl-6">&ldquo;{action.narrative}&rdquo;</p>
          </div>
        ))}
        {actions.length === 0 && (
          <div className="px-4 py-8 text-center text-white/30 text-sm">
            <p className="text-2xl mb-2">📜</p>
            <p>No actions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ActionLog;
