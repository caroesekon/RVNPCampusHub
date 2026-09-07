const Skeleton = ({ type = 'text', count = 1, className = '' }) => {
  const types = {
    text: 'h-4',
    title: 'h-6',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-40',
    button: 'h-10 w-24',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${types[type]} bg-bg-secondary animate-pulse rounded ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;