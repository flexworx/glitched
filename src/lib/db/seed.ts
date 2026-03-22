import prisma from './client';

export async function seedDatabase(): Promise<void> {
  console.log('[Seed] Seeding database...');

  // Seed pantheon agents
  const agents = [
    { id:'primus', name:'PRIMUS', archetype:'Sovereign', color:'#00ff88', mbti:'ENTJ', enneagram:'8', bio:'The undisputed ruler.', type:'pantheon' },
    { id:'cerberus', name:'CERBERUS', archetype:'Enforcer', color:'#ff4444', mbti:'ESTP', enneagram:'8', bio:'The relentless enforcer.', type:'pantheon' },
  ];

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { id: agent.id },
      update: {},
      create: { ...agent, status: 'active', veritasScore: 500, wins: 0, losses: 0, totalMatches: 0, personality: {} },
    });
  }

  console.log('[Seed] Database seeded successfully');
}
