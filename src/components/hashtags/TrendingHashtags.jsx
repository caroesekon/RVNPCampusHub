import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoFlame } from 'react-icons/io5';
import hashtagApi from '../../api/hashtagApi.js';

const TrendingHashtags = () => {
  const navigate = useNavigate();
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await hashtagApi.getTrending(5);
      if (response.data.success) {
        setHashtags(response.data.data || []);
      }
    } catch {
      // Silent
    }
  };

  if (hashtags.length === 0) return null;

  return (
    <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
      <h3 className="font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
        <IoFlame size={16} className="text-rvnp-red" />
        Trending
      </h3>
      <div className="space-y-2">
        {hashtags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => navigate(`/hashtags/${tag.name}`)}
            className="w-full text-left hover:bg-bg-secondary rounded-lg px-2 py-1.5 transition-all"
          >
            <span className="text-rvnp-green font-medium text-sm">#{tag.name}</span>
            <span className="text-text-muted text-xs ml-2">{tag.postCount} posts</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingHashtags;