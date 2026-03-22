'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';

const MOCK_USERS = [
  { id:'u1', username:'arena_watcher', email:'user1@example.com', level:34, xp:34200, murph:15000, joined:'2025-01-15', status:'active', predictions:47 },
  { id:'u2', username:'glitch_prophet', email:'user2@example.com', level:67, xp:89400, murph:82000, joined:'2025-01-02', status:'active', predictions:234 },
  { id:'u3', username:'chaos_agent', email:'user3@example.com', level:12, xp:8900, murph:2500, joined:'2025-02-20', status:'suspended', predictions:8 },
];

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space-grotesk text-white">User Management</h1>
        <p className="text-white/40 text-sm mt-1">{MOCK_USERS.length.toLocaleString()} registered users</p>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="table-scroll"><table className="w-full text-sm">
          <thead><tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">User</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Level</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">$MURPH</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Predictions</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {MOCK_USERS.map(user => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-white">{user.username}</p>
                  <p className="text-xs text-white/40">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-white/70">Lv.{user.level}</td>
                <td className="px-4 py-3 text-[#00ff88] font-mono">{user.murph.toLocaleString()}</td>
                <td className="px-4 py-3 text-white/70">{user.predictions}</td>
                <td className="px-4 py-3">
                  <span className={['px-2 py-0.5 text-xs rounded-full',
                    user.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'].join(' ')}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-xs min-h-[44px] touch-manipulation bg-white/5 border border-white/10 text-white/60 rounded hover:text-white transition-colors">View</button>
                    <button className="px-3 py-2 text-xs min-h-[44px] touch-manipulation bg-red-500/5 border border-red-500/20 text-red-400/60 rounded hover:text-red-400 transition-colors">
                      {user.status === 'active' ? 'Suspend' : 'Restore'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </AdminLayout>
  );
}
