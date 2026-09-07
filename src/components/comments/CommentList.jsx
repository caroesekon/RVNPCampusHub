import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHeart, IoHeartOutline, IoTrash, IoPencil, IoSend } from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import Spinner from '../ui/Spinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import commentApi from '../../api/commentApi.js';
import { formatCount } from '../../utils/formatNumber.js';
import timeAgo from '../../utils/timeAgo.js';

const CommentList = ({ postId = null, reelId = null, groupPostId = null, onCommentCountChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [likedComments, setLikedComments] = useState({});

  useEffect(() => {
    fetchComments();
  }, [postId, reelId, groupPostId]);

  const fetchComments = async () => {
    setLoading(true);

    try {
      let response;

      if (postId) {
        response = await commentApi.getPostComments(postId);
      } else if (reelId) {
        response = await commentApi.getReelComments(reelId);
      }

      if (response?.data.success) {
        setComments(response.data.data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSending(true);

    try {
      const response = await commentApi.createComment({
        content: newComment.trim(),
        postId,
        reelId,
      });

      if (response.data.success) {
        setComments((prev) => [response.data.data, ...prev]);
        setNewComment('');
        onCommentCountChange?.((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to add comment:', error.message);
    } finally {
      setSending(false);
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;

    setSending(true);

    try {
      const response = await commentApi.createComment({
        content: replyText.trim(),
        postId,
        reelId,
        parentId,
      });

      if (response.data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: [...(comment.replies || []), response.data.data] }
              : comment
          )
        );
        setReplyTo(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Failed to add reply:', error.message);
    } finally {
      setSending(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (likedComments[commentId]) {
      setLikedComments((prev) => ({ ...prev, [commentId]: false }));
      await commentApi.unlikeComment(commentId);
    } else {
      setLikedComments((prev) => ({ ...prev, [commentId]: true }));
      await commentApi.likeComment(commentId);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentCountChange?.((prev) => prev - 1);
    } catch (error) {
      console.error('Failed to delete comment:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="flex gap-2">
        <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary text-text-primary text-sm border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || sending}
            className="p-2 rounded-full bg-rvnp-green text-rvnp-white disabled:opacity-50 shrink-0"
          >
            <IoSend size={16} />
          </button>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <EmptyState title="No comments yet" description="Be the first to comment!" />
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-2">
                <Avatar
                  src={comment.user?.avatarUrl}
                  name={comment.user?.fullName}
                  size="sm"
                  onClick={() => navigate(`/profile/${comment.user?.id}`)}
                />

                <div className="flex-1 min-w-0">
                  <div className="bg-bg-secondary rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-medium text-text-primary text-sm cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${comment.user?.id}`)}
                      >
                        {comment.user?.fullName}
                      </span>
                      {comment.user?.hdmVerified && <VerifiedBadge size={12} />}
                    </div>
                    <p className="text-text-primary text-sm mt-0.5 break-words">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-1 px-1">
                    <span className="text-xs text-text-muted">{timeAgo(comment.createdAt)}</span>
                    <button
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="text-xs text-text-muted hover:text-text-primary"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-0.5 text-xs ${
                        likedComments[comment.id]
                          ? 'text-rvnp-green'
                          : 'text-text-muted hover:text-rvnp-green'
                      }`}
                    >
                      {likedComments[comment.id] ? (
                        <IoHeart size={12} className="text-rvnp-green" />
                      ) : (
                        <IoHeartOutline size={12} className="text-rvnp-green" />
                      )}
                      {formatCount(comment.likeCount)}
                    </button>
                    {comment.user?.id === user?.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-text-muted hover:text-rvnp-red"
                      >
                        <IoTrash size={12} />
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyTo === comment.id && (
                    <div className="flex gap-2 mt-2 ml-4">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-bg-secondary text-text-primary text-xs border border-border-color focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        className="p-1.5 rounded-full bg-rvnp-green text-rvnp-white"
                      >
                        <IoSend size={12} />
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar src={reply.user?.avatarUrl} name={reply.user?.fullName} size="sm" />
                          <div className="flex-1 bg-bg-secondary rounded-xl px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-text-primary text-xs">
                                {reply.user?.fullName}
                              </span>
                              {reply.user?.hdmVerified && <VerifiedBadge size={10} />}
                            </div>
                            <p className="text-text-primary text-xs mt-0.5">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;