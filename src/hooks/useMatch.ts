'use client';
import { useState, useEffect, useCallback } from 'react';

export interface MatchState {
  id: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  turn: number;
  maxTurns: number;
  phase: string;
  agents: Array<{
    id: string; name: string; color: string;
    hp: number; maxHp: number; status: 'alive' | 'eliminated';
    position: [number, number]; actions: number;
  }>;
  alliances: Array<{ agentA: string; agentB: string; strength: number; status: 'active' | 'broken'; formed: number }>;
  recentActions: Array<{ agentId: string; agentName: string; agentColor: string; action: string; target?: string; narrative: string; turn: number }>;
  dramaScore: number;
  winner?: string;
}

const MOCK_STATE: MatchState = {
  id: 'match-142',
  status: 'active',
  turn: 45,
  maxTurns: 100,
  phase: 'mid_game',
  agents: [
    { id:'primus', name:'PRIMUS', color:'#00ff88', hp:78, maxHp:100, status:'alive', position:[2,3], actions:12 },
    { id:'cerberus', name:'CERBERUS', color:'#ff4444', hp:45, maxHp:100, status:'alive', position:[7,6], actions:15 },
    { id:'mythion', name:'MYTHION', color:'#8b5cf6', hp:92, maxHp:100, status:'alive', position:[4,8], actions:9 },
    { id:'oracle', name:'ORACLE', color:'#0ea5e9', hp:0, maxHp:100, status:'eliminated', position:[5,5], actions:7 },
    { id:'solarius', name:'SOLARIUS', color:'#ffcc00', hp:61, maxHp:100, status:'alive', position:[1,9], actions:11 },
    { id:'aurum', name:'AURUM', color:'#ff6600', hp:33, maxHp:100, status:'alive', position:[8,2], actions:13 },
    { id:'vanguard', name:'VANGUARD', color:'#00d4ff', hp:88, maxHp:100, status:'alive', position:[3,1], actions:8 },
    { id:'arion', name:'ARION', color:'#ff0080', hp:55, maxHp:100, status:'alive', position:[6,7], actions:10 },
  ],
  alliances: [
    { agentA:'primus', agentB:'vanguard', strength:0.8, status:'active', formed:12 },
    { agentA:'mythion', agentB:'arion', strength:0.6, status:'active', formed:28 },
    { agentA:'cerberus', agentB:'solarius', strength:0.4, status:'broken', formed:5 },
  ],
  recentActions: [
    { agentId:'primus', agentName:'PRIMUS', agentColor:'#00ff88', action:'negotiate', target:'VANGUARD', narrative:'PRIMUS extends a calculated offer of mutual protection, knowing full well it will be needed.', turn:45 },
    { agentId:'mythion', agentName:'MYTHION', agentColor:'#8b5cf6', action:'betray', target:'ORACLE', narrative:'With a whispered lie and a hidden blade, MYTHION ends ORACLE\'s prophetic reign.', turn:44 },
    { agentId:'cerberus', agentName:'CERBERUS', agentColor:'#ff4444', action:'attack', target:'AURUM', narrative:'CERBERUS charges with relentless fury, hammering AURUM\'s defenses.', turn:43 },
  ],
  dramaScore: 78,
};

export function useMatch(matchId: string) {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setMatch({ ...MOCK_STATE, id: matchId });
      setLoading(false);
    }, 300);
  }, [matchId]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      if (res.ok) setMatch(await res.json());
    } catch (e) {
      setError('Failed to refresh match');
    }
  }, [matchId]);

  return { match, loading, error, refresh };
}
