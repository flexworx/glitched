#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding arena configurations...');

  const arenaFiles = fs.readdirSync(path.join(__dirname, '../data/arenas'));

  for (const file of arenaFiles) {
    if (!file.endsWith('.json')) continue;

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/arenas', file), 'utf-8'));

    console.log(\`  ✓ \${data.name}\`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(console.error);
