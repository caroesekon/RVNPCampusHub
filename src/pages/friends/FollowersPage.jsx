import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getFollowers, getFollowing, removeFollower, followUser, unfollowUser } from '@/api/friends';
import { searchUsers } from '@/api/search';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';

export const FollowersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || user?._id;
  const tabParam = searchParams.get('tab') || 'followers';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'followers', label: 'Followers' },
    { id: 'following', label: 'Following' },
    { id: 'suggestions', label: 'People You May Know' },
  ];

  useEffect(() => { if (!userId) return; fetchData(); }, [userId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'followers') { const r = await getFollowers(userId); setFollowers(r.data || r); }
      else if (activeTab === 'following') { const r = await getFollowing(userId); setFollowing(r.data || r); }
      else if (activeTab === 'suggestions') {
        const [usersRes, followingRes] = await Promise.all([searchUsers('', 1), getFollowing(userId)]);
        const all = usersRes.data || usersRes;
        const followingIds = new Set((followingRes.data || followingRes).map(f => f._id));
        const existing = new Set([...followingIds, user?._id]);
        setSuggestions(all.filter(u => !existing.has(u._id)).slice(0, 20));
      }
    } catch { console.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id) => { if (!confirm('Remove?')) return; try { await removeFollower(id); setFollowers(prev => prev.filter(f => f._id !== id)); toast.success('Removed'); } catch { toast.error('Failed'); } };
  const handleUnfollow = async (id) => { try { await unfollowUser(id); toast.success('Unfollowed'); fetchData(); } catch { toast.error('Failed'); } };
  const handleFollow = async (id) => { try { await followUser(id); setSuggestions(prev => prev.filter(p => p._id !== id)); toast.success('Following!'); } catch { toast.error('Failed'); } };

  const list = activeTab === 'followers' ? followers : activeTab === 'following' ? following : suggestions;
  const isOwnProfile = !searchParams.get('userId') || searchParams.get('userId') === user?._id;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-4" />
      {list.length === 0 ? (
        <EmptyState icon={activeTab === 'followers' ? '👥' : activeTab === 'following' ? '👤' : '🧭'} title={activeTab === 'followers' ? 'No followers yet' : activeTab === 'following' ? 'Not following anyone' : 'No suggestions'} description={activeTab === 'suggestions' ? 'Everyone you know is already connected!' : ''} />
      ) : (
        <div className="space-y-1">
          {list.map(person => {
            const isFollowing = following.some(f => f._id === person._id);
            return (
              <div key={person._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors">
                <div onClick={() => navigate(`/profile/${person._id}`)} className="cursor-pointer"><Avatar src={person.avatar} name={person.firstName} size="md" verified={person.hdmVerified} /></div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${person._id}`)}>
                  <p className="font-semibold text-[var(--color-text)] text-sm truncate flex items-center gap-1">{person.firstName} {person.lastName}{person.hdmVerified && <VerifiedBadge size={10} />}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{person.department || 'RVNP'}{person.hostel ? ` • ${person.hostel}` : ''}</p>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    {activeTab === 'followers' ? <Button variant="ghost" size="sm" onClick={() => handleRemove(person._id)}>Remove</Button> :
                     activeTab === 'following' ? <Button variant="outline" size="sm" onClick={() => handleUnfollow(person._id)}>Following</Button> :
                     isFollowing ? <span className="text-xs text-[var(--color-primary)] font-semibold px-2">✓ Following</span> :
                     <Button size="sm" onClick={() => handleFollow(person._id)}>+ Follow</Button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};