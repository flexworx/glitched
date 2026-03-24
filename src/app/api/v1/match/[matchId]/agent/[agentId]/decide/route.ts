/**
 * POST /api/v1/match/{matchId}/agent/{agentId}/decide
 *
 * Spec-aligned agent decision endpoint. Proxies to the same logic as the
 * original /api/v1/match/{matchId}/decide route but includes agentId in the
 * URL path per the API contract spec (section 3.2).
 */
export { POST } from '../../../../[matchId]/decide/route';
