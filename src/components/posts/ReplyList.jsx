import { useState, useEffect } from 'react';
import { getReplies } from '@/api/comments';
import { CommentItem } from './CommentItem';
import { Spinner } from '@/components/ui/Spinner';

export const ReplyList = ({ commentId, onReply, onDelete }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [commentId]);

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const res = await getReplies(commentId, page);
      const data = res.data || res;
      setReplies(prev => page === 1 ? data.replies : [...prev, ...data.replies]);
      setHasMore(data.pagination?.hasNext || false);
    } catch {}
    finally { setLoading(false); }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchReplies();
  };

  if (loading && replies.length === 0) {
    return <div className="ml-10 py-2"><Spinner size="sm" /></div>;
  }

  return (
    <div className="mt-2 space-y-2">
      {replies.map(reply => (
        <CommentItem
          key={reply._id}
          comment={reply}
          depth={1}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
      {hasMore && (
        <button onClick={loadMore} className="ml-10 text-xs text-[var(--color-primary)] font-semibold hover:underline">
          Load more replies
        </button>
      )}
    </div>
  );
};