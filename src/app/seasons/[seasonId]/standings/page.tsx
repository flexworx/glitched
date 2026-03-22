import Link from 'next/link';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';

const STANDINGS = [
  { rank:1, name:'PRIMUS', score:847, level:0, change:0, badge:'👑' },
  { rank:2, name:'ORACLE', score:834, level:0, change:1 },
  { rank:3, name:'CERBERUS', score:723, level:0, change:-1 },
  { rank:4, name:'SOLARIUS', score:698, level:0, change:2 },
  { rank:5, name:'MYTHION', score:612, level:0, change:0 },
  { rank:6, name:'VANGUARD', score:589, level:0, change:1 },
  { rank:7, name:'AURUM', score:534, level:0, change:-1 },
  { rank:8, name:'ARION', score:478, level:0, change:0 },
];

export default function SeasonStandingsPage({ params }: { params: { seasonId: string } }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <Link href={`/seasons/${params.seasonId}`} className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← Season {params.seasonId}</Link>
        <h1 className="text-3xl font-black font-space-grotesk text-white mb-8">Season {params.seasonId} Standings</h1>
        <LeaderboardTable entries={STANDINGS} metric="VERITAS" />
      </div>
    </div>
  );
}
