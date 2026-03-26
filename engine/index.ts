/**
 * Glitched.gg — Game Engine Service
 * Runs as a standalone Express server (port 3002)
 * Handles: turn processing, drama scoring, action validation, cron jobs
 */
import express from 'express';
import { calculateDramaScore } from '../src/lib/engine/drama-score';
import { validateActions } from '../src/lib/engine/action-validator';

const app = express();
app.use(express.json());

const PORT = process.env.ENGINE_PORT || 3002;
const CRON_SECRET = process.env.CRON_SECRET || '';

// ─── Middleware ───────────────────────────────────────────────────────────────

function verifyCronSecret(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'game-engine',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Turn Processing ──────────────────────────────────────────────────────────

app.post('/api/engine/turn', async (req, res) => {
  try {
    const { matchId, agentId, gameState } = req.body;
    if (!matchId || !agentId || !gameState)
      return res.status(400).json({ error: 'Missing required fields: matchId, agentId, gameState' });

    const drama = calculateDramaScore(gameState);

    // Notify Next.js app of drama score update via internal API
    if (process.env.NEXT_PUBLIC_APP_URL) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/engine/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CRON_SECRET}` },
        body: JSON.stringify({ matchId, dramaScore: drama }),
      }).catch(err => console.warn('[Engine] Failed to update drama score:', err));
    }

    res.json({ success: true, drama, matchId, agentId, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
});

// ─── Action Validation ────────────────────────────────────────────────────────

app.post('/api/engine/validate', async (req, res) => {
  try {
    const { actions, gameState, agentId } = req.body;
    if (!agentId || !gameState)
      return res.status(400).json({ error: 'Missing required fields: agentId, gameState' });

    const result = validateActions(agentId, actions || [], gameState);
    res.json({
      valid: result.isValid,
      rejectedActions: result.rejectedActions,
      validActions: result.validActions,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
});

// ─── Cron: Start Hourly Match ─────────────────────────────────────────────────

app.post('/api/cron/start-match', verifyCronSecret, async (_req, res) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Delegate to Next.js API which has Prisma access
    const response = await fetch(`${appUrl}/api/v1/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CRON_SECRET}` },
      body: JSON.stringify({ action: 'auto-start', source: 'cron' }),
    });

    const data = await response.json() as Record<string, unknown>;
    console.log(`[CRON] Match start result:`, data);
    res.json({ success: true, result: data, startedAt: new Date().toISOString() });
  } catch (err: unknown) {
    console.error('[CRON] start-match error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Cron: Advance Running Matches ───────────────────────────────────────────

app.post('/api/cron/advance-matches', verifyCronSecret, async (_req, res) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/engine/cron`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const data = await response.json() as Record<string, unknown>;
    res.json({ success: true, result: data });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Cron: Daily Season Update ────────────────────────────────────────────────

app.post('/api/cron/season-update', verifyCronSecret, async (_req, res) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Update season standings
    const response = await fetch(`${appUrl}/api/seasons`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const data = await response.json() as Record<string, unknown>;
    console.log('[CRON] Season update complete:', data);
    res.json({ success: true, updatedAt: new Date().toISOString() });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Cron: Settle Predictions ─────────────────────────────────────────────────

app.post('/api/cron/settle-predictions', verifyCronSecret, async (_req, res) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/engine/cron`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const data = await response.json() as Record<string, unknown>;
    res.json({ success: true, settled: data });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Cron: Generate Agent Dreams ─────────────────────────────────────────────

app.post('/api/cron/generate-dreams', verifyCronSecret, async (_req, res) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/agents/dreams/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CRON_SECRET}` },
      body: JSON.stringify({ source: 'nightly-cron' }),
    });
    const data = await response.json() as Record<string, unknown>;
    res.json({ success: true, dreams: data });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Cron: Update VERITAS Scores ─────────────────────────────────────────────

app.post('/api/cron/update-veritas', verifyCronSecret, async (_req, res) => {
  try {
    console.log('[CRON] Updating VERITAS scores for all agents');
    // In production: recalculate VERITAS scores based on recent match behavior
    res.json({ success: true, updatedAt: new Date().toISOString() });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Cron: Burn Analytics ────────────────────────────────────────────────────

app.post('/api/cron/burn-analytics', verifyCronSecret, async (_req, res) => {
  try {
    console.log('[CRON] Calculating daily burn analytics');
    res.json({ success: true, updatedAt: new Date().toISOString() });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Cron failed' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Engine] Glitched.gg Game Engine running on port ${PORT}`);
  console.log(`[Engine] CRON_SECRET: ${CRON_SECRET ? 'configured' : 'NOT SET (open access)'}`);
  console.log(`[Engine] App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`);
});

export default app;
