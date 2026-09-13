import { useState, useEffect } from 'react';
import { IoRibbon } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import badgeApi from '../api/badgeApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const Badges = () => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        badgeApi.getAllBadges(),
        badgeApi.getUserBadges(user.id),
      ]);

      if (allRes.data.success) {
        setAllBadges(allRes.data.data || []);
      }

      if (myRes.data.success) {
        setMyBadges(myRes.data.data || []);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const earnedBadgeIds = myBadges.map((ub) => ub.badgeId);

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Badges
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : allBadges.length === 0 ? (
          <EmptyState
            icon={IoRibbon}
            title="No badges"
            description="Badges will appear here!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allBadges.map((badge) => {
              const earned = earnedBadgeIds.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border ${
                    earned
                      ? 'border-rvnp-green bg-rvnp-green bg-opacity-5'
                      : 'border-border-color bg-bg-primary opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary">
                        {badge.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                    {earned && (
                      <span className="px-2 py-1 rounded-full bg-rvnp-green text-rvnp-white text-xs font-medium shrink-0">
                        Earned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Badges;