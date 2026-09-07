import { useApp } from '../../context/AppContext.jsx';
import { IoLocation } from 'react-icons/io5';
import TrendingHashtags from '../hashtags/TrendingHashtags.jsx';

const RightPanel = () => {
  const { campuses } = useApp();

  return (
    <aside className="hidden xl:block w-72 shrink-0 border-l border-border-color bg-bg-secondary">
      <div className="sticky top-20 p-4 space-y-4">
        {/* Trending Hashtags */}
        <TrendingHashtags />

        {/* Campuses */}
        <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Campuses
          </h3>
          <div className="space-y-2.5">
            {campuses.map((campus) => (
              <div key={campus.id} className="flex items-center gap-2">
                <IoLocation size={14} className="text-rvnp-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary block truncate">
                    {campus.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {campus.userCount || 0} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Card */}
        <div className="bg-rvnp-green rounded-xl p-4">
          <h4 className="font-heading font-semibold text-rvnp-white mb-1">
            RVNP Connected
          </h4>
          <p className="text-rvnp-white text-xs opacity-80">
            Five campuses. One community.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;