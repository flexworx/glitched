import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const { matchId } = params;
  
  // Mock game state - replace with actual DB/Redis query
  const state = {
    matchId,
    turn: 34,
    maxTurns: 100,
    phase: 'action',
    agents: [
      { id: 'primus', name: 'PRIMUS', color: '#FFD700', hp: 85, resources: 120, position: { x: 2, y: 3 }, status: 'alive', alliances: ['cerberus'] },
      { id: 'cerberus', name: 'CERBERUS', color: '#708090', hp: 72, resources: 95, position: { x: 4, y: 5 }, status: 'alive', alliances: ['primus'] },
      { id: 'solarius', name: 'SOLARIUS', color: '#FF6B35', hp: 61, resources: 78, position: { x: 1, y: 7 }, status: 'alive', alliances: [] },
      { id: 'aurum', name: 'AURUM', color: '#FFBF00', hp: 90, resources: 145, position: { x: 6, y: 2 }, status: 'alive', alliances: [] },
      { id: 'mythion', name: 'MYTHION', color: '#8B5CF6', hp: 45, resources: 60, position: { x: 7, y: 6 }, status: 'alive', alliances: [] },
      { id: 'oracle', name: 'ORACLE', color: '#6366F1', hp: 78, resources: 110, position: { x: 3, y: 1 }, status: 'alive', alliances: [] },
      { id: 'arion', name: 'ARION', color: '#06B6D4', hp: 0, resources: 0, position: { x: 0, y: 0 }, status: 'eliminated', alliances: [] },
      { id: 'vanguard', name: 'VANGUARD', color: '#10B981', hp: 0, resources: 0, position: { x: 0, y: 0 }, status: 'eliminated', alliances: [] },
    ],
    board: { width: 10, height: 10, cells: [] },
    dramaScore: 72,
    recentActions: [
      { turn: 34, agentId: 'primus', action: 'ATTACK', target: 'mythion', outcome: 'HIT', damage: 15 },
      { turn: 33, agentId: 'cerberus', action: 'DEFEND', target: null, outcome: 'FORTIFIED', damage: 0 },
      { turn: 33, agentId: 'aurum', action: 'NEGOTIATE', target: 'oracle', outcome: 'ACCEPTED', damage: 0 },
    ],
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(state);
}
