import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboard, getMyRank } from '@/api/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { formatCompactNumber } from '@/utils/formatCurrency';

export const LeaderboardPage = () => {
  const { isFeatureEnabled } = useSettings();
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const leaderboardEnabled = isFeatureEnabled('leaderboard');

  useEffect(() => {
    if (!leaderboardEnabled) return;
    fetchData();
  }, [period, leaderboardEnabled]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lbRes, rankRes] = await Promise.all([getLeaderboard(period), getMyRank()]);
      setLeaderboard(lbRes.data || lbRes);
      setMyRank(rankRes.data || rankRes);
    } catch (err) { console.error('Failed to load leaderboard'); }
    finally { setLoading(false); }
  };

  if (!leaderboardEnabled) {
    return <EmptyState icon="🏆" title="Leaderboard is currently disabled" description="The admin has disabled this feature." />;
  }

  const tabs = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all_time', label: 'All Time' },
  ];

  const getMedal = (rank) => { if (rank === 1) return '🥇'; if (rank === 2) return '🥈'; if (rank === 3) return '🥉'; return null; };

  return (
    <div className="pb-20">
      {myRank && myRank.rank && (
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 rounded-xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Your Rank</p>
              <p className="text-3xl font-black">#{myRank.rank}</p>
              <p className="text-xs text-white/70 mt-1">{formatCompactNumber(myRank.score || 0)} points</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">Out of</p>
              <p className="text-xl font-bold">{formatCompactNumber(myRank.total || 0)}</p>
              <p className="text-xs text-white/70 mt-1">contributors</p>
            </div>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={period} onChange={setPeriod} className="mb-4" />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 rounded-full skeleton" /><div className="w-10 h-10 rounded-full skeleton" />
              <div className="flex-1 space-y-2"><div className="w-24 h-3 skeleton rounded" /><div className="w-16 h-2 skeleton rounded" /></div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <EmptyState icon="🏆" title="No rankings yet" description="Be the first to contribute and earn points!" />
      ) : (
        <div className="space-y-1">
          {leaderboard.map((entry, i) => {
            const rank = i + 1;
            const medal = getMedal(rank);
            const isMe = entry.user?._id === user?._id || entry.userId === user?._id;
            return (
              <div key={entry.user?._id || i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isMe ? 'bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20' : 'hover:bg-[var(--color-surface-hover)]'}`}>
                <div className="w-8 text-center flex-shrink-0">
                  {medal ? <span className="text-xl">{medal}</span> : <span className="text-sm font-bold text-[var(--color-text-muted)]">#{rank}</span>}
                </div>
                <Avatar src={entry.user?.avatar} name={entry.user?.firstName} size="md" verified={entry.user?.hdmVerified} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)] text-sm truncate flex items-center gap-1">
                    {entry.user?.firstName} {entry.user?.lastName}
                    {entry.user?.hdmVerified && <VerifiedBadge size={10} />}
                    {isMe && <span className="text-xs text-[var(--color-primary)] ml-1">(You)</span>}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{entry.user?.department || 'RVNP'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[var(--color-text)] text-sm">{formatCompactNumber(entry.score || 0)}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};