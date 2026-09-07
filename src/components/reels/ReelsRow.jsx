import { useNavigate } from 'react-router-dom';
import { IoPlay, IoVideocam } from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import { formatCount } from '../../utils/formatNumber.js';

const ReelsRow = ({ reels }) => {
  const navigate = useNavigate();

  if (!reels || reels.length === 0) return null;

  return (
    <div className="bg-bg-primary border border-border-color rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoVideocam size={18} className="text-rvnp-green" />
          <h3 className="font-heading font-semibold text-text-primary text-sm sm:text-base">
            Reels
          </h3>
        </div>
        <button
          onClick={() => navigate('/reels')}
          className="text-sm text-rvnp-green hover:underline"
        >
          See All
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {reels.map((reel) => (
          <button
            key={reel.id}
            onClick={() => navigate('/reels')}
            className="shrink-0 w-28 sm:w-32 cursor-pointer group"
          >
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-bg-secondary">
              {reel.thumbnailUrl ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.caption || 'Reel'}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-2.5 rounded-full bg-black bg-opacity-50">
                  <IoPlay size={20} className="text-white" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                <div className="flex items-center gap-1 text-white text-xs">
                  <span>▶ {formatCount(reel.viewCount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
              <Avatar src={reel.user?.avatarUrl} name={reel.user?.fullName} size="sm" />
              <span className="text-xs text-text-secondary truncate">
                {reel.user?.fullName?.split(' ')[0]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReelsRow;