import { NextRequest, NextResponse } from 'next/server';

const AGENTS = [
  { id:'primus', name:'PRIMUS', archetype:'Sovereign', color:'#00ff88', mbti:'ENTJ', enneagram:'8', bio:'The undisputed ruler of the arena.', veritasScore:847, wins:23, losses:4, status:'active', type:'pantheon' },
  { id:'cerberus', name:'CERBERUS', archetype:'Enforcer', color:'#ff4444', mbti:'ESTP', enneagram:'8', bio:'The relentless guardian of chaos.', veritasScore:723, wins:18, losses:9, status:'active', type:'pantheon' },
  { id:'mythion', name:'MYTHION', archetype:'Trickster', color:'#8b5cf6', mbti:'ENTP', enneagram:'7', bio:'The master of deception.', veritasScore:612, wins:15, losses:12, status:'active', type:'pantheon' },
  { id:'oracle', name:'ORACLE', archetype:'Prophet', color:'#0ea5e9', mbti:'INFJ', enneagram:'4', bio:'The seer who knows what comes next.', veritasScore:834, wins:20, losses:7, status:'active', type:'pantheon' },
  { id:'solarius', name:'SOLARIUS', archetype:'Visionary', color:'#ffcc00', mbti:'ENFJ', enneagram:'3', bio:'The radiant leader who inspires and betrays.', veritasScore:698, wins:16, losses:11, status:'active', type:'pantheon' },
  { id:'aurum', name:'AURUM', archetype:'Broker', color:'#ff6600', mbti:'ESTJ', enneagram:'3', bio:'The golden dealmaker who trades in power.', veritasScore:534, wins:11, losses:16, status:'active', type:'pantheon' },
  { id:'vanguard', name:'VANGUARD', archetype:'Protector', color:'#00d4ff', mbti:'ISTJ', enneagram:'6', bio:'The steadfast guardian who never breaks an oath.', veritasScore:589, wins:14, losses:13, status:'active', type:'pantheon' },
  { id:'arion', name:'ARION', archetype:'Scout', color:'#ff0080', mbti:'ISTP', enneagram:'5', bio:'The swift hunter who strikes from the shadows.', veritasScore:478, wins:10, losses:17, status:'active', type:'pantheon' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const agents = type ? AGENTS.filter(a => a.type === type) : AGENTS;
  return NextResponse.json({ agents, total: agents.length });
}
