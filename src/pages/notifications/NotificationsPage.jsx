import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { timeAgo } from '@/utils/formatDate';
import toast from 'react-hot-toast';

const NOTIFICATION_ICONS = {
  like: '❤️', comment: '💬', follow: '👥', message: '💬',
  badge: '🏆', event_reminder: '📅', listing_interest: '🛒',
  listing_sold: '💰', spotlight: '🌟', announcement: '📢',
  verification: '🔵', moderation: '⚠️', system: 'ℹ️',
};

export const NotificationsPage = () => {
  const { notifications, unreadCount, readOne, readAll, refetch } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => { refetch().finally(() => setLoading(false)); }, []);

  const handleMarkAll = async () => { await readAll(); toast.success('All marked as read'); };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full skeleton" />
            <div className="flex-1 space-y-2"><div className="w-3/4 h-3 skeleton rounded" /><div className="w-1/2 h-2 skeleton rounded" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[var(--color-text)]">Notifications {unreadCount > 0 && <span className="ml-2 text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">{unreadCount}</span>}</h2>
        {unreadCount > 0 && <button onClick={handleMarkAll} className="text-xs text-[var(--color-primary)] font-semibold hover:underline">Mark all as read</button>}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-0.5">
          {notifications.map(notif => (
            <div key={notif._id} onClick={() => !notif.isRead && readOne(notif._id)}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-surface-hover)] ${!notif.isRead ? 'bg-[var(--color-primary)]/5' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-lg flex-shrink-0">{NOTIFICATION_ICONS[notif.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)]">
                  {!notif.isRead && <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)] mr-1.5 align-middle" />}
                  <span className="font-semibold">{notif.title}</span>
                </p>
                {notif.body && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">{notif.body}</p>}
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{timeAgo(notif.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length >= 30 && (
        <div className="text-center mt-4"><Button variant="outline" size="sm" onClick={() => refetch()}>Load More</Button></div>
      )}
    </div>
  );
};