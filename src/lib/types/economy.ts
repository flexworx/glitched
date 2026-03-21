// Economy types for Glitched.gg
export type TransactionType =
  | 'MATCH_REWARD'
  | 'PREDICTION_WIN'
  | 'AGENT_TRADE'
  | 'BRIBE'
  | 'KNOWLEDGE_PACK'
  | 'COSMETIC_PURCHASE'
  | 'BATTLE_PASS'
  | 'VIEWER_TIP'
  | 'SPONSORSHIP'
  | 'BURN'
  | 'DEPOSIT'
  | 'WITHDRAWAL';

export interface MurphTransaction {
  id: string;
  fromWalletId?: string;
  toWalletId?: string;
  amount: number;
  txType: TransactionType;
  solanaSignature?: string;
  matchId?: string;
  description?: string;
  burnAmount: number;
  timestamp: Date;
}

export interface MurphStats {
  totalSupply: number;
  circulatingSupply: number;
  totalBurned: number;
  burnRate24h: number;
  price: number;
  marketCap: number;
  volume24h: number;
  holders: number;
}

export interface MatchRewardPool {
  matchType: 'regular' | 'tournament' | 'championship' | 'season_finale';
  totalPool: number;
  champion: number;
  runnerUp: number;
  thirdPlace: number;
  survivors: number;
  eliminated: number;
  viewerPool: number;
}

export const MATCH_REWARD_POOLS: Record<string, MatchRewardPool> = {
  regular: {
    matchType: 'regular',
    totalPool: 10000,
    champion: 3000,
    runnerUp: 1500,
    thirdPlace: 1000,
    survivors: 500,
    eliminated: 100,
    viewerPool: 0,
  },
  tournament: {
    matchType: 'tournament',
    totalPool: 25000,
    champion: 7500,
    runnerUp: 4000,
    thirdPlace: 2500,
    survivors: 1000,
    eliminated: 250,
    viewerPool: 0,
  },
  championship: {
    matchType: 'championship',
    totalPool: 100000,
    champion: 40000,
    runnerUp: 20000,
    thirdPlace: 10000,
    survivors: 0,
    eliminated: 5000,
    viewerPool: 0,
  },
  season_finale: {
    matchType: 'season_finale',
    totalPool: 500000,
    champion: 200000,
    runnerUp: 100000,
    thirdPlace: 50000,
    survivors: 25000,
    eliminated: 10000,
    viewerPool: 0,
  },
};

export const BURN_RATES = {
  knowledgePack: 0.70,
  cosmetic: 0.50,
  transferTax: 0.01,
  battlePass: 0.40,
  briberyTax: 0.05,
  dealEscrowFee: 0.025,
};
