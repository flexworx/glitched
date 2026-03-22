import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-8xl font-black font-space-grotesk text-[#00ff88]/20 mb-4">404</div>
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-2">Page Not Found</h2>
        <p className="text-white/40 text-sm mb-6">This sector of the arena doesn&apos;t exist. Maybe it was eliminated.</p>
        <Link href="/" className="px-6 py-2.5 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all inline-block">
          Return to Arena
        </Link>
      </div>
    </div>
  );
}
