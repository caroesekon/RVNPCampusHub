import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export const StoriesRow = ({ stories = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Group stories by author
  const grouped = {};
  stories.forEach(s => {
    if (!grouped[s.author?._id]) grouped[s.author?._id] = [];
    grouped[s.author?._id].push(s);
  });

  const storyUsers = Object.values(grouped);

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 mb-3">
      {/* My Story */}
      <button onClick={() => navigate('/stories')} className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="relative">
          <Avatar src={user?.avatar} name={user?.firstName} size="lg" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center border-2 border-[var(--color-surface)]">+</span>
        </div>
        <span className="text-[10px] text-[var(--color-text-secondary)]">My Story</span>
      </button>

      {/* Other Stories */}
      {storyUsers.slice(0, 10).map((group, i) => (
        <button key={i} onClick={() => navigate('/stories')} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="p-[2px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500">
            <Avatar src={group[0].author?.avatar} name={group[0].author?.firstName} size="lg" className="border-2 border-[var(--color-surface)]" />
          </div>
          <span className="text-[10px] text-[var(--color-text-secondary)] max-w-[60px] truncate">
            {group[0].author?.firstName || 'User'}
          </span>
        </button>
      ))}
    </div>
  );
};