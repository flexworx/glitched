export interface CombatResult {
  attackerId: string;
  defenderId: string;
  damage: number;
  critical: boolean;
  eliminated: boolean;
  newDefenderHp: number;
  narrative: string;
}

export class CombatResolver {
  resolve(attacker: any, defender: any, action: any): CombatResult {
    const baseDamage = 10 + Math.floor(Math.random() * 15);
    const aggressionBonus = ((attacker.traits?.aggressiveness || 0.5) * 10);
    const defense = Math.floor((defender.traits?.conscientiousness || 0.5) * 5);
    const actualDamage = Math.max(0, Math.floor(baseDamage + aggressionBonus) - defense);
    const critical = Math.random() < 0.1;
    const finalDamage = critical ? Math.floor(actualDamage * 1.5) : actualDamage;
    const newHp = Math.max(0, (defender.hp || 100) - finalDamage);
    const eliminated = newHp === 0;

    return {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: finalDamage,
      critical,
      eliminated,
      newDefenderHp: newHp,
      narrative: eliminated
        ? `${attacker.name} eliminates ${defender.name}!`
        : critical
        ? `CRITICAL! ${attacker.name} hits ${defender.name} for ${finalDamage} damage!`
        : `${attacker.name} attacks ${defender.name} for ${finalDamage} damage.`,
    };
  }
}
