import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
import privacyApi from '../api/privacyApi.js';

const PrivacySettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);

    try {
      const response = await privacyApi.getPrivacySettings();

      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      setError('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await privacyApi.updatePrivacySettings(settings);

      if (response.data.success) {
        setSuccess('Privacy settings saved');
      }
    } catch (error) {
      setError('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);

    try {
      const response = await privacyApi.resetPrivacySettings();

      if (response.data.success) {
        setSettings(response.data.data);
        setSuccess('Reset to default');
      }
    } catch (error) {
      setError('Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const visibilityOptions = [
    { value: 'EVERYONE', label: 'Everyone' },
    { value: 'CAMPUS_ONLY', label: 'Campus Only' },
    { value: 'FRIENDS_ONLY', label: 'Friends Only' },
    { value: 'ONLY_ME', label: 'Only Me' },
  ];

  const permissionOptions = [
    { value: 'EVERYONE', label: 'Everyone' },
    { value: 'CAMPUS_ONLY', label: 'Campus Only' },
    { value: 'FRIENDS_ONLY', label: 'Friends Only' },
    { value: 'NO_ONE', label: 'No One' },
  ];

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        {description && (
          <p className="text-text-muted text-xs mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
          checked ? 'bg-rvnp-green' : 'bg-bg-tertiary'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Privacy Settings
          </h1>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Default
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-rvnp-green bg-opacity-10 border border-rvnp-green text-rvnp-green text-sm">
            {success}
          </div>
        )}

        <div className="bg-bg-primary border border-border-color rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Profile Visibility
          </h3>
          <Dropdown
            label="Who can see my profile"
            options={visibilityOptions}
            value={settings?.profileVisibility}
            onChange={(value) => handleSelect('profileVisibility', value)}
          />
          <Toggle label="Show email" checked={settings?.showEmail} onChange={() => handleToggle('showEmail')} />
          <Toggle label="Show phone number" checked={settings?.showPhone} onChange={() => handleToggle('showPhone')} />
          <Toggle label="Show course" checked={settings?.showCourse} onChange={() => handleToggle('showCourse')} />
          <Toggle label="Show year of study" checked={settings?.showYearOfStudy} onChange={() => handleToggle('showYearOfStudy')} />
        </div>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Content Visibility
          </h3>
          <Dropdown label="Who can see my posts" options={visibilityOptions} value={settings?.postVisibility} onChange={(value) => handleSelect('postVisibility', value)} />
          <Dropdown label="Who can see my reels" options={visibilityOptions} value={settings?.reelVisibility} onChange={(value) => handleSelect('reelVisibility', value)} />
          <Dropdown label="Who can see my stories" options={visibilityOptions} value={settings?.storyVisibility} onChange={(value) => handleSelect('storyVisibility', value)} />
        </div>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Interactions
          </h3>
          <Dropdown label="Who can comment" options={permissionOptions} value={settings?.commentPermission} onChange={(value) => handleSelect('commentPermission', value)} />
          <Dropdown label="Who can react" options={permissionOptions} value={settings?.reactionPermission} onChange={(value) => handleSelect('reactionPermission', value)} />
          <Dropdown label="Who can follow me" options={permissionOptions} value={settings?.followPermission} onChange={(value) => handleSelect('followPermission', value)} />
          <Dropdown label="Who can message me" options={permissionOptions} value={settings?.messagePermission} onChange={(value) => handleSelect('messagePermission', value)} />
          <Toggle label="Allow story replies" checked={settings?.allowStoryReplies} onChange={() => handleToggle('allowStoryReplies')} />
          <Toggle label="Allow story reactions" checked={settings?.allowStoryReactions} onChange={() => handleToggle('allowStoryReactions')} />
        </div>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Discovery & Presence
          </h3>
          <Toggle label="Show in search results" checked={settings?.showInSearch} onChange={() => handleToggle('showInSearch')} />
          <Toggle label="Show in campus directory" checked={settings?.showInCampusDirectory} onChange={() => handleToggle('showInCampusDirectory')} />
          <Toggle label="Show online status" checked={settings?.showOnlineStatus} onChange={() => handleToggle('showOnlineStatus')} />
          <Toggle label="Show last seen" checked={settings?.showLastSeen} onChange={() => handleToggle('showLastSeen')} />
          <Toggle label="Show read receipts" checked={settings?.showReadReceipts} onChange={() => handleToggle('showReadReceipts')} />
        </div>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Notifications
          </h3>
          <Toggle label="Email notifications" checked={settings?.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
          <Toggle label="SMS notifications" checked={settings?.smsNotifications} onChange={() => handleToggle('smsNotifications')} />
          <Toggle label="Push notifications" checked={settings?.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
          <Toggle label="Notify on new follower" checked={settings?.notifyOnFollower} onChange={() => handleToggle('notifyOnFollower')} />
          <Toggle label="Notify on new message" checked={settings?.notifyOnMessage} onChange={() => handleToggle('notifyOnMessage')} />
          <Toggle label="Notify on reaction" checked={settings?.notifyOnReaction} onChange={() => handleToggle('notifyOnReaction')} />
          <Toggle label="Notify on comment" checked={settings?.notifyOnComment} onChange={() => handleToggle('notifyOnComment')} />
          <Toggle label="Notify on group invite" checked={settings?.notifyOnGroupInvite} onChange={() => handleToggle('notifyOnGroupInvite')} />
          <Toggle label="Notify on event reminder" checked={settings?.notifyOnEventReminder} onChange={() => handleToggle('notifyOnEventReminder')} />
        </div>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-2">
            Safety
          </h3>
          <Toggle label="Private account" description="Only approved followers can see your content" checked={settings?.privateAccount} onChange={() => handleToggle('privateAccount')} />
          <Toggle label="Two-factor authentication" checked={settings?.twoFactorAuth} onChange={() => handleToggle('twoFactorAuth')} />
        </div>

        <Button fullWidth onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </Layout>
  );
};

export default PrivacySettings;