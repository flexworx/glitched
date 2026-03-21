// Message types for Glitched.gg
export type MessageChannel =
  | 'PUBLIC_BROADCAST'
  | 'BIG_SCREEN'
  | 'TEAM_CHANNEL'
  | 'FRIEND_GROUP'
  | 'DIRECT_MESSAGE'
  | 'OPERATOR_WHISPER'
  | 'SPECTATOR_CHAT'
  | 'REFEREE_CHANNEL';

export interface Message {
  id: string;
  matchId: string;
  turnId?: string;
  senderId: string;
  senderName: string;
  channel: MessageChannel;
  content: string;
  targetId?: string;
  groupId?: string;
  isFlagged: boolean;
  isFiltered: boolean;
  isBigScreen: boolean;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface ContentFilterResult {
  passed: boolean;
  filteredContent?: string;
  flagType?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: string;
}

export interface MessageBusConfig {
  channels: MessageChannel[];
  maxMessagesPerTurn: number;
  bigScreenCostActions: number;
  dmCostActions: number;
}
