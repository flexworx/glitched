import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const signature = req.headers.get('x-webhook-signature');
  const eventType = (body.type as string) ?? 'unknown';
  const headerEntries = Object.fromEntries(req.headers.entries());

  // In production: verify webhook signature from Helius/QuickNode
  console.log('[Solana Webhook]', eventType, JSON.stringify(body).slice(0, 300));

  let webhookEvent;
  try {
    webhookEvent = await prisma.webhookEvent.create({
      data: {
        source: 'solana',
        eventType,
        payload: body as any,
        headers: headerEntries as any,
        status: 'received',
      },
    });
  } catch (err) {
    console.error('[Solana Webhook] Failed to persist event:', err);
    return NextResponse.json({ received: true, persisted: false });
  }

  // Process token burn events
  if (eventType === 'TOKEN_BURN') {
    try {
      const amount = Number(body.amount) || 0;
      const txSignature = (body.signature as string) ?? null;
      const burner = (body.burner as string) ?? (body.from as string) ?? null;

      console.log(`[Solana] Token burn detected: ${amount} $MURPH from ${burner}`);

      await prisma.murphBurn.create({
        data: {
          amount,
          burnReason: `On-chain burn from ${burner ?? 'unknown'}`,
          txSignature: txSignature ?? undefined,
        },
      });

      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'processed', processedAt: new Date() },
      });
    } catch (err) {
      console.error('[Solana Webhook] Failed to process TOKEN_BURN:', err);
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'failed', error: String(err) },
      }).catch(() => {});
    }
  } else {
    // Mark non-burn events as processed
    try {
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'processed', processedAt: new Date() },
      });
    } catch (err) {
      console.error('[Solana Webhook] Failed to mark as processed:', err);
    }
  }

  return NextResponse.json({ received: true, eventId: webhookEvent.id });
}
