'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface AdminUser {
  id: string; username: string; email: string; role: string;
  statusTier: string; murphBalance: number; isBanned: boolean;
  createdAt: string; _count: { predictions: number; agents: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load users');
      setUsers(data.data?.users ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId + action);
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">User Management</h1>
          <p className="text-white/40 text-sm mt-1">{users.length.toLocaleString()} registered users</p>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00ff88]/50 w-full sm:w-64"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">{error}</div>
      )}

      {!loading && (
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden sm:table-cell">Tier</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden md:table-cell">$MURPH</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden md:table-cell">Predictions</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No users found.</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-white">{user.username}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
                          {user.statusTier ?? 'BOOTLOADER'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#00ff88] hidden md:table-cell">
                        {(user.murphBalance ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60 hidden md:table-cell">
                        {user._count?.predictions ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={['px-2 py-0.5 text-xs rounded-full',
                          user.isBanned ? 'bg-red-500/10 text-red-400' :
                          user.role === 'admin' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-[#00ff88]/10 text-[#00ff88]'].join(' ')}>
                          {user.isBanned ? 'BANNED' : user.role === 'admin' ? 'ADMIN' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {!user.isBanned ? (
                            <button
                              onClick={() => handleAction(user.id, 'ban')}
                              disabled={actionLoading === user.id + 'ban'}
                              className="min-h-[36px] px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(user.id, 'unban')}
                              disabled={actionLoading === user.id + 'unban'}
                              className="min-h-[36px] px-3 py-1 text-xs bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50"
                            >
                              Unban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
