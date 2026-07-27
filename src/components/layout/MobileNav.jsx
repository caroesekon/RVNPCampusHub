import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useChat } from '@/context/ChatContext';
import clsx from 'clsx';

const tabs = [
  { id: 'feed', icon: '📰', label: 'Feed', path: '/' },
  { id: 'explore', icon: '🧭', label: 'Explore', path: '/explore' },
  { id: 'chats', icon: '💬', label: 'Chats', path: '/chats', feature: 'chat' },
  { id: 'groups', icon: '👥', label: 'Groups', path: '/groups', feature: 'groups' },
  { id: 'market', icon: '🛒', label: 'Market', path: '/market', feature: 'marketplace' },
];

export const MobileNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isFeatureEnabled } = useSettings();
  const { totalUnread } = useChat();

  const visibleTabs = tabs.filter(tab => !tab.feature || isFeatureEnabled(tab.feature));

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] flex justify-around items-center px-1 py-1.5 flex-shrink-0 fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto z-50">
      {visibleTabs.map(tab => {
        const isActive = tab.path === '/' ? pathname === '/' || pathname === '/posts' : pathname.startsWith(tab.path);
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={clsx(
              'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px] relative',
              isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[9px] font-semibold">{tab.label}</span>
            {tab.id === 'chats' && totalUnread > 0 && (
              <span className="absolute -top-1 right-0 w-4 h-4 bg-[var(--color-accent)] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        );
      })}
    </footer>
  );
};