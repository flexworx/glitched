import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const streams = [
    { platform: 'Twitch', isLive: false, viewers: 0, rtmpUrl: 'rtmp://live.twitch.tv/app' },
    { platform: 'YouTube', isLive: false, viewers: 0, rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2' },
    { platform: 'Kick', isLive: false, viewers: 0, rtmpUrl: 'rtmp://fa723fc1b171.global-contribute.live-video.net/app' },
    { platform: 'X (Twitter)', isLive: false, viewers: 0, rtmpUrl: 'rtmp://ingest.pscp.tv:80/x' },
  ];
  return NextResponse.json({ streams });
}
