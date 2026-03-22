'use client';
import dynamic from 'next/dynamic';

const RedZoneDashboard = dynamic(() => import('@/components/arena/RedZoneDashboard'), { ssr: false, loading: () => (
  <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mx-auto mb-3" />
      <p className="text-white/30 text-sm">Loading RedZone...</p>
    </div>
  </div>
)});

export default function RedZonePage() {
  return <RedZoneDashboard />;
}
