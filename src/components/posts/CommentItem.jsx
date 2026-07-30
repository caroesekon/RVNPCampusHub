import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { toggleCommentReaction } from '@/api/reactions';
import { timeAgo } from '@/utils/formatDate';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const CommentItem = ({ comment, userReaction, onReply, onDelete, depth = 0 }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [myReaction, setMyReaction] = useState(userReaction || null);
  const [showReplies, setShowReplies] = useState(false);
  const isOwner = comment.author?._id === user?._id || comment.author === user?._id;
  const isDeleted = comment.isDeleted;

  const handleLike = async () => {
    if (!user) { toast.error('Login to like'); return; }
    const type = myReaction ? myReaction : 'like';
    try {
      await toggleCommentReaction(comment._id, type);
      if (myReaction) { setMyReaction(null); setLikeCount(prev => prev - 1); }
      else { setMyReaction('like'); setLikeCount(prev => prev + 1); }
    } catch { toast.error('Failed'); }
  };

  if (isDeleted) {
    return (
      <div className={`flex gap-3 ${depth > 0 ? 'ml-10' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm">🗑</div>
        <p className="text-sm text-[var(--color-text-muted)] italic py-2">Comment deleted</p>
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? 'ml-10 border-l-2 border-[var(--color-border)] pl-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar src={comment.author?.avatar} name={comment.author?.firstName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-[var(--color-bg)] rounded-lg p-3">
            <p className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1">
              {comment.author?.firstName} {comment.author?.lastName}
              {comment.author?.hdmVerified && <VerifiedBadge size={10} />}
            </p>
            <p className="text-sm text-[var(--color-text)] mt-0.5">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs">
            <span className="text-[var(--color-text-muted)]">{timeAgo(comment.createdAt)}</span>
            <button
              onClick={handleLike}
              className={`font-semibold ${myReaction ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
            >
              {myReaction ? '❤️' : '🤍'} {likeCount > 0 && formatCompactNumber(likeCount)}
            </button>
            <button onClick={() => onReply(comment._id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-semibold">
              Reply
            </button>
            {isOwner && (
              <button onClick={() => onDelete(comment._id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Delete</button>
            )}
          </div>

          {comment.replyCount > 0 && !showReplies && (
            <button onClick={() => setShowReplies(true)} className="text-xs text-[var(--color-primary)] font-semibold mt-1">
              — View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {showReplies && comment.replies?.map(reply => (
            <div key={reply._id} className="mt-2">
              <CommentItem comment={reply} depth={1} onReply={onReply} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};