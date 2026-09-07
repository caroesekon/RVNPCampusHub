const BadgeIcon = ({ badge, size = 'md', showTooltip = true }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <span
      className={`${sizes[size]} ${showTooltip ? 'cursor-help' : ''}`}
      title={showTooltip ? `${badge.icon} ${badge.name}: ${badge.description}` : badge.name}
    >
      {badge.icon}
    </span>
  );
};

export default BadgeIcon;