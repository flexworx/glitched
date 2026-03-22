'use client';
import { useMemo } from 'react';

interface Relationship {
  agentId: string;
  agentName: string;
  agentColor: string;
  trust: number; // -1 to 1
  type: 'ally' | 'enemy' | 'neutral' | 'betrayed';
}

interface RelationshipWebProps {
  agentName: string;
  agentColor: string;
  relationships: Relationship[];
}

export function RelationshipWeb({ agentName, agentColor, relationships }: RelationshipWebProps) {
  const TYPE_COLORS = { ally:'#00ff88', enemy:'#ff4444', neutral:'#ffffff40', betrayed:'#ff0080' };

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Relationships</p>
      {relationships.map(rel => (
        <div key={rel.agentId} className="flex items-center justify-between p-2.5 bg-[#080810] rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: rel.agentColor + '20', color: rel.agentColor }}>
              {rel.agentName[0]}
            </div>
            <span className="text-sm text-white">{rel.agentName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${Math.abs(rel.trust) * 100}%`,
                background: rel.trust > 0 ? '#00ff88' : '#ff4444',
                marginLeft: rel.trust < 0 ? `${(1 - Math.abs(rel.trust)) * 100}%` : 0,
              }} />
            </div>
            <span className="text-xs capitalize px-1.5 py-0.5 rounded-full"
              style={{ color: TYPE_COLORS[rel.type], background: TYPE_COLORS[rel.type] + '15' }}>
              {rel.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
export default RelationshipWeb;
