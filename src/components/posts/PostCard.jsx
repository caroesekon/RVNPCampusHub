import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoChatbubbleOutline,
  IoShareOutline,
  IoEllipsisHorizontal,
  IoLocation,
  IoClose,
} from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import ReactionPicker from '../reactions/ReactionPicker.jsx';
import ReactionSummary from '../reactions/ReactionSummary.jsx';
import CommentList from '../comments/CommentList.jsx';
import CommentAnalysis from '../ai/CommentAnalysis.jsx';
import ShareModal from '../ui/ShareModal.jsx';
import Modal from '../ui/Modal.jsx';
import { formatCount } from '../../utils/formatNumber.js';
import timeAgo from '../../utils/timeAgo.js';
import reactionApi from '../../api/reactionApi.js';
import postApi from '../../api/postApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const PostCard = ({ post, onReaction, onShare }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(null);
  const [reactionCount, setReactionCount] = useState(post?.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0);
  const [shareCount, setShareCount] = useState(post?.shareCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchMyReaction();
  }, [post?.id]);

  const fetchMyReaction = async () => {
    try {
      const response = await reactionApi.getPostReactions(post.id);
      if (response.data.success) {
        const reactions = response.data.data.reactions || [];
        const mine = reactions.find((r) => r.userId === user?.id);
        if (mine) setCurrentReaction(mine.type);
      }
    } catch (error) {
      console.error('Failed to fetch my reaction:', error.message);
    }
  };

  const handleReaction = async (type) => {
    if (currentReaction === type) {
      setCurrentReaction(null);
      setReactionCount((prev) => Math.max(0, prev - 1));
      await postApi.removeReaction(post.id);
    } else {
      setCurrentReaction(type);
      setReactionCount((prev) => prev + 1);
      await postApi.reactToPost(post.id, type);
    }
    fetchMyReaction();
  };

  const handleRemoveReaction = async () => {
    setCurrentReaction(null);
    setReactionCount((prev) => Math.max(0, prev - 1));
    await postApi.removeReaction(post.id);
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentImageIndex && newIndex >= 0) {
      setCurrentImageIndex(newIndex);
    }
  };

  const content = post?.content;

  return (
    <>
      <div className="bg-bg-primary border border-border-color rounded-xl p-3 sm:p-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="shrink-0">
              <Avatar src={post?.user?.avatarUrl} name={post?.user?.fullName} size="sm" onClick={() => navigate(`/profile/${post?.user?.id}`)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-text-primary cursor-pointer hover:underline text-sm sm:text-base truncate" onClick={() => navigate(`/profile/${post?.user?.id}`)}>
                  {post?.user?.fullName}
                </span>
                {post?.user?.hdmVerified && <VerifiedBadge size={14} />}
              </div>
              <span className="text-xs text-text-muted">{timeAgo(post?.createdAt)}</span>
            </div>
          </div>

          <div className="relative shrink-0">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted">
              <IoEllipsisHorizontal size={18} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-bg-primary border border-border-color rounded-lg shadow-lg py-1 w-40">
                  <button onClick={() => { setShowMenu(false); navigate(`/profile/${post?.user?.id}`); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary">
                    View Profile
                  </button>
                  {post?.user?.id === user?.id && (
                    <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-2 text-sm text-rvnp-red hover:bg-bg-secondary">
                      Delete Post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {content?.text && (
          <p className="text-text-primary mt-3 whitespace-pre-wrap text-sm sm:text-base break-words">{content.text}</p>
        )}

        {content?.feeling && (
          <div className="flex items-center gap-1 mt-2 text-sm text-text-muted">
            <span className="text-lg">{content.feeling.emoji}</span>
            <span>Feeling {content.feeling.label}</span>
          </div>
        )}

        {content?.location && (
          <div className="flex items-center gap-1 mt-2 text-sm text-text-muted">
            <IoLocation size={14} className="text-rvnp-green" />
            <span>At {content.location}</span>
          </div>
        )}

        {content?.taggedUsers && content.taggedUsers.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {content.taggedUsers.map((tagged) => (
              <span key={tagged.id} className="text-sm text-rvnp-green cursor-pointer hover:underline" onClick={() => navigate(`/profile/${tagged.id}`)}>
                @{tagged.fullName}
              </span>
            ))}
          </div>
        )}

        {/* Images Grid */}
        {content?.images && content.images.length > 0 && (
          <div className={`mt-3 grid gap-2 ${content.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {content.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post ${index + 1}`}
                className="w-full rounded-lg object-cover max-h-64 sm:max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(index)}
              />
            ))}
          </div>
        )}

        {content?.video && (
          <video src={content.video} controls className="w-full rounded-lg mt-3 max-h-64 sm:max-h-96" />
        )}

        {reactionCount > 0 && (
          <div className="mt-3">
            <ReactionSummary postId={post.id} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-color">
          <div className="flex items-center gap-1">
            <ReactionPicker currentReaction={currentReaction} onSelect={handleReaction} onRemove={handleRemoveReaction} />
            <span className="text-sm text-text-muted">{formatCount(reactionCount)}</span>
          </div>

          <button onClick={() => setShowComments(true)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
            <IoChatbubbleOutline size={20} />
            <span>{formatCount(commentCount)}</span>
          </button>

          <button onClick={() => setShowShare(true)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
            <IoShareOutline size={20} />
            <span>{formatCount(shareCount)}</span>
          </button>

          <CommentAnalysis postId={post.id} />
        </div>
      </div>

      {/* Image Lightbox - Vertical Scroll */}
      {lightboxOpen && content?.images && content.images.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 shrink-0">
            <span className="text-white text-sm">
              {currentImageIndex + 1} / {content.images.length}
            </span>
            <button onClick={closeLightbox} className="p-2 rounded-full bg-black bg-opacity-50 text-white">
              <IoClose size={28} />
            </button>
          </div>

          {/* Vertically scrollable images */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          >
            {content.images.map((image, index) => (
              <div key={index} className="min-h-full flex items-center justify-center snap-center">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="max-w-full w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          {content.images.length > 1 && (
            <div className="flex justify-center gap-1.5 p-4 shrink-0">
              {content.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const container = scrollContainerRef.current;
                    if (container) {
                      container.scrollTo({
                        top: index * container.clientHeight,
                        behavior: 'smooth',
                      });
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white bg-opacity-40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments Modal */}
      <Modal isOpen={showComments} onClose={() => setShowComments(false)} title="Comments" size="md">
        <CommentList postId={post.id} onCommentCountChange={setCommentCount} />
      </Modal>

      {/* Share Modal */}
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} post={post} onShared={() => setShareCount((prev) => prev + 1)} />
    </>
  );
};

export default PostCard;