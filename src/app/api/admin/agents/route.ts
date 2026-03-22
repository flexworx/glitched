import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    agents: [],
    total: 8,
    pending: 1,
  });
}
