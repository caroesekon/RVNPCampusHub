import { useState, useEffect } from 'react';
import { getUserPosts } from '@/api/users';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export const ProfilePosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserPosts(userId);
        setPosts(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [userId]);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>;
  if (posts.length === 0) return <EmptyState icon="📭" title="No posts yet" />;

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <div key={post._id} className="card">
          <p className="text-sm text-[var(--color-text)]">{post.content}</p>
          <div className="flex gap-4 mt-2 text-xs text-[var(--color-text-secondary)]">
            <span>❤️ {post.likeCount}</span>
            <span>💬 {post.commentCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};