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
import GuestBadge from '../ui/GuestBadge.jsx';
import ReactionPicker from '../reactions/ReactionPicker.jsx';
import ReactionSummary from '../reactions/ReactionSummary.jsx';
import CommentList from '../comments/CommentList.jsx';
import CommentAnalysis from '../ai/CommentAnalysis.jsx';
import ShareModal from '../ui/ShareModal.jsx';
import HashtagLink from '../hashtags/HashtagLink.jsx';
import MentionLink from '../mentions/MentionLink.jsx';
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
    } catch {
      // Silent
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

  const renderTextWithLinks = (text) => {
    if (!text) return null;

    const parts = text.split(/(#[\w]+|@[\w\s]+?)(?=\s|$|[^\w])/g);

    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return <HashtagLink key={index} tag={part} />;
      }
      if (part.startsWith('@')) {
        const cleanName = part.substring(1).trim();
        const tagged = post?.content?.taggedUsers?.find((u) =>
          cleanName.startsWith(u.fullName)
        );
        if (tagged) {
          return (
            <MentionLink
              key={index}
              mention={{ userId: tagged.id, fullName: tagged.fullName }}
            />
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const content = post?.content;

  return (
    <>
      <div className="bg-bg-primary border border-border-color rounded-xl p-3 sm:p-4 w-full">
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
                {post?.user?.role === 'GUEST' && <GuestBadge size="sm" />}
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

        {post?.sharedFrom && (
          <div className="mt-2 p-3 rounded-lg bg-bg-secondary border border-border-color">
            <div className="flex items-center gap-2">
              <Avatar src={post.sharedFrom.user?.avatarUrl} name={post.sharedFrom.user?.fullName} size="sm" />
              <span className="text-sm font-medium text-text-primary">{post.sharedFrom.user?.fullName}</span>
              {post.sharedFrom.user?.hdmVerified && <VerifiedBadge size={12} />}
              {post.sharedFrom.user?.role === 'GUEST' && <GuestBadge size="sm" />}
            </div>
            {post.sharedFrom.content?.text && (
              <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                {post.sharedFrom.content.text}
              </p>
            )}
            {post.sharedFrom.content?.images && post.sharedFrom.content.images.length > 0 && (
              <img src={post.sharedFrom.content.images[0]} alt="Shared" className="w-full rounded-lg mt-2 max-h-48 object-cover" />
            )}
          </div>
        )}

        {content?.text && (
          <p className="text-text-primary mt-3 whitespace-pre-wrap text-sm sm:text-base break-words">
            {renderTextWithLinks(content.text)}
          </p>
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

      {lightboxOpen && content?.images && content.images.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex flex-col">
          <div className="flex items-center justify-between p-4 shrink-0">
            <span className="text-white text-sm">
              {currentImageIndex + 1} / {content.images.length}
            </span>
            <button onClick={closeLightbox} className="p-2 rounded-full bg-black bg-opacity-50 text-white">
              <IoClose size={28} />
            </button>
          </div>

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

      <Modal isOpen={showComments} onClose={() => setShowComments(false)} title="Comments" size="md">
        <CommentList postId={post.id} onCommentCountChange={setCommentCount} />
      </Modal>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} post={post} onShared={() => setShareCount((prev) => prev + 1)} />
    </>
  );
};

export default PostCard;