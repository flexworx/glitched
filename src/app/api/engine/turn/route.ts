import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchId } = body;

  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  // In production: trigger the Glitch Engine to process the next turn
  return NextResponse.json({
    success: true,
    matchId,
    turn: body.turn + 1,
    message: 'Turn processed',
    actions: [],
    dramaScore: Math.floor(Math.random() * 100),
  });
}
