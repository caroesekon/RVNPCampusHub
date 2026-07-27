import clsx from 'clsx';

const variants = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white',
  accent: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white',
  outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = ({ variant = 'primary', size = 'md', className, children, disabled, ...props }) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};