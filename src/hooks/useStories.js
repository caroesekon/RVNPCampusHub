import { useState, useEffect, useCallback } from 'react';
import { getStories, createStory, viewStory } from '@/api/stories.api';

export const useStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      const res = await getStories();
      setStories(res.data);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const addStory = async (formData) => {
    const res = await createStory(formData);
    setStories(prev => [res.data, ...prev]);
    return res.data;
  };

  const markViewed = async (storyId) => {
    await viewStory(storyId);
    setStories(prev => prev.map(s => s._id === storyId ? { ...s, viewed: true } : s));
  };

  return { stories, loading, addStory, markViewed, refresh: fetchStories };
};