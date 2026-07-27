import clsx from 'clsx';

const badgeVariants = {
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  gold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
};

export const Badge = ({ children, variant = 'gray', emoji, className }) => {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold', badgeVariants[variant], className)}>
      {emoji && <span>{emoji}</span>}
      {children}
    </span>
  );
};