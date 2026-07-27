import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Avatar } from '@/components/ui/Avatar';
import { searchAll } from '@/api/search';
import clsx from 'clsx';

const centerTabs = [
  { id: 'feed', icon: '📰', path: '/' },
  { id: 'explore', icon: '🧭', path: '/explore' },
  { id: 'chats', icon: '💬', path: '/chats', feature: 'chat' },
  { id: 'groups', icon: '👥', path: '/groups', feature: 'groups' },
  { id: 'market', icon: '🛒', path: '/market', feature: 'marketplace' },
];

export const DesktopHeader = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { isFeatureEnabled } = useSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const visibleTabs = centerTabs.filter(tab => !tab.feature || isFeatureEnabled(tab.feature));

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
    <header className="flex-shrink-0 sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">

        {/* Left — Logo + Search */}
        <div className="flex items-center gap-2 w-[280px]">
          <div onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-white font-black text-xs">RV</span>
            )}
          </div>
          <div className="relative flex-1" ref={searchRef}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🔍</span>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setShowSearch(true)}
              placeholder="Search..." className="w-full pl-8 pr-8 py-1.5 rounded-full bg-[var(--color-bg)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults(null); setShowSearch(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs">✕</button>
            )}
            {showSearch && (
              <>
                <div className="absolute top-12 left-0 w-80 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] max-h-80 overflow-y-auto z-50">
                  {searchLoading && <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">Searching...</div>}
                  {!searchLoading && searchResults && (
                    <div>
                      {searchResults.users?.length > 0 && (
                        <div className="p-2">
                          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase px-2 mb-1">People</p>
                          {searchResults.users.slice(0, 5).map(u => (
                            <div key={u._id} onClick={() => handleSelect('user', u._id)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                              <Avatar src={u.avatar} name={u.firstName} size="sm" verified={u.hdmVerified} />
                              <div className="min-w-0"><p className="text-xs font-semibold text-[var(--color-text)] truncate">{u.firstName} {u.lastName}</p><p className="text-[10px] text-[var(--color-text-secondary)]">{u.department || 'RVNP'}</p></div>
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
                    </div>
                  )}
                </div>
                <div className="fixed inset-0 z-40" onClick={() => setShowSearch(false)} />
              </>
            )}
          </div>
        </div>

        {/* Center — Tabs */}
        <div className="flex items-center gap-0.5">
          {visibleTabs.map(tab => {
            const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
            return (
              <button key={tab.id} onClick={() => navigate(tab.path)}
                className={clsx('relative px-5 h-14 flex items-center transition-all duration-200 border-b-[3px]',
                  isActive ? 'text-[var(--color-primary)] border-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-bg)]')}>
                <span className="text-xl">{tab.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1 w-[280px] justify-end">
          <button onClick={() => navigate('/friends')} className="w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm hover:bg-[var(--color-surface-hover)]" title="Friends">👥</button>
          <button onClick={() => navigate('/notifications')} className="relative w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm hover:bg-[var(--color-surface-hover)]" title="Notifications">
            🔔
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {user ? (
            <button onClick={() => navigate('/profile')} className="ml-1"><Avatar src={user.avatar} name={user.firstName} size="sm" verified={user.hdmVerified} /></button>
          ) : (
            <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm hover:bg-[var(--color-surface-hover)]">👤</button>
          )}
        </div>
      </div>
    </header>
  );
};