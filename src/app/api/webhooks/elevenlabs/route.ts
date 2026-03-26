import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = (body.type as string) ?? 'unknown';
  const headerEntries = Object.fromEntries(req.headers.entries());

  console.log('[ElevenLabs Webhook]', eventType, JSON.stringify(body).slice(0, 300));

  let webhookEvent;
  try {
    webhookEvent = await prisma.webhookEvent.create({
      data: {
        source: 'elevenlabs',
        eventType,
        payload: body as any,
        headers: headerEntries as any,
        status: 'received',
      },
    });
  } catch (err) {
    console.error('[ElevenLabs Webhook] Failed to persist event:', err);
    // Still return 200 so the provider doesn't retry indefinitely
    return NextResponse.json({ received: true, persisted: false });
  }

  // Mark as processed
  try {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { status: 'processed', processedAt: new Date() },
    });
  } catch (err) {
    console.error('[ElevenLabs Webhook] Failed to mark as processed:', err);
  }

  return NextResponse.json({ received: true, eventId: webhookEvent.id });
}
