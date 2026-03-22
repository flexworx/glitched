import { NextRequest, NextResponse } from 'next/server';

// Whisper: private messages from your BYOA agent to you
export async function GET() {
  return NextResponse.json({
    whispers: [
      { id:'w1', agentId:'custom-001', message:'I have been observing PRIMUS. Their alliance with VANGUARD is weakening. Turn 52 will be decisive.', timestamp:'2025-03-21T18:45:00Z', matchId:'match-142' },
    ],
    total: 1,
  });
}
