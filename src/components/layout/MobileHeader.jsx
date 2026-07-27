import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Avatar } from '@/components/ui/Avatar';
import { searchAll } from '@/api/search';

export const MobileHeader = () => {
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAll(searchQuery.trim());
        setSearchResults(res.data || res);
      } catch { setSearchResults(null); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSelect = (type, id) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults(null);
    if (type === 'user') navigate(`/profile/${id}`);
    else if (type === 'group') navigate(`/groups/${id}`);
  };

  return (
    <header className="bg-[var(--color-primary)] flex-shrink-0">
      {/* Top Row — Brand + Actions */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-white font-black text-[10px]">RV</span>
            )}
          </div>
          <h1 className="text-white text-sm font-bold truncate">{settings.systemName}</h1>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <button onClick={() => navigate('/friends')} className="w-7 h-7 flex items-center justify-center text-base text-white/80 hover:text-white">👥</button>
          <button onClick={() => navigate('/notifications')} className="relative w-7 h-7 flex items-center justify-center text-base text-white/80 hover:text-white">
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-accent)] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {user ? (
            <button onClick={() => navigate('/profile')} className="flex-shrink-0">
              <Avatar src={user.avatar} name={user.firstName} size="sm" />
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0 text-white">👤</button>
          )}
        </div>
      </div>

      {/* Search Row */}
      <div className="px-3 pb-2.5 relative" ref={searchRef}>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-white/50">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            placeholder="Search people, groups..."
            className="w-full pl-8 pr-8 py-1.5 rounded-full bg-white/15 text-white text-xs placeholder-white/40 border border-transparent focus:outline-none focus:bg-white/25 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults(null); setShowSearch(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 text-xs hover:text-white">✕</button>
          )}
        </div>

        {showSearch && (
          <>
            <div className="absolute top-10 left-0 right-0 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] max-h-60 overflow-y-auto z-50 mx-3">
              {searchLoading && <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">Searching...</div>}
              {!searchLoading && searchResults && (
                <div>
                  {searchResults.users?.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase px-2 mb-1">People</p>
                      {searchResults.users.slice(0, 5).map(u => (
                        <div key={u._id} onClick={() => handleSelect('user', u._id)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                          <Avatar src={u.avatar} name={u.firstName} size="sm" verified={u.hdmVerified} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--color-text)] truncate">{u.firstName} {u.lastName}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">{u.department || 'RVNP'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.groups?.length > 0 && (
                    <div className="p-2 border-t border-[var(--color-border)]">
                      <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase px-2 mb-1">Groups</p>
                      {searchResults.groups.slice(0, 3).map(g => (
                        <div key={g._id} onClick={() => handleSelect('group', g._id)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                          <div className="w-7 h-7 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">{g.name?.charAt(0)}</div>
                          <p className="text-xs font-semibold text-[var(--color-text)] truncate">{g.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!searchResults.users?.length && !searchResults.groups?.length && (
                    <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">No results for "{searchQuery}"</div>
                  )}
                </div>
              )}
              {!searchLoading && !searchResults && searchQuery.trim() && (
                <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">Type to search...</div>
              )}
            </div>
            <div className="fixed inset-0 z-40" onClick={() => setShowSearch(false)} />
          </>
        )}
      </div>
    </header>
  );
};