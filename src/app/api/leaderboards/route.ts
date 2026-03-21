import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'global';
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const entries = Array.from({ length: limit }, (_, i) => ({
    rank: i + 1,
    username: ['CryptoWarlord', 'NeonPhantom', 'VoidWalker', 'GlitchMaster', 'QuantumRogue', 'ShadowBroker', 'IronFist', 'NexusKing', 'DataWraith', 'ByteHunter', 'CircuitBreaker', 'PixelReaper', 'CodeSerpent', 'BinaryGhost', 'LogicBomb', 'SynapseStrike', 'CoreMelter', 'RootAccess', 'KernelPanic', 'StackOverflow'][i % 20],
    level: Math.max(1, 60 - i * 2),
    xp: Math.max(0, 150000 - i * 7000),
    wins: Math.max(0, 47 - i),
    murph: Math.max(0, 85000 - i * 4000),
    faction: ['iron_veil', 'neon_syndicate', 'void_council', 'golden_accord'][i % 4],
    change: Math.floor(Math.random() * 5) - 2,
  }));
  
  return NextResponse.json(entries);
}
