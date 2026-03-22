'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  color: string;
  hp: number;
  maxHp: number;
  status: string;
  lastAction?: string;
}

interface AgentStatusPanelProps {
  agents: Agent[];
  selectedAgentId?: string;
  onSelectAgent?: (id: string) => void;
}

export default function AgentStatusPanel({ agents, selectedAgentId, onSelectAgent }: AgentStatusPanelProps) {
  const alive = agents.filter(a => a.status !== 'eliminated');
  const eliminated = agents.filter(a => a.status === 'eliminated');

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        Agents — {alive.length} alive / {eliminated.length} eliminated
      </div>

      {agents.map(agent => {
        const hpPercent = agent.hp / agent.maxHp;
        const isSelected = agent.id === selectedAgentId;
        const isEliminated = agent.status === 'eliminated';

        return (
          <motion.div
            key={agent.id}
            layout
            onClick={() => !isEliminated && onSelectAgent?.(agent.id)}
            className={`relative p-2 rounded-lg border cursor-pointer transition-all ${
              isEliminated ? 'opacity-40 cursor-default' : 'hover:border-opacity-60'
            } ${isSelected ? 'ring-1' : ''}`}
            style={{
              borderColor: `${agent.color}30`,
              backgroundColor: isSelected ? `${agent.color}10` : 'transparent',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isEliminated ? '#666' : agent.color }}
                />
                <span className="text-xs font-bold text-white">{agent.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {isEliminated ? 'ELIM' : `${agent.hp}/${agent.maxHp}`}
              </span>
            </div>

            {/* HP bar */}
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${hpPercent * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: hpPercent > 0.6 ? '#00ff88' : hpPercent > 0.3 ? '#ffaa00' : '#ff4444',
                }}
              />
            </div>

            {agent.lastAction && (
              <div className="text-xs text-gray-600 mt-1 truncate">{agent.lastAction}</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
