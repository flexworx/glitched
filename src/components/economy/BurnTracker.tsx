'use client';
import { BurnMeter } from './BurnMeter';

interface BurnTrackerProps {
  compact?: boolean;
}

export function BurnTracker({ compact = false }: BurnTrackerProps) {
  return <BurnMeter totalBurned={12450000} dailyBurn={8100} size={compact ? 'sm' : 'md'} />;
}
export default BurnTracker;
