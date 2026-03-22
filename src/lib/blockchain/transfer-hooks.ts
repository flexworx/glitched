// Transfer Hooks: SPL Token-2022 transfer hook handlers
export interface TransferHookData {
  source: string;
  destination: string;
  amount: number;
  mint: string;
  authority: string;
}

export function calculateTransferFee(amount: number): number {
  // 0.5% transfer fee, max 1000 MURPH
  return Math.min(Math.floor(amount * 0.005), 1000);
}

export function shouldBurnOnTransfer(source: string, destination: string): boolean {
  // Burn on transfers to prediction pools
  return destination.startsWith('prediction_pool_');
}

export function processTransferHook(data: TransferHookData): {
  fee: number;
  burnAmount: number;
  netAmount: number;
} {
  const fee = calculateTransferFee(data.amount);
  const burnAmount = shouldBurnOnTransfer(data.source, data.destination) ? Math.floor(data.amount * 0.01) : 0;
  const netAmount = data.amount - fee - burnAmount;

  return { fee, burnAmount, netAmount };
}
