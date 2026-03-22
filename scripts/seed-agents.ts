#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pantheon agents...');

  const agentFiles = fs.readdirSync(path.join(__dirname, '../data/pantheon'));

  for (const file of agentFiles) {
    if (!file.endsWith('.glitch.json')) continue;

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pantheon', file), 'utf-8'));
    if (data.role === 'referee' || data.role === 'narrator') continue;

    await prisma.agent.upsert({
      where: { id: data.id },
      update: { name: data.name, archetype: data.archetype, color: data.color, personality: data.traits },
      create: {
        id: data.id,
        name: data.name,
        archetype: data.archetype,
        color: data.color,
        mbti: data.mbti,
        enneagram: String(data.enneagram),
        bio: data.bio,
        type: 'pantheon',
        status: 'active',
        personality: data.traits,
        veritasScore: 500,
        wins: 0,
        losses: 0,
        totalMatches: 0,
      },
    });

    console.log(\`  ✓ \${data.name}\`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(console.error);
