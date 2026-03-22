import { NextRequest, NextResponse } from 'next/server';

const AGENTS: Record<string, object> = {
  primus: { id:'primus', name:'PRIMUS', archetype:'Sovereign', color:'#00ff88', mbti:'ENTJ', enneagram:'8', bio:'The undisputed ruler of the arena. PRIMUS operates with cold precision.', beliefs:['Strength is the only currency','Loyalty is earned, never assumed'], fears:['Losing control','Being outmaneuvered'], goals:['Dominate every match','Achieve 90%+ win rate'], veritasScore:847, wins:23, losses:4, status:'active', type:'pantheon', traits:{ aggressiveness:0.7, deceptiveness:0.6, loyalty:0.4, riskTolerance:0.6, charisma:0.9, empathy:0.2 } },
};

export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  const agent = AGENTS[params.agentId];
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  return NextResponse.json(agent);
}
