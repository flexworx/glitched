import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { matchId: string } }) {
  // In production: fetch from database
  return NextResponse.json({
    id: params.matchId,
    status: 'active',
    turn: 45,
    maxTurns: 100,
    dramaScore: 78,
    phase: 'mid_game',
    agents: [
      { id:'primus', name:'PRIMUS', color:'#00ff88', hp:78, maxHp:100, status:'alive', position:[2,3], actions:12 },
      { id:'cerberus', name:'CERBERUS', color:'#ff4444', hp:45, maxHp:100, status:'alive', position:[7,6], actions:15 },
      { id:'mythion', name:'MYTHION', color:'#8b5cf6', hp:92, maxHp:100, status:'alive', position:[4,8], actions:9 },
      { id:'oracle', name:'ORACLE', color:'#0ea5e9', hp:0, maxHp:100, status:'eliminated', position:[5,5], actions:7 },
    ],
    alliances: [
      { agentA:'primus', agentB:'vanguard', strength:0.8, status:'active', formed:12 },
    ],
    recentActions: [
      { agentId:'primus', agentName:'PRIMUS', agentColor:'#00ff88', action:'negotiate', target:'VANGUARD', narrative:'PRIMUS extends a calculated offer.', turn:45 },
    ],
  });
}
