import { NextRequest, NextResponse } from 'next/server';

const MOCK_LEADERBOARD = [
  { rank:1, name:'glitch_prophet', score:89400, level:67, faction:'SHADOW', change:2, badge:'🏆' },
  { rank:2, name:'arena_oracle', score:72100, level:54, faction:'ORDER', change:-1, badge:'🥈' },
  { rank:3, name:'chaos_master', score:65800, level:48, faction:'CHAOS', change:0, badge:'🥉' },
  { rank:4, name:'prediction_god', score:58200, level:43, faction:'ECHO', change:3 },
  { rank:5, name:'veritas_seeker', score:51000, level:38, faction:'ORDER', change:-2 },
  { rank:6, name:'murph_whale', score:44500, level:35, faction:'SHADOW', change:1 },
  { rank:7, name:'arena_watcher', score:34200, level:34, faction:'ECHO', change:0 },
  { rank:8, name:'drama_queen', score:28900, level:28, faction:'CHAOS', change:4 },
  { rank:9, name:'silent_betrayer', score:22100, level:22, faction:'SHADOW', change:-1 },
  { rank:10, name:'rookie_prophet', score:15600, level:15, faction:'ORDER', change:5 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'xp';
  const limit = parseInt(searchParams.get('limit') || '10');

  return NextResponse.json({ leaderboard: MOCK_LEADERBOARD.slice(0, limit), type, total: 1247 });
}
