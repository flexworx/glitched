import express from 'express';
import cron from 'node-cron';
import { GameStateManager } from '../src/lib/engine/game-state-manager';
import { ContextAssembler } from '../src/lib/engine/context-assembly';
import { ActionValidator } from '../src/lib/engine/action-validator';
import { DramaScoreCalculator } from '../src/lib/engine/drama-score';
import { ARBITER } from '../src/lib/engine/arbiter';
import { SHOWRUNNER } from '../src/lib/engine/showrunner';
import { ClaudeClient } from '../src/lib/engine/claude-client';

const app = express();
app.use(express.json());

const gameManager = new GameStateManager();
const contextAssembler = new ContextAssembler();
const actionValidator = new ActionValidator();
const dramaCalc = new DramaScoreCalculator();
const arbiter = new ARBITER();
const showrunner = new SHOWRUNNER();
const claude = new ClaudeClient();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'game-engine', timestamp: new Date().toISOString() });
});

// Start a new match
app.post('/matches/start', async (req, res) => {
  try {
    const { matchId, agentIds, seasonId, episodeNumber } = req.body;
    console.log(`[Engine] Starting match ${matchId} with agents: ${agentIds.join(', ')}`);
    res.json({ matchId, status: 'started', agentIds });
  } catch (error) {
    console.error('[Engine] Error starting match:', error);
    res.status(500).json({ error: 'Failed to start match' });
  }
});

// Process next turn
app.post('/matches/:matchId/turn', async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log(`[Engine] Processing turn for match ${matchId}`);
    res.json({ matchId, turn: 1, status: 'processed' });
  } catch (error) {
    console.error('[Engine] Error processing turn:', error);
    res.status(500).json({ error: 'Failed to process turn' });
  }
});

// Cron: Process active matches every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  console.log('[Engine] Cron: Processing active matches...');
});

// Cron: Daily season stats update at midnight
cron.schedule('0 0 0 * * *', async () => {
  console.log('[Engine] Cron: Updating season stats...');
});

// Cron: Hourly prediction market settlement check
cron.schedule('0 0 * * * *', async () => {
  console.log('[Engine] Cron: Checking prediction market settlements...');
});

const PORT = parseInt(process.env.ENGINE_PORT || '3002', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Game Engine] Listening on port ${PORT}`);
});
