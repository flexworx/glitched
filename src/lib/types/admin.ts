// Admin types for Glitched.gg
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface ModerationItem {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  reviewedById?: string;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
}

export interface ChaosEvent {
  type: 'environmental' | 'rule' | 'social' | 'sponsor';
  name: string;
  description: string;
  effect: Record<string, unknown>;
  dramaBonus: number;
}

export interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  websocket: 'healthy' | 'degraded' | 'down';
  gameEngine: 'healthy' | 'degraded' | 'down';
  claudeApi: 'healthy' | 'degraded' | 'down';
  solanaRpc: 'healthy' | 'degraded' | 'down';
  activeMatches: number;
  connectedClients: number;
  apiResponseTime: number;
  errorRate: number;
}

export interface AgentEscalationLevel {
  level: 0 | 1 | 2 | 3 | 4;
  name: 'MONITOR' | 'CAUTION' | 'ALERT' | 'LOCKDOWN' | 'SHUTDOWN';
  description: string;
}
