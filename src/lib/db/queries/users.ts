import { prisma } from '../client';

export async function getUserByWallet(walletAddress: string) {
  return prisma.user.findUnique({
    where: { walletAddress },
    include: { wallet: true, streak: true },
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: { wallet: true },
  });
}

export async function createUser(data: {
  username: string;
  walletAddress?: string;
  email?: string;
}) {
  return prisma.user.create({
    data: {
      username: data.username,
      walletAddress: data.walletAddress,
      email: data.email,
    },
  });
}

export async function updateUserProfile(userId: string, data: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
