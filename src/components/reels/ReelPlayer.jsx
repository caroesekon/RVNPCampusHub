import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoHeart,
  IoHeartOutline,
  IoChatbubbleOutline,
  IoShareOutline,
  IoEye,
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoPersonAdd,
  IoSparkles,
} from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import ReactionPicker from '../reactions/ReactionPicker.jsx';
import CommentList from '../comments/CommentList.jsx';
import ShareModal from '../ui/ShareModal.jsx';
import Modal from '../ui/Modal.jsx';
import Spinner from '../ui/Spinner.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import reelApi from '../../api/reelApi.js';
import aiApi from '../../api/aiApi.js';
import { formatCount } from '../../utils/formatNumber.js';
import timeAgo from '../../utils/timeAgo.js';

const ReelPlayer = ({ reels, initialIndex = 0, onClose, onNext, onPrev }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAICaption, setShowAICaption] = useState(false);
  const [aiCaption, setAiCaption] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(null);
  const [muted, setMuted] = useState(false);

  const videoRef = useRef(null);

  const currentReel = reels[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (currentReel) {
      setLikeCount(currentReel.likeCount || 0);
      setLiked(false);
      setCurrentReaction(null);
    }
  }, [currentReel?.id]);

  useEffect(() => {
    if (currentReel) {
      reelApi.incrementView(currentReel.id);
    }
  }, [currentReel?.id]);

  const handleReaction = async (type) => {
    if (currentReaction === type) {
      setCurrentReaction(null);
      setLikeCount((prev) => Math.max(0, prev - 1));
      await reelApi.removeReaction(currentReel.id);
    } else {
      setCurrentReaction(type);
      setLikeCount((prev) => prev + 1);
      await reelApi.reactToReel(currentReel.id, type);
    }
  };

  const handleGenerateCaption = async () => {
    setAiLoading(true);

    try {
      const response = await aiApi.generateContent(
        `Write a caption for a video about ${currentReel?.caption || 'campus life'}`,
        'reel_caption'
      );

      if (response.data.success) {
        setAiCaption(response.data.data.content);
      }
    } catch (error) {
      console.error('AI caption failed:', error.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (!currentReel) return null;

  const isOwnReel = currentReel.userId === user?.id;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={currentReel.videoUrl}
        poster={currentReel.thumbnailUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        autoPlay
        muted={muted}
        onClick={() => setMuted(!muted)}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <button onClick={onClose} className="p-2 rounded-full bg-black bg-opacity-50 text-white">
          <IoClose size={24} />
        </button>
        <h2 className="text-white font-heading font-semibold">Reels</h2>
        <button onClick={() => setMuted(!muted)} className="p-2 rounded-full bg-black bg-opacity-50 text-white">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Navigation */}
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-30"
      >
        <IoChevronBack size={24} />
      </button>

      <button
        onClick={onNext}
        disabled={currentIndex === reels.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-30"
      >
        <IoChevronForward size={24} />
      </button>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-20">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={currentReel.user?.avatarUrl}
                name={currentReel.user?.fullName}
                size="sm"
                onClick={() => navigate(`/profile/${currentReel.user?.id}`)}
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-medium text-sm">{currentReel.user?.fullName}</span>
                  {currentReel.user?.hdmVerified && <VerifiedBadge size={12} />}
                </div>
                <span className="text-white text-xs opacity-70">{timeAgo(currentReel.createdAt)}</span>
              </div>

              {!isOwnReel && (
                <button
                  onClick={() => navigate(`/profile/${currentReel.user?.id}`)}
                  className="ml-2 px-3 py-1 rounded-full bg-white text-black text-xs font-medium"
                >
                  Follow
                </button>
              )}
            </div>

            {currentReel.caption && (
              <p className="text-white text-sm mb-1 line-clamp-2">{currentReel.caption}</p>
            )}

            {currentReel.content?.location && (
              <p className="text-white text-xs opacity-70 mb-1">📍 {currentReel.content.location}</p>
            )}

            {currentReel.content?.taggedUsers && currentReel.content.taggedUsers.length > 0 && (
              <p className="text-rvnp-green text-xs">
                With {currentReel.content.taggedUsers.map((t) => t.fullName).join(', ')}
              </p>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <ReactionPicker
                currentReaction={currentReaction}
                onSelect={handleReaction}
                onRemove={() => handleReaction(currentReaction)}
              />
              <span className="text-white text-xs">{formatCount(likeCount)}</span>
            </div>

            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 text-white">
              <IoChatbubbleOutline size={28} />
              <span className="text-xs">{formatCount(currentReel.commentCount)}</span>
            </button>

            <button onClick={() => setShowShare(true)} className="flex flex-col items-center gap-1 text-white">
              <IoShareOutline size={28} />
              <span className="text-xs">{formatCount(currentReel.shareCount)}</span>
            </button>

            <div className="flex flex-col items-center gap-1 text-white">
              <IoEye size={28} />
              <span className="text-xs">{formatCount(currentReel.viewCount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <Modal isOpen={showComments} onClose={() => setShowComments(false)} title="Comments" size="md">
        <CommentList
          reelId={currentReel.id}
          onCommentCountChange={(count) => setLikeCount(count)}
        />
      </Modal>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        post={currentReel}
      />
    </div>
  );
};

export default ReelPlayer; 