const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="mb-4 text-text-muted">
          <Icon size={64} />
        </div>
      )}

      <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-secondary text-center max-w-sm mb-4">
          {description}
        </p>
      )}

      {action}
    </div>
  );
};

export default EmptyState;