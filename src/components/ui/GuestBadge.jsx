const GuestBadge = ({ size = 'sm' }) => {
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`${sizes[size]} inline-flex items-center gap-1 bg-amber-500 bg-opacity-15 text-amber-600 dark:text-amber-400 rounded-full font-medium border border-amber-500`}
    >
      👤 Guest
    </span>
  );
};

export default GuestBadge;