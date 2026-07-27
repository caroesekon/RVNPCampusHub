import clsx from 'clsx';

export const Avatar = ({ src, name, size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name || ''}
          className={clsx('rounded-full object-cover', sizes[size], size !== 'sm' && 'ring-2 ring-[var(--color-surface)]')}
        />
      ) : (
        <div className={clsx('rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold', sizes[size], size !== 'sm' && 'ring-2 ring-[var(--color-surface)]')}>
          {initials}
        </div>
      )}
    </div>
  );
};