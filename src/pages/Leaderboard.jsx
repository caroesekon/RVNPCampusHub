import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import leaderboardApi from '../api/leaderboardApi.js';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [contributors, setContributors] = useState([]);
  const [fans, setFans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contributors');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contributorsRes, fansRes] = await Promise.all([
        leaderboardApi.getTopContributors('all', 20),
        leaderboardApi.getTopFans(20),
      ]);

      if (contributorsRes.data.success) {
        setContributors(contributorsRes.data.data || []);
      }

      if (fansRes.data.success) {
        setFans(fansRes.data.data || []);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const displayData = activeTab === 'contributors' ? contributors : fans;

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Leaderboard
        </h1>

        <div className="flex gap-2 mb-4 border-b border-border-color">
          <button
            onClick={() => setActiveTab('contributors')}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
              activeTab === 'contributors'
                ? 'border-rvnp-green text-rvnp-green'
                : 'border-transparent text-text-muted'
            }`}
          >
            🏆 Top Contributors
          </button>
          <button
            onClick={() => setActiveTab('fans')}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
              activeTab === 'fans'
                ? 'border-rvnp-green text-rvnp-green'
                : 'border-transparent text-text-muted'
            }`}
          >
            💎 Top Fans
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : displayData.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} yet`}
            description="Start engaging to appear here!"
          />
        ) : (
          <div className="space-y-2">
            {displayData.map((user, i) => (
              <button
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg font-bold w-10 shrink-0">
                    {getMedal(i)}
                  </span>
                  <Avatar
                    src={user.avatarUrl}
                    name={user.fullName}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-text-primary truncate">
                        {user.fullName}
                      </span>
                      {user.hdmVerified && <VerifiedBadge size={12} />}
                    </div>
                    <span className="text-xs text-text-muted">
                      {activeTab === 'contributors'
                        ? `${user._count?.posts || 0} posts • ${user._count?.reels || 0} reels`
                        : `${user._count?.reactions || 0} reactions • ${user._count?.comments || 0} comments`}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ml-2 ${
                    activeTab === 'contributors'
                      ? 'text-rvnp-green'
                      : 'text-rvnp-red'
                  }`}
                >
                  {activeTab === 'contributors'
                    ? user.contributionScore
                    : user.fanScore}{' '}
                  pts
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;