import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { getGroups, discoverGroups } from '@/api/groups';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { formatCompactNumber } from '@/utils/formatCurrency';

export const GroupsPage = () => {
  const { isFeatureEnabled } = useSettings();
  const navigate = useNavigate();
  const [tab, setTab] = useState('my');
  const [myGroups, setMyGroups] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const groupsEnabled = isFeatureEnabled('groups');

  useEffect(() => {
    if (!groupsEnabled) return;
    fetchGroups();
  }, [groupsEnabled]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const [myRes, disRes] = await Promise.all([getGroups(), discoverGroups()]);
      setMyGroups(myRes.data || myRes);
      setDiscover(disRes.data || disRes);
    } catch { console.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  if (!groupsEnabled) {
    return <EmptyState icon="👥" title="Groups are currently disabled" description="The admin has disabled this feature." />;
  }

  const tabs = [
    { id: 'my', label: `My Groups (${myGroups.length})` },
    { id: 'discover', label: 'Discover' },
  ];

  const groups = tab === 'my' ? myGroups : discover;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-black text-[var(--color-text)]">Groups</h2>
        <Button size="sm" onClick={() => navigate('/create-group')}>+ Create</Button>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {groups.length === 0 ? (
        <EmptyState
          icon="👥"
          title={tab === 'my' ? 'No groups yet' : 'No groups to discover'}
          description={tab === 'my' ? 'Create or join a group!' : 'All groups have been joined.'}
          action={tab === 'my' ? <Button size="sm" onClick={() => navigate('/create-group')}>Create Group</Button> : null}
        />
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <div
              key={group._id}
              onClick={() => navigate(`/groups/${group._id}`)}
              className="card border-l-transparent overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-[var(--color-primary)]/30 to-[var(--color-primary)]/10 flex items-center justify-center">
                {group.coverImage ? (
                  <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{group.category === 'sports' ? '⚽' : group.category === 'tech' ? '💻' : group.category === 'arts' ? '🎨' : group.category === 'academic' ? '📚' : '👥'}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[var(--color-text)]">{group.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{group.description || 'No description'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-muted)]">
                  <span>👥 {formatCompactNumber(group.memberCount)} members</span>
                  <span>• {group.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};