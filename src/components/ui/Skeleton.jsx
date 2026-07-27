import clsx from 'clsx';

export const Skeleton = ({ className }) => (
  <div className={clsx('skeleton', className)} />
);

export const PostSkeleton = () => (
  <div className="card border-l-[var(--color-border)] p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-16 h-2" />
      </div>
    </div>
    <Skeleton className="w-full h-4" />
    <Skeleton className="w-3/4 h-4" />
    <Skeleton className="w-full h-40 rounded-md" />
  </div>
);

export const ChatSkeleton = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="w-32 h-3" />
      <Skeleton className="w-48 h-2" />
    </div>
  </div>
);