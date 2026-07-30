import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getPostById } from '@/api/posts';
import { getComments, createComment, deleteComment } from '@/api/comments';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { ReactionBar } from '@/components/posts/ReactionBar';
import { CommentItem } from '@/components/posts/CommentItem';
import { CommentInput } from '@/components/posts/CommentInput';
import { ReplyList } from '@/components/posts/ReplyList';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { timeAgo } from '@/utils/formatDate';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [userReactions, setUserReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => { fetchPost(); fetchComments(); }, [id]);

  const fetchPost = async () => {
    try {
      const res = await getPostById(id);
      setPost(res.data || res);
    } catch { toast.error('Post not found'); navigate('/'); }
    finally { setLoading(false); }
  };

  const fetchComments = async (page = 1) => {
    setLoadingComments(true);
    try {
      const res = await getComments(id, page);
      const data = res.data || res;
      if (page === 1) setComments(data.comments);
      else setComments(prev => [...prev, ...data.comments]);
      setHasMoreComments(data.pagination?.hasNext || false);
      setCommentPage(page);
      if (data.userReactions) setUserReactions(prev => ({ ...prev, ...data.userReactions }));
    } catch {}
    finally { setLoadingComments(false); }
  };

  const handleComment = async (content) => {
    try {
      const body = { content };
      if (replyingTo) body.parentComment = replyingTo;
      await createComment(id, body);
      toast.success(replyingTo ? 'Reply posted' : 'Comment posted');
      setReplyingTo(null);
      fetchComments(1);
      fetchPost();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try { await deleteComment(commentId); toast.success('Deleted'); fetchComments(1); fetchPost(); }
    catch { toast.error('Failed'); }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!post) return null;

  return (
    <div className="pb-20">
      <button onClick={() => navigate(-1)} className="text-[var(--color-text-secondary)] text-sm mb-3">← Back</button>

      <div className={`card ${post.isUrgent ? 'card-urgent' : ''} ${post.type === 'lost_found' ? 'card-lost' : ''}`}>
        <div className="flex items-center gap-3 p-4 pb-2">
          <Avatar src={post.author?.avatar} name={post.author?.firstName} size="md" verified={post.author?.hdmVerified} />
          <div>
            <p className="font-semibold text-[var(--color-text)] text-sm flex items-center gap-1">
              {post.author?.firstName} {post.author?.lastName}
              {post.author?.hdmVerified && <VerifiedBadge size={12} />}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {timeAgo(post.createdAt)} {post.department && `• ${post.department}`}
              {post.feeling && ` • Feeling ${post.feeling}`}
            </p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">{post.content}</p>
        </div>

        {post.images?.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {post.images.map((img, i) => <img key={i} src={img} alt="Post" className="w-full rounded-lg" />)}
          </div>
        )}

        {post.location?.name && (
          <p className="px-4 pb-2 text-xs text-[var(--color-text-secondary)]">📍 {post.location.name}</p>
        )}

        <div className="flex items-center justify-between px-4 pb-4 text-sm">
          <ReactionBar postId={post._id} />
          <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
            <span>💬 {formatCompactNumber(post.commentCount || 0)}</span>
            <span>🔄 {formatCompactNumber(post.repostCount || 0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold text-[var(--color-text)] text-sm mb-3">Comments ({post.commentCount || 0})</h3>

        {user ? (
          <div className="mb-4">
            <CommentInput
              onSubmit={handleComment}
              replyingTo={replyingTo}
              onCancel={() => setReplyingTo(null)}
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            <button onClick={() => navigate('/login')} className="text-[var(--color-primary)] font-semibold">Login</button> to comment.
          </p>
        )}

        {loadingComments && comments.length === 0 ? (
          <div className="flex justify-center py-6"><Spinner size="md" /></div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-6">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment._id}>
                <CommentItem
                  comment={comment}
                  userReaction={userReactions[comment._id]}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                />
                {comment.replyCount > 0 && comment.replies?.length > 0 && (
                  <ReplyList
                    commentId={comment._id}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                  />
                )}
              </div>
            ))}
            {hasMoreComments && (
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => fetchComments(commentPage + 1)} disabled={loadingComments}>
                  {loadingComments ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};