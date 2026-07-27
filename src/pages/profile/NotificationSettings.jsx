import { useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import { updateNotificationSettings } from '@/api/settings';
import toast from 'react-hot-toast';

export const NotificationSettings = ({ user, onUpdate }) => {
  const [push, setPush] = useState(user.settings?.pushEnabled ?? true);
  const [email, setEmail] = useState(user.settings?.emailDigest ?? true);
  const [sms, setSms] = useState(user.settings?.smsEnabled ?? false);

  const handleToggle = async (key, value) => {
    const data = { [key]: value };
    await updateNotificationSettings(data);
    toast.success('Updated');
    if (key === 'pushEnabled') setPush(value);
    if (key === 'emailDigest') setEmail(value);
    if (key === 'smsEnabled') setSms(value);
    onUpdate();
  };

  return (
    <div className="card border-l-transparent">
      <h3 className="font-bold text-[var(--color-text)] mb-3">🔔 Notifications</h3>
      <Toggle enabled={push} onChange={v => handleToggle('pushEnabled', v)} label="Push Notifications" description="Get notified instantly" />
      <Toggle enabled={email} onChange={v => handleToggle('emailDigest', v)} label="Email Digest" description="Weekly activity summary" />
      <Toggle enabled={sms} onChange={v => handleToggle('smsEnabled', v)} label="SMS Alerts" description="For major updates only" />
    </div>
  );
};