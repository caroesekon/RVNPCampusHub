import { IoGrid, IoVideocam } from 'react-icons/io5';

const ProfileTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { value: 'posts', label: 'Posts', icon: IoGrid },
    { value: 'reels', label: 'Reels', icon: IoVideocam },
  ];

  return (
    <div className="flex border-b border-border-color">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all
            border-b-2 -mb-px
            ${
              activeTab === tab.value
                ? 'border-text-primary text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }
          `}
        >
          <tab.icon size={18} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;