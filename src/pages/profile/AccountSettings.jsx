import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateAccountSettings, changePassword } from '@/api/settings';
import toast from 'react-hot-toast';

export const AccountSettings = ({ user, onUpdate }) => {
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveAccount = async () => {
    setSaving(true);
    await updateAccountSettings({ email, phone });
    toast.success('Account updated');
    onUpdate();
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Fill all fields');
    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed. Please login again.');
      setShowPassword(false);
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  return (
    <div className="card border-l-transparent">
      <h3 className="font-bold text-[var(--color-text)] mb-3">👤 Account</h3>
      <div className="space-y-3">
        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254712345678" />
        <Button variant="outline" size="sm" onClick={handleSaveAccount} disabled={saving}>Save Account</Button>

        {!showPassword ? (
          <Button variant="ghost" size="sm" onClick={() => setShowPassword(true)}>Change Password</Button>
        ) : (
          <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
            <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleChangePassword} disabled={saving}>Update Password</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPassword(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};