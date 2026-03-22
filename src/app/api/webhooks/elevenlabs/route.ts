import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('[ElevenLabs Webhook]', body.type);
  return NextResponse.json({ received: true });
}
