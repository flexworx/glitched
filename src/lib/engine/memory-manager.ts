export interface MemoryEntry {
  turn: number;
  type: 'action' | 'observation' | 'conversation' | 'betrayal' | 'alliance';
  content: string;
  emotionalWeight: number;
  timestamp: string;
}

export interface RelationshipMemory {
  agentId: string;
  trustLevel: number;
  allianceStatus: 'none' | 'allied' | 'enemy' | 'neutral';
  interactions: number;
  lastInteraction: string;
  betrayed: boolean;
}

export class MemoryManager {
  private memories = new Map<string, { shortTerm: MemoryEntry[]; longTerm: MemoryEntry[]; relationships: Map<string, RelationshipMemory> }>();

  initializeAgent(agentId: string, matchId: string) {
    this.memories.set(`${matchId}:${agentId}`, { shortTerm: [], longTerm: [], relationships: new Map() });
  }

  addMemory(agentId: string, matchId: string, entry: Omit<MemoryEntry, 'timestamp'>) {
    const key = `${matchId}:${agentId}`;
    const memory = this.memories.get(key);
    if (!memory) return;
    const fullEntry = { ...entry, timestamp: new Date().toISOString() };
    memory.shortTerm.push(fullEntry);
    if (Math.abs(entry.emotionalWeight) > 0.7) memory.longTerm.push(fullEntry);
    if (memory.shortTerm.length > 20) memory.shortTerm.shift();
  }

  updateRelationship(agentId: string, matchId: string, targetId: string, update: Partial<RelationshipMemory>) {
    const memory = this.memories.get(`${matchId}:${agentId}`);
    if (!memory) return;
    const existing = memory.relationships.get(targetId) || { agentId: targetId, trustLevel: 0.5, allianceStatus: 'neutral' as const, interactions: 0, lastInteraction: new Date().toISOString(), betrayed: false };
    memory.relationships.set(targetId, { ...existing, ...update, lastInteraction: new Date().toISOString() });
  }

  getContextSummary(agentId: string, matchId: string): string {
    const memory = this.memories.get(`${matchId}:${agentId}`);
    if (!memory) return '';
    const recent = memory.shortTerm.slice(-5).map(m => m.content).join(' | ');
    const rels = Array.from(memory.relationships.entries()).map(([id, r]) => `${id}:trust=${r.trustLevel.toFixed(1)}`).join(', ');
    return `Recent: ${recent}
Relationships: ${rels}`;
  }
}
