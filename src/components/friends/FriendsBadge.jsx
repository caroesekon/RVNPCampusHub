import { IoPeople } from 'react-icons/io5';

const FriendsBadge = ({ isFriend, size = 'sm' }) => {
  if (!isFriend) return null;

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`
        ${sizes[size]}
        inline-flex items-center gap-1
        bg-rvnp-green bg-opacity-10 text-rvnp-green
        rounded-full font-medium
      `}
    >
      <IoPeople size={size === 'sm' ? 12 : 14} />
      Friends
    </span>
  );
};

export default FriendsBadge;