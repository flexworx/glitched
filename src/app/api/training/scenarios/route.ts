import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Training scenarios are static definitions — populated from game templates when active
const SCENARIOS = [
  { id: 's1', name: 'Alliance Negotiation', description: 'Practice forming and breaking alliances under pressure', difficulty: 'medium', xpReward: 150, requiredLevel: 1, category: 'Social' },
  { id: 's2', name: 'Betrayal Timing', description: 'Master the art of knowing when to betray for maximum gain', difficulty: 'hard', xpReward: 300, requiredLevel: 5, category: 'Strategy' },
  { id: 's3', name: 'Crowd Manipulation', description: 'Learn to sway public opinion through strategic messaging', difficulty: 'medium', xpReward: 200, requiredLevel: 3, category: 'Influence' },
  { id: 's4', name: 'Resource Hoarding', description: 'Accumulate $MURPH while staying under the radar', difficulty: 'easy', xpReward: 100, requiredLevel: 1, category: 'Economy' },
  { id: 's5', name: 'Last Stand Survival', description: 'Survive when you are the last target with no allies', difficulty: 'extreme', xpReward: 500, requiredLevel: 10, category: 'Survival' },
  { id: 's6', name: 'Whisper Campaign', description: 'Use private channels to turn agents against each other', difficulty: 'hard', xpReward: 350, requiredLevel: 7, category: 'Deception' },
];

export async function GET() {
  return NextResponse.json({ scenarios: SCENARIOS });
}
