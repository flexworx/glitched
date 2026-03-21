import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, archetype, personality, beliefs, backstory } = body;
  
  if (!name || !archetype || !personality || !backstory) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  // TODO: Save to DB, deduct 1000 $MURPH burn, notify admin
  const agent = {
    id: `byoa-${Date.now()}`,
    name,
    archetype,
    personality,
    beliefs,
    backstory,
    status: 'pending_review',
    submittedAt: new Date().toISOString(),
    burnAmount: 1000,
  };
  
  return NextResponse.json(agent, { status: 201 });
}
