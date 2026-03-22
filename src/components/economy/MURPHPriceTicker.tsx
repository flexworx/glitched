'use client';
import { useEffect, useState } from 'react';

export function MURPHPriceTicker() {
  const [price, setPrice] = useState(0.0028);
  const [change, setChange] = useState(+12.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(p => +(p + (Math.random() - 0.48) * 0.0001).toFixed(6));
      setChange(c => +(c + (Math.random() - 0.5) * 0.5).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isUp = change >= 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] border border-white/10 rounded-lg">
      <span className="text-xs font-bold text-white/50">$MURPH</span>
      <span className="text-sm font-bold font-mono text-white">${price.toFixed(6)}</span>
      <span className={['text-xs font-bold', isUp ? 'text-[#00ff88]' : 'text-red-400'].join(' ')}>
        {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
      </span>
    </div>
  );
}
export default MURPHPriceTicker;
