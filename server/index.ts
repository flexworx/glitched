import { createServer } from 'http';
import express from 'express';
import { createWebSocketServer } from '../src/lib/websocket/server';
import { RedZoneCoordinator } from '../src/lib/websocket/redzone-coordinator';
import { ChatHandler } from '../src/lib/websocket/chat-handler';

const app = express();
const httpServer = createServer(app);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'websocket', timestamp: new Date().toISOString() });
});

// Create WebSocket server
const { io, broadcastMatchState, broadcastDramaEvent } = createWebSocketServer(httpServer);
const redZone = new RedZoneCoordinator(io);
const chat = new ChatHandler(io);

// Expose broadcast functions for game engine to call
app.post('/internal/broadcast/state', (req, res) => {
  const { matchId, state } = req.body;
  broadcastMatchState(matchId, state);
  res.json({ ok: true });
});

app.post('/internal/broadcast/drama', (req, res) => {
  const { matchId, score, event } = req.body;
  broadcastDramaEvent(matchId, score, event);
  redZone.updateMatch(matchId, { dramaScore: score });
  res.json({ ok: true });
});

app.get('/internal/redzone/active', (req, res) => {
  res.json({
    current: redZone.getCurrentFocus(),
    matches: redZone.getActiveMatches(),
  });
});

const PORT = parseInt(process.env.WS_PORT || '3001', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[WS Server] Listening on port ${PORT}`);
});

export { io, redZone, chat };
