import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: '📰', label: 'Feed' },
  { to: '/explore', icon: '🧭', label: 'Explore' },
  { to: '/chats', icon: '💬', label: 'Chats', feature: 'chat' },
  { to: '/groups', icon: '👥', label: 'Groups', feature: 'groups' },
  { to: '/market', icon: '🛒', label: 'Market', feature: 'marketplace' },
  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard', feature: 'leaderboard' },
];

export const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  const { settings, isFeatureEnabled } = useSettings();
  const navigate = useNavigate();
  const visibleItems = navItems.filter(item => !item.feature || isFeatureEnabled(item.feature));

  return (
    <div className="flex flex-col h-full p-3">
      <div className="p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-lg">RV</span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-[var(--color-text)]">{settings.systemName}</h2>
            <p className="text-[10px] text-[var(--color-text-secondary)]">from HDM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {visibleItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
              isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
            )}>
            <span className="text-xl">{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-[var(--color-border)] pt-3 mt-3">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--color-bg)] transition-colors">
            <Avatar src={user.avatar} name={user.firstName} size="md" verified={user.hdmVerified} />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-[var(--color-text)] truncate flex items-center gap-1">
                {user.firstName} {user.lastName}
                {user.hdmVerified && <VerifiedBadge size={12} />}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">{user.email}</p>
            </div>
          </button>
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 mt-1 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)] transition-colors">
            <span className="text-lg">🚪</span><span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};