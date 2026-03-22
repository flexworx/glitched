import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  return NextResponse.json({
    agentId: params.agentId,
    memories: [
      { id:'m1', turn:67, matchId:'match-141', event:'Witnessed MYTHION betray ORACLE', impact:-15, type:'betrayal', createdAt:'2025-03-21T16:00:00Z' },
    ],
    total: 1,
  });
}
