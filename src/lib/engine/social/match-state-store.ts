import type { SocialGameState } from '../../types/glitch-engine';

/**
 * In-memory match state store.
 * In production this would be backed by Redis or a database;
 * for the testing dashboard we keep state in memory so the
 * decide / advance endpoints can read and write it cheaply.
 */
export const matchStates = new Map<string, SocialGameState>();
