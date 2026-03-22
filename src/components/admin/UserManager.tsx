'use client';
import { useState } from 'react';

const MOCK_USERS = [
  { id:'u1', username:'glitch_prophet', email:'user1@example.com', level:12, murph:15000, joined:'Mar 1', status:'active' },
  { id:'u2', username:'arena_oracle', email:'user2@example.com', level:8, murph:8500, joined:'Mar 5', status:'active' },
  { id:'u3', username:'shadow_broker', email:'user3@example.com', level:3, murph:1200, joined:'Mar 15', status:'suspended' },
];

export function UserManager() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_USERS.filter(u => u.username.includes(search) || u.email.includes(search));

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)}
        className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 mb-4"
        placeholder="Search users..." />
      <div className="space-y-2">
        {filtered.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-[#0d0d1a] border border-white/10 rounded-xl">
            <div>
              <p className="font-bold text-white text-sm">{user.username}</p>
              <p className="text-xs text-white/30">{user.email} · Level {user.level} · {user.murph.toLocaleString()} $MURPH</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={['px-2 py-0.5 text-xs font-bold rounded-full', user.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'].join(' ')}>
                {user.status}
              </span>
              <button className="text-xs text-white/30 hover:text-white transition-colors">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default UserManager;
