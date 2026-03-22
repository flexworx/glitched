import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.on('connect', () => console.log('[WS] Connected:', socket?.id));
    socket.on('disconnect', (reason) => console.log('[WS] Disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[WS] Error:', err.message));
  }
  return socket;
}

export function joinMatch(matchId: string): void {
  getSocket().emit('join:match', { matchId });
}

export function leaveMatch(matchId: string): void {
  getSocket().emit('leave:match', { matchId });
}

export function subscribeToMatch(matchId: string, handlers: {
  onTurn?: (data: unknown) => void;
  onAction?: (data: unknown) => void;
  onDrama?: (data: unknown) => void;
  onElimination?: (data: unknown) => void;
  onMatchEnd?: (data: unknown) => void;
}): () => void {
  const sock = getSocket();
  joinMatch(matchId);

  if (handlers.onTurn) sock.on(`match:${matchId}:turn`, handlers.onTurn);
  if (handlers.onAction) sock.on(`match:${matchId}:action`, handlers.onAction);
  if (handlers.onDrama) sock.on(`match:${matchId}:drama`, handlers.onDrama);
  if (handlers.onElimination) sock.on(`match:${matchId}:elimination`, handlers.onElimination);
  if (handlers.onMatchEnd) sock.on(`match:${matchId}:end`, handlers.onMatchEnd);

  return () => {
    leaveMatch(matchId);
    if (handlers.onTurn) sock.off(`match:${matchId}:turn`, handlers.onTurn);
    if (handlers.onAction) sock.off(`match:${matchId}:action`, handlers.onAction);
    if (handlers.onDrama) sock.off(`match:${matchId}:drama`, handlers.onDrama);
    if (handlers.onElimination) sock.off(`match:${matchId}:elimination`, handlers.onElimination);
    if (handlers.onMatchEnd) sock.off(`match:${matchId}:end`, handlers.onMatchEnd);
  };
}
