export interface PlayerRating { mu: number; sigma: number; }

export function createRating(mu=25, sigma=8.333): PlayerRating { return { mu, sigma }; }
export function ordinal(r: PlayerRating): number { return r.mu - 3*r.sigma; }

export function rate(teams: PlayerRating[][], ranks: number[]): PlayerRating[][] {
  const results = teams.map(t => [...t]);
  for (let i=0; i<teams.length; i++) {
    for (let j=0; j<teams[i].length; j++) {
      const p = teams[i][j];
      let delta = 0;
      for (let k=0; k<teams.length; k++) {
        if (k===i) continue;
        const o = teams[k][0];
        const expected = 1/(1+Math.exp((o.mu-p.mu)/Math.sqrt(2*(p.sigma**2+o.sigma**2))));
        const actual = ranks[i]<ranks[k] ? 1 : ranks[i]>ranks[k] ? 0 : 0.5;
        delta += actual - expected;
      }
      const k = p.sigma**2/(p.sigma**2+1);
      results[i][j] = { mu: p.mu+k*delta*10, sigma: Math.max(0.1, p.sigma*(1-k*0.1)) };
    }
  }
  return results;
}

export function getRankTier(score: number): { tier: string; color: string } {
  if (score>=45) return { tier:'LEGENDARY', color:'#FFD700' };
  if (score>=38) return { tier:'ELITE', color:'#FF6B35' };
  if (score>=30) return { tier:'VETERAN', color:'#8B5CF6' };
  if (score>=22) return { tier:'CONTENDER', color:'#0EA5E9' };
  if (score>=14) return { tier:'CHALLENGER', color:'#00FF88' };
  return { tier:'ROOKIE', color:'#6B7280' };
}
