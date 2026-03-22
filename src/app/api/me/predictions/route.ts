import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    bets: [
      { id:'b1', marketId:'pm-1', question:'Who will win Match #142?', optionLabel:'PRIMUS', amount:500, odds:2.1, status:'open', potentialPayout:1050 },
    ],
    total: 1,
    totalWon: 320,
    totalLost: 200,
  });
}
