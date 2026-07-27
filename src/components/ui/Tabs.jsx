import clsx from 'clsx';

export const Tabs = ({ tabs, active, onChange, className }) => {
  return (
    <div className={clsx('flex gap-1 overflow-x-auto scrollbar-hide', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'tab-pill',
            active === tab.id ? 'tab-pill-active' : 'tab-pill-inactive'
          )}
        >
          {tab.icon && <span className="mr-1">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
              active === tab.id ? 'bg-white/20' : 'bg-[var(--color-surface-hover)]'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};