import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const AGENTS = [
  { id: "primus", name: "PRIMUS", title: "The Sovereign", mbti: "ENTJ", enneagram: "8w7", wins: 47, losses: 12, veritas: 847, color: "#FFD700" },
  { id: "cerberus", name: "CERBERUS", title: "The Enforcer", mbti: "ISTJ", enneagram: "1w9", wins: 41, losses: 18, veritas: 712, color: "#708090" },
  { id: "solarius", name: "SOLARIUS", title: "The Visionary", mbti: "ENFJ", enneagram: "3w4", wins: 38, losses: 21, veritas: 634, color: "#FF6B35" },
  { id: "aurum", name: "AURUM", title: "The Broker", mbti: "ENTP", enneagram: "7w8", wins: 35, losses: 24, veritas: 589, color: "#FFBF00" },
  { id: "mythion", name: "MYTHION", title: "The Trickster", mbti: "ENTP", enneagram: "7w6", wins: 33, losses: 26, veritas: 521, color: "#8B5CF6" },
  { id: "oracle", name: "ORACLE", title: "The Prophet", mbti: "INFJ", enneagram: "5w4", wins: 31, losses: 28, veritas: 498, color: "#6366F1" },
  { id: "arion", name: "ARION", title: "The Scout", mbti: "ISTP", enneagram: "9w8", wins: 28, losses: 31, veritas: 445, color: "#06B6D4" },
  { id: "vanguard", name: "VANGUARD", title: "The Protector", mbti: "ISFJ", enneagram: "2w1", wins: 25, losses: 34, veritas: 389, color: "#14B8A6" },
];
async function main() {
  for (const agent of AGENTS) {
    await prisma.agent.upsert({ where: { id: agent.id }, update: {}, create: { ...agent, isActive: true, isCustom: false } });
    console.log("Agent:", agent.name);
  }
  console.log("Seed complete");
}
main().catch(console.error).finally(() => prisma.$disconnect());
