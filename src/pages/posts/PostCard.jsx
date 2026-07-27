import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Badge } from '@/components/ui/Badge';
import { likePost, repost, deletePost } from '@/api/posts';
import { timeAgo } from '@/utils/formatDate';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(false);

  const isOwnPost = post.author?._id === user?._id || post.author === user?._id;

  const handleLike = async (e) => { e.stopPropagation(); try { await likePost(post._id); setLiked(!liked); setLikeCount(prev => liked ? prev - 1 : prev + 1); } catch { toast.error('Failed'); } };
  const handleRepost = async (e) => { e.stopPropagation(); try { await repost(post._id); setReposted(true); setRepostCount(prev => prev + 1); toast.success('Reposted'); } catch { toast.error('Failed'); } };
  const handleDelete = async (e) => { e.stopPropagation(); if (!confirm('Delete?')) return; try { await deletePost(post._id); toast.success('Deleted'); onDelete?.(post._id); } catch { toast.error('Failed'); } setShowMenu(false); };
  const handleEdit = (e) => { e.stopPropagation(); navigate(`/edit-post/${post._id}`); setShowMenu(false); };
  const handleSave = (e) => { e.stopPropagation(); setSaved(!saved); toast.success(saved ? 'Removed' : 'Saved'); setShowMenu(false); };
  const handleShare = (e) => { e.stopPropagation(); if (navigator.share) { navigator.share({ title: 'RVNP Post', text: post.content, url: `${window.location.origin}/post/${post._id}` }); } else { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success('Link copied!'); } setShowMenu(false); };
  const handleArchive = async (e) => { e.stopPropagation(); try { await likePost(post._id); toast.success('Archived'); } catch { toast.error('Failed'); } setShowMenu(false); };

  return (
    <div className={`card ${post.isUrgent ? 'card-urgent' : ''} ${post.type === 'lost_found' ? 'card-lost' : ''} cursor-pointer relative`} onClick={() => navigate(`/post/${post._id}`)}>
      <div className="absolute top-3 right-3 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShowMenu(!showMenu)} className="w-7 h-7 rounded-full hover:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-muted)]">⋮</button>
        {showMenu && (
          <div className="absolute right-0 top-8 w-44 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] py-1 z-50">
            {isOwnPost && <button onClick={handleEdit} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">✏️ Edit</button>}
            <button onClick={handleSave} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">{saved ? '✅ Saved' : '🔖 Save'}</button>
            <button onClick={handleShare} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">📤 Share</button>
            {isOwnPost && <button onClick={handleArchive} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">📦 Archive</button>}
            {isOwnPost && <hr className="border-[var(--color-border)] my-1" />}
            {isOwnPost && <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-accent)] hover:bg-[var(--color-bg)]">🗑️ Delete</button>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar src={post.author?.avatar} name={post.author?.firstName} size="md" verified={post.author?.hdmVerified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-text)] text-sm truncate flex items-center gap-1">
              {post.author?.firstName} {post.author?.lastName}
              {post.author?.hdmVerified && <VerifiedBadge size={10} />}
            </span>
            {post.isUrgent && <Badge variant="red" emoji="🔥">Urgent</Badge>}
            {post.type === 'lost_found' && <Badge variant="gold" emoji="🔑">Lost & Found</Badge>}
            {post.type === 'event' && <Badge variant="green" emoji="📅">Event</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>{timeAgo(post.createdAt)}</span>
            {post.department && <span>• {post.department}</span>}
            {post.feeling && <span>• Feeling {post.feeling}</span>}
          </div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {post.images?.length > 0 && (
        <div className={`px-4 pb-3 grid gap-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, i) => <img key={i} src={img} alt="Post" className="w-full rounded-lg object-cover max-h-80" />)}
        </div>
      )}

      {post.location?.name && (
        <div className="px-4 pb-2 text-xs text-[var(--color-text-secondary)]">
          📍 {post.location.name}
          {post.eventDate && ` • ${new Date(post.eventDate).toLocaleString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
        </div>
      )}

      <div className="flex items-center gap-6 px-4 pb-4 text-sm text-[var(--color-text-secondary)]">
        <button onClick={handleLike} className={`flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors ${liked ? 'text-[var(--color-accent)] font-bold' : ''}`}>
          {liked ? '❤️' : '🤍'} <span>{formatCompactNumber(likeCount)}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); navigate(`/post/${post._id}`); }} className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
          💬 <span>{formatCompactNumber(post.commentCount || 0)}</span>
        </button>
        <button onClick={handleRepost} className={`flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors ${reposted ? 'text-[var(--color-primary)] font-bold' : ''}`}>
          🔄 <span>{formatCompactNumber(repostCount)}</span>
        </button>
      </div>
    </div>
  );
};