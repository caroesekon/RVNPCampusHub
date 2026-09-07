import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout.jsx';
import StoriesBar from '../components/stories/StoriesBar.jsx';
import TrendingChips from '../components/hashtags/TrendingChips.jsx';
import PostComposer from '../components/posts/PostComposer.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import ReelsRow from '../components/reels/ReelsRow.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import feedApi from '../api/feedApi.js';
import postApi from '../api/postApi.js';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const tabs = [
    { value: 'all', label: 'All Posts' },
    { value: 'campus', label: 'My Campus' },
  ];

  useEffect(() => {
    fetchFeed(1, true);
    fetchReels();
  }, [activeTab]);

  const fetchReels = async () => {
    try {
      const response = await feedApi.getFeedReels(8);

      if (response.data.success) {
        setReels(response.data.data.reels || []);
      }
    } catch (error) {
      console.error('Failed to load reels:', error.message);
    }
  };

  const fetchFeed = async (pageNum = 1, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let response;

      if (activeTab === 'all') {
        response = await feedApi.getFeed(pageNum);
      } else {
        const storedUser = JSON.parse(localStorage.getItem('rvnp_user'));
        response = await feedApi.getCampusFeed(storedUser?.campusId, pageNum);
      }

      if (response.data.success) {
        const { posts: newPosts, total } = response.data.data;

        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(pageNum * 20 < total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load feed:', error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    try {
      await postApi.reactToPost(postId, 'LIKE');
    } catch (error) {
      console.error('Like failed:', error.message);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await postApi.removeReaction(postId);
    } catch (error) {
      console.error('Unlike failed:', error.message);
    }
  };

  const handleShare = async (postId) => {
    try {
      await postApi.sharePost(postId);
    } catch (error) {
      console.error('Share failed:', error.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 w-full">
        <StoriesBar />

        <TrendingChips />

        <PostComposer onPostCreated={handlePostCreated} />

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'all' && reels.length > 0 && (
          <ReelsRow reels={reels} />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Be the first to share something with your campus!"
          />
        ) : (
          <div className="space-y-4 w-full">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onShare={handleShare}
              />
            ))}

            {loadingMore && (
              <div className="flex justify-center py-4">
                <Spinner size="md" />
              </div>
            )}

            {hasMore && !loadingMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 rounded-lg bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Feed;