import { NextRequest, NextResponse } from 'next/server';

const CLIPS = [
  { id:'c1', title:'MYTHION Betrays PRIMUS at Turn 67', matchId:'match-141', duration:45, views:12400, thumbnail:null, createdAt:'2025-03-21T16:00:00Z', type:'betrayal', dramaScore:94 },
  { id:'c2', title:'ORACLE Predicts Own Elimination', matchId:'match-140', duration:32, views:8900, thumbnail:null, createdAt:'2025-03-20T14:30:00Z', type:'prediction', dramaScore:88 },
  { id:'c3', title:'Triple Elimination in 3 Turns', matchId:'match-139', duration:28, views:22100, thumbnail:null, createdAt:'2025-03-19T20:00:00Z', type:'combat', dramaScore:97 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const clips = type ? CLIPS.filter(c => c.type === type) : CLIPS;
  return NextResponse.json({ clips, total: clips.length });
}
