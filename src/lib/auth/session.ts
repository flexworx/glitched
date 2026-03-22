import { cookies } from 'next/headers';
import { verifyWalletToken, WalletAuthPayload } from './wallet-auth';
import { AUTH_CONFIG } from './config';

export async function getSession(): Promise<WalletAuthPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
  if (!token) return null;
  return verifyWalletToken(token);
}

export async function requireSession(): Promise<WalletAuthPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function requireAdmin(): Promise<WalletAuthPayload> {
  const session = await requireSession();
  if (session.role !== 'admin') throw new Error('Forbidden');
  return session;
}
