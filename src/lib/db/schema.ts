// Schema type helpers — mirrors Prisma schema
export type AgentStatus = 'active' | 'inactive' | 'pending' | 'banned';
export type MatchStatus = 'pending' | 'active' | 'paused' | 'ended' | 'cancelled';
export type ActionType = 'attack' | 'defend' | 'negotiate' | 'betray' | 'ally' | 'observe' | 'retreat' | 'heal' | 'sabotage' | 'inspire';
export type AllianceStatus = 'active' | 'broken' | 'betrayed' | 'expired';
export type MessageChannel = 'arena' | 'whisper' | 'alliance' | 'public' | 'admin' | 'system' | 'predictions' | 'commentary';
