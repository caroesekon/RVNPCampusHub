import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAdd } from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import storyApi from '../../api/storyApi.js';

const StoriesBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await storyApi.getActiveStories();

      if (response.data.success) {
        setStories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load stories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
      <button
        onClick={() => navigate('/stories/create')}
        className="flex flex-col items-center gap-1 shrink-0"
      >
        <div className="relative">
          <Avatar src={user?.avatarUrl} name={user?.fullName} size="lg" />
          <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-bg-primary border border-border-color">
            <IoAdd size={14} className="text-text-primary" />
          </span>
        </div>
        <span className="text-xs text-text-muted">Your story</span>
      </button>

      {stories.map((storyGroup) => (
        <button
          key={storyGroup.user?.id}
          onClick={() => navigate(`/stories/${storyGroup.user?.id}`)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <Avatar
            src={storyGroup.user?.avatarUrl}
            name={storyGroup.user?.fullName}
            size="lg"
          />
          <span className="text-xs text-text-muted truncate max-w-[64px]">
            {storyGroup.user?.fullName?.split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default StoriesBar;