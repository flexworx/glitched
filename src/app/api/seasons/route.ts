import { NextRequest, NextResponse } from 'next/server';

const SEASONS = [
  { id:'2', name:'Season 2: Emergence', status:'active', startDate:'2025-03-01', endDate:'2025-04-30', episodes:12, completedEpisodes:7, battlePassPrice:500, totalMatches:48, murphBurned:1200000 },
  { id:'1', name:'Season 1: Genesis', status:'ended', startDate:'2025-01-01', endDate:'2025-02-28', episodes:10, completedEpisodes:10, battlePassPrice:300, totalMatches:40, murphBurned:980000 },
];

export async function GET() {
  return NextResponse.json({ seasons: SEASONS, currentSeason: SEASONS[0] });
}
