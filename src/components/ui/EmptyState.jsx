export const EmptyState = ({ icon = '📭', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-[var(--color-text)]">{title || 'Nothing here yet'}</h3>
      {description && <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};