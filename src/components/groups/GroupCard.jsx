import { useNavigate } from 'react-router-dom';
import { IoPeople, IoLocation } from 'react-icons/io5';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/groups/${group.id}`)}
      className="w-full p-4 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-rvnp-green bg-opacity-10 shrink-0">
          <IoPeople size={24} className="text-rvnp-green" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{group.name}</h3>
          <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
            <span>{group._count?.members || 0} members</span>
            <span>{group._count?.posts || 0} posts</span>
          </div>
        </div>
      </div>

      {group.description && (
        <p className="text-sm text-text-secondary mt-2 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
        <span className="px-2 py-0.5 rounded bg-bg-secondary">{group.category || 'General'}</span>
        {group.privacy && group.privacy !== 'PUBLIC' && (
          <span className="px-2 py-0.5 rounded bg-bg-secondary">🔒 {group.privacy}</span>
        )}
        {group.campus && (
          <span className="flex items-center gap-1">
            <IoLocation size={12} />
            {group.campus.name}
          </span>
        )}
      </div>
    </button>
  );
};

export default GroupCard; 
