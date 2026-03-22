import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    earned: ['a1', 'a2', 'a3'],
    total: 3,
    available: 50,
  });
}
