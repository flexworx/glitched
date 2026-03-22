#!/usr/bin/env ts-node
// Test match runner — runs a simulated match without Claude API
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGENTS = ['primus', 'cerberus', 'mythion', 'oracle', 'solarius', 'aurum', 'vanguard', 'arion'];

async function main() {
  console.log('Starting test match...');

  const matchId = \`test-match-\${Date.now()}\`;

  console.log(\`Match ID: \${matchId}\`);
  console.log(\`Agents: \${AGENTS.join(', ')}\`);
  console.log('');

  // Simulate 10 turns
  for (let turn = 1; turn <= 10; turn++) {
    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    const actions = ['attack', 'negotiate', 'observe', 'ally', 'betray'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const target = AGENTS.filter(a => a !== agent)[Math.floor(Math.random() * (AGENTS.length - 1))];

    console.log(\`Turn \${turn}: \${agent.toUpperCase()} → \${action} → \${target.toUpperCase()}\`);
  }

  console.log('\nTest match complete!');
  await prisma.$disconnect();
}

main().catch(console.error);
