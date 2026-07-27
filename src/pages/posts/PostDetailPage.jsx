import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getPostById, likePost, commentOnPost, deleteComment } from '@/api/posts';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
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
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await getPostById(id);
      const p = res.data || res;
      setPost(p);
      setLiked(p.likes?.includes(user?._id));
      setLikeCount(p.likeCount || 0);
    } catch (err) {
      toast.error('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await likePost(id);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch { toast.error('Failed'); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await commentOnPost(id, comment.trim());
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data || res],
        commentCount: (prev.commentCount || 0) + 1,
      }));
      setComment('');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      setPost(prev => ({
        ...prev,
        comments: prev.comments?.filter(c => c._id !== commentId),
        commentCount: (prev.commentCount || 0) - 1,
      }));
    } catch { toast.error('Failed'); }
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
            <p className="font-semibold text-[var(--color-text)] text-sm">{post.author?.firstName} {post.author?.lastName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{timeAgo(post.createdAt)} {post.department && `• ${post.department}`}</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">{post.content}</p>
        </div>

        {post.images?.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {post.images.map((img, i) => (
              <img key={i} src={img} alt="Post" className="w-full rounded-lg" />
            ))}
          </div>
        )}

        {post.location?.name && (
          <p className="px-4 pb-2 text-xs text-[var(--color-text-secondary)]">📍 {post.location.name}</p>
        )}

        <div className="flex items-center gap-6 px-4 pb-4 text-sm text-[var(--color-text-secondary)]">
          <button onClick={handleLike} className={`flex items-center gap-1 hover:text-[var(--color-accent)] ${liked ? 'text-[var(--color-accent)] font-bold' : ''}`}>
            {liked ? '❤️' : '🤍'} <span>{formatCompactNumber(likeCount)}</span>
          </button>
          <span>💬 {formatCompactNumber(post.commentCount || 0)}</span>
          <span>🔄 {formatCompactNumber(post.repostCount || 0)}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-4">
        <h3 className="font-bold text-[var(--color-text)] text-sm mb-3">Comments ({post.commentCount || 0})</h3>
        
        <div className="flex gap-2 mb-4">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." className="input flex-1" />
          <Button size="sm" onClick={handleComment} disabled={!comment.trim()}>Post</Button>
        </div>

        <div className="space-y-3">
          {post.comments?.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">No comments yet.</p>
          )}
          {post.comments?.map(c => (
            <div key={c._id} className="flex gap-3">
              <Avatar src={c.author?.avatar} name={c.author?.firstName} size="sm" />
              <div className="flex-1">
                <div className="bg-[var(--color-bg)] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{c.author?.firstName} {c.author?.lastName}</p>
                  <p className="text-sm text-[var(--color-text)] mt-0.5">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--color-text-muted)]">
                  <span>{timeAgo(c.createdAt)}</span>
                  {(c.author?._id === user?._id || c.author === user?._id) && (
                    <button onClick={() => handleDeleteComment(c._id)} className="hover:text-[var(--color-accent)]">Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};