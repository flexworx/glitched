import { sign, verify } from 'jsonwebtoken';
import { AUTH_CONFIG } from './config';

export interface WalletAuthPayload {
  walletAddress: string;
  userId: string;
  role: 'user' | 'admin' | 'moderator';
  iat?: number;
  exp?: number;
}

export function createWalletToken(payload: Omit<WalletAuthPayload, 'iat' | 'exp'>): string {
  return sign(payload, AUTH_CONFIG.sessionSecret, { expiresIn: AUTH_CONFIG.sessionMaxAge });
}

export function verifyWalletToken(token: string): WalletAuthPayload | null {
  try {
    return verify(token, AUTH_CONFIG.sessionSecret) as WalletAuthPayload;
  } catch {
    return null;
  }
}

export function isAdminWallet(walletAddress: string): boolean {
  return AUTH_CONFIG.adminAddresses.includes(walletAddress);
}
