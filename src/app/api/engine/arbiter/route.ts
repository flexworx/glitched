import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, gameState } = body;

  if (!action || !gameState) {
    return NextResponse.json({ error: 'action and gameState required' }, { status: 400 });
  }

  // In production: call Claude API with ARBITER system prompt
  return NextResponse.json({
    valid: true,
    reason: null,
    modifiedAction: null,
    penalty: null,
    narrative: `${action.agentName} executes ${action.action}.`,
  });
}
