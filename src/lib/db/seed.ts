import { prisma } from "./client";

export async function seedDatabase() {
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
  return { arena };
}
