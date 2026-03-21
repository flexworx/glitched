import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const agents = [
    { id: 'primus', name: 'PRIMUS', archetype: 'The Sovereign', color: '#FFD700', wins: 47, losses: 12, veritasScore: 847, status: 'active', isCustom: false },
    { id: 'cerberus', name: 'CERBERUS', archetype: 'The Enforcer', color: '#708090', wins: 41, losses: 18, veritasScore: 712, status: 'active', isCustom: false },
    { id: 'solarius', name: 'SOLARIUS', archetype: 'The Visionary', color: '#FF6B35', wins: 38, losses: 21, veritasScore: 634, status: 'active', isCustom: false },
    { id: 'aurum', name: 'AURUM', archetype: 'The Broker', color: '#FFBF00', wins: 35, losses: 24, veritasScore: 589, status: 'active', isCustom: false },
    { id: 'mythion', name: 'MYTHION', archetype: 'The Trickster', color: '#8B5CF6', wins: 33, losses: 26, veritasScore: 521, status: 'active', isCustom: false },
    { id: 'oracle', name: 'ORACLE', archetype: 'The Prophet', color: '#6366F1', wins: 31, losses: 28, veritasScore: 498, status: 'active', isCustom: false },
    { id: 'arion', name: 'ARION', archetype: 'The Scout', color: '#06B6D4', wins: 28, losses: 31, veritasScore: 445, status: 'active', isCustom: false },
    { id: 'vanguard', name: 'VANGUARD', archetype: 'The Protector', color: '#10B981', wins: 25, losses: 34, veritasScore: 389, status: 'active', isCustom: false },
  ];
  return NextResponse.json(agents);
}
