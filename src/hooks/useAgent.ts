'use client';
import { useState, useEffect, useCallback } from 'react';

export interface AgentProfile {
  id: string; name: string; archetype: string; color: string;
  mbti: string; enneagram: string; bio: string;
  beliefs: string[]; fears: string[]; goals: string[];
  veritasScore: number; wins: number; losses: number;
  status: 'active' | 'competing' | 'retired';
  type: 'pantheon' | 'byoa';
  traits: Record<string, number>;
  memories: Array<{ turn: number; matchId: string; event: string; impact: number }>;
}

export function useAgent(agentId?: string) {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentId) {
      setLoading(true);
      fetch(`/api/agents/${agentId}`)
        .then(r => r.json())
        .then(data => { setAgent(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [agentId]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!agentId) fetchAgents(); }, [agentId, fetchAgents]);

  return { agent, agents, loading, refetch: fetchAgents };
}
