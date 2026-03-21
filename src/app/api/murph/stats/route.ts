import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalSupply: 1_000_000_000,
    circulatingSupply: 342_891_204,
    totalBurned: 18_234_891,
    currentPrice: 0.0014,
    marketCap: 480048,
    volume24h: 2100000,
    priceChange24h: 3.2,
    holders: 12847,
    burnRate7d: 2914000,
    lastUpdated: new Date().toISOString(),
  });
}
