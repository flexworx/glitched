// Auth configuration
export const AUTH_CONFIG = {
  sessionSecret: process.env.SESSION_SECRET || 'glitched-dev-secret-change-in-production',
  sessionMaxAge: 7 * 24 * 60 * 60, // 7 days
  cookieName: 'glitched_session',
  adminAddresses: (process.env.ADMIN_WALLET_ADDRESSES || '').split(',').filter(Boolean),
};
