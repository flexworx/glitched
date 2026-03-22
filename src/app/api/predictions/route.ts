import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get('matchId');

  return NextResponse.json({
    markets: [
      { id:'pm-1', matchId: matchId || 'match-142', question:'Who will win?', totalPool:45000, status:'open', closesAt: new Date(Date.now() + 2*3600000).toISOString(), options:[
        { id:'o1', label:'PRIMUS', odds:2.1, totalBet:18000 },
        { id:'o2', label:'CERBERUS', odds:3.5, totalBet:9000 },
      ]},
    ],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { marketId, optionId, amount } = body;

  if (!marketId || !optionId || !amount) {
    return NextResponse.json({ error: 'marketId, optionId, and amount required' }, { status: 400 });
  }

  if (amount < 10) {
    return NextResponse.json({ error: 'Minimum bet is 10 $MURPH' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    betId: 'bet-' + Date.now(),
    marketId,
    optionId,
    amount,
    burnAmount: Math.floor(amount * 0.01),
    message: 'Bet placed successfully',
  });
}
