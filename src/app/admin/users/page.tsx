'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  Search, Users, Shield, Ban, CheckCircle, XCircle,
  RefreshCw, Filter, Eye, TrendingUp, Wallet, Star,
  Crown, AlertTriangle, Clock, MoreHorizontal
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  statusTier: string;
  createdAt: string;
  lastSeen?: string;
  isBanned?: boolean;
  lifetimeMurph: number;
  seasonMurph: number;
  _count: { agents: number; bets: number };
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#ef4444', OPERATOR: '#f59e0b', USER: '#0ea5e9', VIEWER: '#6b7280',
};
const TIER_COLORS: Record<string, string> = {
  BRONZE: '#cd7f32', SILVER: '#c0c0c0', GOLD: '#ffd700',
  PLATINUM: '#e5e4e2', DIAMOND: '#b9f2ff', LEGEND: '#00ff88',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [showBanned, setShowBanned] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: String(page), limit: String(PER_PAGE) });
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (tierFilter !== 'ALL') params.set('tier', tierFilter);
      if (showBanned) params.set('banned', 'true');
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch { /* keep */ }
    finally { setLoading(false); }
  }, [search, page, roleFilter, tierFilter, showBanned]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: string, value?: string) => {
    setActionLoading(userId + action);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      if (res.ok) {
        showToast(`User ${action} successful`);
        fetchUsers();
        if (selectedUser?.id === userId) setSelectedUser(null);
      } else {
        showToast(`Failed to ${action} user`, 'err');
      }
    } catch {
      showToast('Network error', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => !u.isBanned).length,
    banned: users.filter(u => u.isBanned).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${
          toast.type === 'ok' ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">User Management</h1>
          <p className="text-white/40 text-sm mt-1">
            {stats.total} users · {stats.active} active · {stats.banned} banned · {stats.admins} admins
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 border text-xs rounded-lg transition-all flex items-center gap-1.5 ${showFilters ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats.total, color: '#0ea5e9', icon: Users },
          { label: 'Active', value: stats.active, color: '#00ff88', icon: CheckCircle },
          { label: 'Banned', value: stats.banned, color: '#ef4444', icon: Ban },
          { label: 'Admins', value: stats.admins, color: '#f59e0b', icon: Crown },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <p className="text-xs text-white/40">{label}</p>
            </div>
            <p className="text-2xl font-black font-space-grotesk" style={{ color }}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-[#0d0d1a] border border-white/10 rounded-xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Role</label>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00ff88]/50">
                  {['ALL', 'ADMIN', 'OPERATOR', 'USER', 'VIEWER'].map((r: string) => (
                    <option key={r} value={r} className="bg-[#0d0d1a]">{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Status Tier</label>
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00ff88]/50">
                  {['ALL', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND'].map((t: string) => (
                    <option key={t} value={t} className="bg-[#0d0d1a]">{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showBanned} onChange={e => setShowBanned(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00ff88] focus:ring-[#00ff88]/50" />
                  <span className="text-sm text-white/60">Show banned only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by username or email..."
          className="w-full pl-10 pr-4 py-3 bg-[#0d0d1a] border border-white/10 text-white placeholder-white/30 text-sm rounded-xl focus:outline-none focus:border-[#00ff88]/50 transition-colors"
        />
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User table */}
        <div className="lg:col-span-2 bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['User', 'Role', 'Tier', 'Agents', '$MURPH', 'Joined', 'Actions'].map((h: string) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin mx-auto" />
                  </td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">No users found</td></tr>
                ) : users.map(user => {
                  const roleColor = ROLE_COLORS[user.role] || '#6b7280';
                  const tierColor = TIER_COLORS[user.statusTier] || '#6b7280';
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <tr key={user.id}
                      onClick={() => setSelectedUser(isSelected ? null : user)}
                      className={`border-b border-white/5 cursor-pointer transition-colors ${isSelected ? 'bg-[#00ff88]/5' : user.isBanned ? 'bg-red-500/5' : 'hover:bg-white/3'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00ff88]/20 to-[#0ea5e9]/20 flex items-center justify-center text-xs font-bold text-white">
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${user.isBanned ? 'text-red-400 line-through' : 'text-white'}`}>{user.username}</p>
                            <p className="text-xs text-white/30 truncate max-w-[120px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ color: roleColor, background: `${roleColor}20` }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold" style={{ color: tierColor }}>{user.statusTier}</span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{user._count?.agents ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-[#00ff88]">{(user.lifetimeMurph || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {!user.isBanned ? (
                            <button onClick={() => handleAction(user.id, 'ban')}
                              disabled={!!actionLoading}
                              className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                              title="Ban User">
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => handleAction(user.id, 'unban')}
                              disabled={!!actionLoading}
                              className="p-1.5 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50"
                              title="Unban User">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setSelectedUser(isSelected ? null : user)}
                            className="p-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg hover:border-white/20 transition-all"
                            title="View Details">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-white/30">Page {page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 disabled:opacity-30 transition-all">
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={users.length < PER_PAGE}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 disabled:opacity-30 transition-all">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* User Detail Panel */}
        <div className="space-y-4">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#0ea5e9]/20 flex items-center justify-center text-xl font-black text-white">
                    {selectedUser.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-black text-white font-space-grotesk">{selectedUser.username}</h3>
                    <p className="text-xs text-white/40">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {selectedUser.isBanned && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-red-400">This user is banned</span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Role', value: selectedUser.role, color: ROLE_COLORS[selectedUser.role] || '#6b7280' },
                  { label: 'Tier', value: selectedUser.statusTier, color: TIER_COLORS[selectedUser.statusTier] || '#6b7280' },
                  { label: 'Agents', value: String(selectedUser._count?.agents ?? 0), color: '#0ea5e9' },
                  { label: 'Bets', value: String(selectedUser._count?.bets ?? 0), color: '#8b5cf6' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 bg-white/3 rounded-lg">
                    <p className="text-xs text-white/40 mb-1">{label}</p>
                    <p className="font-bold text-sm" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* $MURPH */}
              <div className="mb-4 p-3 bg-white/3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-[#00ff88]" />
                  <span className="text-xs text-white/40">$MURPH Balance</span>
                </div>
                <p className="text-lg font-black font-space-grotesk text-[#00ff88]">
                  {(selectedUser.lifetimeMurph || 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  Season: {(selectedUser.seasonMurph || 0).toLocaleString()}
                </p>
              </div>

              {/* Dates */}
              <div className="mb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> Joined</span>
                  <span className="text-white/60">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedUser.lastSeen && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1"><Eye className="w-3 h-3" /> Last Seen</span>
                    <span className="text-white/60">{new Date(selectedUser.lastSeen).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Role change */}
              <div className="mb-4">
                <label className="text-xs text-white/40 mb-1 block">Change Role</label>
                <div className="flex gap-2">
                  {['USER', 'OPERATOR', 'ADMIN'].map(role => (
                    <button key={role}
                      onClick={() => handleAction(selectedUser.id, 'set-role', role)}
                      disabled={!!actionLoading || selectedUser.role === role}
                      className={`flex-1 px-2 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 ${
                        selectedUser.role === role
                          ? 'border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88]'
                          : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                {!selectedUser.isBanned ? (
                  <button onClick={() => handleAction(selectedUser.id, 'ban')}
                    disabled={!!actionLoading}
                    className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Ban User
                  </button>
                ) : (
                  <button onClick={() => handleAction(selectedUser.id, 'unban')}
                    disabled={!!actionLoading}
                    className="px-3 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Unban
                  </button>
                )}
                <button onClick={() => handleAction(selectedUser.id, 'reset-password')}
                  disabled={!!actionLoading}
                  className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-xs font-bold rounded-lg hover:border-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Reset Pass
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center">
              <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select a user to view details</p>
            </div>
          )}

          {/* Tier Distribution */}
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Tier Distribution
            </h4>
            <div className="space-y-2">
              {['LEGEND', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].map(tier => {
                const count = users.filter(u => u.statusTier === tier).length;
                const pct = users.length > 0 ? (count / users.length) * 100 : 0;
                return (
                  <div key={tier} className="flex items-center gap-2">
                    <span className="text-xs w-16" style={{ color: TIER_COLORS[tier] }}>{tier}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: TIER_COLORS[tier] }} />
                    </div>
                    <span className="text-xs text-white/30 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
