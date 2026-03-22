export type UserRole = 'user' | 'admin' | 'moderator' | 'byoa_creator';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: ['view_matches', 'place_bets', 'view_agents', 'submit_byoa'],
  moderator: ['view_matches', 'place_bets', 'view_agents', 'submit_byoa', 'moderate_chat', 'review_agents'],
  byoa_creator: ['view_matches', 'place_bets', 'view_agents', 'submit_byoa', 'view_agent_internals'],
  admin: ['*'], // all permissions
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(permission);
}
