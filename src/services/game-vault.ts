/**
 * Game Vault Service
 * Manages the in-game store: Knowledge Packs, Battle Pass, and cosmetic items.
 * Models: KnowledgePack, BattlePass, BattlePassProgress, MurphTransaction
 */

import prisma from '@/lib/db/client';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface VaultItem {
  id: string;
  name: string;
  category: string;
  rarity: string;
  price: number;
  description: string;
  type: 'knowledge_pack' | 'battle_pass' | 'cosmetic';
}

// ─── Knowledge Packs ───────────────────────────────────────────────────────────

export async function getKnowledgePacks(filters?: { category?: string }) {
  return prisma.knowledgePack.findMany({
    where: {
      isActive: true,
      ...(filters?.category ? { category: filters.category } : {}),
    },
    orderBy: { priceMurph: 'asc' },
  });
}

export async function getKnowledgePack(packId: string) {
  return prisma.knowledgePack.findUnique({ where: { id: packId } });
}

export async function purchaseKnowledgePack(
  userId: string,
  packId: string
): Promise<{ success: boolean; message: string }> {
  const [user, pack] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    }),
    prisma.knowledgePack.findUnique({ where: { id: packId } }),
  ]);

  if (!user) return { success: false, message: 'User not found' };
  if (!pack) return { success: false, message: 'Knowledge pack not found' };
  if (!pack.isActive) return { success: false, message: 'This pack is no longer available' };

  const balance = user.wallet?.murphBalance ?? 0;
  if (balance < pack.priceMurph) {
    return { success: false, message: `Insufficient $MURPH. Need ${pack.priceMurph}, have ${balance}` };
  }

  // Deduct from wallet and record transaction
  await prisma.$transaction([
    prisma.userWallet.update({
      where: { userId },
      data: { murphBalance: { decrement: pack.priceMurph } },
    }),
    prisma.murphTransaction.create({
      data: {
        amount: -pack.priceMurph,
        txType: 'KNOWLEDGE_PACK',
        description: `Purchased Knowledge Pack: ${pack.name}`,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { lifetimeMurph: { increment: pack.priceMurph } },
    }),
  ]);

  return { success: true, message: `Successfully purchased ${pack.name}` };
}

// ─── Battle Pass ───────────────────────────────────────────────────────────────

export async function getActiveBattlePass(seasonId: string) {
  return prisma.battlePass.findFirst({
    where: { seasonId, isActive: true },
    include: {
      progress: { select: { userId: true, track: true, currentTier: true } },
    },
  });
}

export async function getUserBattlePassProgress(userId: string, passId: string) {
  return prisma.battlePassProgress.findUnique({
    where: { userId_passId: { userId, passId } },
    include: { pass: true },
  });
}

export async function purchaseBattlePassPremium(
  userId: string,
  passId: string
): Promise<{ success: boolean; message: string }> {
  const [user, pass, existing] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } }),
    prisma.battlePass.findUnique({ where: { id: passId } }),
    prisma.battlePassProgress.findUnique({
      where: { userId_passId: { userId, passId } },
    }),
  ]);

  if (!user) return { success: false, message: 'User not found' };
  if (!pass) return { success: false, message: 'Battle Pass not found' };
  if (!pass.isActive) return { success: false, message: 'Battle Pass is not active' };
  if (existing?.track === 'PREMIUM') return { success: false, message: 'Already have Premium Battle Pass' };

  const balance = user.wallet?.murphBalance ?? 0;
  if (balance < pass.priceMurph) {
    return { success: false, message: `Insufficient $MURPH. Need ${pass.priceMurph}, have ${balance}` };
  }

  await prisma.$transaction([
    prisma.userWallet.update({
      where: { userId },
      data: { murphBalance: { decrement: pass.priceMurph } },
    }),
    prisma.murphTransaction.create({
      data: {
        amount: -pass.priceMurph,
        txType: 'BATTLE_PASS',
        description: 'Premium Battle Pass purchase',
      },
    }),
    prisma.battlePassProgress.upsert({
      where: { userId_passId: { userId, passId } },
      create: { userId, passId, track: 'PREMIUM', currentTier: existing?.currentTier ?? 0 },
      update: { track: 'PREMIUM' },
    }),
  ]);

  return { success: true, message: 'Premium Battle Pass activated!' };
}

export async function advanceBattlePassTier(
  userId: string,
  passId: string,
  xpGained: number
): Promise<{ newTier: number; rewardsUnlocked: string[] }> {
  const progress = await prisma.battlePassProgress.findUnique({
    where: { userId_passId: { userId, passId } },
    include: { pass: true },
  });

  if (!progress) return { newTier: 0, rewardsUnlocked: [] };

  const xpPerTier = 1000;
  const newXp = progress.xpEarned + xpGained;
  const newTier = Math.min(Math.floor(newXp / xpPerTier), progress.pass.tierCount);
  const tiersGained = newTier - progress.currentTier;
  const rewardsUnlocked: string[] = [];

  if (tiersGained > 0) {
    const rewards = progress.pass.rewards as Record<string, unknown>;
    for (let t = progress.currentTier + 1; t <= newTier; t++) {
      const reward = rewards[String(t)];
      if (reward) rewardsUnlocked.push(String(reward));
    }

    await prisma.battlePassProgress.update({
      where: { userId_passId: { userId, passId } },
      data: { currentTier: newTier, xpEarned: newXp },
    });
  } else {
    await prisma.battlePassProgress.update({
      where: { userId_passId: { userId, passId } },
      data: { xpEarned: newXp },
    });
  }

  return { newTier, rewardsUnlocked };
}

// ─── Vault Catalog (unified view) ─────────────────────────────────────────────

export async function getVaultCatalog(filters?: { category?: string; rarity?: string }): Promise<VaultItem[]> {
  const packs = await getKnowledgePacks(filters?.category ? { category: filters.category } : undefined);

  return packs.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    rarity: 'common',
    price: p.priceMurph,
    description: p.description ?? '',
    type: 'knowledge_pack' as const,
  }));
}

export async function getVaultItem(itemId: string): Promise<VaultItem | null> {
  const pack = await getKnowledgePack(itemId);
  if (!pack) return null;
  return {
    id: pack.id,
    name: pack.name,
    category: pack.category,
    rarity: 'common',
    price: pack.priceMurph,
    description: pack.description,
    type: 'knowledge_pack',
  };
}

export async function purchaseVaultItem(
  userId: string,
  itemId: string
): Promise<{ success: boolean; message: string }> {
  return purchaseKnowledgePack(userId, itemId);
}

export async function getUserVaultInventory(userId: string): Promise<VaultItem[]> {
  // Return knowledge packs the user has purchased (via transaction history)
  // Get user wallet first
  const wallet = await prisma.userWallet.findUnique({ where: { userId }, select: { id: true } });
  if (!wallet) return [];
  const txs = await prisma.murphTransaction.findMany({
    where: { userWalletId: wallet.id, txType: 'KNOWLEDGE_PACK' },
    select: { description: true },
  });
  // Return as basic items from descriptions
  return txs.map((tx, i) => ({
    id: `tx-${i}`,
    name: (tx.description ?? '').replace('Purchased Knowledge Pack: ', ''),
    category: 'knowledge',
    rarity: 'common',
    price: 0,
    description: tx.description ?? '',
    type: 'knowledge_pack' as const,
  }));
}

// ─── Legacy export for backward compatibility ──────────────────────────────────
export const gameVaultService = {
  getItems: getVaultCatalog,
  getItem: getVaultItem,
  purchaseItem: purchaseVaultItem,
  getUserInventory: getUserVaultInventory,
};
