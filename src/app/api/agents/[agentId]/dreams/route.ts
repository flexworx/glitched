import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  return NextResponse.json({
    agentId: params.agentId,
    dreams: [
      { id:'d1', title:'The Perfect Betrayal', content:'A recurring vision of executing the ultimate betrayal.', frequency:12, sentiment:'ambition' },
    ],
    total: 1,
  });
}
