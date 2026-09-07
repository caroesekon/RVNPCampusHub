const StatCard = ({ label, value, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-bg-secondary transition-all cursor-pointer"
      >
        <span className="text-lg font-heading font-bold text-text-primary">
          {value}
        </span>
        <span className="text-xs text-text-muted">{label}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2">
      <span className="text-lg font-heading font-bold text-text-primary">
        {value}
      </span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
};

export default StatCard;