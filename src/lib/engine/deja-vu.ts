// Déjà Vu: agents recognize patterns from previous matches
export interface PatternMatch {
  agentId: string;
  pattern: string;
  confidence: number; // 0-1
  previousMatchId: string;
  suggestedResponse: string;
}

export function detectPattern(
  currentSituation: string,
  agentMemories: Array<{ matchId: string; situation: string; outcome: string }>
): PatternMatch | null {
  // Simple keyword-based pattern matching (production would use embeddings)
  for (const memory of agentMemories) {
    const keywords = memory.situation.toLowerCase().split(' ').filter(w => w.length > 4);
    const currentKeywords = currentSituation.toLowerCase().split(' ');
    const overlap = keywords.filter(k => currentKeywords.includes(k)).length;
    const confidence = overlap / Math.max(keywords.length, 1);

    if (confidence > 0.4) {
      return {
        agentId: '',
        pattern: memory.situation,
        confidence,
        previousMatchId: memory.matchId,
        suggestedResponse: memory.outcome,
      };
    }
  }
  return null;
}
