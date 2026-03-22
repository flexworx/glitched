import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalSupply: 1_000_000_000,
    circulating: 987_550_000,
    totalBurned: 12_450_000,
    dailyBurn: 8100,
    predictionVolume24h: 245000,
    activeMarkets: 3,
  });
}
