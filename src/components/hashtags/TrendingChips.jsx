import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoFlame } from 'react-icons/io5';
import hashtagApi from '../../api/hashtagApi.js';

const TrendingChips = () => {
  const navigate = useNavigate();
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await hashtagApi.getTrending(8);
      if (response.data.success) {
        setHashtags(response.data.data || []);
      }
    } catch {
      // Silent
    }
  };

  if (hashtags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      <span className="flex items-center gap-1 text-rvnp-red shrink-0">
        <IoFlame size={14} />
        <span className="text-xs font-medium">Trending:</span>
      </span>
      {hashtags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => navigate(`/hashtags/${tag.name}`)}
          className="px-3 py-1.5 rounded-full bg-bg-secondary border border-border-color text-xs text-rvnp-green hover:bg-bg-tertiary shrink-0"
        >
          #{tag.name}
        </button>
      ))}
    </div>
  );
};

export default TrendingChips;