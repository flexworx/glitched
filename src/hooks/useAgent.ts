'use client';
/**
 * RADF v3 — useAgent hook
 * Fetches real agent data from /api/agents and /api/agents/[agentId].
 */
import { useState, useEffect, useCallback } from 'react';

export interface AgentProfile {
  id: string;
  name: string;
  archetype: string;
  mbti: string;
  enneagram: string;
  backstory: string;
  status: string;
  veritasScore: number;
  veritasTier: string;
  signatureColor: string;
  avatarUrl?: string;
  isPantheon: boolean;
  isByoa: boolean;
  totalWins: number;
  totalMatches: number;
  createdAt: string;
}

export function useAgent(agentId?: string) {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAgent(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const fetchAgents = useCallback(async (type?: string) => {
    setLoading(true);
    try {
      const params = type ? `?type=${type}` : '';
      const res = await fetch(`/api/agents${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAgents(data.agents ?? []);
      setTotal(data.total ?? 0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (agentId) fetchAgent();
    else fetchAgents();
  }, [agentId, fetchAgent, fetchAgents]);

  return { agent, agents, total, loading, error, refetch: agentId ? fetchAgent : fetchAgents };
}
