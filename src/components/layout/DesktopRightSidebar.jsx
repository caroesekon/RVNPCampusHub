import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { searchUsers } from '@/api/search';
import { getTopContributors } from '@/api/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

export const DesktopRightSidebar = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggested, setSuggested] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [usersRes, topRes] = await Promise.all([
          searchUsers('', 1),
          getTopContributors(),
        ]);
        setSuggested((usersRes.data || usersRes).filter(u => u._id !== user?._id).slice(0, 3));
        setTopContributors((topRes.data || topRes).slice(0, 3));
      } catch {}
    };
    fetchData();
  }, [user]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        <div className="bg-[var(--color-bg)] rounded-xl p-4">
          <h3 className="font-bold text-[var(--color-text)] text-sm mb-3">🔥 Trending</h3>
          <div className="space-y-2">
            {['Rugby Match Today', 'Exam Timetable Out', 'Hostel B Party', 'Workshop C Open', 'Agri Show Friday'].map((topic, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer transition-colors">
                <span className="text-xs font-bold text-[var(--color-primary)]">#{i + 1}</span><span>{topic}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-bg)] rounded-xl p-4">
          <h3 className="font-bold text-[var(--color-text)] text-sm mb-3">👤 Suggested</h3>
          {suggested.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">No suggestions yet</p>
          ) : (
            <div className="space-y-3">
              {suggested.map((u) => (
                <div key={u._id} onClick={() => navigate(`/profile/${u._id}`)} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-surface-hover)] rounded-lg p-2 transition-colors">
                  <Avatar src={u.avatar} name={u.firstName} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1">
                      {u.firstName} {u.lastName}
                      {u.hdmVerified && <VerifiedBadge size={10} />}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{u.department || 'RVNP'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--color-bg)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[var(--color-text)] text-sm">🏆 Top Contributors</h3>
            <button onClick={() => navigate('/leaderboard')} className="text-xs text-[var(--color-primary)] font-semibold hover:underline">View All</button>
          </div>
          {topContributors.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">No rankings yet</p>
          ) : (
            <div className="space-y-2">
              {topContributors.map((entry, i) => (
                <div key={entry.user?._id || i} className="flex items-center gap-2 text-sm">
                  <span>{medals[i] || `#${i + 1}`}</span>
                  <span className="flex-1 font-medium text-[var(--color-text)] truncate">{entry.user?.firstName} {entry.user?.lastName}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{entry.score || 0} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-[var(--color-border)] p-4 space-y-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {[{ label: 'Terms', path: '/legal/terms' },{ label: 'Privacy', path: '/legal/privacy' },{ label: 'Guidelines', path: '/legal/guidelines' },{ label: 'Marketplace Policy', path: '/legal/marketplace' }].map(l => (
            <button key={l.path} onClick={() => navigate(l.path)} className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline transition-colors">{l.label}</button>
          ))}
        </div>
        <div className="text-[11px] text-[var(--color-text-muted)] space-y-0.5">
          {settings.supportEmail && <p>📧 <a href={`mailto:${settings.supportEmail}`} className="hover:text-[var(--color-text)] hover:underline">{settings.supportEmail}</a></p>}
          {settings.supportPhone && <p>📞 {settings.supportPhone}</p>}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)]">
          <p className="font-semibold">{settings.systemName}</p>
          <p>from HDM</p>
          <p className="mt-1">© {currentYear} HDM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};