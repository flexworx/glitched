import { Server as SocketIOServer } from 'socket.io';

interface ActiveMatch {
  matchId: string;
  dramaScore: number;
  lastUpdated: number;
  agentsAlive: number;
  recentEvents: string[];
}

export class RedZoneCoordinator {
  private activeMatches = new Map<string, ActiveMatch>();
  private currentFocusMatchId: string | null = null;
  private switchCooldown = 30000;
  private lastSwitch = 0;

  constructor(private io: SocketIOServer) {}

  updateMatch(matchId: string, update: Partial<ActiveMatch>) {
    const existing = this.activeMatches.get(matchId) || {
      matchId,
      dramaScore: 0,
      lastUpdated: Date.now(),
      agentsAlive: 8,
      recentEvents: [],
    };
    this.activeMatches.set(matchId, { ...existing, ...update, lastUpdated: Date.now() });
    this.evaluateSwitch();
  }

  private evaluateSwitch() {
    const now = Date.now();
    if (now - this.lastSwitch < this.switchCooldown) return;

    let highestDrama = 0;
    let highestMatchId: string | null = null;

    this.activeMatches.forEach((match) => {
      if (match.dramaScore > highestDrama) {
        highestDrama = match.dramaScore;
        highestMatchId = match.matchId;
      }
    });

    if (highestMatchId && highestMatchId !== this.currentFocusMatchId && highestDrama > 60) {
      const previousMatchId = this.currentFocusMatchId;
      this.currentFocusMatchId = highestMatchId;
      this.lastSwitch = now;

      this.io.emit('redzone:switch', {
        fromMatchId: previousMatchId || '',
        toMatchId: highestMatchId,
        reason: `Drama score: ${highestDrama}`,
        dramaScore: highestDrama,
      });
    }
  }

  getCurrentFocus(): string | null {
    return this.currentFocusMatchId;
  }

  getActiveMatches(): ActiveMatch[] {
    return Array.from(this.activeMatches.values()).sort((a, b) => b.dramaScore - a.dramaScore);
  }
}
