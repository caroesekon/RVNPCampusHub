import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toggleReaction, getReactions } from '@/api/reactions';
import { ReactionPicker } from './ReactionPicker';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'cry', emoji: '😭', label: 'Cry' },
];

export const ReactionBar = ({ postId, onNavigate }) => {
  const { user } = useAuth();
  const [reactionCounts, setReactionCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const [recentReactors, setRecentReactors] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const longPressTimer = useRef(null);

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const res = await getReactions(postId);
      const data = res.data || res;
      setReactionCounts(data.reactionCounts || {});
      setTotalCount(data.totalCount || 0);
      setUserReaction(data.userReaction || null);
      setRecentReactors(data.recentReactors || []);
    } catch {}
  };

  const handleReaction = async (type) => {
    if (!user) {
      toast.error('Login to react');
      return;
    }
    setShowPicker(false);
    try {
      await toggleReaction(postId, type);
      fetchReactions();
    } catch { toast.error('Failed'); }
  };

  const handleDefaultReaction = () => {
    if (userReaction) {
      handleReaction(userReaction); // Remove reaction
    } else {
      handleReaction('like'); // Default like
    }
  };

  const handleMouseEnter = () => {
    longPressTimer.current = setTimeout(() => setShowPicker(true), 400);
  };

  const handleMouseLeave = () => {
    clearTimeout(longPressTimer.current);
  };

  const getReactionLabel = () => {
    if (totalCount === 0) return 'Like';
    if (recentReactors.length === 0) return formatCompactNumber(totalCount);

    const names = recentReactors.slice(0, 3).map(r => r.user?.firstName || 'Someone');
    const others = totalCount - names.length;

    if (others <= 0) return names.join(', ');
    return `${names.join(', ')} and ${others} other${others > 1 ? 's' : ''}`;
  };

  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type));

  const currentEmoji = userReaction ? REACTIONS.find(r => r.type === userReaction)?.emoji : '🤍';
  const isReacted = !!userReaction;

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={handleDefaultReaction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold transition-all ${
          isReacted ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
        }`}
      >
        <span className="text-lg">{currentEmoji}</span>
        <span>{totalCount > 0 ? formatCompactNumber(totalCount) : ''}</span>
      </button>

      {showPicker && (
        <ReactionPicker
          onSelect={handleReaction}
          onClose={() => setShowPicker(false)}
        />
      )}

      {topReactions.length > 0 && (
        <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[200px] hidden sm:inline">
          {topReactions.map(r => r?.emoji).join('')} {getReactionLabel()}
        </span>
      )}
    </div>
  );
};