import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    flags: [],
    pending: 2,
    resolved: 1,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ success: true, action: body.action });
}
