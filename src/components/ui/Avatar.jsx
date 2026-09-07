const Avatar = ({ src, name, size = 'md', onClick }) => {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-xl',
    xl: 'h-20 w-20 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizes[size]}
        rounded-full overflow-hidden
        bg-bg-secondary flex items-center justify-center
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-text-secondary">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};

export default Avatar;