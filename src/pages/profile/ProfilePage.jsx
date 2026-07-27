import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getProfile } from '@/api/users';
import { ProfileHeader } from './ProfileHeader';
import { ProfilePosts } from './ProfilePosts';
import { ProfileListings } from './ProfileListings';
import { AccountSettings } from './AccountSettings';
import { NotificationSettings } from './NotificationSettings';
import { PrivacySettings } from './PrivacySettings';
import { AppearanceSettings } from './AppearanceSettings';
import { SubscriptionSettings } from './SubscriptionSettings';
import { LegalSettings } from './LegalSettings';
import { DangerZone } from './DangerZone';
import { VerificationPage } from './VerificationPage';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs } from '@/components/ui/Tabs';

export const ProfilePage = () => {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { isFeatureEnabled } = useSettings();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = !userId || userId === user?._id;
  const verificationEnabled = isFeatureEnabled('verification');

  useEffect(() => {
    if (authLoading) return;
    const id = userId || user?._id;
    if (!id) { setLoading(false); return; }

    const fetchProfile = async () => {
      try {
        const res = await getProfile(id);
        setProfile(res.data?.user || res.user);
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, user, authLoading]);

  const refreshProfile = () => {
    const id = userId || user?._id;
    if (id) {
      getProfile(id).then(res => {
        setProfile(res.data?.user || res.user);
      }).catch(() => {});
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!user && !userId) {
    return <div className="p-4 text-center text-[var(--color-text-secondary)]">Please log in to view your profile.</div>;
  }

  if (!profile) {
    return <div className="p-4 text-center text-[var(--color-text-secondary)]">User not found</div>;
  }

  const ownTabs = [
    { id: 'posts', label: '📰 Posts' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  if (isOwnProfile && verificationEnabled) {
    ownTabs.push({
      id: 'verification',
      label: profile.hdmVerified ? '🔵 Verified' : '🔵 Verify',
    });
  }

  const otherTabs = [{ id: 'posts', label: '📰 Posts' }];
  if (isFeatureEnabled('marketplace')) {
    otherTabs.push({ id: 'listings', label: '🛒 Listings' });
  }

  const tabs = isOwnProfile ? ownTabs : otherTabs;

  return (
    <div className="pb-20">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} onUpdate={refreshProfile} />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mt-4" />

      <div className="mt-4">
        {activeTab === 'posts' && <ProfilePosts userId={profile._id} />}
        {activeTab === 'listings' && <ProfileListings userId={profile._id} />}
        {activeTab === 'verification' && isOwnProfile && verificationEnabled && (
          <VerificationPage embedded />
        )}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <AccountSettings user={profile} onUpdate={refreshProfile} />
            <NotificationSettings user={profile} onUpdate={refreshProfile} />
            <PrivacySettings user={profile} onUpdate={refreshProfile} />
            <AppearanceSettings />
            <SubscriptionSettings user={profile} />
            <LegalSettings />
            <DangerZone />
          </div>
        )}
      </div>
    </div>
  );
};