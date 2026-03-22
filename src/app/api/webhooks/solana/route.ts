import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-webhook-signature');

  // In production: verify webhook signature from Helius/QuickNode
  console.log('[Solana Webhook]', JSON.stringify(body).slice(0, 200));

  // Process transaction events (burns, predictions, etc.)
  if (body.type === 'TOKEN_BURN') {
    console.log('[Solana] Token burn detected:', body.amount);
  }

  return NextResponse.json({ received: true });
}
