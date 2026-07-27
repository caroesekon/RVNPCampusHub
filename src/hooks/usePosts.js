import { useState, useEffect, useCallback } from 'react';
import { getFeed, getPostById, createPost, likePost, commentOnPost, deletePost } from '@/api/posts.api';

export const usePosts = (tab = 'all') => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getFeed(tab, pageNum);
      if (pageNum === 1) {
        setPosts(res.data);
      } else {
        setPosts(prev => [...prev, ...res.data]);
      }
      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    if (hasMore && !loading) fetchPosts(page + 1);
  };

  const addPost = async (data) => {
    const res = await createPost(data);
    setPosts(prev => [res.data, ...prev]);
    return res.data;
  };

  const toggleLike = async (postId) => {
    const res = await likePost(postId);
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes, likeCount: res.data.likeCount } : p));
  };

  const addComment = async (postId, content) => {
    const res = await commentOnPost(postId, content);
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data.comments, commentCount: res.data.commentCount } : p));
  };

  const removePost = async (postId) => {
    await deletePost(postId);
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return { posts, loading, hasMore, loadMore, addPost, toggleLike, addComment, removePost, refresh: () => fetchPosts(1) };
};