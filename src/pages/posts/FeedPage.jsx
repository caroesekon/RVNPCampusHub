import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { getFeed } from '@/api/posts';
import { getStories } from '@/api/stories';
import { searchUsers } from '@/api/search';
import { followUser } from '@/api/friends';
import { StoriesRow } from './StoriesRow';
import { CreatePostBar } from './CreatePostBar';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Tabs } from '@/components/ui/Tabs';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const POST_TABS = [
  { id: 'all', label: 'All' },
  { id: 'dept', label: '📢 Dept' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'projects', label: '🔧 Projects' },
  { id: 'qna', label: '📝 Q&A' },
  { id: 'trade', label: '🛒 Trade' },
  { id: 'urgent', label: '🔥 Urgent' },
];

export const FeedPage = () => {
  const { isFeatureEnabled } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const postsEnabled = isFeatureEnabled('posts');
  const storiesEnabled = isFeatureEnabled('stories');

  const fetchPosts = useCallback(async (pageNum = 1, currentTab = tab) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await getFeed(currentTab, pageNum);
      const newPosts = res.data || res;
      if (pageNum === 1) setPosts(newPosts);
      else setPosts(prev => [...prev, ...newPosts]);
      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) { console.error('Failed to load feed'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [tab]);

  const fetchStories = useCallback(async () => {
    if (!storiesEnabled) return;
    try { const res = await getStories(); setStories(res.data || res); } catch {}
  }, [storiesEnabled]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await searchUsers('', 1);
      setSuggestions((res.data || res).filter(u => u._id !== user?._id).slice(0, 5));
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!postsEnabled) return;
    fetchPosts(1, tab);
    fetchStories();
    fetchSuggestions();
  }, [tab, postsEnabled, fetchPosts, fetchStories, fetchSuggestions]);

  const handleTabChange = (newTab) => { setTab(newTab); setPage(1); setHasMore(true); };
  const handleLoadMore = () => { if (hasMore && !loadingMore) fetchPosts(page + 1, tab); };
  const handlePostCreated = (newPost) => { setPosts(prev => [newPost, ...prev]); setShowCreate(false); };
  const handlePostDeleted = (postId) => { setPosts(prev => prev.filter(p => p._id !== postId)); };
  const handleFollow = async (personId) => {
    try { await followUser(personId); setFollowingMap(prev => ({ ...prev, [personId]: true })); toast.success('Following!'); }
    catch { toast.error('Failed'); }
  };

  if (!postsEnabled) {
    return <EmptyState icon="📰" title="Posts are currently disabled" description="The admin has disabled this feature." />;
  }

  return (
    <div className="pb-20">
      {storiesEnabled && <StoriesRow stories={stories} />}

      {suggestions.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[var(--color-text)] text-sm">👥 People You May Know</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {suggestions.map(person => (
              <button
                key={person._id}
                onClick={() => navigate(`/profile/${person._id}`)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-20"
              >
                <Avatar src={person.avatar} name={person.firstName} size="lg" verified={person.hdmVerified} />
                <span className="text-[10px] font-semibold text-[var(--color-text)] text-center truncate w-full flex items-center justify-center gap-0.5">
                  {person.firstName}
                  {person.hdmVerified && <VerifiedBadge size={10} />}
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)] text-center truncate w-full">{person.department || 'RVNP'}</span>
                {followingMap[person._id] ? (
                  <span className="text-[10px] text-[var(--color-primary)] font-semibold">✓ Following</span>
                ) : (
                  <span onClick={(e) => { e.stopPropagation(); handleFollow(person._id); }} className="text-[10px] bg-[var(--color-bg)] px-2 py-0.5 rounded-full text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors">+ Follow</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <CreatePostBar onClick={() => setShowCreate(true)} />
      <Tabs tabs={POST_TABS} active={tab} onChange={handleTabChange} className="mb-3" />

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full skeleton" /><div className="space-y-1.5"><div className="w-24 h-3 skeleton rounded" /><div className="w-16 h-2 skeleton rounded" /></div></div>
              <div className="w-full h-4 skeleton rounded" /><div className="w-3/4 h-4 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon="📭" title="No posts yet" description="Be the first to share something with the campus." action={<Button size="sm" onClick={() => setShowCreate(true)}>Create Post</Button>} />
      ) : (
        <div className="space-y-3">
          {posts.map(post => <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />)}
          {hasMore && (
            <div className="text-center py-4">
              <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>{loadingMore ? 'Loading...' : 'Load More'}</Button>
            </div>
          )}
        </div>
      )}

      <CreatePostModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={handlePostCreated} />
    </div>
  );
};