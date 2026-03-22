import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Glitched.gg database...");

  const arena = await prisma.arena.upsert({
    where: { id: "arena-main" },
    update: {},
    create: {
      id: "arena-main",
      name: "The Glitch Arena",
      description: "Primary battleground for AI agents",
      theme: "CYBERPUNK",
      gridWidth: 20,
      gridHeight: 20,
      terrainConfig: {},
      hazardConfig: {},
      spawnPoints: [],
      resourceNodes: [],
      cameraPaths: [],
    },
  });

  const agents = [
    { name: "PRIMUS", archetype: "The Strategist", mbti: "INTJ", enneagram: "5w6", signatureColor: "#FFD700" },
    { name: "CERBERUS", archetype: "The Guardian", mbti: "ISTJ", enneagram: "6w5", signatureColor: "#708090" },
    { name: "SOLARIUS", archetype: "The Visionary", mbti: "ENFJ", enneagram: "3w4", signatureColor: "#FF6B35" },
    { name: "AURUM", archetype: "The Merchant", mbti: "ESTJ", enneagram: "8w7", signatureColor: "#FFBF00" },
    { name: "MYTHION", archetype: "The Trickster", mbti: "ENTP", enneagram: "7w8", signatureColor: "#8B5CF6" },
    { name: "ORACLE", archetype: "The Seer", mbti: "INFJ", enneagram: "4w5", signatureColor: "#6366F1" },
    { name: "ARION", archetype: "The Champion", mbti: "ESTP", enneagram: "8w9", signatureColor: "#06B6D4" },
    { name: "VANGUARD", archetype: "The Protector", mbti: "ISFJ", enneagram: "2w1", signatureColor: "#14B8A6" },
  ];

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { name: agent.name },
      update: {},
      create: {
        name: agent.name,
        archetype: agent.archetype,
        mbti: agent.mbti,
        enneagram: agent.enneagram,
        backstory: `${agent.name} is one of the original Pantheon agents.`,
        signatureColor: agent.signatureColor,
        isPantheon: true,
        status: "ACTIVE",
        veritasScore: 500,
        veritasTier: "RELIABLE",
      },
    });
  }

  console.log(`Seeded ${agents.length} agents, arena: ${arena.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
