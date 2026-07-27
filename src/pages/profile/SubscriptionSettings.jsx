import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { getMySubscription, cancelSubscription } from '@/api/subscriptions';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export const SubscriptionSettings = ({ user }) => {
  const [sub, setSub] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMySubscription();
        setSub(res.data);
      } catch {}
    };
    load();
  }, []);

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return;
    await cancelSubscription('User cancelled');
    toast.success('Subscription cancelled');
    setSub(null);
  };

  return (
    <div className="card border-l-transparent">
      <h3 className="font-bold text-[var(--color-text)] mb-3">💳 Subscription</h3>
      {sub ? (
        <div>
          <p className="text-sm text-[var(--color-text)]"><strong>{sub.planName}</strong></p>
          {sub.expiresAt && <p className="text-xs text-[var(--color-text-secondary)]">Expires {formatDate(sub.expiresAt)}</p>}
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => navigate('/subscriptions')}>Upgrade</Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">Free Plan</p>
          <Button size="sm" className="mt-2" onClick={() => navigate('/subscriptions')}>Upgrade to Pro</Button>
        </div>
      )}
    </div>
  );
};