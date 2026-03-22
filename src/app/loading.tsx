export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" />
        <p className="text-white/40 text-sm font-mono">Loading arena...</p>
      </div>
    </div>
  );
}
