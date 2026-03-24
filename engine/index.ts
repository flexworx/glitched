import express from 'express';
import { calculateDramaScore } from '../src/lib/engine/drama-score';
import { validateActions } from '../src/lib/engine/action-validator';

const app = express();
app.use(express.json());

const PORT = process.env.ENGINE_PORT || 3002;

// Health check
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', service: 'game-engine', timestamp: new Date().toISOString() });
});

// Process agent turn — assembles context and calculates drama
app.post('/api/engine/turn', async (req: any, res: any) => {
  try {
    const { matchId, agentId, gameState } = req.body;
    if (!matchId || !agentId || !gameState) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const drama = calculateDramaScore(gameState);
    res.json({ success: true, drama, matchId, agentId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Validate action
app.post('/api/engine/validate', async (req: any, res: any) => {
  try {
    const { actions, gameState, agentId } = req.body;
    const result = validateActions(agentId, actions || [], gameState);
    res.json({ valid: result.isValid, rejectedActions: result.rejectedActions, validActions: result.validActions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cron: start hourly match
app.post('/api/cron/start-match', async (_req: any, res: any) => {
  try {
    const matchId = `match-${Date.now()}`;
    console.log(`[CRON] Starting match: ${matchId}`);
    res.json({ success: true, matchId, startedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cron: daily season update
app.post('/api/cron/season-update', async (_req: any, res: any) => {
  try {
    console.log('[CRON] Running daily season update');
    res.json({ success: true, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cron: weekly burn report
app.post('/api/cron/burn-report', async (_req: any, res: any) => {
  try {
    console.log('[CRON] Generating weekly burn report');
    res.json({ success: true, reportedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[GAME ENGINE] Running on port ${PORT}`);
});
