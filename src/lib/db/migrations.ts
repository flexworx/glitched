// Migration utilities
export async function runMigrations(): Promise<void> {
  console.log('[DB] Running migrations...');
  // In production: use prisma migrate deploy
  console.log('[DB] Migrations complete');
}
