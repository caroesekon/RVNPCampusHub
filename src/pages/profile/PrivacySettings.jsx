import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { updatePrivacySettings } from '@/api/privacy';
import toast from 'react-hot-toast';

export const PrivacySettings = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(user.privacy || {});

  const handleToggle = async (key, value) => {
    const updated = { ...privacy, [key]: value };
    if (key === 'ghostMode' && value) {
      updated.hideOnlineStatus = true;
      updated.hideLastSeen = true;
      updated.hideReadReceipts = true;
      updated.hideLikes = true;
      updated.hideProfile = true;
    }
    setPrivacy(updated);
    await updatePrivacySettings(updated);
    toast.success('Privacy updated');
    onUpdate();
  };

  const handleMessageChange = async (e) => {
    const updated = { ...privacy, allowMessages: e.target.value };
    setPrivacy(updated);
    await updatePrivacySettings(updated);
    toast.success('Updated');
  };

  return (
    <div className="card border-l-transparent">
      <h3 className="font-bold text-[var(--color-text)] mb-3">🔒 Privacy</h3>
      <Toggle enabled={privacy.ghostMode || false} onChange={v => handleToggle('ghostMode', v)} label="Ghost Mode" description="Full invisibility — overrides all" />
      <Toggle enabled={privacy.hideProfile || false} onChange={v => handleToggle('hideProfile', v)} label="Hide Profile" description="Make profile private" />
      <Toggle enabled={privacy.hideLastSeen || false} onChange={v => handleToggle('hideLastSeen', v)} label="Hide Last Seen" />
      <Toggle enabled={privacy.hideOnlineStatus || false} onChange={v => handleToggle('hideOnlineStatus', v)} label="Hide Online Status" />
      <Toggle enabled={privacy.hideReadReceipts || false} onChange={v => handleToggle('hideReadReceipts', v)} label="Hide Read Receipts" />
      <Toggle enabled={privacy.hideLikes || false} onChange={v => handleToggle('hideLikes', v)} label="Hide Likes" />
      <Toggle enabled={privacy.allowTagging ?? true} onChange={v => handleToggle('allowTagging', v)} label="Allow Tagging" />
      <Toggle enabled={privacy.allowFriendRequests ?? true} onChange={v => handleToggle('allowFriendRequests', v)} label="Allow Followers" />
      <Toggle enabled={privacy.showDepartment ?? true} onChange={v => handleToggle('showDepartment', v)} label="Show Department" />
      <Toggle enabled={privacy.showHostel ?? true} onChange={v => handleToggle('showHostel', v)} label="Show Hostel" />

      <div className="py-3">
        <label className="text-sm font-semibold text-[var(--color-text)]">Allow Messages</label>
        <select value={privacy.allowMessages || 'everyone'} onChange={handleMessageChange} className="input mt-1">
          <option value="everyone">Everyone</option>
          <option value="followers">Followers Only</option>
          <option value="verified">HDM Verified Only</option>
          <option value="none">No One</option>
        </select>
      </div>

      <Button variant="outline" size="sm" onClick={() => navigate('/blocked-users')}>View Blocked Users</Button>
    </div>
  );
};