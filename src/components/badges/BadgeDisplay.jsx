import { useState, useEffect } from 'react';
import BadgeIcon from './BadgeIcon.jsx';
import badgeApi from '../../api/badgeApi.js';

const BadgeDisplay = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const response = await badgeApi.getUserBadges(userId);
      if (response.data.success) {
        setBadges(response.data.data || []);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((userBadge) => (
        <span
          key={userBadge.id}
          className="px-2 py-1 rounded-full bg-bg-secondary border border-border-color text-xs flex items-center gap-1"
        >
          <BadgeIcon badge={userBadge.badge} size="sm" showTooltip={false} />
          <span className="text-text-secondary">{userBadge.badge.name}</span>
        </span>
      ))}
    </div>
  );
};

export default BadgeDisplay;