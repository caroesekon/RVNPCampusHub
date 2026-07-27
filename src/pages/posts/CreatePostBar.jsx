import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';

export const CreatePostBar = ({ onClick }) => {
  const { user } = useAuth();

  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] shadow-sm cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors mb-3">
      <Avatar src={user?.avatar} name={user?.firstName} size="sm" />
      <span className="flex-1 text-sm text-[var(--color-text-muted)]">What's happening at RVNP...</span>
      <span className="text-xl">📷</span>
    </div>
  );
};