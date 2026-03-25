/**
 * Seasonal Reset Service — Schema Migration Pending
 * Missing fields: preGameSpent, seasonBudget on Agent model
 * Missing enum: HumanStatusTier in Prisma client
 */

export async function runSeasonalReset(seasonId: string): Promise<void> {
  console.log('[seasonal-reset] Schema migration pending for seasonId:', seasonId);
}

export async function calculateSeasonRewards(seasonId: string): Promise<void> {
  console.log('[seasonal-reset] Schema migration pending for seasonId:', seasonId);
}

export async function archiveSeasonData(seasonId: string): Promise<void> {
  console.log('[seasonal-reset] Schema migration pending for seasonId:', seasonId);
}
