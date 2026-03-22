import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

  // In production: fetch from Solana RPC
  return NextResponse.json({
    address,
    solBalance: 2.45,
    murphBalance: 15000,
    murphUsdValue: 0.0028 * 15000,
  });
}
