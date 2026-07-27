import clsx from 'clsx';

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-1.5 text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-3 rounded-md border bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
          error ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-accent)] mt-1">{error}</p>}
    </div>
  );
};