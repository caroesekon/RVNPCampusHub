const Badge = ({ count, max = 99 }) => {
  if (!count || count <= 0) return null;

  const display = count > max ? `${max}+` : count;

  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
      {display}
    </span>
  );
};

export default Badge;