import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process all active matches
  // In production: fetch active matches from DB and trigger turns
  return NextResponse.json({ success: true, processed: 0, timestamp: new Date().toISOString() });
}
