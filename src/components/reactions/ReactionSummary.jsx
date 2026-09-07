import { useState, useEffect } from 'react';
import { IoClose, IoHeart } from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import Tabs from '../ui/Tabs.jsx';
import Spinner from '../ui/Spinner.jsx';
import reactionApi from '../../api/reactionApi.js';

const EMOJI_MAP = {
  LIKE: '👍',
  LOVE: '❤️',
  CARE: '🤗',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
};

const ReactionSummary = ({ postId = null, reelId = null, commentId = null }) => {
  const [summary, setSummary] = useState(null);
  const [allReactions, setAllReactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [postId, reelId, commentId]);

  const fetchSummary = async () => {
    try {
      let response;

      if (postId) {
        response = await reactionApi.getPostReactionSummary(postId);
      } else if (reelId) {
        response = await reactionApi.getReelReactionSummary(reelId);
      } else if (commentId) {
        response = await reactionApi.getCommentReactionSummary(commentId);
      }

      if (response?.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load reaction summary:', error.message);
    }
  };

  const fetchAllReactions = async () => {
    setLoading(true);

    try {
      let response;

      if (postId) {
        response = await reactionApi.getPostReactions(postId);
      } else if (reelId) {
        response = await reactionApi.getReelReactions(reelId);
      } else if (commentId) {
        response = await reactionApi.getCommentReactions(commentId);
      }

      if (response?.data.success) {
        setAllReactions(response.data.data.reactions || []);
      }
    } catch (error) {
      console.error('Failed to load reactions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchAllReactions();
  };

  if (!summary || summary.total === 0) return null;

  const tabs = [
    { value: 'ALL', label: `All (${summary.total})` },
    ...Object.entries(summary.types).map(([type, count]) => ({
      value: type,
      label: `${EMOJI_MAP[type]} ${count}`,
    })),
  ];

  const filteredReactions = activeTab === 'ALL'
    ? allReactions
    : allReactions.filter((r) => r.type === activeTab);

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-1 text-xs sm:text-sm text-text-muted hover:text-rvnp-green transition-colors"
      >
        {summary.topEmojis.map((emoji, index) => (
          <span key={index}>{emoji}</span>
        ))}
        <span className="truncate">{summary.displayText}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md mx-4 bg-bg-primary rounded-xl max-h-[80vh] flex flex-col border-2 border-rvnp-green">
            <div className="flex items-center justify-between p-4 border-b border-border-color">
              <div className="flex items-center gap-2">
                {summary.topEmojis.map((emoji, index) => (
                  <span key={index} className="text-xl">{emoji}</span>
                ))}
                <span className="text-sm text-text-muted">{summary.total} reactions</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-bg-secondary text-text-secondary"
              >
                <IoClose size={22} />
              </button>
            </div>

            <div className="px-4 pt-3">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-8"><Spinner size="md" /></div>
              ) : filteredReactions.length === 0 ? (
                <p className="text-center text-text-muted py-8">No reactions</p>
              ) : (
                <div className="space-y-2">
                  {filteredReactions.map((reaction) => (
                    <div key={reaction.id} className="flex items-center gap-3">
                      <Avatar src={reaction.user?.avatarUrl} name={reaction.user?.fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-text-primary text-sm truncate">
                            {reaction.user?.fullName}
                          </span>
                          {reaction.user?.hdmVerified && <VerifiedBadge size={12} />}
                        </div>
                      </div>
                      <span className="text-xl shrink-0">{EMOJI_MAP[reaction.type]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReactionSummary;