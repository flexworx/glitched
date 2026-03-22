import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    services: [
      { name:'Next.js Web', port:3000, status:'healthy', uptime:'99.9%' },
      { name:'WebSocket Server', port:3001, status:'healthy', uptime:'99.7%' },
      { name:'Game Engine', port:3002, status:'healthy', uptime:'99.8%' },
    ],
    cpu: 34,
    memory: 58,
    wsConnections: 342,
    timestamp: new Date().toISOString(),
  });
}
