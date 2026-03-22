export interface GLITCHJson {
  id: string; name: string; archetype: string; version: string; color: string;
  mbti: string; enneagram: string; traits: Record<string,number>;
  beliefs: string[]; speechPatterns: string[];
  decisionWeights: { attack:number; defend:number; negotiate:number; betray:number; ally:number; observe:number };
  systemPrompt: string;
}

export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[]; }

export function validateGLITCHJson(data: unknown): ValidationResult {
  const errors: string[] = [], warnings: string[] = [];
  if (!data || typeof data !== 'object') return { valid: false, errors: ['Root must be an object'], warnings: [] };
  const obj = data as Record<string,unknown>;
  const required = ['id','name','archetype','version','color','mbti','enneagram','traits','beliefs','speechPatterns','decisionWeights','systemPrompt'];
  for (const f of required) if (!(f in obj)) errors.push(`Missing required field: ${f}`);
  if (obj.traits && typeof obj.traits === 'object') {
    const traits = obj.traits as Record<string,unknown>;
    const traitFields = ['openness','conscientiousness','extraversion','agreeableness','neuroticism','aggressiveness','deceptiveness','loyalty','riskTolerance','adaptability','charisma','patience','ambition','empathy','creativity'];
    for (const t of traitFields) {
      if (!(t in traits)) errors.push(`Missing trait: ${t}`);
      else if (typeof traits[t] !== 'number' || (traits[t] as number)<0 || (traits[t] as number)>1) errors.push(`Trait ${t} must be 0-1`);
    }
  }
  if (obj.color && typeof obj.color === 'string' && !/^[0-9A-Fa-f]{6}$/.test(obj.color)) warnings.push('Color should be 6-char hex without #');
  return { valid: errors.length===0, errors, warnings };
}
