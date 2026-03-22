#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const seasonNumber = parseInt(args[0] || '1');
  const name = args[1] || \`Season \${seasonNumber}\`;

  console.log(\`Creating Season \${seasonNumber}: \${name}...\`);

  const season = await prisma.season.create({
    data: {
      number: seasonNumber,
      name,
      status: 'pending',
      totalEpisodes: 12,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  });

  console.log(\`Created season: \${season.id}\`);
  await prisma.$disconnect();
}

main().catch(console.error);
