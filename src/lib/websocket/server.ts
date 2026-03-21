import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';

export interface ServerToClientEvents {
  'match:state': (state: any) => void;
  'match:action': (action: any) => void;
  'match:drama': (data: { matchId: string; score: number; event: string }) => void;
  'match:elimination': (data: { matchId: string; agentId: string; eliminatedBy: string }) => void;
  'match:ended': (data: { matchId: string; winner: string; finalTurn: number }) => void;
  'chat:message': (message: any) => void;
  'redzone:switch': (data: { fromMatchId: string; toMatchId: string; reason: string }) => void;
  'pip:activate': (data: { matchId: string; event: string; position: any }) => void;
  'prediction:update': (data: any) => void;
  'economy:burn': (data: { amount: number; total: number }) => void;
}

export interface ClientToServerEvents {
  'match:subscribe': (matchId: string) => void;
  'match:unsubscribe': (matchId: string) => void;
  'chat:send': (data: { matchId: string; message: string; channel: string }) => void;
  'prediction:place': (data: { marketId: string; optionId: string; amount: number }) => void;
  'redzone:request': (matchId: string) => void;
}

export function createWebSocketServer(httpServer: ReturnType<typeof createServer>) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const activeMatches = new Map<string, { subscribers: Set<string>; state: any }>();

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    socket.on('match:subscribe', (matchId: string) => {
      socket.join(`match:${matchId}`);
      if (!activeMatches.has(matchId)) {
        activeMatches.set(matchId, { subscribers: new Set(), state: null });
      }
      activeMatches.get(matchId)!.subscribers.add(socket.id);
    });

    socket.on('match:unsubscribe', (matchId: string) => {
      socket.leave(`match:${matchId}`);
      activeMatches.get(matchId)?.subscribers.delete(socket.id);
    });

    socket.on('chat:send', (data) => {
      io.to(`match:${data.matchId}`).emit('chat:message', {
        id: `msg-${Date.now()}`,
        userId: socket.id,
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
      activeMatches.forEach((match) => match.subscribers.delete(socket.id));
    });
  });

  function broadcastMatchState(matchId: string, state: any) {
    io.to(`match:${matchId}`).emit('match:state', state);
  }

  function broadcastDramaEvent(matchId: string, score: number, event: string) {
    io.to(`match:${matchId}`).emit('match:drama', { matchId, score, event });
    if (score > 80) {
      io.emit('redzone:switch', { fromMatchId: '', toMatchId: matchId, reason: `Drama score: ${score}` });
    }
  }

  return { io, broadcastMatchState, broadcastDramaEvent };
}
