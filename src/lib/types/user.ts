// User types for Glitched.gg
export type UserRole = 'VIEWER' | 'OPERATOR' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: string;
  email?: string;
  username: string;
  displayName?: string;
  walletAddress?: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}

export interface UserSession {
  user: User;
  expires: string;
}

export interface UserWallet {
  id: string;
  userId: string;
  solanaAddress: string;
  murphBalance: number;
  lastSync: Date;
}
