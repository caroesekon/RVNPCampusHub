const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex gap-2 border-b border-border-color ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            px-4 py-2 font-medium text-sm transition-all duration-200
            border-b-2 -mb-px
            ${
              activeTab === tab.value
                ? 'border-text-primary text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }
          `}
        >
          {tab.label}
          {tab.badge && <span className="ml-2">{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
};

export default Tabs;