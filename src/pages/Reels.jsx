import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAdd,
  IoVideocam,
  IoChatbubbleOutline,
  IoShareOutline,
  IoEye,
  IoPlay,
  IoPause,
} from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import ReactionPicker from '../components/reactions/ReactionPicker.jsx';
import ReactionSummary from '../components/reactions/ReactionSummary.jsx';
import CommentList from '../components/comments/CommentList.jsx';
import ShareModal from '../components/ui/ShareModal.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import reelApi from '../api/reelApi.js';
import userApi from '../api/userApi.js';
import friendApi from '../api/friendApi.js';
import { formatCount } from '../utils/formatNumber.js';
import timeAgo from '../utils/timeAgo.js';

const Reels = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});
  const [likedStatus, setLikedStatus] = useState({});
  const [currentReaction, setCurrentReaction] = useState({});
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [showShareFor, setShowShareFor] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState({});

  const videoRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    if (reels.length > 0) {
      const timer = setTimeout(() => setupObserver(), 100);
      return () => clearTimeout(timer);
    }
  }, [reels]);

  const setupObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const reelId = video.dataset.reelId;

          if (entry.isIntersecting) {
            video.play().then(() => {
              setVideoPlaying((prev) => ({ ...prev, [reelId]: true }));
            }).catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
            setVideoPlaying((prev) => ({ ...prev, [reelId]: false }));
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '50px 0px',
      }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observerRef.current.observe(video);
    });
  };

  const fetchReels = async () => {
    setLoading(true);

    try {
      const response = await reelApi.getReelFeed();

      if (response.data.success) {
        const reelsData = response.data.data.reels || [];
        setReels(reelsData);

        const followStatus = {};
        await Promise.all(
          reelsData.map(async (reel) => {
            try {
              const checkRes = await friendApi.checkFriendship(reel.user?.id);
              if (checkRes.data.success) {
                followStatus[reel.user?.id] = checkRes.data.data.isFollowing;
              }
            } catch (error) {
              followStatus[reel.user?.id] = false;
            }
          })
        );
        setFollowingStatus(followStatus);
      }
    } catch (error) {
      console.error('Failed to load reels:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (reel) => {
    try {
      if (followingStatus[reel.user.id]) {
        await userApi.unfollowUser(reel.user.id);
        setFollowingStatus((prev) => ({ ...prev, [reel.user.id]: false }));
      } else {
        await userApi.followUser(reel.user.id);
        setFollowingStatus((prev) => ({ ...prev, [reel.user.id]: true }));
      }
    } catch (error) {
      console.error('Follow action failed:', error.message);
    }
  };

  const handleReaction = async (reel, type) => {
    if (likedStatus[reel.id] && currentReaction[reel.id] === type) {
      setLikedStatus((prev) => ({ ...prev, [reel.id]: false }));
      setCurrentReaction((prev) => ({ ...prev, [reel.id]: null }));
      await reelApi.removeReaction(reel.id);
      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id ? { ...r, likeCount: Math.max(0, (r.likeCount || 1) - 1) } : r
        )
      );
    } else {
      setLikedStatus((prev) => ({ ...prev, [reel.id]: true }));
      setCurrentReaction((prev) => ({ ...prev, [reel.id]: type }));
      await reelApi.reactToReel(reel.id, type);
      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id ? { ...r, likeCount: (r.likeCount || 0) + 1 } : r
        )
      );
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const togglePlay = (reelId) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setVideoPlaying((prev) => ({ ...prev, [reelId]: true }));
      }).catch(() => {});
    } else {
      video.pause();
      setVideoPlaying((prev) => ({ ...prev, [reelId]: false }));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (reels.length === 0) {
    return (
      <Layout>
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-heading font-bold text-text-primary">Reels</h1>
            <button onClick={() => navigate('/reels/upload')} className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white">
              <IoAdd size={22} />
            </button>
          </div>
          <EmptyState icon={IoVideocam} title="No reels yet" description="Upload your first reel!" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Reels</h1>
          <button onClick={() => navigate('/reels/upload')} className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white hover:bg-rvnp-green-light shadow-lg">
            <IoAdd size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {reels.map((reel) => {
            const isFollowing = followingStatus[reel.user?.id] || false;
            const isLiked = likedStatus[reel.id] || false;
            const isOwnReel = reel.user?.id === currentUser?.id;
            const isPlaying = videoPlaying[reel.id] || false;

            return (
              <div key={reel.id} className="bg-bg-primary border border-border-color rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3">
                  <button onClick={() => handleViewProfile(reel.user?.id)} className="flex items-center gap-2 cursor-pointer">
                    <Avatar src={reel.user?.avatarUrl} name={reel.user?.fullName} size="sm" />
                    <div className="text-left">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-text-primary text-sm">{reel.user?.fullName}</span>
                        {reel.user?.hdmVerified && <VerifiedBadge size={12} />}
                      </div>
                      <span className="text-xs text-text-muted">{timeAgo(reel.createdAt)}</span>
                    </div>
                  </button>

                  {!isOwnReel && (
                    <button
                      onClick={() => handleFollow(reel)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
                        isFollowing ? 'bg-bg-secondary text-text-primary' : 'bg-rvnp-green text-rvnp-white'
                      }`}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                  )}
                </div>

                {/* Video */}
                <div className="relative bg-black aspect-[9/16] max-h-[500px]">
                  <video
                    ref={(el) => (videoRefs.current[reel.id] = el)}
                    data-reel-id={reel.id}
                    src={reel.videoUrl}
                    poster={reel.thumbnailUrl}
                    className="w-full h-full object-contain"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    controls
                    onClick={() => togglePlay(reel.id)}
                  />

                  {!isPlaying && (
                    <button
                      onClick={() => togglePlay(reel.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                    >
                      <div className="p-4 rounded-full bg-black bg-opacity-60">
                        <IoPlay size={32} className="text-white" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Caption & Actions */}
                <div className="p-3">
                  {reel.caption && (
                    <p className="text-text-primary text-sm mb-1">{reel.caption}</p>
                  )}
                  {reel.content?.location && (
                    <p className="text-text-muted text-xs mb-2">📍 {reel.content.location}</p>
                  )}
                  {reel.content?.taggedUsers && reel.content.taggedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                      {reel.content.taggedUsers.map((tagged) => (
                        <span
                          key={tagged.id}
                          className="text-xs text-rvnp-green cursor-pointer hover:underline"
                          onClick={() => handleViewProfile(tagged.id)}
                        >
                          @{tagged.fullName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 border-t border-border-color pt-3">
                    <div className="flex items-center gap-1">
                      <ReactionPicker
                        currentReaction={isLiked ? currentReaction[reel.id] : null}
                        onSelect={(type) => handleReaction(reel, type)}
                        onRemove={() => handleReaction(reel, currentReaction[reel.id])}
                      />
                      <span className="text-sm text-text-muted">{formatCount(reel.likeCount)}</span>
                    </div>

                    <button onClick={() => setShowCommentsFor(reel.id)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
                      <IoChatbubbleOutline size={20} />
                      <span>{formatCount(reel.commentCount)}</span>
                    </button>

                    <button onClick={() => setShowShareFor(reel.id)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
                      <IoShareOutline size={20} />
                      <span>{formatCount(reel.shareCount)}</span>
                    </button>

                    <div className="flex items-center gap-1 text-sm text-text-muted ml-auto">
                      <IoEye size={20} />
                      <span>{formatCount(reel.viewCount)}</span>
                    </div>
                  </div>

                  {/* Reaction Summary */}
                  {(reel.likeCount > 0) && (
                    <div className="mt-2">
                      <ReactionSummary reelId={reel.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showCommentsFor && (
        <Modal isOpen={true} onClose={() => setShowCommentsFor(null)} title="Comments" size="md">
          <CommentList reelId={showCommentsFor} />
        </Modal>
      )}

      {showShareFor && (
        <ShareModal
          isOpen={true}
          onClose={() => setShowShareFor(null)}
          post={reels.find((r) => r.id === showShareFor)}
        />
      )}
    </Layout>
  );
};

export default Reels;