import { Server as SocketIOServer } from 'socket.io';

export class MatchBroadcaster {
  constructor(private io: SocketIOServer) {}

  broadcastTurnResult(matchId: string, turnResult: any) {
    this.io.to(`match:${matchId}`).emit('match:action', {
      matchId,
      ...turnResult,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastElimination(matchId: string, agentId: string, eliminatedBy: string) {
    this.io.to(`match:${matchId}`).emit('match:elimination', { matchId, agentId, eliminatedBy });
    this.io.emit('match:elimination', { matchId, agentId, eliminatedBy });
  }

  broadcastMatchEnd(matchId: string, winner: string, finalTurn: number) {
    this.io.to(`match:${matchId}`).emit('match:ended', { matchId, winner, finalTurn });
    this.io.emit('match:ended', { matchId, winner, finalTurn });
  }

  broadcastPredictionUpdate(marketId: string, update: any) {
    this.io.emit('prediction:update', { marketId, ...update });
  }

  broadcastBurn(amount: number, total: number) {
    this.io.emit('economy:burn', { amount, total });
  }
}
