import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'open';
  
  const markets = [
    {
      id: 'pred-match7-winner',
      matchId: 'match-7',
      title: 'Match 7 Winner',
      description: 'Who will win the Season 1 Episode 7 main match?',
      category: 'match',
      options: [
        { id: 'primus', label: 'PRIMUS', odds: 2.1, totalWagered: 45000 },
        { id: 'cerberus', label: 'CERBERUS', odds: 3.2, totalWagered: 28000 },
        { id: 'oracle', label: 'ORACLE', odds: 4.5, totalWagered: 18000 },
        { id: 'mythion', label: 'MYTHION', odds: 8.0, totalWagered: 9000 },
      ],
      closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      totalPool: 100000,
      createdAt: new Date().toISOString(),
    },
  ];
  
  return NextResponse.json(markets.filter(m => status === 'all' || m.status === status));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ id: `pred-${Date.now()}`, status: 'created', ...body }, { status: 201 });
}
