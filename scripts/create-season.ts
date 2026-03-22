import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createSeason() {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const season = await prisma.season.create({
    data: {
      name: `Season ${Date.now()}`,
      number: 1,
      status: "UPCOMING",
      startedAt: now,
      endedAt: endDate,
      config: {},
    },
  });

  console.log("Created season:", season.id, season.name);
  await prisma.$disconnect();
}

createSeason().catch(console.error);
