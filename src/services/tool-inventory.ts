/**
 * Tool Inventory Service — Schema Migration Pending
 * Missing models: ToolInventory, ToolPurchaseLog
 */

export async function getAgentInventory(agentId: string) {
  return { items: [], agentId };
}

export async function purchaseTool(agentId: string, toolId: string) {
  return { success: false, message: 'Tool inventory schema migration pending' };
}

export async function getInventorySummary(agentId: string) {
  return { legendary: 0, rare: 0, uncommon: 0, common: 0, total: 0 };
}

export async function getPurchaseHistory(agentId: string) {
  return [];
}
